import "@/globals.css";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

interface Goal {
  id: number;
  title: string;
  description: string;
  targetDays: number;
  createdAt: string;
  category: 'health' | 'career' | 'personal' | 'learning' | 'other';
}

interface GoalProgress {
  goalId: number;
  date: string;
  completed: boolean;
  notes?: string;
}

const goalTracking = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalProgress, setGoalProgress] = useState<GoalProgress[]>([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isProgressModalVisible, setIsProgressModalVisible] = useState(false);
  
  // Create goal form state
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalTargetDays, setNewGoalTargetDays] = useState('30');
  const [newGoalCategory, setNewGoalCategory] = useState<Goal['category']>('personal');

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadGoalsAndProgress();
  }, []);

  const loadGoalsAndProgress = async () => {
    try {
      const savedGoals = await AsyncStorage.getItem('goals');
      const savedProgress = await AsyncStorage.getItem('goalProgress');
      
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      }
      if (savedProgress) {
        setGoalProgress(JSON.parse(savedProgress));
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const saveGoals = async (updatedGoals: Goal[]) => {
    try {
      await AsyncStorage.setItem('goals', JSON.stringify(updatedGoals));
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  };

  const saveProgress = async (updatedProgress: GoalProgress[]) => {
    try {
      await AsyncStorage.setItem('goalProgress', JSON.stringify(updatedProgress));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const createGoal = async () => {
    if (!newGoalTitle.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    const newGoal: Goal = {
      id: Date.now(),
      title: newGoalTitle.trim(),
      description: newGoalDescription.trim(),
      targetDays: parseInt(newGoalTargetDays) || 30,
      createdAt: new Date().toISOString(),
      category: newGoalCategory,
    };

    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    await saveGoals(updatedGoals);

    // Reset form
    setNewGoalTitle('');
    setNewGoalDescription('');
    setNewGoalTargetDays('30');
    setNewGoalCategory('personal');
    setIsCreateModalVisible(false);
  };

  const deleteGoal = async (goalId: number) => {
    const goalToDelete = goals.find(goal => goal.id === goalId);
    
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goalToDelete?.title}"? This will also remove all progress data for this goal.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Remove goal from goals array
            const updatedGoals = goals.filter(goal => goal.id !== goalId);
            setGoals(updatedGoals);
            await saveGoals(updatedGoals);

            // Remove all progress entries for this goal
            const updatedProgress = goalProgress.filter(progress => progress.goalId !== goalId);
            setGoalProgress(updatedProgress);
            await saveProgress(updatedProgress);
          }
        }
      ]
    );
  };

  const toggleTodayProgress = async (goalId: number) => {
    const today = new Date().toISOString().split('T')[0];
    const existingProgress = goalProgress.find(p => p.goalId === goalId && p.date === today);
    
    let updatedProgress;
    if (existingProgress) {
      // Toggle existing progress
      updatedProgress = goalProgress.map(p => 
        p.goalId === goalId && p.date === today 
          ? { ...p, completed: !p.completed }
          : p
      );
    } else {
      // Create new progress entry
      const newProgress: GoalProgress = {
        goalId,
        date: today,
        completed: true,
      };
      updatedProgress = [...goalProgress, newProgress];
    }

    setGoalProgress(updatedProgress);
    await saveProgress(updatedProgress);
  };

  const getGoalStats = (goalId: number) => {
    const goalProgressEntries = goalProgress.filter(p => p.goalId === goalId);
    const completedDays = goalProgressEntries.filter(p => p.completed).length;
    const totalDays = goalProgressEntries.length;
    const goal = goals.find(g => g.id === goalId);
    
    if (!goal) return { completedDays: 0, totalDays: 0, percentage: 0, streak: 0 };

    // Calculate current streak
    const sortedEntries = goalProgressEntries
      .filter(p => p.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        streak++;
      } else {
        break;
      }
    }

    const percentage = goal.targetDays > 0 ? (completedDays / goal.targetDays) * 100 : 0;
    
    return { completedDays, totalDays, percentage: Math.min(percentage, 100), streak };
  };

  const getWeeklyProgressData = (goalId: number) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const progress = goalProgress.find(p => p.goalId === goalId && p.date === date);
      return {
        date,
        dayName: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
        completed: progress?.completed || false
      };
    });
  };

  const getOverallWeeklyData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayProgress = goalProgress.filter(p => p.date === date);
      const completedGoals = dayProgress.filter(p => p.completed).length;
      const totalGoalsForDay = goals.length;
      const percentage = totalGoalsForDay > 0 ? (completedGoals / totalGoalsForDay) * 100 : 0;
      
      return {
        date,
        dayName: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
        completedGoals,
        totalGoals: totalGoalsForDay,
        percentage
      };
    });
  };

  const OverallProgressChart = () => {
    const weeklyData = getOverallWeeklyData();
    const maxHeight = 80;
    
    return (
      <View>
        <View className="flex-row justify-between items-end h-24 mb-4">
          {weeklyData.map((day, index) => (
            <View key={day.date} className="items-center flex-1">
              <View className="flex-1 justify-end mb-2">
                <View 
                  className="w-8 rounded-t-lg bg-gradient-to-t from-blue-500 to-green-500"
                  style={{ 
                    height: Math.max((day.percentage / 100) * maxHeight, 8),
                    backgroundColor: day.percentage > 75 ? '#22c55e' : day.percentage > 50 ? '#3b82f6' : day.percentage > 25 ? '#f59e0b' : '#e5e7eb'
                  }}
                />
              </View>
              <Text className="text-xs text-gray-500 font-medium">{day.dayName}</Text>
              <Text className="text-xs text-gray-400">{day.completedGoals}/{day.totalGoals}</Text>
            </View>
          ))}
        </View>
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-green-500 mr-2" />
            <Text className="text-xs text-gray-500">75%+ Complete</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
            <Text className="text-xs text-gray-500">50-75%</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-amber-500 mr-2" />
            <Text className="text-xs text-gray-500">25-50%</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-gray-300 mr-2" />
            <Text className="text-xs text-gray-500">0-25%</Text>
          </View>
        </View>
      </View>
    );
  };

  const WeeklyProgressChart = ({ goalId }: { goalId: number }) => {
    const weeklyData = getWeeklyProgressData(goalId);
    
    return (
      <View className="bg-gray-50 rounded-2xl p-4 mb-6">
        <Text className="text-base font-semibold mb-4 text-gray-900">Last 7 Days Progress</Text>
        <View className="flex-row justify-between items-end h-24">
          {weeklyData.map((day, index) => (
            <View key={day.date} className="items-center flex-1">
              <View className="flex-1 justify-end mb-2">
                <View 
                  className={`w-6 rounded-t-lg ${day.completed ? 'bg-green-500' : 'bg-gray-200'}`}
                  style={{ height: day.completed ? 60 : 20 }}
                />
              </View>
              <Text className="text-xs text-gray-500 font-medium">{day.dayName}</Text>
            </View>
          ))}
        </View>
        <View className="flex-row justify-between mt-2">
          <Text className="text-xs text-gray-400">Incomplete</Text>
          <Text className="text-xs text-gray-400">Complete</Text>
        </View>
      </View>
    );
  };

  const CircularProgress = ({ percentage, size = 80 }: { percentage: number; size?: number }) => {
    return (
      <View className="items-center justify-center" style={{ width: size, height: size }}>
        <View 
          className="absolute border-4 border-gray-200 rounded-full"
          style={{ width: size, height: size }}
        />
        <View 
          className="absolute border-4 rounded-full"
          style={{ 
            width: size, 
            height: size,
            borderTopColor: percentage > 0 ? '#22c55e' : 'transparent',
            borderRightColor: percentage > 25 ? '#22c55e' : 'transparent',
            borderBottomColor: percentage > 50 ? '#22c55e' : 'transparent',
            borderLeftColor: percentage > 75 ? '#22c55e' : 'transparent',
            transform: [{ rotate: '-90deg' }],
          }}
        />
        <Text className="text-lg font-bold text-gray-900">{Math.round(percentage)}%</Text>
      </View>
    );
  };

  const getTodayProgress = (goalId: number) => {
    const today = new Date().toISOString().split('T')[0];
    const todayProgress = goalProgress.find(p => p.goalId === goalId && p.date === today);
    return todayProgress?.completed || false;
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

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 pt-6" showsVerticalScrollIndicator={false}>
        {/* Header Stats */}
        <View className="px-4 mb-6">
          <View className="flex-row justify-between">
            <View className="bg-white rounded-xl p-4 flex-1 mr-2 shadow-sm border border-gray-100">
              <Text className="text-2xl font-bold text-gray-900">{goals.length}</Text>
              <Text className="text-sm text-gray-500">Active Goals</Text>
            </View>
            <View className="bg-white rounded-xl p-4 flex-1 mx-1 shadow-sm border border-gray-100">
              <Text className="text-2xl font-bold text-green-600">
                {goals.reduce((acc, goal) => acc + getGoalStats(goal.id).completedDays, 0)}
              </Text>
              <Text className="text-sm text-gray-500">Total Days</Text>
            </View>
            <View className="bg-white rounded-xl p-4 flex-1 ml-2 shadow-sm border border-gray-100">
              <Text className="text-2xl font-bold text-blue-600">
                {goals.length > 0 ? Math.round(goals.reduce((acc, goal) => acc + getGoalStats(goal.id).percentage, 0) / goals.length) : 0}%
              </Text>
              <Text className="text-sm text-gray-500">Avg Progress</Text>
            </View>
          </View>
        </View>

        {/* Overall Progress Graph Widget */}
        {goals.length > 0 && (
          <View className="px-4 mb-6">
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-gray-900">Weekly Overview</Text>
                <Ionicons name="trending-up" size={20} color="#22c55e" />
              </View>
              <OverallProgressChart />
            </View>
          </View>
        )}

        {/* Goals List */}
        <View className="px-4">
          {goals.length > 0 && (
            <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <View className="flex-row items-center">
                <Ionicons name="information-circle" size={20} color="#2563eb" />
                <Text className="text-blue-700 text-sm font-medium ml-2 flex-1">
                  Tap the checkmark button on each goal to mark today's progress as complete!
                </Text>
              </View>
            </View>
          )}
          
          {goals.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 items-center">
              <View className="bg-gray-100 rounded-full p-4 mb-4">
                <Ionicons name="flag-outline" size={32} color="#6b7280" />
              </View>
              <Text className="text-xl font-semibold text-gray-900 mb-2">No Goals Yet</Text>
              <Text className="text-gray-500 text-center mb-6">
                Set your first goal and track your daily progress with simple taps!
              </Text>
              <Pressable
                className="bg-gray-900 rounded-xl px-6 py-3"
                onPress={() => setIsCreateModalVisible(true)}
              >
                <Text className="text-white font-semibold">Create Your First Goal</Text>
              </Pressable>
            </View>
          ) : (
            goals.map((goal) => {
              const stats = getGoalStats(goal.id);
              const isTodayCompleted = getTodayProgress(goal.id);
              
              return (
                <View key={goal.id} className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-gray-100">
                  <View className="flex-row items-start justify-between mb-4">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-2">
                        <View 
                          className="rounded-full p-2 mr-3"
                          style={{ backgroundColor: getCategoryColor(goal.category) + '20' }}
                        >
                          <Ionicons 
                            name={getCategoryIcon(goal.category)} 
                            size={16} 
                            color={getCategoryColor(goal.category)} 
                          />
                        </View>
                        <Text className="text-lg font-bold text-gray-900 flex-1">{goal.title}</Text>
                        <Pressable
                          className="p-1 mr-2"
                          onPress={() => deleteGoal(goal.id)}
                        >
                          <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </Pressable>
                        <Pressable
                          className={`w-10 h-10 rounded-full items-center justify-center border-2 ${
                            isTodayCompleted 
                              ? 'bg-green-500 border-green-500' 
                              : 'bg-white border-gray-300'
                          }`}
                          onPress={() => toggleTodayProgress(goal.id)}
                        >
                          <Ionicons 
                            name="checkmark" 
                            size={18} 
                            color={isTodayCompleted ? "#ffffff" : "#9ca3af"} 
                          />
                        </Pressable>
                      </View>
                      {goal.description ? (
                        <Text className="text-gray-600 mb-3">{goal.description}</Text>
                      ) : null}
                    </View>
                  </View>

                  {/* Progress Section */}
                  <View className="mb-4 flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-sm font-medium text-gray-700">Progress</Text>
                        <Text className="text-sm text-gray-500">
                          {stats.completedDays}/{goal.targetDays} days
                        </Text>
                      </View>
                      <View className="bg-gray-200 rounded-full h-2">
                        <View 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${stats.percentage}%` }}
                        />
                      </View>
                    </View>
                    <View className="ml-4">
                      <CircularProgress percentage={stats.percentage} size={60} />
                    </View>
                  </View>

                  {/* Stats Row */}
                  <View className="flex-row justify-between items-center">
                    <View className="items-center">
                      <Text className="text-lg font-bold text-green-600">{stats.streak}</Text>
                      <Text className="text-xs text-gray-500">Day Streak</Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-lg font-bold text-blue-600">{Math.round(stats.percentage)}%</Text>
                      <Text className="text-xs text-gray-500">Complete</Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-lg font-bold text-purple-600">{stats.completedDays}</Text>
                      <Text className="text-xs text-gray-500">Total Days</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <Pressable
        className="absolute bottom-8 right-6 rounded-full bg-gray-900 w-16 h-16 flex items-center justify-center shadow-lg"
        onPress={() => setIsCreateModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </Pressable>

      {/* Create Goal Modal */}
      <Modal
        visible={isCreateModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCreateModalVisible(false)}
      >
        <View className="flex-1 shadow justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[90%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900">Create New Goal</Text>
              <Pressable onPress={() => setIsCreateModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Text className="text-base font-semibold mb-2 text-gray-900">Goal Title *</Text>
                <TextInput
                  value={newGoalTitle}
                  onChangeText={setNewGoalTitle}
                  placeholder="e.g., Exercise daily, Read 30 minutes"
                  className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                />
              </View>

              <View className="mb-4">
                <Text className="text-base font-semibold mb-2 text-gray-900">Description</Text>
                <TextInput
                  value={newGoalDescription}
                  onChangeText={setNewGoalDescription}
                  placeholder="Optional: Add more details about your goal"
                  multiline
                  numberOfLines={3}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                  textAlignVertical="top"
                />
              </View>

              <View className="mb-4">
                <Text className="text-base font-semibold mb-2 text-gray-900">Target Days</Text>
                <TextInput
                  value={newGoalTargetDays}
                  onChangeText={setNewGoalTargetDays}
                  placeholder="30"
                  keyboardType="numeric"
                  className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                />
              </View>

              <View className="mb-6">
                <Text className="text-base font-semibold mb-3 text-gray-900">Category</Text>
                <View className="flex-row flex-wrap">
                  {(['health', 'career', 'personal', 'learning', 'other'] as const).map((category) => (
                    <Pressable
                      key={category}
                      className={`mr-3 mb-3 px-4 py-2 rounded-full border ${
                        newGoalCategory === category 
                          ? 'border-gray-900 bg-gray-900' 
                          : 'border-gray-300 bg-white'
                      }`}
                      onPress={() => setNewGoalCategory(category)}
                    >
                      <Text className={`font-medium capitalize ${
                        newGoalCategory === category ? 'text-white' : 'text-gray-700'
                      }`}>
                        {category}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Pressable
                className="bg-gray-900 rounded-xl py-4 items-center"
                onPress={createGoal}
              >
                <Text className="text-white font-semibold text-base">Create Goal</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Progress Chart Modal */}
      <Modal
        visible={isProgressModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsProgressModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center px-4">
          <View className="bg-white rounded-3xl p-6 max-h-[80%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900">
                {selectedGoal?.title}
              </Text>
              <Pressable onPress={() => setIsProgressModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </Pressable>
            </View>

            {selectedGoal && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <WeeklyProgressChart goalId={selectedGoal.id} />

                <View className="mt-6">
                  <Text className="text-base font-semibold mb-4 text-gray-900">Goal Overview</Text>
                  {(() => {
                    const stats = getGoalStats(selectedGoal.id);
                    return (
                      <View className="bg-gray-50 rounded-xl p-4">
                        <View className="flex-row justify-between items-center mb-3">
                          <Text className="text-gray-600">Completion Rate</Text>
                          <Text className="font-bold text-gray-900">{Math.round(stats.percentage)}%</Text>
                        </View>
                        <View className="flex-row justify-between items-center mb-3">
                          <Text className="text-gray-600">Days Completed</Text>
                          <Text className="font-bold text-gray-900">{stats.completedDays}/{selectedGoal.targetDays}</Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                          <Text className="text-gray-600">Current Streak</Text>
                          <Text className="font-bold text-green-600">{stats.streak} days</Text>
                        </View>
                      </View>
                    );
                  })()}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default goalTracking;