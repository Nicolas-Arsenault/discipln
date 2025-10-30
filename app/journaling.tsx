import "@/globals.css";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Keyboard, Modal, Pressable, ScrollView, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';

interface JournalEntry {
  date: string;
  content: string;
  disciplineScore: number;
  timestamp: number;
}

const journaling = () => {
  const [journalEntries, setJournalEntries] = useState<Record<string, JournalEntry>>({});
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentEntry, setCurrentEntry] = useState('');
  const [disciplineScore, setDisciplineScore] = useState(5);
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null);
  const [isViewingMode, setIsViewingMode] = useState(false);

  useEffect(() => {
    loadJournalEntries();
  }, []);

  const loadJournalEntries = async () => {
    try {
      const savedEntries = await AsyncStorage.getItem('journalEntries');
      if (savedEntries) {
        setJournalEntries(JSON.parse(savedEntries));
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
    }
  };

  const saveJournalEntries = async (entries: Record<string, JournalEntry>) => {
    try {
      await AsyncStorage.setItem('journalEntries', JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving journal entries:', error);
    }
  };

  const handleDatePress = (day: any) => {
    const dateKey = day.dateString;
    setSelectedDate(dateKey);
    
    if (journalEntries[dateKey]) {
      setViewingEntry(journalEntries[dateKey]);
      setIsViewingMode(true);
      setIsModalVisible(true);
    } else {
      setViewingEntry(null);
      setCurrentEntry('');
      setDisciplineScore(5);
      setIsViewingMode(false);
      setIsModalVisible(true);
    }
  };

  const handleSaveEntry = async () => {
    if (!currentEntry.trim()) {
      Alert.alert('Error', 'Please write something in your journal entry.');
      return;
    }

    const newEntry: JournalEntry = {
      date: selectedDate,
      content: currentEntry.trim(),
      disciplineScore,
      timestamp: Date.now()
    };

    const updatedEntries = {
      ...journalEntries,
      [selectedDate]: newEntry
    };

    setJournalEntries(updatedEntries);
    await saveJournalEntries(updatedEntries);
    
    setIsModalVisible(false);
    setCurrentEntry('');
    setDisciplineScore(5);
  };

  const handleDeleteEntry = async () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedEntries = { ...journalEntries };
            delete updatedEntries[selectedDate];
            setJournalEntries(updatedEntries);
            await saveJournalEntries(updatedEntries);
            setIsModalVisible(false);
          }
        }
      ]
    );
  };

  const getMarkedDates = () => {
    const marked: any = {};
    Object.keys(journalEntries).forEach(date => {
      marked[date] = {
        selected: true,
        selectedColor: '#22c55e',
        selectedTextColor: '#ffffff'
      };
    });
    return marked;
  };

  const getTotalEntries = () => Object.keys(journalEntries).length;
  const getAverageDiscipline = () => {
    const entries = Object.values(journalEntries);
    if (entries.length === 0) return 0;
    const total = entries.reduce((sum, entry) => sum + entry.disciplineScore, 0);
    return (total / entries.length).toFixed(1);
  };

  const getCurrentStreak = () => {
    const sortedDates = Object.keys(journalEntries).sort().reverse();
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedDates.length; i++) {
      const entryDate = new Date(sortedDates[i]);
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          <ScrollView className="flex-1 pt-6" showsVerticalScrollIndicator={false}>
            {/* Stats Cards */}
            <View className="px-4 py-4">
          <View className="flex-row justify-between mb-4">
            <View className="bg-white rounded-xl p-4 flex-1 mr-2 shadow-sm border border-gray-100">
              <Text className="text-2xl font-bold text-gray-900">{getTotalEntries()}</Text>
              <Text className="text-sm text-gray-500">Total Entries</Text>
            </View>
            <View className="bg-white rounded-xl p-4 flex-1 mx-1 shadow-sm border border-gray-100">
              <Text className="text-2xl font-bold text-gray-900">{getCurrentStreak()}</Text>
              <Text className="text-sm text-gray-500">Day Streak</Text>
            </View>
            <View className="bg-white rounded-xl p-4 flex-1 ml-2 shadow-sm border border-gray-100">
              <Text className="text-2xl font-bold text-gray-900">{getAverageDiscipline()}</Text>
              <Text className="text-sm text-gray-500">Avg Discipline</Text>
            </View>
          </View>
        </View>

        {/* Calendar Header */}
        <View className="mx-4 mb-2">
          <Text className="text-lg font-semibold text-gray-900 mb-1">Journal Calendar</Text>
        </View>

        {/* Calendar */}
        <View className="bg-white mx-4 rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
          {/* Tap instruction banner */}
          <View className="bg-gradient-to-r from-green-50 to-blue-50 px-4 py-3 border-b border-gray-100">
            <View className="flex-row items-center justify-center">
              <Ionicons name="finger-print" size={16} color="#22c55e" />
              <Text className="text-sm font-medium text-gray-700 ml-2">
                Tap any date below to start journaling
              </Text>
            </View>
          </View>

          <Calendar
            onDayPress={handleDatePress}
            markedDates={getMarkedDates()}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#374151',
              selectedDayBackgroundColor: '#22c55e',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#2563eb',
              todayBackgroundColor: '#dbeafe',
              dayTextColor: '#374151',
              textDisabledColor: '#d1d5db',
              arrowColor: '#1f2937',
              monthTextColor: '#1f2937',
              indicatorColor: '#22c55e',
              textDayFontWeight: '500',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '500',
            }}
          />
        </View>

        {/* Legend */}
        <View className="bg-white mx-4 rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <Text className="text-base font-semibold text-gray-900 mb-3">Legend</Text>
          <View className="space-y-2">
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded-full bg-green-500 mr-3"></View>
              <Text className="text-sm text-gray-600">Dates with journal entries</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded border-2 border-blue-400 bg-blue-50 mr-3"></View>
              <Text className="text-sm text-gray-600">Today</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded border border-gray-300 mr-3"></View>
              <Text className="text-sm text-gray-600">Available dates (tap to journal)</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Entry Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 shadow justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[90%] min-h-[90%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">
                {isViewingMode ? 'Journal Entry' : 'New Entry'}
              </Text>
              <Pressable
                onPress={() => setIsModalVisible(false)}
                className="p-2"
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>

            <Text className="text-base text-gray-600 mb-4">
              {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : ''}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {isViewingMode && viewingEntry ? (
                <>
                  <View className="bg-gray-50 rounded-xl p-4 mb-4">
                    <Text className="text-gray-800 text-base leading-6">
                      {viewingEntry.content}
                    </Text>
                  </View>
                  <View className="bg-gray-50 rounded-xl p-4 mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Discipline Score</Text>
                    <View className="flex-row items-center">
                      <Text className="text-2xl font-bold text-gray-900 mr-2">
                        {viewingEntry.disciplineScore}/10
                      </Text>
                      <View className="flex-1 bg-gray-200 rounded-full h-2">
                        <View 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(viewingEntry.disciplineScore / 10) * 100}%` }}
                        />
                      </View>
                    </View>
                  </View>
                  <Pressable
                    className="bg-red-500 rounded-xl py-4 flex items-center justify-center"
                    onPress={handleDeleteEntry}
                  >
                    <Text className="text-white text-base font-semibold">Delete Entry</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <TextInput
                    multiline
                    numberOfLines={8}
                    value={currentEntry}
                    onChangeText={setCurrentEntry}
                    placeholder="How was your day? What did you accomplish? What challenges did you face?"
                    placeholderTextColor="#9CA3AF"
                    className="bg-gray-50 rounded-xl p-4 text-gray-800 text-base leading-6 min-h-[200px] mb-4"
                    textAlignVertical="top"
                    returnKeyType="done"
                    blurOnSubmit={true}
                  />

                  <View className="mb-6">
                    <Text className="text-base font-medium text-gray-700 mb-3">
                      Discipline Score (1-10)
                    </Text>
                    <View className="flex-row justify-between items-center mb-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                        <Pressable
                          key={score}
                          onPress={() => setDisciplineScore(score)}
                          className={`w-8 h-8 rounded-full border-2 items-center justify-center ${
                            disciplineScore >= score 
                              ? 'bg-green-500 border-green-500' 
                              : 'border-gray-300'
                          }`}
                        >
                          <Text className={`text-sm font-medium ${
                            disciplineScore >= score ? 'text-white' : 'text-gray-400'
                          }`}>
                            {score}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                    <Text className="text-sm text-gray-500 text-center">
                      Rate your discipline and productivity today
                    </Text>
                  </View>

                  <Pressable
                    className="bg-gray-900 rounded-xl py-4 flex items-center justify-center"
                    onPress={handleSaveEntry}
                    disabled={!currentEntry.trim()}
                    style={{
                      opacity: currentEntry.trim() ? 1 : 0.5
                    }}
                  >
                    <Text className="text-white text-base font-semibold">Save Entry</Text>
                  </Pressable>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default journaling;