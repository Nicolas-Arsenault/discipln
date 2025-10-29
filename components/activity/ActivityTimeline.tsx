import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { RoutineActivity } from '../../types';
import { formatTime } from '../../utils';

interface ActivityTimelineProps {
  day: string;
  activities: RoutineActivity[];
  onEditActivity: (activityId: number) => void;
  onDeleteActivity: (activityId: number) => void;
  onAddActivity: () => void;
}

export default function ActivityTimeline({
  day,
  activities,
  onEditActivity,
  onDeleteActivity,
  onAddActivity
}: ActivityTimelineProps) {
  const handleDeleteConfirmation = (activity: RoutineActivity) => {
    Alert.alert(
      "Delete Activity",
      `Are you sure you want to delete "${activity.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDeleteActivity(activity.id) }
      ]
    );
  };

  return (
    <View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ minHeight: 2400, height: 2400 }}>
      {/* Render each activity as a single block spanning its duration */}
      {activities
        .filter(activity => activity.day === day)
        .map(activity => {
          const activityStart = activity.startHour * 60 + activity.startMinute;
          const activityEnd = activity.endHour * 60 + activity.endMinute;
          // 100px per hour, so 1px per 0.6min, so 15min = 25px
          const pxPerMinute = 100 / 60;
          const blockTopPx = activityStart * pxPerMinute;
          let blockHeightPx = (activityEnd - activityStart) * pxPerMinute;
          // Ensure a minimum block height for usability
          const minBlockHeight = 32;
          if (blockHeightPx < minBlockHeight) blockHeightPx = minBlockHeight;
          return (
            <Pressable
              key={activity.id}
              className="absolute bg-gray-50 border-l-4 border-gray-900 rounded-lg p-2.5 justify-center shadow-sm"
              style={{
                left: 80,
                right: 0,
                top: blockTopPx,
                height: blockHeightPx,
              }}
              onPress={() => onEditActivity(activity.id)}
            >
              <Text className="font-bold text-gray-900 text-base" numberOfLines={1} ellipsizeMode="tail">{activity.title}</Text>
              <Text className="text-gray-600 text-xs font-semibold">{formatTime(activity.startHour, activity.startMinute)} - {formatTime(activity.endHour, activity.endMinute)}</Text>
            </Pressable>
          );
        })}
      {/* Render the hour labels as a column, always visible */}
      <View className="absolute left-0 top-0 w-20 z-20 bg-gray-100" style={{ height: 2400 }}>
        {Array.from({ length: 24 }, (_, hour) => (
          <View 
            key={hour} 
            className={`h-25 justify-center items-center ${hour !== 23 ? 'border-b border-gray-200' : ''}`}
            style={{ height: 100 }}
          >
            <Text className="text-lg font-bold text-gray-600">{hour.toString().padStart(2, '0')}:00</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
