import React from 'react';
import { Pressable, Text } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
}

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false,
  className = ''
}: ButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return disabled 
          ? 'bg-gray-300' 
          : 'bg-gray-900';
      case 'secondary':
        return disabled 
          ? 'bg-gray-100 border border-gray-200' 
          : 'bg-gray-100 border border-gray-200';
      case 'danger':
        return disabled 
          ? 'bg-red-200' 
          : 'bg-red-500';
      default:
        return 'bg-gray-900';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-4 py-2 rounded-xl';
      case 'medium':
        return 'px-6 py-4 rounded-2xl';
      case 'large':
        return 'px-8 py-5 rounded-2xl';
      default:
        return 'px-6 py-4 rounded-2xl';
    }
  };

  const getTextClasses = () => {
    const baseClasses = 'font-semibold';
    const sizeClasses = size === 'small' ? 'text-sm' : size === 'large' ? 'text-xl' : 'text-base';
    
    if (disabled) {
      return `${baseClasses} ${sizeClasses} text-gray-500`;
    }

    switch (variant) {
      case 'primary':
        return `${baseClasses} ${sizeClasses} text-white`;
      case 'secondary':
        return `${baseClasses} ${sizeClasses} text-gray-700`;
      case 'danger':
        return `${baseClasses} ${sizeClasses} text-white`;
      default:
        return `${baseClasses} ${sizeClasses} text-white`;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex items-center justify-center ${getVariantClasses()} ${getSizeClasses()} ${className}`}
    >
      <Text className={getTextClasses()}>
        {title}
      </Text>
    </Pressable>
  );
}
