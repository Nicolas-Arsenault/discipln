import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
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
        headerStyle: {
          backgroundColor: '#1f2937',
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 8,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontSize: 24,
          fontWeight: '300',
          color: '#f8fafc',
          letterSpacing: 2,
          fontFamily: 'System',
          textTransform: 'uppercase',
        },
        headerTitleAlign: 'center',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Weekly Routine',
          headerTitle: 'Routine Maker',
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
          headerTitle: 'Discipln',
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
          headerTitle: 'Discipln',
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
  );
}