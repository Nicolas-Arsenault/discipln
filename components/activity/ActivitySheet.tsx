import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useRef } from 'react';
import { Alert, Animated, Dimensions, Easing, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { WeekDay } from '../../types';

const { height: screenHeight } = Dimensions.get('window');

interface ActivitySheetProps {
  visible: boolean;
  mode: 'add' | 'edit';
  activityTitle: string;
  activityDay: WeekDay;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  weekDays: WeekDay[];
  hours: number[];
  minutes: number[];
  onChangeTitle: (title: string) => void;
  onChangeDay: (day: WeekDay) => void;
  onChangeStartHour: (h: number) => void;
  onChangeStartMinute: (m: number) => void;
  onChangeEndHour: (h: number) => void;
  onChangeEndMinute: (m: number) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export default function ActivitySheet({
  visible,
  mode,
  activityTitle,
  activityDay,
  startHour,
  startMinute,
  endHour,
  endMinute,
  weekDays,
  hours,
  minutes,
  onChangeTitle,
  onChangeDay,
  onChangeStartHour,
  onChangeStartMinute,
  onChangeEndHour,
  onChangeEndMinute,
  onSave,
  onCancel,
  onDelete,
}: ActivitySheetProps) {
  const slideAnim = useRef(new Animated.Value(400)).current; // Start off-screen

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete && onDelete() },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View className="flex-1 shadow justify-end">
        <View className="bg-white rounded-t-3xl p-6 max-h-[90%] min-h-[70%]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-900">{mode === 'edit' ? 'Edit Activity' : 'Add Activity'}</Text>
            <Pressable onPress={onCancel}>
              <Text className="text-gray-400 text-lg">✕</Text>
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="mb-4">
              <Text className="text-base font-semibold mb-2 text-gray-900">Activity Title *</Text>
              <TextInput
                value={activityTitle}
                onChangeText={onChangeTitle}
                placeholder="e.g., Gym, Study, Meeting"
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
              />
            </View>
            <View className="mb-4">
              <Text className="text-base font-semibold mb-2 text-gray-900">Day of the Week</Text>
              <View className="flex-row flex-wrap">
                {weekDays.map((day) => (
                  <Pressable
                    key={day}
                    className={`mr-3 mb-3 px-4 py-2 rounded-full border ${activityDay === day ? 'border-gray-900 bg-gray-900' : 'border-gray-300 bg-white'}`}
                    onPress={() => onChangeDay(day)}
                  >
                    <Text className={`font-medium capitalize ${activityDay === day ? 'text-white' : 'text-gray-700'}`}>{day}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View className="mb-4 flex-row">
              <View className="flex-1 mr-2">
                <Text className="text-base font-semibold mb-2 text-gray-900">Start Time</Text>
                <View className="flex-row items-center">
                  <Picker
                    selectedValue={startHour}
                    onValueChange={onChangeStartHour}
                    style={{ flex: 1, height: 36, backgroundColor: 'transparent', borderWidth: 0 }}
                  >
                    {hours.map((h) => (
                      <Picker.Item key={h} label={h.toString().padStart(2, '0')} value={h} />
                    ))}
                  </Picker>
                  <Picker
                    selectedValue={startMinute}
                    onValueChange={onChangeStartMinute}
                    style={{ flex: 1, height: 36, backgroundColor: 'transparent', borderWidth: 0 }}
                  >
                    {minutes.map((m) => (
                      <Picker.Item key={m} label={m.toString().padStart(2, '0')} value={m} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-base font-semibold mb-2 text-gray-900">End Time</Text>
                <View className="flex-row">
                  <Picker
                    selectedValue={endHour}
                    onValueChange={onChangeEndHour}
                    style={{ flex: 1, height: 36 }}
                  >
                    {hours.map((h) => (
                      <Picker.Item key={h} label={h.toString().padStart(2, '0')} value={h} />
                    ))}
                  </Picker>
                  <Picker
                    selectedValue={endMinute}
                    onValueChange={onChangeEndMinute}
                    style={{ flex: 1, height: 36 }}
                  >
                    {minutes.map((m) => (
                      <Picker.Item key={m} label={m.toString().padStart(2, '0')} value={m} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          </ScrollView>
          {mode === 'edit' && onDelete && (
            <View className="flex-row justify-start absolute left-6 bottom-6">
              <Pressable className="bg-red-100 rounded-xl py-3 px-6 items-center" onPress={handleDelete}>
                <Text className="text-red-600 font-semibold text-base">Delete Activity</Text>
              </Pressable>
            </View>
          )}
          <View className="flex-row justify-end absolute right-6 bottom-6">
            <Pressable className="bg-gray-200 rounded-xl py-3 px-6 mr-2" onPress={onCancel}>
              <Text className="text-gray-700 font-semibold text-base">Cancel</Text>
            </Pressable>
            <Pressable className="bg-gray-900 rounded-xl py-3 px-6" onPress={onSave}>
              <Text className="text-white font-semibold text-base">{mode === 'edit' ? 'Save Changes' : 'Add Activity'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
