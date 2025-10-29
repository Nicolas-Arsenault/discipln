import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  className?: string;
}

export default function Header({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  className = ''
}: HeaderProps) {
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View className={`flex-row justify-between items-center mb-8 px-8 pt-8 ${className}`}>
      <View className="flex-1">
        <Text className="text-3xl font-bold text-gray-900">{title}</Text>
        {subtitle && (
          <Text className="text-lg text-gray-500 mt-2">{subtitle}</Text>
        )}
      </View>
      {showBackButton && (
        <Pressable 
          onPress={handleBackPress}
          className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center"
        >
          <Icon name="close" size={24} color="#6b7280" />
        </Pressable>
      )}
    </View>
  );
}
