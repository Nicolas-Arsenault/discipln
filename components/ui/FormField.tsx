import React from 'react';
import { Text, TextInput, View } from 'react-native';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  autoFocus?: boolean;
  className?: string;
}

export default function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numberOfLines = 1,
  autoFocus = false,
  className = ''
}: FormFieldProps) {
  return (
    <View className={`mb-6 ${className}`}>
      <Text className="text-xl font-semibold mb-4 text-gray-900">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        className={`border border-gray-200 rounded-2xl px-6 py-5 text-xl bg-gray-50 text-gray-900 ${
          multiline ? 'min-h-[200px]' : ''
        }`}
        multiline={multiline}
        numberOfLines={numberOfLines}
        autoFocus={autoFocus}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}
