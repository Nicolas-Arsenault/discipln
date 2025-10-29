import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import ActivitySheet from '../components/activity/ActivitySheet';
import ActivityTimeline from '../components/activity/ActivityTimeline';
import FloatingActionButton from '../components/ui/FloatingActionButton';
import { useActivities } from '../hooks/useActivities';
import { RoutineActivity, WeekDay } from '../types';

const weekDays: WeekDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = [0, 15, 30, 45];

export default function Index() {
  const [selectedDay, setSelectedDay] = useState<WeekDay>('monday');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDay, setActivityDay] = useState<WeekDay>('monday');
  const [startHour, setStartHour] = useState(9);
  const [startMinute, setStartMinute] = useState(0);
  const [endHour, setEndHour] = useState(10);
  const [endMinute, setEndMinute] = useState(0);
  const [editingActivity, setEditingActivity] = useState<RoutineActivity | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const { addActivity, updateActivity, deleteActivity, getActivitiesForDay, loadActivities } = useActivities();

  useEffect(() => {
    loadActivities();
  }, []);

  const openAddSheet = () => {
    setEditingActivity(null);
    setActivityTitle('');
    setStartHour(9);
    setStartMinute(0);
    setEndHour(10);
    setEndMinute(0);
    setActivityDay(selectedDay);
    setSheetVisible(true);
  };

  const openEditSheet = (activityId: number) => {
    const activity = getActivitiesForDay(selectedDay).find(a => a.id === activityId);
    if (!activity) return;
    setEditingActivity(activity);
    setActivityTitle(activity.title);
    setStartHour(activity.startHour);
    setStartMinute(activity.startMinute);
    setEndHour(activity.endHour);
    setEndMinute(activity.endMinute);
    setActivityDay(activity.day);
    setSheetVisible(true);
  };

  const closeSheet = () => {
    setSheetVisible(false);
    setEditingActivity(null);
  };

  const handleSaveActivity = async () => {
    if (!activityTitle.trim()) return;
    if (editingActivity) {
      await updateActivity({
        ...(editingActivity ?? {}),
        title: activityTitle,
        day: activityDay,
        startHour,
        startMinute,
        endHour,
        endMinute,
      });
    } else {
      await addActivity({
        title: activityTitle,
        day: activityDay,
        startHour,
        startMinute,
        endHour,
        endMinute,
      });
    }
    closeSheet();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Day Title Selector */}
      <View style={{ paddingHorizontal: 24, paddingTop: 40, paddingBottom: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 16, textAlign: 'center' }}>
          {selectedDay ? selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1) : ''}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }} contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}>
          {weekDays.map((day) => (
            <Pressable
              key={day}
              onPress={() => setSelectedDay(day)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginHorizontal: 4,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: selectedDay === day ? '#1F2937' : '#D1D5DB',
                backgroundColor: selectedDay === day ? '#1F2937' : '#E5E7EB',
                transitionDuration: '150ms',
              }}
            >
              <Text style={{ fontWeight: '600', color: selectedDay === day ? '#FFF' : '#374151' }}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <ScrollView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <ActivityTimeline
          day={selectedDay}
          activities={getActivitiesForDay(selectedDay)}
          onEditActivity={openEditSheet}
          onDeleteActivity={deleteActivity}
          onAddActivity={openAddSheet}
        />
      </ScrollView>
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
        weekDays={weekDays}
        hours={hours}
        minutes={minutes}
        onChangeTitle={setActivityTitle}
        onChangeDay={setActivityDay}
        onChangeStartHour={setStartHour}
        onChangeStartMinute={setStartMinute}
        onChangeEndHour={setEndHour}
        onChangeEndMinute={setEndMinute}
        onSave={handleSaveActivity}
        onCancel={closeSheet}
        onDelete={editingActivity ? () => { deleteActivity(editingActivity.id); closeSheet(); } : undefined}
      />
    </View>
  );
}