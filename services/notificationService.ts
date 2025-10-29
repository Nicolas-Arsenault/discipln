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
        console.log('Failed to get push token for push notification!');
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
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async scheduleTaskNotification(task: TaskNotification): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Notification permissions not granted');
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

      console.log(`Notifications scheduled for task "${task.title}"`);
      console.log(`- Advance reminder at ${reminderTime.getHours().toString().padStart(2, '0')}:${reminderTime.getMinutes().toString().padStart(2, '0')}:${reminderTime.getSeconds().toString().padStart(2, '0')}`);
      console.log(`- Main reminder at ${task.hours.toString().padStart(2, '0')}:${task.minutes.toString().padStart(2, '0')}:${task.seconds.toString().padStart(2, '0')}`);
      
      // Return both notification IDs as a JSON string
      return JSON.stringify({
        advance: advanceNotificationId,
        main: mainNotificationId
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
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
          console.log(`Advance notification ${notificationIds.advance} cancelled`);
        }
        
        if (notificationIds.main) {
          await Notifications.cancelScheduledNotificationAsync(notificationIds.main);
          console.log(`Main notification ${notificationIds.main} cancelled`);
        }
      } else {
        // Handle legacy single notification ID
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        console.log(`Notification ${notificationId} cancelled`);
      }
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
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

      // Debug logging
      console.log('Event scheduling debug:');
      console.log(`- Input date: ${event.date}`);
      console.log(`- Input time: ${event.hours}:${event.minutes}:${event.seconds}`);
      console.log(`- Created eventDate: ${eventDate.toLocaleString()}`);
      console.log(`- Current time: ${new Date().toLocaleString()}`);

      // Check if the event is in the future
      const now = new Date();
      if (eventDate <= now) {
        console.log('Event is in the past, not scheduling notification');
        console.log(`Event: ${eventDate.toLocaleString()}, Now: ${now.toLocaleString()}`);
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

      console.log(`Event notifications scheduled for "${event.title}" on ${event.date}`);
      if (advanceNotificationId) {
        console.log(`- Advance reminder at ${reminderDate.toLocaleString()}`);
      }
      console.log(`- Main reminder at ${eventDate.toLocaleString()}`);
      
      // Return both notification IDs as a JSON string
      return JSON.stringify({
        advance: advanceNotificationId,
        main: mainNotificationId
      });
    } catch (error) {
      console.error('Error scheduling event notification:', error);
      return null;
    }
  }

  async getScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log('Scheduled notifications:', notifications);
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }
}

export const notificationService = new NotificationService();
