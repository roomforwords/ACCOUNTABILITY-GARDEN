// ==========================================
// ACCOUNTABILITY GARDEN - CORE TYPE SYSTEM
// BANYAN TREE GROWTH SYSTEM
// Tagline: "You cannot edit yesterday."
// ==========================================

export type TrackingType = 
  | 'YES_NO'
  | 'DONE_NOT_DONE'
  | 'GOAL'
  | 'QUANTITY'
  | 'TIME'
  | 'PERCENTAGE';

export type Category = 
  | 'Study'
  | 'Coding'
  | 'Blockchain'
  | 'Fitness'
  | 'Reading'
  | 'Health'
  | 'Finance'
  | 'Work'
  | 'Personal'
  | 'Creativity'
  | 'Other';

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export type FrequencyType = 
  | 'daily'
  | 'weekdays'
  | 'weekends'
  | 'specific_days'
  | 'weekly'
  | 'monthly'
  | 'custom_interval';

// Every work has a dedicated Banyan Tree
export type PlantArchetype = 'banyan';

export type BanyanStage = 
  | 'Seed'
  | 'Sprout'
  | 'Young Banyan'
  | 'Growing Banyan'
  | 'Mature Banyan'
  | 'Large Banyan'
  | 'Massive Banyan'
  | 'Ancient Banyan Grove'
  | 'Legendary Ancient Banyan';

export type PlantHealthState = 'Healthy' | 'Stable' | 'Weak' | 'Struggling';

export type AccountabilityMode = 'Gentle' | 'Direct' | 'Tough Love' | 'Silent';

export type Mood = 'Great' | 'Good' | 'Neutral' | 'Low' | 'Difficult';

export type Difficulty = 'Easy' | 'Normal' | 'Hard' | 'Very Hard';

export type DeadlineStatus = 'Upcoming' | 'Due Today' | 'Due Soon' | 'Overdue' | 'Completed' | 'Archived';

// Commitment / Work Definition (Every work = 1 Banyan Tree)
export interface Commitment {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: Category | string;
  priority: Priority;
  trackingType: TrackingType;
  goalValue?: number;
  goalUnit?: string;
  frequency: {
    type: FrequencyType;
    daysOfWeek?: number[]; // 0 = Sun, 1 = Mon ... 6 = Sat
    intervalDays?: number; // e.g. every 2 days
  };
  startDate: string; // ISO date YYYY-MM-DD
  deadlineDate?: string; // ISO date YYYY-MM-DD
  deadlineTime?: string; // HH:mm
  plantType: PlantArchetype; // Always 'banyan'
  toughLoveMode: AccountabilityMode;
  notes?: string;
  isArchived: boolean;
  archivedAt?: string;
  createdAt: string; // ISO timestamp
  linkedDependencyId?: string;
}

// Single-day Todo item
export interface TodoItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: Category | string;
  priority: Priority;
  deadlineDate?: string;
  isCompleted: boolean;
  completedAt?: string;
  isLocked: boolean;
  createdAt: string;
}

// Immutable Daily Record: UNIQUE(habitId, recordDate)
export interface DailyRecord {
  id: string;
  userId: string;
  habitId: string;
  recordDate: string; // YYYY-MM-DD
  status: 'COMPLETED' | 'MISSED' | 'PARTIAL' | 'FROZEN';
  value?: number; // For GOAL, QUANTITY, TIME, PERCENTAGE
  targetValue?: number;
  unit?: string;
  isLocked: boolean; // Immutable marker
  lockedAt: string; // ISO timestamp
  notes?: string;
  mood?: Mood;
  energyLevel?: number; // 1 to 5
  difficulty?: Difficulty;
  reflection?: {
    completedText?: string;
    avoidedText?: string;
    reasonMissed?: string;
    wentWell?: string;
    improveTomorrow?: string;
  };
  freezeUsed?: boolean;
  waterBucketPoured?: boolean;
}

// Permanent Watering Event (Section 12, 13)
export interface WateringEvent {
  id: string;
  userId: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  status: 'WATERED' | 'MISSED' | 'FROZEN';
  timestamp: string;
  growthDelta: number;
}

// Permanent Streak Break Record (Section 4, 23)
export interface StreakBreakRecord {
  id: string;
  userId: string;
  habitId: string;
  breakDate: string; // YYYY-MM-DD
  previousStreak: number;
  recoveryDate?: string;
  newStreak?: number;
}

// Journal Entry for a given day
export interface DailyJournalEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  entryText: string;
  gratitude: [string, string, string] | string[]; // 3 things grateful for
  dailyWins: string[];
  failureLog: string;
  highlight: string;
  mood: Mood;
  energyLevel: number;
  isLocked: boolean;
  lockedAt: string;
}

// Streak Computation with Permanent Break History
export interface HabitStreakStats {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletedDays: number;
  totalMissedDays: number;
  totalScheduledDays: number;
  completionPercentage: number;
  freezeCreditsRemaining: number;
  lastCompletedDate?: string;
  brokenStreaksCount: number; // Permanent cumulative
  breakRecords: StreakBreakRecord[]; // Permanent historical breaks
  recoveredStreaksCount: number;
  commitmentAgeDays: number;
}

// Banyan Tree Continuous Growth State (Sections 3, 4, 15, 16, 17, 18)
export interface BanyanGrowthState {
  habitId: string;
  stage: BanyanStage;
  stageIndex: number; // 1 to 9 (and continues)
  growthPoints: number; // continuous infinite points
  growthPercentage: number; // display percentage (0 - 100%)
  healthPercent: number; // 0 to 100%
  healthState: PlantHealthState;
  aerialRootsCount: number; // Aerial roots descending from branches
  pillarTrunksCount: number; // Roots that reached the ground and thickened
  canopySpreadScale: number; // Horizontal branch expansion
  heightScale: number; // Overall scale
  leavesCount: number;
  shrinkCount: number; // Number of times shrunken due to missed days
  currentShrinkFactor: number; // 0.0 to 0.4 contraction
  isWateredToday: boolean;
  milestones: {
    stage: BanyanStage;
    unlockedAt: string;
    streakRequired?: number;
    notes?: string;
  }[];
}

// Audit Log (Append-Only)
export interface AuditLogEntry {
  id: string;
  userId: string;
  eventType: 
    | 'commitment_created'
    | 'commitment_archived'
    | 'record_locked'
    | 'banyan_watered'
    | 'banyan_shrunk'
    | 'streak_broken'
    | 'streak_recovered'
    | 'freeze_used'
    | 'milestone_reached'
    | 'journal_locked'
    | 'settings_updated';
  entityId: string;
  description: string;
  timestamp: string; // ISO timestamp
  metadata?: Record<string, any>;
}

// User Profile & Settings
export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  timezone: string;
  preferredLanguage: string;
  theme: 'dark' | 'light' | 'system';
  accountabilityMode: AccountabilityMode;
  notificationPreferences: {
    dailyReminders: boolean;
    morningReminderTime: string; // "08:00"
    eveningReminderTime: string; // "20:00"
    deadlineWarnings: boolean;
    browserPush: boolean;
  };
  memberSince: string; // YYYY-MM-DD
  freezeCredits: number;
}

// Overall Life Archive Export
export interface LifeLogExport {
  exportVersion: string;
  generatedAt: string;
  user: UserProfile;
  commitments: Commitment[];
  todos: TodoItem[];
  dailyRecords: DailyRecord[];
  wateringEvents: WateringEvent[];
  streakBreaks: StreakBreakRecord[];
  journalEntries: DailyJournalEntry[];
  auditLogs: AuditLogEntry[];
  summaryStats: {
    totalCommitments: number;
    totalActive: number;
    totalRecords: number;
    overallCompletionRate: number;
    longestOverallStreak: number;
  };
}
