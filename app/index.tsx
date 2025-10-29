import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import ActivitySheet from '../components/activity/ActivitySheet';
import ActivityTimeline from '../components/activity/ActivityTimeline';
import WeeklyGrid from '../components/activity/WeeklyGrid';
import FloatingActionButton from '../components/ui/FloatingActionButton';
import { useActivities } from '../hooks/useActivities';
import { useGoals } from '../hooks/useGoals';
import { RoutineActivity, WeekDay } from '../types';
import { router } from 'expo-router';

const weekDays: WeekDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = [0, 15, 30, 45];

export default function Index() {
  const [selectedDay, setSelectedDay] = useState<WeekDay>('monday');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDay, setActivityDay] = useState<WeekDay>('monday');
  const [startHour, setStartHour] = useState(9);
  const [startMinute, setStartMinute] = useState(0);
  const [endHour, setEndHour] = useState(10);
  const [endMinute, setEndMinute] = useState(0);
  const [selectedGoalId, setSelectedGoalId] = useState<number | undefined>(undefined);
  const [editingActivity, setEditingActivity] = useState<RoutineActivity | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const { addActivity, updateActivity, deleteActivity, getActivitiesForDay, activities, loadActivities } = useActivities();
  const { goals, loadGoalsAndProgress } = useGoals();

  useEffect(() => {
    loadActivities();
    loadGoalsAndProgress();
  }, []);

  // Refresh goals when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadGoalsAndProgress();
    }, [loadGoalsAndProgress])
  );

  const openAddSheet = async (day?: WeekDay) => {
    // Refresh goals when opening the sheet
    await loadGoalsAndProgress();
    setEditingActivity(null);
    setActivityTitle('');
    setStartHour(9);
    setStartMinute(0);
    setEndHour(10);
    setEndMinute(0);
    setActivityDay(day || selectedDay);
    setSelectedGoalId(undefined);
    setSheetVisible(true);
  };

  const openEditSheet = (activityId: number) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;
    setEditingActivity(activity);
    setActivityTitle(activity.title);
    setStartHour(activity.startHour);
    setStartMinute(activity.startMinute);
    setEndHour(activity.endHour);
    setEndMinute(activity.endMinute);
    setActivityDay(activity.day);
    setSelectedGoalId(activity.goalId);
    setSheetVisible(true);
  };

  const closeSheet = () => {
    setSheetVisible(false);
    setEditingActivity(null);
  };

  const handleSaveActivity = async () => {
    if (!activityTitle.trim() || !selectedGoalId) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    
    if (editingActivity) {
      await updateActivity({
        ...(editingActivity ?? {}),
        title: activityTitle,
        day: activityDay,
        startHour,
        startMinute,
        endHour,
        endMinute,
        goalId: selectedGoalId,
      });
    } else {
      await addActivity({
        title: activityTitle,
        day: activityDay,
        startHour,
        startMinute,
        endHour,
        endMinute,
        goalId: selectedGoalId,
      });
    }
    closeSheet();
  };

  const handleCreateGoal = () => {
    Alert.alert(
      'Create Goal',
      'You need to create a goal first to link activities to it. Would you like to go to the Goals section?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Go to Goals', 
          onPress: () => {
            closeSheet();
            router.push('/goalTracking');
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 50, paddingBottom: 20 }}>
        {/* View Toggle */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
          <View style={{ 
            flexDirection: 'row', 
            backgroundColor: '#F1F5F9', 
            borderRadius: 12, 
            padding: 4 
          }}>
            <Pressable
              onPress={() => setViewMode('day')}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: viewMode === 'day' ? '#4F46E5' : 'transparent',
              }}
            >
              <Text style={{
                fontWeight: '600',
                color: viewMode === 'day' ? '#FFFFFF' : '#64748B',
                fontSize: 14
              }}>
                Day View
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setViewMode('week')}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: viewMode === 'week' ? '#4F46E5' : 'transparent',
              }}
            >
              <Text style={{
                fontWeight: '600',
                color: viewMode === 'week' ? '#FFFFFF' : '#64748B',
                fontSize: 14
              }}>
                Week View
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Day Title and Selector - Only show in day view */}
        {viewMode === 'day' && (
          <>
            <Text style={{ fontSize: 32, fontWeight: '800', color: '#111827', marginBottom: 24, textAlign: 'center', letterSpacing: -0.5 }}>
              {selectedDay ? selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1) : ''}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }} contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}>
              {weekDays.map((day) => (
                <Pressable
                  key={day}
                  onPress={() => setSelectedDay(day)}
                  style={{
                    paddingHorizontal: 18,
                    paddingVertical: 10,
                    marginHorizontal: 3,
                    borderRadius: 12,
                    backgroundColor: selectedDay === day ? '#4F46E5' : '#F8FAFC',
                    shadowColor: selectedDay === day ? '#4F46E5' : '#000',
                    shadowOpacity: selectedDay === day ? 0.25 : 0.08,
                    shadowRadius: selectedDay === day ? 8 : 4,
                    shadowOffset: { width: 0, height: selectedDay === day ? 4 : 2 },
                    elevation: selectedDay === day ? 8 : 2,
                  }}
                >
                  <Text style={{ 
                    fontWeight: selectedDay === day ? '700' : '600', 
                    color: selectedDay === day ? '#FFFFFF' : '#64748B',
                    fontSize: 14,
                    textTransform: 'capitalize'
                  }}>
                    {day.slice(0, 3)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}

        {/* Week View Title */}
        {viewMode === 'week' && (
          <Text style={{ fontSize: 32, fontWeight: '800', color: '#111827', marginBottom: 24, textAlign: 'center', letterSpacing: -0.5 }}>
            Weekly Overview
          </Text>
        )}
      </View>
      {viewMode === 'day' ? (
        <ScrollView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          <ActivityTimeline
            day={selectedDay}
            activities={getActivitiesForDay(selectedDay)}
            onEditActivity={openEditSheet}
            onDeleteActivity={deleteActivity}
            onAddActivity={openAddSheet}
          />
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingLeft: 24, paddingTop: 8, paddingBottom: 24 }}>
          <WeeklyGrid
            activities={activities}
            onEditActivity={openEditSheet}
            onDeleteActivity={deleteActivity}
            onAddActivity={openAddSheet}
          />
        </View>
      )}
      <FloatingActionButton onPress={openAddSheet} />
      <ActivitySheet
        visible={sheetVisible}
        mode={editingActivity ? 'edit' : 'add'}
        activityTitle={activityTitle}
        activityDay={activityDay}
        startHour={startHour}
        startMinute={startMinute}
        endHour={endHour}
        endMinute={endMinute}
        selectedGoalId={selectedGoalId}
        goals={goals}
        weekDays={weekDays}
        hours={hours}
        minutes={minutes}
        onChangeTitle={setActivityTitle}
        onChangeDay={setActivityDay}
        onChangeStartHour={setStartHour}
        onChangeStartMinute={setStartMinute}
        onChangeEndHour={setEndHour}
        onChangeEndMinute={setEndMinute}
        onChangeGoal={setSelectedGoalId}
        onSave={handleSaveActivity}
        onCancel={closeSheet}
        onDelete={editingActivity ? () => { deleteActivity(editingActivity.id); closeSheet(); } : undefined}
        onCreateGoal={handleCreateGoal}
      />
    </View>
  );
}