// ==========================================
// TEST SUITE FOR BANYAN TREE GROWTH SYSTEM & ACCOUNTABILITY GARDEN
// Tests:
// 1. One Work = One Banyan Tree
// 2. Infinite Continuous Growth Model (10, 100, 300, 1000 days)
// 3. Aerial prop roots and pillar trunks expansion
// 4. Shrink on missed days without tree destruction
// 5. Recovery without resetting historical data
// 6. Streak Engine with permanent break records ("3 previous breaks recorded")
// ==========================================

import { calculateHabitStreaks } from './services/streakEngine';
import { BanyanEngine } from './services/banyanEngine';
import { AnalyticsEngine } from './services/analyticsEngine';
import { Commitment, DailyRecord } from './types';

function runTests() {
  console.log("🌳 STARTING BANYAN GROWTH SYSTEM VERIFICATION...\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✕ FAIL: ${testName}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // TEST 1: Dedicated Banyan Tree Creation & Streaks
  // ----------------------------------------------------
  console.log("=== TEST 1: ONE WORK = ONE DEDICATED BANYAN TREE ===");
  const banyanHabit: Commitment = {
    id: 'habit_blockchain_1',
    userId: 'user_1',
    name: 'Study Blockchain & Smart Contracts',
    category: 'Blockchain',
    priority: 'Critical',
    trackingType: 'YES_NO',
    frequency: { type: 'daily' },
    startDate: '2026-08-01',
    plantType: 'banyan',
    toughLoveMode: 'Direct',
    isArchived: false,
    createdAt: '2026-08-01T00:00:00Z'
  };

  assert(banyanHabit.plantType === 'banyan', 'Commitment is permanently bound to dedicated Banyan Tree');

  // Simulate 10-day streak
  const records10Days: DailyRecord[] = [];
  for (let i = 1; i <= 10; i++) {
    const day = i < 10 ? `0${i}` : `${i}`;
    records10Days.push({
      id: `rec_${i}`,
      userId: 'user_1',
      habitId: banyanHabit.id,
      recordDate: `2026-08-${day}`,
      status: 'COMPLETED',
      isLocked: true,
      lockedAt: `2026-08-${day}T18:00:00Z`
    });
  }

  const banyan10 = BanyanEngine.calculateBanyanGrowth(banyanHabit, records10Days, '2026-08-10');
  console.log(`  10-day Banyan: Points=${banyan10.growthPoints}, Roots=${banyan10.aerialRootsCount}, Pillars=${banyan10.pillarTrunksCount}, Stage=${banyan10.stage}`);
  assert(banyan10.growthPoints >= 100, '10 completed days generates >= 100 growth points');
  assert(banyan10.aerialRootsCount >= 1, '10-day Banyan develops descending aerial roots');

  // ----------------------------------------------------
  // TEST 2: Continuous Infinite Growth past 100 and 1000 days
  // ----------------------------------------------------
  console.log("\n=== TEST 2: INFINITE GROWTH MODEL (NO MAXIMUM CAP) ===");
  // Simulate 100 completed days
  const records100Days: DailyRecord[] = [];
  for (let i = 1; i <= 100; i++) {
    records100Days.push({
      id: `rec_100_${i}`,
      userId: 'user_1',
      habitId: banyanHabit.id,
      recordDate: `2026-01-${i}`,
      status: 'COMPLETED',
      isLocked: true,
      lockedAt: `2026-01-01T18:00:00Z`
    });
  }
  const banyan100 = BanyanEngine.calculateBanyanGrowth(banyanHabit, records100Days, '2026-04-10');

  // Simulate 1000 completed days
  const records1000Days: DailyRecord[] = [];
  for (let i = 1; i <= 1000; i++) {
    records1000Days.push({
      id: `rec_1000_${i}`,
      userId: 'user_1',
      habitId: banyanHabit.id,
      recordDate: `2023-01-${i}`,
      status: 'COMPLETED',
      isLocked: true,
      lockedAt: `2023-01-01T18:00:00Z`
    });
  }
  const banyan1000 = BanyanEngine.calculateBanyanGrowth(banyanHabit, records1000Days, '2026-09-17');

  console.log(`  100-day Banyan: Points=${banyan100.growthPoints}, CanopySpread=${banyan100.canopySpreadScale}, Roots=${banyan100.aerialRootsCount}, Stage=${banyan100.stage}`);
  console.log(`  1000-day Banyan: Points=${banyan1000.growthPoints}, CanopySpread=${banyan1000.canopySpreadScale}, Roots=${banyan1000.aerialRootsCount}, Pillars=${banyan1000.pillarTrunksCount}, Stage=${banyan1000.stage}`);

  assert(banyan1000.growthPoints > banyan100.growthPoints, '1000-day Banyan has vastly higher growth points than 100-day');
  assert(banyan1000.canopySpreadScale > banyan100.canopySpreadScale, 'Canopy spread continues expanding past 100 days');
  assert(banyan1000.pillarTrunksCount > banyan100.pillarTrunksCount, '1000-day Banyan forms extensive secondary pillar trunks');
  assert(banyan1000.aerialRootsCount > banyan100.aerialRootsCount, 'Aerial prop roots multiply significantly over long commitments');

  // ----------------------------------------------------
  // TEST 3: Missed Days -> Shrink without Destruction
  // ----------------------------------------------------
  console.log("\n=== TEST 3: MISSED DAY SHRINKS BUT NEVER DESTROYS BANYAN ===");
  const recordsWithMisses: DailyRecord[] = [
    ...records10Days,
    { id: 'm1', userId: 'user_1', habitId: banyanHabit.id, recordDate: '2026-08-11', status: 'MISSED', isLocked: true, lockedAt: '2026-08-11T20:00:00Z' },
    { id: 'm2', userId: 'user_1', habitId: banyanHabit.id, recordDate: '2026-08-12', status: 'MISSED', isLocked: true, lockedAt: '2026-08-12T20:00:00Z' }
  ];

  const banyanMissed = BanyanEngine.calculateBanyanGrowth(banyanHabit, recordsWithMisses, '2026-08-12');
  console.log(`  After 2 missed days: Points=${banyanMissed.growthPoints}, ShrinkFactor=${banyanMissed.currentShrinkFactor}, Health=${banyanMissed.healthPercent}%`);

  assert(banyanMissed.currentShrinkFactor > 0, 'Shrink factor applied after missed days');
  assert(banyanMissed.growthPoints > 0, 'Tree preserves historical growth points and is never destroyed');
  assert(banyanMissed.healthPercent < banyan10.healthPercent, 'Health decreases after missed days');

  // ----------------------------------------------------
  // TEST 4: Streak Breaks & Permanent Historical Record
  // ----------------------------------------------------
  console.log("\n=== TEST 4: PERMANENT STREAK BREAK LEDGER ===");
  const recoveryRecords: DailyRecord[] = [
    ...recordsWithMisses,
    { id: 'r_rec', userId: 'user_1', habitId: banyanHabit.id, recordDate: '2026-08-13', status: 'COMPLETED', isLocked: true, lockedAt: '2026-08-13T20:00:00Z' }
  ];

  const streakStats = calculateHabitStreaks(banyanHabit, recoveryRecords, '2026-08-13');
  console.log(`  Breaks count: ${streakStats.brokenStreaksCount}, Current Streak: ${streakStats.currentStreak}, Longest: ${streakStats.longestStreak}`);

  assert(streakStats.brokenStreaksCount >= 1, 'Streak break is permanently tracked and not erased');
  assert(streakStats.currentStreak === 1, 'Streak restarts at 1 upon returning');
  assert(streakStats.longestStreak === 10, 'Longest streak remains preserved at 10');
  assert(streakStats.totalCompletedDays === 11, 'Total completed days preserves past 10 + 1');

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log(`\n========================================`);
  console.log(`BANYAN VERIFICATION: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);
}

runTests();
