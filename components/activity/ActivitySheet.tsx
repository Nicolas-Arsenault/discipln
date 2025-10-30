import React, { useEffect, useRef } from 'react';
import { Alert, Animated, Dimensions, Easing, Modal, Pressable, ScrollView, Text, TextInput, View, PanResponder, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Goal, WeekDay } from '../../types';
import TimePicker from './TimePicker';

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
  selectedGoalId?: number;
  goals: Goal[];
  weekDays: WeekDay[];
  hours: number[];
  minutes: number[];
  onChangeTitle: (title: string) => void;
  onChangeDay: (day: WeekDay) => void;
  onChangeStartHour: (h: number) => void;
  onChangeStartMinute: (m: number) => void;
  onChangeEndHour: (h: number) => void;
  onChangeEndMinute: (m: number) => void;
  onChangeGoal: (goalId?: number) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  onCreateGoal?: () => void;
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
  selectedGoalId,
  goals,
  weekDays,
  hours,
  minutes,
  onChangeTitle,
  onChangeDay,
  onChangeStartHour,
  onChangeStartMinute,
  onChangeEndHour,
  onChangeEndMinute,
  onChangeGoal,
  onSave,
  onCancel,
  onDelete,
  onCreateGoal,
}: ActivitySheetProps) {
  const slideAnim = useRef(new Animated.Value(400)).current; // Start off-screen
  const translateY = useRef(new Animated.Value(0)).current; // For swipe gesture

  // Pan responder for swipe to dismiss
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dy) > 20 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
    },
    onPanResponderMove: (evt, gestureState) => {
      if (gestureState.dy > 0) { // Only allow downward swipes
        translateY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dy > 150 || gestureState.vy > 0.5) {
        // Dismiss if swiped down enough or fast enough
        Animated.timing(translateY, {
          toValue: 400,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          translateY.setValue(0);
          onCancel();
        });
      } else {
        // Snap back to original position
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      
      // Ensure Monday is selected when opening for new activity
      if (mode === 'add') {
        onChangeDay('monday');
      }
    } else {
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [visible, mode, onChangeDay]);

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

  // Check if all required fields are filled
  const isFormValid = () => {
    return activityTitle.trim().length > 0 && 
           selectedGoalId !== undefined && 
           goals.length > 0;
  };

  // Close all pickers and dismiss keyboard
  const handleBackgroundPress = () => {
    Keyboard.dismiss();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={handleBackgroundPress}>
        <View className="flex-1 shadow justify-end">
          <Animated.View 
            style={{
              transform: [{ translateY: translateY }],
            }}
            {...panResponder.panHandlers}
            className="bg-white rounded-t-3xl max-h-[90%] min-h-[90%] flex-1"
          >
            {/* Drag indicator */}
            <View className="flex-row justify-center pt-3 pb-4">
              <View className="w-10 h-1 bg-gray-300 rounded-full" />
            </View>
            
            <ScrollView 
              showsVerticalScrollIndicator={false}
              bounces={false}
              className="flex-1 px-6"
            >
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-gray-900">{mode === 'edit' ? 'Edit Activity' : 'Add Activity'}</Text>
                <Pressable onPress={onCancel}>
                  <Text className="text-gray-400 text-lg">✕</Text>
                </Pressable>
              </View>
              <View className="mb-4">
                <View className="flex-row items-center mb-2">
                  <Text className="text-base font-semibold text-gray-900">Activity Title</Text>
                  <Text className="text-red-500 ml-1">*</Text>
                </View>
                <TextInput
                  value={activityTitle}
                  onChangeText={onChangeTitle}
                  placeholder="e.g., Gym, Study, Meeting"
                  className={`border rounded-xl px-4 py-3 text-gray-900 ${
                    !activityTitle.trim() ? 'border-red-200' : 'border-gray-200'
                  }`}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  blurOnSubmit={true}
                />
                {!activityTitle.trim() && (
                  <Text className="text-red-500 text-sm mt-1">Activity title is required</Text>
                )}
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
              
              {/* Goal Selection */}
              <View className="mb-4">
                <View className="flex-row items-center mb-2">
                  <Text className="text-base font-semibold text-gray-900">Link to Goal</Text>
                  <Text className="text-red-500 ml-1">*</Text>
                </View>
                {goals.length === 0 ? (
                  <View className="border border-red-200 bg-red-50 rounded-xl p-4">
                    <Text className="text-red-800 text-sm mb-3">
                      You must create a goal first to link this activity to it.
                    </Text>
                    <Pressable
                      className="bg-red-600 rounded-lg py-3 px-4 self-start"
                      onPress={onCreateGoal}
                    >
                      <Text className="text-white font-semibold text-sm">Create Goal</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View>
                    <Text className="text-sm text-gray-600 mb-3">Select which goal this activity contributes to:</Text>
                    <View className="space-y-2">
                      {goals.map((goal) => (
                        <Pressable
                          key={goal.id}
                          className={`border rounded-xl p-3 ${
                            selectedGoalId === goal.id 
                              ? 'border-gray-900 bg-gray-900' 
                              : selectedGoalId === undefined
                              ? 'border-red-200 bg-white'
                              : 'border-gray-200 bg-white'
                          }`}
                          onPress={() => onChangeGoal(goal.id)}
                        >
                          <View className="flex-row items-center justify-between">
                            <Text className={`font-semibold flex-1 ${
                              selectedGoalId === goal.id ? 'text-white' : 'text-gray-900'
                            }`}>
                              {goal.title}
                            </Text>
                            <View className={`w-5 h-5 rounded-full border-2 ml-3 ${
                              selectedGoalId === goal.id 
                                ? 'border-white bg-white' 
                                : 'border-gray-300'
                            }`}>
                              {selectedGoalId === goal.id && (
                                <View className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                                  <Text className="text-white text-xs">✓</Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                    {selectedGoalId === undefined && (
                      <Text className="text-red-500 text-sm mt-2">Please select a goal to continue</Text>
                    )}
                  </View>
                )}
              </View>

              <View className="mb-4 flex-row space-x-4">
                <TimePicker
                  label="Start Time"
                  hour={startHour}
                  minute={startMinute}
                  hours={hours}
                  minutes={minutes}
                  onHourChange={onChangeStartHour}
                  onMinuteChange={onChangeStartMinute}
                />
                <TimePicker
                  label="End Time"
                  hour={endHour}
                  minute={endMinute}
                  hours={hours}
                  minutes={minutes}
                  onHourChange={onChangeEndHour}
                  onMinuteChange={onChangeEndMinute}
                />
              </View>
              
              {/* Add bottom padding for buttons */}
              <View className="h-20" />
            </ScrollView>
            {/* Bottom action buttons - fixed position */}
            <View className="absolute bottom-6 left-6 right-6">
              <View className="flex-row justify-between items-center">
                {/* Delete button on the left */}
                {mode === 'edit' && onDelete ? (
                  <Pressable 
                    className="bg-red-100 rounded-xl py-3 px-3 items-center flex-1 mr-3"
                    onPress={handleDelete}
                  >
                    <Text className="text-red-600 font-semibold text-sm">Delete</Text>
                  </Pressable>
                ) : (
                  <View className="flex-1" />
                )}
                
                {/* Cancel and Save buttons on the right */}
                <View className="flex-row">
                  <Pressable className="bg-gray-200 rounded-xl py-3 px-4 mr-2" onPress={onCancel}>
                    <Text className="text-gray-700 font-semibold text-base">Cancel</Text>
                  </Pressable>
                  <Pressable 
                    className={`rounded-xl py-3 px-4 ${
                      isFormValid() ? 'bg-gray-900' : 'bg-gray-300'
                    }`}
                    onPress={isFormValid() ? onSave : undefined}
                    disabled={!isFormValid()}
                  >
                    <Text className={`font-semibold text-base ${
                      isFormValid() ? 'text-white' : 'text-gray-500'
                    }`}>
                      {mode === 'edit' ? 'Save Changes' : 'Add Activity'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
