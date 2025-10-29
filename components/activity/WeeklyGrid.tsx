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
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingRight: 24 }}
    >
      <View style={{ flexDirection: 'row' }}>
        {weekDays.map((day, dayIndex) => {
          const dayActivities = getActivitiesForDay(day);
          
          return (
            <View key={day} style={{ width: 260, marginRight: dayIndex === weekDays.length - 1 ? 0 : 16 }}>
              {/* Day Header */}
              <View style={{ 
                backgroundColor: '#FFFFFF', 
                borderRadius: 16, 
                padding: 16, 
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#E2E8F0',
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 }
              }}>
                <Text style={{ 
                  fontSize: 18, 
                  fontWeight: '700', 
                  color: '#1E293B', 
                  textAlign: 'center',
                  textTransform: 'capitalize'
                }}>
                  {day}
                </Text>
                <Text style={{ 
                  fontSize: 12, 
                  color: '#64748B', 
                  textAlign: 'center',
                  marginTop: 2
                }}>
                  {dayActivities.length} {dayActivities.length === 1 ? 'activity' : 'activities'}
                </Text>
              </View>

              {/* Activities Column */}
              <ScrollView 
                style={{ flex: 1, maxHeight: 600 }}
                showsVerticalScrollIndicator={false}
              >
                {dayActivities.length === 0 ? (
                  <Pressable
                    onPress={() => onAddActivity(day)}
                    style={{
                      backgroundColor: '#F8FAFC',
                      borderRadius: 12,
                      padding: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 2,
                      borderColor: '#CBD5E1',
                      borderStyle: 'dashed',
                      minHeight: 120
                    }}
                  >
                    <Text style={{ fontSize: 24, color: '#94A3B8', marginBottom: 8 }}>+</Text>
                    <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center' }}>
                      Add activity
                    </Text>
                  </Pressable>
                ) : (
                  <>
                    {dayActivities.map((activity, index) => (
                      <Pressable
                        key={activity.id}
                        style={{
                          backgroundColor: '#EEF2FF',
                          borderLeftWidth: 4,
                          borderLeftColor: '#4F46E5',
                          borderRadius: 12,
                          padding: 12,
                          marginBottom: 8,
                          shadowColor: '#4F46E5',
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          shadowOffset: { width: 0, height: 2 },
                        }}
                        onPress={() => onEditActivity(activity.id)}
                      >
                        <Text 
                          style={{ 
                            fontWeight: '700', 
                            color: '#1E293B', 
                            fontSize: 15, 
                            marginBottom: 4 
                          }} 
                          numberOfLines={2} 
                          ellipsizeMode="tail"
                        >
                          {activity.title}
                        </Text>
                        <Text style={{ 
                          color: '#4F46E5', 
                          fontSize: 12, 
                          fontWeight: '600' 
                        }}>
                          {formatTime(activity.startHour, activity.startMinute)} - {formatTime(activity.endHour, activity.endMinute)}
                        </Text>
                      </Pressable>
                    ))}
                    
                    {/* Add button at bottom of activities */}
                    <Pressable
                      onPress={() => onAddActivity(day)}
                      style={{
                        backgroundColor: '#F1F5F9',
                        borderRadius: 12,
                        padding: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: '#CBD5E1',
                        marginTop: 4
                      }}
                    >
                      <Text style={{ fontSize: 18, color: '#64748B', marginBottom: 4 }}>+</Text>
                      <Text style={{ fontSize: 12, color: '#64748B' }}>Add activity</Text>
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
