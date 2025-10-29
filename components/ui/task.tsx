import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface TaskProps {
  id: number;
  title: string;
  hours?: number;
  minutes?: number;
  seconds?: number;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
}

export default function Task({ id, title, hours = 0, minutes = 0, seconds = 0, onDelete, onEdit }: TaskProps) {
  const formatTime = () => {
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Task",
      `Are you sure you want to delete "${title}"?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(id)
        }
      ]
    );
  };

  return (
    <View className='flex-row justify-between items-center bg-white p-5 rounded-xl mb-3 shadow-sm border border-gray-100'>
      <View className='flex-1'>
        <Text className="text-lg font-semibold mb-2 text-gray-900">{title}</Text>
        <View className="flex-row items-center">
          <View className="w-2 h-2 bg-gray-400 rounded-full mr-2"></View>
          <Text className="text-sm text-gray-500">Notification at {formatTime()}</Text>
        </View>
      </View>
      <View className="flex-row">
        <Pressable
          onPress={() => onEdit(id)}
          className="mr-3 p-2 bg-gray-50 rounded-lg"
        >
          <Icon name="edit" size={20} color="#6b7280" />
        </Pressable>
        <Pressable
          onPress={handleDelete}
          className="p-2 bg-red-50 rounded-lg"
        >
          <Icon name="delete" size={20} color="#ef4444" />
        </Pressable>
      </View>
    </View>
  )
}