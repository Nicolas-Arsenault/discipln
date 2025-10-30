import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1f2937',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 20,
          height: 85,
          paddingBottom: 25,
          paddingTop: 12,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={focused ? 28 : 24} 
              color={focused ? '#1f2937' : color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Routine',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "calendar" : "calendar-outline"} 
              size={focused ? 28 : 24} 
              color={focused ? '#1f2937' : color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="journaling"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "book" : "book-outline"} 
              size={focused ? 28 : 24} 
              color={focused ? '#1f2937' : color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="goalTracking"
        options={{
          title: 'Goals',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "flag" : "flag-outline"} 
              size={focused ? 28 : 24} 
              color={focused ? '#1f2937' : color} 
            />
          ),
        }}
      />

    </Tabs>
    </SafeAreaProvider>
  );
}