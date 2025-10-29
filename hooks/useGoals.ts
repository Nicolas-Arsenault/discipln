import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { Goal, GoalProgress } from '../types';

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalProgress, setGoalProgress] = useState<GoalProgress[]>([]);

  const loadGoalsAndProgress = useCallback(async () => {
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
  }, []);

  const saveGoals = useCallback(async (updatedGoals: Goal[]) => {
    try {
      await AsyncStorage.setItem('goals', JSON.stringify(updatedGoals));
      setGoals(updatedGoals);
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  }, []);

  const saveProgress = useCallback(async (updatedProgress: GoalProgress[]) => {
    try {
      await AsyncStorage.setItem('goalProgress', JSON.stringify(updatedProgress));
      setGoalProgress(updatedProgress);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, []);

  const createGoal = useCallback(async (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    if (!goalData.title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return false;
    }

    const newGoal: Goal = {
      id: Date.now(),
      title: goalData.title.trim(),
      description: goalData.description.trim(),
      targetDays: goalData.targetDays || 30,
      createdAt: new Date().toISOString(),
      category: goalData.category,
    };

    const updatedGoals = [...goals, newGoal];
    await saveGoals(updatedGoals);
    return newGoal;
  }, [goals, saveGoals]);

  const deleteGoal = useCallback(async (goalId: number) => {
    const goalToDelete = goals.find(goal => goal.id === goalId);
    
    return new Promise<void>((resolve) => {
      Alert.alert(
        'Delete Goal',
        `Are you sure you want to delete "${goalToDelete?.title}"? This will also remove all progress data for this goal.`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve() },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              // Remove goal from goals array
              const updatedGoals = goals.filter(goal => goal.id !== goalId);
              await saveGoals(updatedGoals);

              // Remove all progress entries for this goal
              const updatedProgress = goalProgress.filter(progress => progress.goalId !== goalId);
              await saveProgress(updatedProgress);
              resolve();
            }
          }
        ]
      );
    });
  }, [goals, goalProgress, saveGoals, saveProgress]);

  const getGoalById = useCallback((goalId: number) => {
    return goals.find(goal => goal.id === goalId);
  }, [goals]);

  return {
    goals,
    goalProgress,
    loadGoalsAndProgress,
    createGoal,
    deleteGoal,
    getGoalById,
    saveGoals,
    saveProgress,
  };
};
