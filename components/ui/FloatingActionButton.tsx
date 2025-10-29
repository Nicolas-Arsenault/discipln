import React from 'react';
import { Pressable, Text } from 'react-native';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string;
  className?: string;
}

export default function FloatingActionButton({ 
  onPress, 
  icon = '+',
  className = ''
}: FloatingActionButtonProps) {
  return (
    <Pressable 
      className={`absolute bottom-10 right-8 rounded-full bg-gray-900 w-20 h-20 flex items-center justify-center shadow-lg ${className}`}
      onPress={onPress}
    >
      <Text className="text-4xl font-bold text-white">{icon}</Text>  
    </Pressable>
  );
}
