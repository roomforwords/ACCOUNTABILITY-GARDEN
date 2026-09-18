// ==========================================
// TOUGH-LOVE & ACCOUNTABILITY QUOTE ENGINE
// Sections 50 - 60, 96, 120
// ==========================================

import { AccountabilityMode } from '../types';

export interface QuoteItem {
  id: string;
  category: 
    | 'missed_task'
    | 'broken_streak'
    | 'approaching_deadline'
    | 'overdue_deadline'
    | 'repeated_failure'
    | 'recovery'
    | 'milestone'
    | 'morning'
    | 'evening'
    | 'general_philosophy';
  text: string;
  author?: string;
  minMode: AccountabilityMode; // 'Gentle' | 'Direct' | 'Tough Love'
}

export const CENTRAL_PHILOSOPHY_QUOTES = [
  "You cannot edit yesterday.",
  "You can only decide what happens next.",
  "Your history is not here to judge you. It is here to tell you the truth.",
  "Your intentions are private. Your actions become history.",
  "The garden grows from what you actually do.",
  "A missed day is not the end. Repeated avoidance becomes a pattern.",
  "You don't need a perfect history. You need an honest one.",
  "Don't promise the future. Record the present.",
  "The past is locked. The next record is yours."
];

export const ACCOUNTABILITY_QUOTES: QuoteItem[] = [
  // General / Direct
  {
    id: 'phil_1',
    category: 'general_philosophy',
    text: 'You had a plan. Today is where the plan met reality.',
    minMode: 'Direct'
  },
  {
    id: 'phil_2',
    category: 'general_philosophy',
    text: "You don't need another plan. You need to do what you already decided.",
    minMode: 'Direct'
  },
  {
    id: 'phil_3',
    category: 'general_philosophy',
    text: 'You wanted change. Did today\'s actions support that?',
    minMode: 'Direct'
  },
  {
    id: 'phil_4',
    category: 'general_philosophy',
    text: 'Yesterday is locked. Tomorrow isn\'t here yet. You only have today.',
    minMode: 'Gentle'
  },
  {
    id: 'phil_5',
    category: 'general_philosophy',
    text: 'You said you wanted consistency. Consistency is built on ordinary days like this.',
    minMode: 'Gentle'
  },
  {
    id: 'phil_6',
    category: 'general_philosophy',
    text: 'The garden doesn\'t care what you intended. It grows from what you actually did.',
    minMode: 'Direct'
  },

  // Missed Task
  {
    id: 'miss_1',
    category: 'missed_task',
    text: 'You said this was the last time. Your record says otherwise.',
    minMode: 'Direct'
  },
  {
    id: 'miss_2',
    category: 'missed_task',
    text: 'You can explain the reason. The record will still show the result.',
    minMode: 'Direct'
  },
  {
    id: 'miss_3',
    category: 'missed_task',
    text: 'You postponed it again. Ask yourself why.',
    minMode: 'Direct'
  },
  {
    id: 'miss_4',
    category: 'missed_task',
    text: 'You don\'t need motivation to press the button. You need honesty.',
    minMode: 'Direct'
  },
  {
    id: 'miss_tl_1',
    category: 'missed_task',
    text: 'Bro, you\'re not confused about what to do. You\'re avoiding doing it.',
    minMode: 'Tough Love'
  },
  {
    id: 'miss_tl_2',
    category: 'missed_task',
    text: 'You keep negotiating with the same commitment.',
    minMode: 'Tough Love'
  },
  {
    id: 'miss_tl_3',
    category: 'missed_task',
    text: 'How many times are you going to call something "the last time"?',
    minMode: 'Tough Love'
  },
  {
    id: 'miss_gentle_1',
    category: 'missed_task',
    text: 'One missed day is recorded. It does not erase who you are.',
    minMode: 'Gentle'
  },

  // Broken Streak
  {
    id: 'streak_break_1',
    category: 'broken_streak',
    text: 'Your streak was not luck. You built it. Now your next action decides what happens next.',
    minMode: 'Direct'
  },
  {
    id: 'streak_break_2',
    category: 'broken_streak',
    text: 'The streak ended. That history remains permanent. Now start the new one.',
    minMode: 'Direct'
  },
  {
    id: 'streak_break_tl_1',
    category: 'broken_streak',
    text: 'You wanted the result without repeating the behavior that creates it.',
    minMode: 'Tough Love'
  },

  // Repeated Failure (3+ consecutive misses)
  {
    id: 'rep_1',
    category: 'repeated_failure',
    text: 'One missed day is a record. Repeating it becomes a pattern.',
    minMode: 'Direct'
  },
  {
    id: 'rep_2',
    category: 'repeated_failure',
    text: 'You are not behind because of one bad day. You\'re behind when the same day keeps repeating.',
    minMode: 'Direct'
  },
  {
    id: 'rep_3',
    category: 'repeated_failure',
    text: 'Three missed days are now a pattern worth looking at.',
    minMode: 'Direct'
  },
  {
    id: 'rep_tl_1',
    category: 'repeated_failure',
    text: 'You don\'t have a planning problem here. You have an execution problem.',
    minMode: 'Tough Love'
  },
  {
    id: 'rep_tl_2',
    category: 'repeated_failure',
    text: 'Your words said change. Today\'s record says continuation.',
    minMode: 'Tough Love'
  },
  {
    id: 'rep_tl_3',
    category: 'repeated_failure',
    text: 'Don\'t make another promise tonight. Make tomorrow\'s action different.',
    minMode: 'Tough Love'
  },

  // Approaching & Overdue Deadlines
  {
    id: 'dl_app_1',
    category: 'approaching_deadline',
    text: 'Tomorrow is not the deadline. Today is your remaining preparation time.',
    minMode: 'Direct'
  },
  {
    id: 'dl_app_2',
    category: 'approaching_deadline',
    text: 'One hour remains. The record will soon become history.',
    minMode: 'Direct'
  },
  {
    id: 'dl_over_1',
    category: 'overdue_deadline',
    text: 'The deadline didn\'t move. Your commitment did.',
    minMode: 'Direct'
  },
  {
    id: 'dl_over_2',
    category: 'overdue_deadline',
    text: 'The deadline passed. Record the result honestly.',
    minMode: 'Direct'
  },
  {
    id: 'dl_over_tl_1',
    category: 'overdue_deadline',
    text: 'You already knew the task. You already knew the deadline. What exactly are you waiting for?',
    minMode: 'Tough Love'
  },

  // Recovery
  {
    id: 'rec_1',
    category: 'recovery',
    text: 'The streak restarted. No need to rewrite the past. Build from here.',
    minMode: 'Gentle'
  },
  {
    id: 'rec_2',
    category: 'recovery',
    text: 'You disappeared from the routine. You\'re back. Continue.',
    minMode: 'Direct'
  },
  {
    id: 'rec_3',
    category: 'recovery',
    text: 'You don\'t need to recover yesterday. You need to complete today.',
    minMode: 'Direct'
  },

  // Morning Message
  {
    id: 'morn_1',
    category: 'morning',
    text: 'Decide what deserves your attention before the day decides for you.',
    minMode: 'Gentle'
  },
  {
    id: 'morn_2',
    category: 'morning',
    text: 'Today\'s record is unwritten. What will it say by midnight?',
    minMode: 'Direct'
  },

  // Evening Message
  {
    id: 'eve_incomp_1',
    category: 'evening',
    text: 'The day is almost over. What remains unfinished is now visible.',
    minMode: 'Direct'
  },
  {
    id: 'eve_comp_1',
    category: 'evening',
    text: 'Today\'s record is complete. Nothing needs to be rewritten.',
    minMode: 'Gentle'
  },

  // Garden Philosophy
  {
    id: 'garden_growth_1',
    category: 'milestone',
    text: 'The garden remembers the days you showed up.',
    minMode: 'Gentle'
  },
  {
    id: 'garden_growth_2',
    category: 'milestone',
    text: 'You didn\'t grow this tree in one day.',
    minMode: 'Gentle'
  }
];

export function getContextualQuote(
  mode: AccountabilityMode,
  context: {
    category?: QuoteItem['category'];
    consecutiveMisses?: number;
    isStreakBroken?: boolean;
    isRecovered?: boolean;
    isAllCompleted?: boolean;
    hasOverdueDeadlines?: boolean;
    timeOfDay?: 'morning' | 'day' | 'evening' | 'night';
  }
): string {
  if (mode === 'Silent') {
    return '';
  }

  // Priority mapping based on urgency
  if (context.consecutiveMisses && context.consecutiveMisses >= 3) {
    const candidates = ACCOUNTABILITY_QUOTES.filter(
      q => q.category === 'repeated_failure' && isModeAllowed(q.minMode, mode)
    );
    if (candidates.length > 0) return getRandom(candidates).text;
  }

  if (context.hasOverdueDeadlines) {
    const candidates = ACCOUNTABILITY_QUOTES.filter(
      q => q.category === 'overdue_deadline' && isModeAllowed(q.minMode, mode)
    );
    if (candidates.length > 0) return getRandom(candidates).text;
  }

  if (context.isStreakBroken) {
    const candidates = ACCOUNTABILITY_QUOTES.filter(
      q => q.category === 'broken_streak' && isModeAllowed(q.minMode, mode)
    );
    if (candidates.length > 0) return getRandom(candidates).text;
  }

  if (context.isRecovered) {
    const candidates = ACCOUNTABILITY_QUOTES.filter(
      q => q.category === 'recovery' && isModeAllowed(q.minMode, mode)
    );
    if (candidates.length > 0) return getRandom(candidates).text;
  }

  if (context.timeOfDay === 'morning') {
    const candidates = ACCOUNTABILITY_QUOTES.filter(
      q => q.category === 'morning' && isModeAllowed(q.minMode, mode)
    );
    if (candidates.length > 0) return getRandom(candidates).text;
  }

  if (context.timeOfDay === 'evening' || context.timeOfDay === 'night') {
    if (context.isAllCompleted) {
      return "Today's record is complete. Nothing needs to be rewritten.";
    }
    const candidates = ACCOUNTABILITY_QUOTES.filter(
      q => q.category === 'evening' && isModeAllowed(q.minMode, mode)
    );
    if (candidates.length > 0) return getRandom(candidates).text;
  }

  // Filter general
  const general = ACCOUNTABILITY_QUOTES.filter(
    q => (q.category === 'general_philosophy' || q.category === (context.category || 'general_philosophy')) &&
         isModeAllowed(q.minMode, mode)
  );

  return general.length > 0 ? getRandom(general).text : "You cannot edit yesterday.";
}

function isModeAllowed(quoteMinMode: AccountabilityMode, userMode: AccountabilityMode): boolean {
  if (userMode === 'Silent') return false;
  if (userMode === 'Tough Love') return true; // Allowed everything
  if (userMode === 'Direct') {
    return quoteMinMode === 'Gentle' || quoteMinMode === 'Direct';
  }
  if (userMode === 'Gentle') {
    return quoteMinMode === 'Gentle';
  }
  return true;
}

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
