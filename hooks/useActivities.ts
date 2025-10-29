import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { notificationService } from '../services/notificationService';
import { RoutineActivity } from '../types';
import { adjustConflictingActivities, loadFromStorage, saveToStorage, timeToMinutes } from '../utils';

export const useActivities = () => {
  const [activities, setActivities] = useState<RoutineActivity[]>([]);

  const loadActivities = useCallback(async () => {
    const loadedActivities = await loadFromStorage<RoutineActivity>('routine-activities');
    setActivities(loadedActivities);
  }, []);

  const saveActivities = useCallback(async (updatedActivities: RoutineActivity[]) => {
    await saveToStorage('routine-activities', updatedActivities);
    setActivities(updatedActivities);
  }, []);

  const hasCollision = (newActivity: Omit<RoutineActivity, 'id' | 'notificationId'>, excludeId?: number) => {
    const newStart = timeToMinutes(newActivity.startHour, newActivity.startMinute);
    const newEnd = timeToMinutes(newActivity.endHour, newActivity.endMinute);
    return activities.some(activity => {
      if (excludeId && activity.id === excludeId) return false;
      if (activity.day !== newActivity.day) return false;
      const actStart = timeToMinutes(activity.startHour, activity.startMinute);
      const actEnd = timeToMinutes(activity.endHour, activity.endMinute);
      // Check for overlap
      return (newStart < actEnd && newEnd > actStart);
    });
  };

  const addActivity = useCallback(async (newActivity: Omit<RoutineActivity, 'id' | 'notificationId'>) => {
    // Validate time
    const startMinutes = timeToMinutes(newActivity.startHour, newActivity.startMinute);
    const endMinutes = timeToMinutes(newActivity.endHour, newActivity.endMinute);
    
    if (endMinutes <= startMinutes) {
      Alert.alert('Invalid Time', 'End time must be after start time');
      return false;
    }

    if (hasCollision(newActivity)) {
      Alert.alert('Collision', 'There is already an activity scheduled during this time.');
      return false;
    }

    const activityWithId: RoutineActivity = {
      id: Date.now(),
      ...newActivity
    };
    
    // Adjust conflicting activities
    const adjustedActivities = adjustConflictingActivities(newActivity, activities);

    // Map WeekDay string to JS weekday number (0=Sunday, 1=Monday, ...)
    const weekdayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };
    
    // Schedule notification
    const notificationId = await notificationService.scheduleTaskNotification({
      id: activityWithId.id,
      title: activityWithId.title,
      hours: activityWithId.startHour,
      minutes: activityWithId.startMinute,
      seconds: 0,
      weekday: weekdayMap[newActivity.day]
    });
    
    const activityWithNotification = {
      ...activityWithId,
      notificationId: notificationId || undefined
    };
    
    const updatedActivities = [...adjustedActivities, activityWithNotification];
    await saveActivities(updatedActivities);
    return true;
  }, [activities, saveActivities]);

  const updateActivity = useCallback(async (updatedActivity: RoutineActivity) => {
    // Validate time
    const startMinutes = timeToMinutes(updatedActivity.startHour, updatedActivity.startMinute);
    const endMinutes = timeToMinutes(updatedActivity.endHour, updatedActivity.endMinute);
    
    if (endMinutes <= startMinutes) {
      Alert.alert('Invalid Time', 'End time must be after start time');
      return false;
    }

    if (hasCollision(updatedActivity, updatedActivity.id)) {
      Alert.alert('Collision', 'There is already an activity scheduled during this time.');
      return false;
    }

    const originalActivity = activities.find(activity => activity.id === updatedActivity.id);
    
    // Cancel old notification
    if (originalActivity?.notificationId) {
      await notificationService.cancelNotification(originalActivity.notificationId);
    }

    // Adjust conflicting activities
    const adjustedActivities = adjustConflictingActivities(updatedActivity, activities, updatedActivity.id);

    // Map WeekDay string to JS weekday number (0=Sunday, 1=Monday, ...)
    const weekdayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };
    
    // Schedule new notification
    const notificationId = await notificationService.scheduleTaskNotification({
      id: updatedActivity.id,
      title: updatedActivity.title,
      hours: updatedActivity.startHour,
      minutes: updatedActivity.startMinute,
      seconds: 0,
      weekday: weekdayMap[updatedActivity.day]
    });
    
    const activityWithNotification = {
      ...updatedActivity,
      notificationId: notificationId || undefined
    };
    
    const finalActivities = adjustedActivities.map(activity => 
      activity.id === updatedActivity.id ? activityWithNotification : activity
    );
    
    if (!finalActivities.find(activity => activity.id === updatedActivity.id)) {
      finalActivities.push(activityWithNotification);
    }
    
    await saveActivities(finalActivities);
    return true;
  }, [activities, saveActivities]);

  const deleteActivity = useCallback(async (activityId: number) => {
    const activityToDelete = activities.find(activity => activity.id === activityId);
    
    if (activityToDelete?.notificationId) {
      await notificationService.cancelNotification(activityToDelete.notificationId);
    }
    
    const updatedActivities = activities.filter(activity => activity.id !== activityId);
    await saveActivities(updatedActivities);
  }, [activities, saveActivities]);

  const getActivitiesForDay = useCallback((day: string): RoutineActivity[] => {
    return activities
      .filter(activity => activity.day === day)
      .sort((a, b) => {
        const aMinutes = timeToMinutes(a.startHour, a.startMinute);
        const bMinutes = timeToMinutes(b.startHour, b.startMinute);
        return aMinutes - bMinutes;
      });
  }, [activities]);

  return {
    activities,
    loadActivities,
    addActivity,
    updateActivity,
    deleteActivity,
    getActivitiesForDay
  };
};
