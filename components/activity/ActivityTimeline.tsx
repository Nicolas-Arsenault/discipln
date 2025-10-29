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
    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, overflow: 'hidden', minHeight: 2400, height: 2400 }}>
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
                backgroundColor: '#EEF2FF',
                borderLeftWidth: 4,
                borderLeftColor: '#4F46E5',
                borderRadius: 10,
                padding: 10,
                justifyContent: 'center',
                shadowColor: '#4F46E5',
                shadowOpacity: 0.15,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
              }}
              onPress={() => onEditActivity(activity.id)}
            >
              <Text style={{ fontWeight: '700', color: '#1E293B', fontSize: 16 }} numberOfLines={1} ellipsizeMode="tail">{activity.title}</Text>
              <Text style={{ color: '#4F46E5', fontSize: 13, fontWeight: '600' }}>{formatTime(activity.startHour, activity.startMinute)} - {formatTime(activity.endHour, activity.endMinute)}</Text>
            </Pressable>
          );
        })}
      {/* Render the hour labels as a column, always visible */}
      <View style={{ position: 'absolute', left: 0, top: 0, width: 80, zIndex: 20, height: 2400, backgroundColor: '#FAFBFC' }}>
        {Array.from({ length: 24 }, (_, hour) => (
          <View key={hour} style={{ height: 100, justifyContent: 'center', alignItems: 'center', borderBottomWidth: hour === 23 ? 0 : 1, borderBottomColor: '#E2E8F0' }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#475569' }}>{hour.toString().padStart(2, '0')}:00</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
