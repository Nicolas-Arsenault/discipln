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
    <View style={{ backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, overflow: 'hidden', minHeight: 2400, height: 2400 }}>
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
              style={{
                position: 'absolute',
                left: 80,
                right: 0,
                top: blockTopPx,
                height: blockHeightPx,
                backgroundColor: '#DBEAFE',
                borderLeftWidth: 4,
                borderLeftColor: '#3B82F6',
                borderRadius: 8,
                padding: 8,
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOpacity: 0.04,
                shadowRadius: 4,
              }}
              onPress={() => onEditActivity(activity.id)}
            >
              <Text style={{ fontWeight: 'bold', color: '#1E293B', fontSize: 16 }} numberOfLines={1} ellipsizeMode="tail">{activity.title}</Text>
              <Text style={{ color: '#2563EB', fontSize: 13, fontWeight: '600' }}>{formatTime(activity.startHour, activity.startMinute)} - {formatTime(activity.endHour, activity.endMinute)}</Text>
            </Pressable>
          );
        })}
      {/* Render the hour labels as a column, always visible */}
      <View style={{ position: 'absolute', left: 0, top: 0, width: 80, zIndex: 20, height: 2400 }}>
        {Array.from({ length: 24 }, (_, hour) => (
          <View key={hour} style={{ height: 100, justifyContent: 'center', alignItems: 'center', borderBottomWidth: hour === 23 ? 0 : 1, borderBottomColor: '#F3F4F6' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#374151' }}>{hour.toString().padStart(2, '0')}:00</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
