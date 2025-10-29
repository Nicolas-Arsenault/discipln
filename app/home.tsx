import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGoals } from '../hooks/useGoals';
import { Goal } from '../types';
import { router } from 'expo-router';

export default function Home() {
  const insets = useSafeAreaInsets();
  const { goals, goalProgress, loadGoalsAndProgress, saveProgress } = useGoals();
  const [todayProgress, setTodayProgress] = useState<{ [goalId: number]: boolean }>({});
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadGoalsAndProgress();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadGoalsAndProgress();
    }, [loadGoalsAndProgress])
  );

  // Update today's progress state when goalProgress changes
  useEffect(() => {
    const todayProgressMap: { [goalId: number]: boolean } = {};
    goalProgress.forEach(progress => {
      if (progress.date === today) {
        todayProgressMap[progress.goalId] = progress.completed;
      }
    });
    setTodayProgress(todayProgressMap);
  }, [goalProgress, today]);

  const toggleGoalProgress = async (goalId: number) => {
    const currentStatus = todayProgress[goalId] || false;
    const newStatus = !currentStatus;

    // Update local state immediately for responsive UI
    setTodayProgress(prev => ({
      ...prev,
      [goalId]: newStatus
    }));

    // Update the progress in storage
    const existingProgress = goalProgress.find(p => p.goalId === goalId && p.date === today);
    
    let updatedProgress;
    if (existingProgress) {
      // Update existing progress
      updatedProgress = goalProgress.map(p => 
        p.goalId === goalId && p.date === today 
          ? { ...p, completed: newStatus }
          : p
      );
    } else {
      // Create new progress entry
      const newProgress = {
        goalId,
        date: today,
        completed: newStatus,
      };
      updatedProgress = [...goalProgress, newProgress];
    }

    await saveProgress(updatedProgress);
  };

  const getCategoryIcon = (category: Goal['category']) => {
    switch (category) {
      case 'health': return 'fitness';
      case 'career': return 'briefcase';
      case 'personal': return 'person';
      case 'learning': return 'book';
      default: return 'flag';
    }
  };

  const getCategoryColor = (category: Goal['category']) => {
    switch (category) {
      case 'health': return '#ef4444';
      case 'career': return '#3b82f6';
      case 'personal': return '#8b5cf6';
      case 'learning': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const completedToday = Object.values(todayProgress).filter(Boolean).length;

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pb-3" style={{ paddingTop: insets.top + 8 }}>
          <Text className="text-2xl font-bold text-gray-900 mb-1.5 text-center tracking-tight">
            Daily Check-in
          </Text>
          <Text className="text-sm text-gray-500 text-center font-medium">
            {formatDate(new Date())}
          </Text>
        </View>

        {/* Progress Summary */}
        {goals.length > 0 && (
          <View className="px-5 mb-4">
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-3">
                <View className="bg-gray-100 rounded-xl p-2 mr-3">
                  <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                </View>
                <Text className="text-lg font-bold text-gray-900 flex-1">
                  Today's Progress
                </Text>
              </View>
              <Text className="text-sm text-gray-500 mb-4">
                Keep up the momentum! Track your daily goal achievements.
              </Text>
              <View className="flex-row items-center">
                <Text className="text-3xl font-bold text-green-600 mr-2">
                  {completedToday}
                </Text>
                <Text className="text-base text-gray-500">
                  of {goals.length} goals completed
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Goals List */}
        <View className="px-5 pb-20">
          {goals.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-100">
              <View className="bg-gray-100 rounded-full p-4 mb-5">
                <Ionicons name="flag-outline" size={32} color="#6b7280" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
                No Goals Yet
              </Text>
              <Text className="text-base text-gray-500 text-center mb-6 leading-6">
                Create your first goal to start tracking your daily progress and build lasting habits.
              </Text>
              <Pressable
                onPress={() => router.push('/goalTracking')}
                className="bg-gray-900 rounded-xl px-6 py-3"
              >
                <Text className="text-white font-semibold text-base">
                  Create Your First Goal
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text className="text-lg font-bold text-gray-900 mb-4">
                Which goals have you worked on today?
              </Text>
              
              {goals.map((goal) => {
                const isCompleted = todayProgress[goal.id] || false;
                
                return (
                  <Pressable
                    key={goal.id}
                    onPress={() => toggleGoalProgress(goal.id)}
                    className={`bg-white rounded-2xl p-4 mb-3 flex-row items-center shadow-sm border-2 ${
                      isCompleted ? 'border-green-500' : 'border-gray-100'
                    }`}
                  >
                    {/* Category Icon */}
                    <View 
                      className="rounded-xl p-2.5 mr-4"
                      style={{ backgroundColor: getCategoryColor(goal.category) + '20' }}
                    >
                      <Ionicons 
                        name={getCategoryIcon(goal.category)} 
                        size={20} 
                        color={getCategoryColor(goal.category)} 
                      />
                    </View>

                    {/* Goal Content */}
                    <View className="flex-1">
                      <Text className="text-base font-bold text-gray-900 mb-1">
                        {goal.title}
                      </Text>
                      {goal.description && (
                        <Text className="text-sm text-gray-500 mb-1">
                          {goal.description}
                        </Text>
                      )}
                      <Text className="text-xs text-gray-500 capitalize">
                        {goal.category} • {goal.targetDays} days target
                      </Text>
                    </View>

                    {/* Checkbox */}
                    <View 
                      className={`w-7 h-7 rounded-full border-2 items-center justify-center ${
                        isCompleted 
                          ? 'border-green-500 bg-green-500' 
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isCompleted && (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
