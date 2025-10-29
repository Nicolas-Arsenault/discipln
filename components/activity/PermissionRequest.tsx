import React from 'react';
import { Text, View } from 'react-native';
import Button from '../ui/Button';

interface PermissionRequestProps {
  onRequestPermissions: () => void;
}

export default function PermissionRequest({ onRequestPermissions }: PermissionRequestProps) {
  return (
    <View className="flex-1 bg-gray-50 justify-center items-center px-6">
      <View className="bg-white rounded-2xl p-8 shadow-lg w-full max-w-sm">
        <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
          Notifications Required
        </Text>
        <Text className="text-base text-gray-600 text-center mb-6 leading-6">
          Motiv needs notification permissions to remind you about your activities at the scheduled times.
        </Text>
        <Button 
          title="Enable Notifications"
          onPress={onRequestPermissions}
          className="mb-3"
        />
        <Text className="text-sm text-gray-500 text-center">
          Without notifications, the app cannot function properly
        </Text>
      </View>
    </View>
  );
}
