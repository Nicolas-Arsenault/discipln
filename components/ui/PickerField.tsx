import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { Text, View } from 'react-native';

interface PickerOption {
  label: string;
  value: string | number;
}

interface PickerFieldProps {
  label: string;
  selectedValue: string | number;
  onValueChange: (value: string | number) => void;
  options: PickerOption[];
  className?: string;
}

export default function PickerField({
  label,
  selectedValue,
  onValueChange,
  options,
  className = ''
}: PickerFieldProps) {
  return (
    <View className={`mb-6 ${className}`}>
      <Text className="text-xl font-semibold mb-4 text-gray-900">{label}</Text>
      <View className="border border-gray-200 rounded-2xl bg-gray-50">
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={{ color: '#111827', height: 60, fontSize: 18 }}
        >
          {options.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>
    </View>
  );
}
