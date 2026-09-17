// ==========================================
// BANYAN TREE GROWTH & SHRINK ENGINE
// Sections 1 - 28
// One Work = One Dedicated Banyan Tree (Continuous Infinite Growth)
// ==========================================

import { BanyanGrowthState, BanyanStage, Commitment, DailyRecord, PlantHealthState } from '../types';

export const BANYAN_STAGES: { stage: BanyanStage; minPoints: number; description: string }[] = [
  { stage: 'Seed', minPoints: 0, description: 'Fresh seed planted into the soil of personal responsibility.' },
  { stage: 'Sprout', minPoints: 16, description: 'First emerald shoot emerges through honest daily action.' },
  { stage: 'Young Banyan', minPoints: 46, description: 'Lateral branches stretch outward with glossy green foliage.' },
  { stage: 'Growing Banyan', minPoints: 111, description: 'First aerial prop roots descend gracefully from overhead boughs.' },
  { stage: 'Mature Banyan', minPoints: 241, description: 'Aerial roots penetrate the earth, forming sturdy secondary pillar trunks.' },
  { stage: 'Large Banyan', minPoints: 501, description: 'Vast horizontal canopy supported by multiple living pillars.' },
  { stage: 'Massive Banyan', minPoints: 1001, description: 'Expansive sacred grove, deeply rooted against life resistance.' },
  { stage: 'Ancient Banyan Grove', minPoints: 2001, description: 'Generational monument of unbroken discipline.' },
  { stage: 'Legendary Ancient Banyan', minPoints: 4001, description: 'Infinite living architecture spanning hundreds of recorded days.' }
];

export class BanyanEngine {
  /**
   * Computes the exact, continuous procedural growth state of a commitment's Banyan Tree.
   * Handles infinite growth, aerial prop roots, pillar trunks, and missed-day shrink.
   */
  public static calculateBanyanGrowth(
    commitment: Commitment,
    records: DailyRecord[],
    referenceDateStr: string = '2026-09-17'
  ): BanyanGrowthState {
    const habitRecords = records.filter(r => r.habitId === commitment.id);
    const completedRecords = habitRecords.filter(r => r.status === 'COMPLETED');
    const freezeRecords = habitRecords.filter(r => r.status === 'FROZEN');
    const missedRecords = habitRecords.filter(r => r.status === 'MISSED');

    const totalCompleted = completedRecords.length;
    const totalMissed = missedRecords.length;

    // Check if watered today
    const todayRecord = habitRecords.find(r => r.recordDate === referenceDateStr);
    const isWateredToday = todayRecord?.status === 'COMPLETED' || todayRecord?.status === 'FROZEN';

    // Calculate current streak & consecutive missed days
    const sortedRecords = [...habitRecords].sort((a, b) => b.recordDate.localeCompare(a.recordDate));
    
    // Count consecutive misses at the tail
    let consecutiveMisses = 0;
    for (const r of sortedRecords) {
      if (r.status === 'MISSED') {
        consecutiveMisses++;
      } else if (r.status === 'COMPLETED' || r.status === 'FROZEN') {
        break;
      }
    }

    // Recent 7 scheduled records consistency
    const recentRecords = sortedRecords.slice(0, 7);
    let recentCompletedCount = 0;
    recentRecords.forEach(r => {
      if (r.status === 'COMPLETED' || r.status === 'FROZEN') recentCompletedCount++;
    });

    const recentConsistency = recentRecords.length > 0
      ? Math.round((recentCompletedCount / recentRecords.length) * 100)
      : 100;

    // Determine health state (Section 15)
    let healthPercent = 100;
    let healthState: PlantHealthState = 'Healthy';

    if (consecutiveMisses >= 4 || recentConsistency < 30) {
      healthPercent = Math.max(15, 30 - consecutiveMisses * 3);
      healthState = 'Struggling';
    } else if (consecutiveMisses >= 2 || recentConsistency < 55) {
      healthPercent = 45;
      healthState = 'Weak';
    } else if (consecutiveMisses === 1 || recentConsistency < 80) {
      healthPercent = 75;
      healthState = 'Stable';
    } else {
      healthPercent = 100;
      healthState = 'Healthy';
    }

    // Calculate Shrink Factor (Sections 6 & 7: Missed day = tree shrinks)
    // 1 miss = 5%, 2 misses = 10%, 3 misses = 15%, 7+ misses = up to 30% shrink
    let currentShrinkFactor = 0;
    if (consecutiveMisses === 1) currentShrinkFactor = 0.06;
    else if (consecutiveMisses === 2) currentShrinkFactor = 0.12;
    else if (consecutiveMisses >= 3) currentShrinkFactor = Math.min(0.35, 0.15 + (consecutiveMisses - 3) * 0.03);

    // Infinite Growth Points Formula (Section 18):
    // Completed day: +10 pts
    // Missed day: -3 pts (never below 0)
    // Longevity bonus: +1 pt per 5 days of age
    const createdDate = new Date(commitment.createdAt || '2026-09-01');
    const now = new Date(referenceDateStr);
    const ageDays = Math.max(1, Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));

    const rawGrowthPoints = (totalCompleted * 10) + (freezeRecords.length * 5) - (totalMissed * 3) + Math.floor(ageDays / 5);
    const growthPoints = Math.max(totalCompleted > 0 ? 10 : 0, rawGrowthPoints);

    // Determine Stage
    let stageIndex = 1;
    let currentStageObj = BANYAN_STAGES[0];

    for (let i = BANYAN_STAGES.length - 1; i >= 0; i--) {
      if (growthPoints >= BANYAN_STAGES[i].minPoints) {
        stageIndex = i + 1;
        currentStageObj = BANYAN_STAGES[i];
        break;
      }
    }

    // Aerial prop roots count (Sections 16, 17, 18)
    // Emerge as tree matures (around 70+ growth points) and continues scaling infinitely
    const aerialRootsCount = growthPoints >= 70
      ? Math.floor(1 + Math.sqrt((growthPoints - 70) * 0.8))
      : 0;

    // Pillar trunks count (roots that reached the ground and thickened into secondary supporting trunks)
    const pillarTrunksCount = growthPoints >= 200
      ? Math.floor(1 + Math.log10((growthPoints - 200) + 10) * 2.8)
      : 0;

    // Scales with diminishing return so tree grows forever without breaking canvas
    const baseHeightScale = 0.45 + Math.log10(Math.max(1, growthPoints + 10)) * 0.35;
    const baseCanopySpread = 0.5 + Math.log10(Math.max(1, growthPoints + 10)) * 0.45;

    // Apply shrink factor to canopy & height (Section 6: tree shrinks, leaves fall)
    const effectiveHeightScale = Math.max(0.35, baseHeightScale * (1 - currentShrinkFactor * 0.5));
    const effectiveCanopySpread = Math.max(0.4, baseCanopySpread * (1 - currentShrinkFactor));

    // Leaves count
    const baseLeaves = Math.floor((15 + growthPoints * 0.2) * (healthPercent / 100));
    const leavesCount = Math.max(4, Math.floor(baseLeaves * (1 - currentShrinkFactor)));

    // Growth percentage display (relative to next major milestone)
    const nextStage = BANYAN_STAGES[stageIndex];
    let growthPercentage = 100;
    if (nextStage) {
      const prevMin = currentStageObj.minPoints;
      const nextMin = nextStage.minPoints;
      growthPercentage = Math.min(100, Math.round(((growthPoints - prevMin) / (nextMin - prevMin)) * 100));
    }

    return {
      habitId: commitment.id,
      stage: currentStageObj.stage,
      stageIndex,
      growthPoints,
      growthPercentage: Math.max(5, growthPercentage),
      healthPercent,
      healthState,
      aerialRootsCount,
      pillarTrunksCount,
      canopySpreadScale: effectiveCanopySpread,
      heightScale: effectiveHeightScale,
      leavesCount,
      shrinkCount: totalMissed,
      currentShrinkFactor,
      isWateredToday,
      milestones: [
        { stage: 'Seed', unlockedAt: commitment.createdAt, notes: 'Commitment established. Seed planted.' },
        ...(growthPoints >= 16 ? [{ stage: 'Sprout' as BanyanStage, unlockedAt: commitment.startDate, notes: 'First watering germination.' }] : []),
        ...(growthPoints >= 46 ? [{ stage: 'Young Banyan' as BanyanStage, unlockedAt: commitment.startDate, notes: 'Primary boughs extended.' }] : []),
        ...(growthPoints >= 111 ? [{ stage: 'Growing Banyan' as BanyanStage, unlockedAt: commitment.startDate, notes: 'First aerial prop roots descend.' }] : []),
        ...(growthPoints >= 241 ? [{ stage: 'Mature Banyan' as BanyanStage, unlockedAt: commitment.startDate, notes: 'Pillar trunk anchored into soil.' }] : []),
        ...(growthPoints >= 501 ? [{ stage: 'Large Banyan' as BanyanStage, unlockedAt: commitment.startDate, notes: 'Expansive horizontal canopy formed.' }] : []),
        ...(growthPoints >= 1001 ? [{ stage: 'Massive Banyan' as BanyanStage, unlockedAt: commitment.startDate, notes: 'Multi-pillar sacred grove established.' }] : [])
      ]
    };
  }
}
