import AsyncStorage from '@react-native-async-storage/async-storage';
import { RoutineActivity } from '../types';

// Time utilities
export const formatTime = (hour: number, minute: number): string => {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

export const timeToMinutes = (hour: number, minute: number): number => {
  return hour * 60 + minute;
};

export const minutesToTime = (minutes: number): { hour: number; minute: number } => {
  return { hour: Math.floor(minutes / 60), minute: minutes % 60 };
};

export const getDurationText = (startHour: number, startMinute: number, endHour: number, endMinute: number): string => {
  const totalMinutes = timeToMinutes(endHour, endMinute) - timeToMinutes(startHour, startMinute);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
};

export const capitalizeDay = (day: string): string => {
  return day.charAt(0).toUpperCase() + day.slice(1);
};

// Storage utilities
export const loadFromStorage = async <T>(key: string): Promise<T[]> => {
  try {
    const savedData = await AsyncStorage.getItem(key);
    return savedData ? JSON.parse(savedData) : [];
  } catch (error) {
    console.error(`Error loading ${key}:`, error);
    return [];
  }
};

export const saveToStorage = async <T>(key: string, data: T[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
  }
};

// Activity utilities
export const checkTimeConflict = (
  newActivity: Omit<RoutineActivity, 'id' | 'notificationId'>,
  existingActivities: RoutineActivity[],
  excludeId?: number
): boolean => {
  const dayActivities = existingActivities.filter(
    activity => activity.day === newActivity.day && activity.id !== excludeId
  );

  const newStartMinutes = timeToMinutes(newActivity.startHour, newActivity.startMinute);
  const newEndMinutes = timeToMinutes(newActivity.endHour, newActivity.endMinute);

  return dayActivities.some(activity => {
    const existingStartMinutes = timeToMinutes(activity.startHour, activity.startMinute);
    const existingEndMinutes = timeToMinutes(activity.endHour, activity.endMinute);

    return (
      (newStartMinutes >= existingStartMinutes && newStartMinutes < existingEndMinutes) ||
      (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) ||
      (newStartMinutes <= existingStartMinutes && newEndMinutes >= existingEndMinutes)
    );
  });
};

export const adjustConflictingActivities = (
  newActivity: Omit<RoutineActivity, 'id' | 'notificationId'>,
  existingActivities: RoutineActivity[],
  excludeId?: number
): RoutineActivity[] => {
  const dayActivities = existingActivities.filter(
    activity => activity.day === newActivity.day && activity.id !== excludeId
  );
  const otherDayActivities = existingActivities.filter(
    activity => activity.day !== newActivity.day || activity.id === excludeId
  );

  const newStartMinutes = timeToMinutes(newActivity.startHour, newActivity.startMinute);
  const newEndMinutes = timeToMinutes(newActivity.endHour, newActivity.endMinute);

  const adjustedActivities = dayActivities.map(activity => {
    const existingStartMinutes = timeToMinutes(activity.startHour, activity.startMinute);
    const existingEndMinutes = timeToMinutes(activity.endHour, activity.endMinute);
    const duration = existingEndMinutes - existingStartMinutes;

    // If the existing activity conflicts with the new one, move it after
    if (
      (newStartMinutes >= existingStartMinutes && newStartMinutes < existingEndMinutes) ||
      (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) ||
      (newStartMinutes <= existingStartMinutes && newEndMinutes >= existingEndMinutes)
    ) {
      const newStart = minutesToTime(newEndMinutes);
      const newEnd = minutesToTime(newEndMinutes + duration);
      
      return {
        ...activity,
        startHour: newStart.hour,
        startMinute: newStart.minute,
        endHour: newEnd.hour,
        endMinute: newEnd.minute,
      };
    }
    
    return activity;
  });

  return [...otherDayActivities, ...adjustedActivities];
};
