import React from 'react';
import { Text, View } from 'react-native';
import Button from '../ui/Button';

interface EmptyStateProps {
  title: string;
  subtitle: string;
  buttonTitle: string;
  onButtonPress: () => void;
}

export default function EmptyState({
  title,
  subtitle,
  buttonTitle,
  onButtonPress
}: EmptyStateProps) {
  return (
    <View className="flex-1 justify-center items-center py-20">
      <View className="items-center max-w-md">
        <Text className="text-3xl font-bold text-gray-800 text-center mb-4">
          {title}
        </Text>
        <Text className="text-xl text-gray-500 text-center mb-8 leading-7">
          {subtitle}
        </Text>
        <Button 
          title={buttonTitle}
          onPress={onButtonPress}
          size="large"
        />
      </View>
    </View>
  );
}
