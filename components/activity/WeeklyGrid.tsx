import React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { RoutineActivity, WeekDay } from '../../types';
import { formatTime } from '../../utils';

interface WeeklyGridProps {
  activities: RoutineActivity[];
  onEditActivity: (activityId: number) => void;
  onDeleteActivity: (activityId: number) => void;
  onAddActivity: (day?: WeekDay) => void;
}

const weekDays: WeekDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function WeeklyGrid({
  activities,
  onEditActivity,
  onDeleteActivity,
  onAddActivity
}: WeeklyGridProps) {
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

  const getActivitiesForDay = (day: WeekDay) => {
    return activities
      .filter(activity => activity.day === day)
      .sort((a, b) => {
        const aTime = a.startHour * 60 + a.startMinute;
        const bTime = b.startHour * 60 + b.startMinute;
        return aTime - bTime;
      });
  };

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      className="flex-1"
      contentContainerStyle={{ paddingRight: 24 }}
    >
      <View className="flex-row">
        {weekDays.map((day, dayIndex) => {
          const dayActivities = getActivitiesForDay(day);
          
          return (
            <View key={day} style={{ width: 260, marginRight: dayIndex === weekDays.length - 1 ? 0 : 16 }}>
              {/* Day Header */}
              <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm">
                <Text className="text-lg font-bold text-gray-900 text-center capitalize">
                  {day}
                </Text>
                <Text className="text-xs text-gray-500 text-center mt-0.5">
                  {dayActivities.length} {dayActivities.length === 1 ? 'activity' : 'activities'}
                </Text>
              </View>

              {/* Activities Column */}
              <ScrollView 
                className="flex-1"
                style={{ maxHeight: 600 }}
                showsVerticalScrollIndicator={false}
              >
                {dayActivities.length === 0 ? (
                  <Pressable
                    onPress={() => onAddActivity(day)}
                    className="bg-gray-50 rounded-xl p-5 items-center justify-center border-2 border-dashed border-gray-300"
                    style={{ minHeight: 120 }}
                  >
                    <Text className="text-2xl text-gray-400 mb-2">+</Text>
                    <Text className="text-sm text-gray-500 text-center">
                      Add activity
                    </Text>
                  </Pressable>
                ) : (
                  <>
                    {dayActivities.map((activity, index) => (
                      <Pressable
                        key={activity.id}
                        className="bg-gray-50 border-l-4 border-gray-900 rounded-xl p-3 mb-2 shadow-sm"
                        onPress={() => onEditActivity(activity.id)}
                      >
                        <Text 
                          className="font-bold text-gray-900 text-sm mb-1"
                          numberOfLines={2} 
                          ellipsizeMode="tail"
                        >
                          {activity.title}
                        </Text>
                        <Text className="text-gray-600 text-xs font-semibold">
                          {formatTime(activity.startHour, activity.startMinute)} - {formatTime(activity.endHour, activity.endMinute)}
                        </Text>
                      </Pressable>
                    ))}
                    
                    {/* Add button at bottom of activities */}
                    <Pressable
                      onPress={() => onAddActivity(day)}
                      className="bg-gray-100 rounded-xl p-4 items-center justify-center border border-gray-200 mt-1"
                    >
                      <Text className="text-lg text-gray-500 mb-1">+</Text>
                      <Text className="text-xs text-gray-500">Add activity</Text>
                    </Pressable>
                  </>
                )}
              </ScrollView>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
