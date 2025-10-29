import React from 'react';
import { Text, View } from 'react-native';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <View className="flex-1 bg-gray-50 justify-center items-center">
      <Text className="text-lg text-gray-600">{message}</Text>
    </View>
  );
}
