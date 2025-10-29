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
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: insets.top + 20, paddingBottom: 20 }}>
          <Text style={{ 
            fontSize: 32, 
            fontWeight: '800', 
            color: '#111827', 
            marginBottom: 8, 
            textAlign: 'center',
            letterSpacing: -0.5 
          }}>
            Daily Check-in
          </Text>
          <Text style={{ 
            fontSize: 16, 
            color: '#64748B', 
            textAlign: 'center',
            fontWeight: '500'
          }}>
            {formatDate(new Date())}
          </Text>
        </View>

        {/* Progress Summary */}
        {goals.length > 0 && (
          <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              padding: 20,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              borderWidth: 1,
              borderColor: '#E2E8F0'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={{
                  backgroundColor: '#EEF2FF',
                  borderRadius: 12,
                  padding: 8,
                  marginRight: 12
                }}>
                  <Ionicons name="checkmark-circle" size={24} color="#4F46E5" />
                </View>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E293B', flex: 1 }}>
                  Today's Progress
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: '#64748B', marginBottom: 16 }}>
                Keep up the momentum! Track your daily goal achievements.
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 28, fontWeight: '800', color: '#4F46E5', marginRight: 8 }}>
                  {completedToday}
                </Text>
                <Text style={{ fontSize: 16, color: '#64748B' }}>
                  of {goals.length} goals completed
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Goals List */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 100 }}>
          {goals.length === 0 ? (
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              padding: 32,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              borderWidth: 1,
              borderColor: '#E2E8F0'
            }}>
              <View style={{
                backgroundColor: '#F1F5F9',
                borderRadius: 20,
                padding: 16,
                marginBottom: 20
              }}>
                <Ionicons name="flag-outline" size={32} color="#64748B" />
              </View>
              <Text style={{ 
                fontSize: 20, 
                fontWeight: '700', 
                color: '#1E293B', 
                marginBottom: 8,
                textAlign: 'center'
              }}>
                No Goals Yet
              </Text>
              <Text style={{ 
                fontSize: 16, 
                color: '#64748B', 
                textAlign: 'center', 
                marginBottom: 24,
                lineHeight: 24
              }}>
                Create your first goal to start tracking your daily progress and build lasting habits.
              </Text>
              <Pressable
                onPress={() => router.push('/goalTracking')}
                style={{
                  backgroundColor: '#4F46E5',
                  borderRadius: 12,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  shadowColor: '#4F46E5',
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 4 }
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>
                  Create Your First Goal
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: '700', 
                color: '#1E293B', 
                marginBottom: 16 
              }}>
                Which goals have you worked on today?
              </Text>
              
              {goals.map((goal) => {
                const isCompleted = todayProgress[goal.id] || false;
                
                return (
                  <Pressable
                    key={goal.id}
                    onPress={() => toggleGoalProgress(goal.id)}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      shadowColor: '#000',
                      shadowOpacity: 0.08,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 2 },
                      borderWidth: 2,
                      borderColor: isCompleted ? '#10B981' : '#E2E8F0'
                    }}
                  >
                    {/* Category Icon */}
                    <View style={{
                      backgroundColor: getCategoryColor(goal.category) + '20',
                      borderRadius: 12,
                      padding: 10,
                      marginRight: 16
                    }}>
                      <Ionicons 
                        name={getCategoryIcon(goal.category)} 
                        size={20} 
                        color={getCategoryColor(goal.category)} 
                      />
                    </View>

                    {/* Goal Content */}
                    <View style={{ flex: 1 }}>
                      <Text style={{ 
                        fontSize: 16, 
                        fontWeight: '700', 
                        color: '#1E293B',
                        marginBottom: 4
                      }}>
                        {goal.title}
                      </Text>
                      {goal.description && (
                        <Text style={{ 
                          fontSize: 14, 
                          color: '#64748B',
                          marginBottom: 4
                        }}>
                          {goal.description}
                        </Text>
                      )}
                      <Text style={{ 
                        fontSize: 12, 
                        color: '#64748B',
                        textTransform: 'capitalize'
                      }}>
                        {goal.category} • {goal.targetDays} days target
                      </Text>
                    </View>

                    {/* Checkbox */}
                    <View style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      borderWidth: 2,
                      borderColor: isCompleted ? '#10B981' : '#CBD5E1',
                      backgroundColor: isCompleted ? '#10B981' : '#FFFFFF',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
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
