import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { Text, View } from 'react-native';
import { HOURS_ARRAY, MINUTES_ARRAY } from '../../types';

interface TimePickerSectionProps {
  label: string;
  hour: number;
  minute: number;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
  className?: string;
}

export default function TimePickerSection({
  label,
  hour,
  minute,
  onHourChange,
  onMinuteChange,
  className = ''
}: TimePickerSectionProps) {
  return (
    <View className={`mb-8 ${className}`}>
      <Text className="text-xl font-semibold mb-4 text-gray-900">{label}</Text>
      <View className="flex-row space-x-4">
        <View className="flex-1">
          <Text className="text-lg text-gray-600 mb-3">Hour</Text>
          <View className="border border-gray-200 rounded-2xl bg-gray-50">
            <Picker
              selectedValue={hour}
              onValueChange={onHourChange}
              style={{ color: '#111827', height: 60 }}
            >
              {HOURS_ARRAY.map((h) => (
                <Picker.Item 
                  key={h} 
                  label={h.toString().padStart(2, '0')} 
                  value={h} 
                />
              ))}
            </Picker>
          </View>
        </View>
        <View className="flex-1">
          <Text className="text-lg text-gray-600 mb-3">Minute</Text>
          <View className="border border-gray-200 rounded-2xl bg-gray-50">
            <Picker
              selectedValue={minute}
              onValueChange={onMinuteChange}
              style={{ color: '#111827', height: 60 }}
            >
              {MINUTES_ARRAY.map((m) => (
                <Picker.Item 
                  key={m} 
                  label={m.toString().padStart(2, '0')} 
                  value={m} 
                />
              ))}
            </Picker>
          </View>
        </View>
      </View>
    </View>
  );
}
