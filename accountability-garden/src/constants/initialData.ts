// ==========================================
// INITIAL DATA (CLEAN SLATE)
// All mock default commitments removed as requested
// Tagline: "You cannot edit yesterday."
// ==========================================

import { Commitment, DailyJournalEntry, DailyRecord, TodoItem, UserProfile } from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'user_master',
  name: 'Alex Vance',
  username: 'alexvance',
  email: 'alex.vance@garden.internal',
  timezone: 'Asia/Kolkata',
  preferredLanguage: 'en',
  theme: 'dark',
  accountabilityMode: 'Direct',
  memberSince: '2026-09-17',
  freezeCredits: 3,
  notificationPreferences: {
    dailyReminders: true,
    morningReminderTime: '08:00',
    eveningReminderTime: '21:00',
    deadlineWarnings: true,
    browserPush: false
  }
};

// CLEAN SLATE: Zero hardcoded mock commitments
export const INITIAL_COMMITMENTS: Commitment[] = [];

// CLEAN SLATE: Zero hardcoded todos
export const INITIAL_TODOS: TodoItem[] = [];

// CLEAN SLATE: Zero hardcoded records
export function generateInitialRecords(userId: string): DailyRecord[] {
  return [];
}

// CLEAN SLATE: Zero hardcoded journals
export const INITIAL_JOURNALS: DailyJournalEntry[] = [];
