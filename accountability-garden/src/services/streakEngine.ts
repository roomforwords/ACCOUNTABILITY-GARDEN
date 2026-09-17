// ==========================================
// STREAK & CONSISTENCY ENGINE
// Sections 21 - 24, 43 - 44
// ==========================================

import { Commitment, DailyRecord, HabitStreakStats } from '../types';

/**
 * Checks if a habit was scheduled on a particular date.
 */
export function isHabitScheduledOnDate(commitment: Commitment, dateStr: string): boolean {
  if (commitment.startDate && dateStr < commitment.startDate) {
    return false;
  }
  if (commitment.isArchived && commitment.archivedAt && dateStr > commitment.archivedAt.slice(0, 10)) {
    return false;
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayOfWeek = dateObj.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat

  switch (commitment.frequency.type) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6;
    case 'specific_days':
      return (commitment.frequency.daysOfWeek || []).includes(dayOfWeek);
    case 'weekly':
      return (commitment.frequency.daysOfWeek || [1]).includes(dayOfWeek);
    case 'monthly':
      return day === 1;
    case 'custom_interval': {
      const interval = commitment.frequency.intervalDays || 2;
      const start = new Date(commitment.startDate);
      const diffDays = Math.floor((dateObj.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays % interval === 0;
    }
    default:
      return true;
  }
}

/**
 * Calculates complete streak statistics for a commitment across all records.
 */
export function calculateHabitStreaks(
  commitment: Commitment,
  records: DailyRecord[],
  currentDateStr: string
): HabitStreakStats {
  const habitRecords = records
    .filter(r => r.habitId === commitment.id)
    .sort((a, b) => a.recordDate.localeCompare(b.recordDate));

  const recordsByDate = new Map<string, DailyRecord>();
  habitRecords.forEach(r => recordsByDate.set(r.recordDate, r));

  // Determine commitment age
  const createdDate = new Date(commitment.createdAt);
  const now = new Date();
  const commitmentAgeDays = Math.max(1, Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));

  let totalCompletedDays = 0;
  let totalMissedDays = 0;
  let totalScheduledDays = 0;
  let longestStreak = 0;
  let runningStreak = 0;
  let brokenStreaksCount = 0;
  let recoveredStreaksCount = 0;
  let wasInStreakBeforeBreak = false;
  let lastCompletedDate: string | undefined = undefined;
  const breakRecords: { id: string; userId: string; habitId: string; breakDate: string; previousStreak: number; recoveryDate?: string; newStreak?: number }[] = [];

  // Walk through days from start date to today
  const start = new Date(commitment.startDate);
  const end = new Date(currentDateStr);
  const cur = new Date(start);

  while (cur <= end) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    const dStr = `${y}-${m}-${d}`;

    if (isHabitScheduledOnDate(commitment, dStr)) {
      totalScheduledDays++;
      const record = recordsByDate.get(dStr);

      if (record) {
        if (record.status === 'COMPLETED') {
          totalCompletedDays++;
          lastCompletedDate = dStr;
          runningStreak++;
          if (runningStreak > longestStreak) {
            longestStreak = runningStreak;
          }
          if (wasInStreakBeforeBreak) {
            recoveredStreaksCount++;
            wasInStreakBeforeBreak = false;
            // Update last break record with recovery info
            if (breakRecords.length > 0 && !breakRecords[breakRecords.length - 1].recoveryDate) {
              breakRecords[breakRecords.length - 1].recoveryDate = dStr;
              breakRecords[breakRecords.length - 1].newStreak = 1;
            }
          }
        } else if (record.status === 'FROZEN') {
          // Freeze keeps streak intact, but is not counted as completed day
        } else if (record.status === 'PARTIAL') {
          totalCompletedDays += 0.5;
        } else if (record.status === 'MISSED') {
          totalMissedDays++;
          if (runningStreak > 1) {
            brokenStreaksCount++;
            wasInStreakBeforeBreak = true;
            breakRecords.push({
              id: `brk_${commitment.id}_${dStr}`,
              userId: commitment.userId,
              habitId: commitment.id,
              breakDate: dStr,
              previousStreak: runningStreak
            });
          }
          runningStreak = 0;
        }
      } else {
        if (dStr < currentDateStr) {
          totalMissedDays++;
          if (runningStreak > 1) {
            brokenStreaksCount++;
            wasInStreakBeforeBreak = true;
            breakRecords.push({
              id: `brk_${commitment.id}_${dStr}`,
              userId: commitment.userId,
              habitId: commitment.id,
              breakDate: dStr,
              previousStreak: runningStreak
            });
          }
          runningStreak = 0;
        }
      }
    }

    cur.setDate(cur.getDate() + 1);
  }

  const completionPercentage = totalScheduledDays > 0
    ? Math.round((totalCompletedDays / totalScheduledDays) * 100)
    : 0;

  return {
    habitId: commitment.id,
    currentStreak: runningStreak,
    longestStreak: Math.max(longestStreak, runningStreak),
    totalCompletedDays: Math.floor(totalCompletedDays),
    totalMissedDays,
    totalScheduledDays,
    completionPercentage,
    freezeCreditsRemaining: 3,
    lastCompletedDate,
    brokenStreaksCount,
    breakRecords,
    recoveredStreaksCount,
    commitmentAgeDays
  };
}

/**
 * Generates the heatmap cell states for the last N days (e.g. 180 or 365 days).
 */
export interface HeatmapCell {
  date: string;
  dayOfWeek: number;
  isScheduled: boolean;
  status: 'COMPLETED' | 'MISSED' | 'PARTIAL' | 'FROZEN' | 'OVERDUE' | 'NOT_SCHEDULED' | 'PENDING';
  record?: DailyRecord;
}

export function generateHeatmapGrid(
  commitment: Commitment,
  records: DailyRecord[],
  daysCount: number = 180,
  referenceDateStr: string
): HeatmapCell[] {
  const habitRecords = records.filter(r => r.habitId === commitment.id);
  const recordsByDate = new Map<string, DailyRecord>();
  habitRecords.forEach(r => recordsByDate.set(r.recordDate, r));

  const cells: HeatmapCell[] = [];
  const refDate = new Date(referenceDateStr);

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(refDate);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;

    const scheduled = isHabitScheduledOnDate(commitment, dateStr);
    const rec = recordsByDate.get(dateStr);

    let status: HeatmapCell['status'] = 'NOT_SCHEDULED';

    if (scheduled) {
      if (rec) {
        status = rec.status;
      } else if (dateStr < referenceDateStr) {
        status = 'MISSED';
      } else {
        status = 'PENDING';
      }
    }

    cells.push({
      date: dateStr,
      dayOfWeek: d.getDay(),
      isScheduled: scheduled,
      status,
      record: rec
    });
  }

  return cells;
}
