import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface TaskNotification {
  id: number;
  title: string;
  hours: number;
  minutes: number;
  seconds: number;
  weekday?: number; // 0 (Sunday) - 6 (Saturday)
}

export interface EventNotification {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD format
  hours: number;
  minutes: number;
  seconds: number;
}

class NotificationService {
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        return false;
      }
      
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  async scheduleTaskNotification(task: TaskNotification): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // Calculate 5 minutes before the scheduled time
      const reminderTime = new Date();
      reminderTime.setHours(task.hours, task.minutes, task.seconds, 0);
      reminderTime.setMinutes(reminderTime.getMinutes() - 5);

      // Schedule 5-minute advance notification
      const advanceNotificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Reminder ⏰',
          body: `Coming up in 5 minutes: ${task.title}`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: reminderTime.getHours(),
          minute: reminderTime.getMinutes(),
          second: reminderTime.getSeconds(),
          weekday: typeof task.weekday === 'number' ? task.weekday : undefined,
          repeats: true,
        },
      });

      // Schedule main notification at exact time
      const mainNotificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Reminder 📝',
          body: `Time to do: ${task.title}`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: task.hours,
          minute: task.minutes,
          second: task.seconds,
          weekday: typeof task.weekday === 'number' ? task.weekday : undefined,
          repeats: true,
        },
      });

      // Return both notification IDs as a JSON string
      return JSON.stringify({
        advance: advanceNotificationId,
        main: mainNotificationId
      });
    } catch (error) {
      return null;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      // Check if notificationId contains multiple IDs (JSON format)
      if (notificationId.startsWith('{')) {
        const notificationIds = JSON.parse(notificationId);
        
        // Cancel both advance and main notifications
        if (notificationIds.advance) {
          await Notifications.cancelScheduledNotificationAsync(notificationIds.advance);
        }
        
        if (notificationIds.main) {
          await Notifications.cancelScheduledNotificationAsync(notificationIds.main);
        }
      } else {
        // Handle legacy single notification ID
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }
    } catch (error) {
      // Error cancelling notification
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      // Error cancelling all notifications
    }
  }

  async scheduleEventNotification(event: EventNotification): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Notification permissions not granted');
        return null;
      }

      // Parse the event date and create the full date-time in local timezone
      const [year, month, day] = event.date.split('-').map(Number);
      const eventDate = new Date(year, month - 1, day, event.hours, event.minutes, event.seconds);

      // Check if the event is in the future
      const now = new Date();
      if (eventDate <= now) {
        return null;
      }

      // Calculate 5 minutes before the event
      const reminderDate = new Date(eventDate);
      reminderDate.setMinutes(reminderDate.getMinutes() - 5);

      let advanceNotificationId = null;
      let mainNotificationId = null;

      // Schedule 5-minute advance notification (only if it's in the future)
      if (reminderDate > now) {
        advanceNotificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Event Reminder ⏰',
            body: `Starting in 5 minutes: ${event.title}`,
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: reminderDate,
          },
        });
      }

      // Schedule main notification at exact event time
      mainNotificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Event Starting 📅',
          body: `${event.title} is starting now!`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: eventDate,
        },
      });

      // Return both notification IDs as a JSON string
      return JSON.stringify({
        advance: advanceNotificationId,
        main: mainNotificationId
      });
    } catch (error) {
      return null;
    }
  }

  async getScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications;
    } catch (error) {
      return [];
    }
  }
}

export const notificationService = new NotificationService();
