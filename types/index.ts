export interface RoutineActivity {
  id: number;
  title: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  notificationId?: string;
  goalId?: number;
}

export interface Goal {
  id: number;
  title: string;
  description: string;
  targetDays: number;
  createdAt: string;
  category: 'health' | 'career' | 'personal' | 'learning' | 'other';
}

export interface GoalProgress {
  goalId: number;
  date: string;
  completed: boolean;
  notes?: string;
}

export interface JournalEntry {
  date: string;
  content: string;
  disciplineScore: number;
  timestamp: number;
}

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export const WEEK_DAYS: Array<{ value: WeekDay; label: string }> = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

export const HOURS_ARRAY = Array.from({ length: 24 }, (_, i) => i);
export const MINUTES_ARRAY = Array.from({ length: 60 }, (_, i) => i);
