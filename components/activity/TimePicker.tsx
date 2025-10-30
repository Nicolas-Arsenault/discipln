import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableWithoutFeedback, View } from 'react-native';

interface TimePickerProps {
  label: string;
  hour: number;
  minute: number;
  hours: number[];
  minutes: number[];
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
}

export default function TimePicker({
  label,
  hour,
  minute,
  hours,
  minutes,
  onHourChange,
  onMinuteChange,
}: TimePickerProps) {
  const [showHourPicker, setShowHourPicker] = useState(false);
  const [showMinutePicker, setShowMinutePicker] = useState(false);

  const closeAllPickers = () => {
    setShowHourPicker(false);
    setShowMinutePicker(false);
  };

  return (
    <View className="flex-1">
      <Text className="text-base font-semibold mb-2 text-gray-900">{label}</Text>
      <View className="flex-row items-center space-x-2">
        {/* Hour Picker */}
        <View className="flex-1">
          <Pressable
            className="border border-gray-300 rounded-xl px-4 py-4 bg-white shadow-sm active:bg-gray-50 active:scale-95"
            onPress={() => {
              closeAllPickers();
              setShowHourPicker(true);
            }}
          >
            <Text className="text-gray-900 text-center font-semibold text-lg">
              {hour.toString().padStart(2, '0')}
            </Text>
            <Text className="text-gray-500 text-center text-xs mt-1">Hour</Text>
          </Pressable>
        </View>
        
        <Text className="text-gray-400 text-2xl font-light">:</Text>
        
        {/* Minute Picker */}
        <View className="flex-1">
          <Pressable
            className="border border-gray-300 rounded-xl px-4 py-4 bg-white shadow-sm active:bg-gray-50 active:scale-95"
            onPress={() => {
              closeAllPickers();
              setShowMinutePicker(true);
            }}
          >
            <Text className="text-gray-900 text-center font-semibold text-lg">
              {minute.toString().padStart(2, '0')}
            </Text>
            <Text className="text-gray-500 text-center text-xs mt-1">Min</Text>
          </Pressable>
        </View>
      </View>

      {/* Hour Picker Modal */}
      <Modal
        visible={showHourPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHourPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowHourPicker(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-4">
            <TouchableWithoutFeedback onPress={() => {}}>
              <View className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
                <View className="p-6 border-b border-gray-100">
                  <Text className="text-xl font-bold text-gray-900 text-center">
                    Select Hour
                  </Text>
                  <Text className="text-sm text-gray-500 text-center mt-1">
                    Choose the hour for your activity
                  </Text>
                </View>
                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  className="max-h-64"
                >
                  {hours.map((h) => (
                    <Pressable
                      key={h}
                      className={`px-6 py-4 border-b border-gray-50 last:border-b-0 active:bg-gray-50 ${
                        hour === h ? 'bg-gray-100' : 'bg-white'
                      }`}
                      onPress={() => {
                        onHourChange(h);
                        setShowHourPicker(false);
                      }}
                    >
                      <Text className={`text-center text-lg ${
                        hour === h ? 'font-bold text-gray-900' : 'text-gray-700'
                      }`}>
                        {h.toString().padStart(2, '0')}:00
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Minute Picker Modal */}
      <Modal
        visible={showMinutePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMinutePicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowMinutePicker(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-4">
            <TouchableWithoutFeedback onPress={() => {}}>
              <View className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
                <View className="p-6 border-b border-gray-100">
                  <Text className="text-xl font-bold text-gray-900 text-center">
                    Select Minutes
                  </Text>
                  <Text className="text-sm text-gray-500 text-center mt-1">
                    Choose the minutes for your activity
                  </Text>
                </View>
                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  className="max-h-64"
                >
                  {minutes.map((m) => (
                    <Pressable
                      key={m}
                      className={`px-6 py-4 border-b border-gray-50 last:border-b-0 active:bg-gray-50 ${
                        minute === m ? 'bg-gray-100' : 'bg-white'
                      }`}
                      onPress={() => {
                        onMinuteChange(m);
                        setShowMinutePicker(false);
                      }}
                    >
                      <Text className={`text-center text-lg ${
                        minute === m ? 'font-bold text-gray-900' : 'text-gray-700'
                      }`}>
                        :{m.toString().padStart(2, '0')}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
