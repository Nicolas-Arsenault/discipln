import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { WeekDay } from '../../types';
import { capitalizeDay } from '../../utils';

interface DayNavigationHeaderProps {
  selectedDay: string | null;
  onDaySelection: (day: string | null) => void;
  weekDays: readonly WeekDay[];
}

export default function DayNavigationHeader({
  selectedDay,
  onDaySelection,
  weekDays
}: DayNavigationHeaderProps) {
  return (
    <View className="px-6 pt-16 pb-6 bg-white border-b border-gray-100">
      <Text className="text-3xl font-bold text-gray-900 text-center mb-6">My Routine</Text>
      
      {/* Day shortcuts */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        className="flex-row"
        contentContainerStyle={{ paddingHorizontal: 0 }}
      >
        <Pressable
          onPress={() => onDaySelection(null)}
          className={`mr-4 px-6 py-3 rounded-2xl ${
            selectedDay === null ? 'bg-gray-900 shadow-md' : 'bg-gray-100'
          }`}
        >
          <Text className={`text-lg font-bold ${
            selectedDay === null ? 'text-white' : 'text-gray-700'
          }`}>
            All Days
          </Text>
        </Pressable>
        
        {weekDays.map((day, index) => (
          <Pressable
            key={`${day}-${index}`}
            onPress={() => onDaySelection(day)}
            className={`mr-4 px-6 py-3 rounded-2xl ${
              selectedDay === day ? 'bg-gray-900 shadow-md' : 'bg-gray-100'
            }`}
          >
            <Text className={`text-lg font-bold ${
              selectedDay === day ? 'text-white' : 'text-gray-700'
            }`}>
              {capitalizeDay(day)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
