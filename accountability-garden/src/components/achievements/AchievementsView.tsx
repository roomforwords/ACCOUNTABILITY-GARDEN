// ==========================================
// ACHIEVEMENTS & LEVELS: STRUCTURED MATRICES & TABLES
// Sections 66, 67, 68
// Structured Tables for Stages & Challenges
// ==========================================

import React from 'react';
import { Commitment, DailyRecord } from '../../types';
import {
  Award,
  CheckCircle2,
  Clock,
  Flame,
  Lock,
  Shield,
  Sparkles,
  Star,
  Table as TableIcon,
  Target
} from 'lucide-react';

interface AchievementsViewProps {
  commitments: Commitment[];
  records: DailyRecord[];
}

interface LevelDef {
  level: number;
  name: string;
  minCompletedDays: number;
  description: string;
}

const LEVELS: LevelDef[] = [
  { level: 1, name: 'Seed', minCompletedDays: 0, description: 'First commitment planted. Willingness to be held accountable.' },
  { level: 2, name: 'Sprout', minCompletedDays: 7, description: 'Roots beginning to take hold in the daily routine.' },
  { level: 3, name: 'Builder', minCompletedDays: 20, description: 'Structure emerging. Showing up on ordinary, unmotivated days.' },
  { level: 4, name: 'Consistent', minCompletedDays: 45, description: 'Execution begins to outpace resistance.' },
  { level: 5, name: 'Disciplined', minCompletedDays: 80, description: 'Habit roots run deep. Unfazed by temporary disruptions.' },
  { level: 6, name: 'Established', minCompletedDays: 150, description: 'The garden has formed a resilient, thriving microclimate.' },
  { level: 7, name: 'Flourishing', minCompletedDays: 300, description: 'Permanence. The record reflects profound behavioral mastery.' }
];

export const AchievementsView: React.FC<AchievementsViewProps> = ({ commitments, records }) => {
  const completedRecordsCount = records.filter(r => r.status === 'COMPLETED').length;

  // Determine current user level
  let currentLevel = LEVELS[0];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (completedRecordsCount >= LEVELS[i].minCompletedDays) {
      currentLevel = LEVELS[i];
      break;
    }
  }

  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);
  const progressToNext = nextLevel
    ? Math.min(
        100,
        Math.round(
          ((completedRecordsCount - currentLevel.minCompletedDays) /
            (nextLevel.minCompletedDays - currentLevel.minCompletedDays)) *
            100
        )
      )
    : 100;

  // Challenges (Section 68)
  const challenges = [
    {
      code: 'CH-07',
      id: 'ch_7',
      name: '7-Day Unbroken Ground',
      target: 7,
      description: 'Execute all scheduled daily commitments for 7 consecutive days.',
      isUnlocked: completedRecordsCount >= 7,
      historyStatus: completedRecordsCount >= 7 ? 'Completed' : 'In Progress'
    },
    {
      code: 'CH-14',
      id: 'ch_14',
      name: '14-Day Iron Rhythm',
      target: 14,
      description: 'Maintain strict consistency across two full weeks.',
      isUnlocked: completedRecordsCount >= 14,
      historyStatus: completedRecordsCount >= 14 ? 'Completed' : 'In Progress'
    },
    {
      code: 'CH-30',
      id: 'ch_30',
      name: '30-Day Root Formation',
      target: 30,
      description: 'A complete monthly cycle of undeniable reality.',
      isUnlocked: completedRecordsCount >= 30,
      historyStatus: completedRecordsCount >= 30 ? 'Completed' : 'In Progress'
    },
    {
      code: 'CH-100',
      id: 'ch_100',
      name: '100-Day Ancient Grove',
      target: 100,
      description: 'One hundred recorded days without rewriting the record.',
      isUnlocked: completedRecordsCount >= 100,
      historyStatus: completedRecordsCount >= 100 ? 'Completed' : 'Pending'
    }
  ];

  return (
    <div className="achievements-view-container">
      {/* Header Banner */}
      <div className="achievements-banner-card">
        <div className="banner-title-box">
          <Award size={24} className="award-accent" />
          <div>
            <h2 className="banner-heading">Accountability Milestones & Levels</h2>
            <p className="banner-subtext">
              “Do not make gamification more important than accountability. Growth comes from what you actually do.”
            </p>
          </div>
        </div>

        {/* Current Level Badge */}
        <div className="level-current-badge">
          <div className="level-number-pill">Level {currentLevel.level}</div>
          <div className="level-name-title">{currentLevel.name}</div>
          <div className="level-count-sub">{completedRecordsCount} total completed days</div>
        </div>
      </div>

      {/* Level Progress Track Bar */}
      {nextLevel && (
        <div className="level-progress-card mt-3">
          <div className="progress-info-row">
            <span className="progress-title-sub">
              Current Horizon: <strong>Level {nextLevel.level} ({nextLevel.name})</strong>
            </span>
            <span className="progress-stat-sub">
              {completedRecordsCount} / {nextLevel.minCompletedDays} days ({progressToNext}%)
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressToNext}%` }} />
          </div>
        </div>
      )}

      {/* SECTION 1: THE SEVEN STAGES TABLE */}
      <div className="structured-section-card mt-4">
        <div className="section-card-header">
          <div className="header-title-group">
            <Sparkles size={18} className="text-green" />
            <h3 className="section-title">The Seven Stages of Accountability (Progression Table)</h3>
          </div>
          <span className="badge-subtle">Empirical Stage Gates</span>
        </div>

        <div className="table-responsive-wrapper mt-2">
          <table className="accountability-table stages-table">
            <thead>
              <tr>
                <th style={{ width: '90px' }}>Level</th>
                <th style={{ width: '140px' }}>Stage Name</th>
                <th style={{ width: '130px' }}>Requirement</th>
                <th style={{ width: '180px' }}>Current Progress</th>
                <th style={{ width: '130px' }}>Audit Status</th>
                <th>Behavioral Philosophy & Impact</th>
              </tr>
            </thead>
            <tbody>
              {LEVELS.map(lvl => {
                const isReached = lvl.level <= currentLevel.level;
                const isCurrent = lvl.level === currentLevel.level;
                const percent = Math.min(100, Math.round((completedRecordsCount / Math.max(1, lvl.minCompletedDays)) * 100));

                return (
                  <tr key={lvl.level} className={isCurrent ? 'row-current-level' : isReached ? 'row-mastered' : 'row-locked'}>
                    <td>
                      <span className={`level-pill-cell ${isReached ? 'pill-mastered' : 'pill-locked'}`}>
                        L{lvl.level}
                      </span>
                    </td>
                    <td>
                      <strong className="stage-name-text">{lvl.name}</strong>
                      {isCurrent && <span className="current-indicator-badge">ACTIVE</span>}
                    </td>
                    <td className="req-cell">
                      {lvl.minCompletedDays === 0 ? '0 days (Day 1)' : `${lvl.minCompletedDays} completed days`}
                    </td>
                    <td>
                      <div className="table-progress-box">
                        <div className="mini-progress-track">
                          <div
                            className={`mini-progress-bar ${isReached ? 'bar-green' : 'bar-muted'}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="mini-progress-text">
                          {isReached ? '100%' : `${completedRecordsCount}/${lvl.minCompletedDays}d`}
                        </span>
                      </div>
                    </td>
                    <td>
                      {isReached ? (
                        <span className="status-badge-table status-completed">
                          <CheckCircle2 size={12} /> Mastered
                        </span>
                      ) : (
                        <span className="status-badge-table status-locked">
                          <Lock size={12} /> Locked
                        </span>
                      )}
                    </td>
                    <td className="desc-cell text-muted">
                      {lvl.description}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: CONSISTENCY CHALLENGES TABLE */}
      <div className="structured-section-card mt-4">
        <div className="section-card-header">
          <div className="header-title-group">
            <Target size={18} className="text-orange" />
            <h3 className="section-title">Consistency Challenges (Audit Matrix)</h3>
          </div>
          <span className="badge-subtle">Permanent Outcome Ledger</span>
        </div>

        <div className="table-responsive-wrapper mt-2">
          <table className="accountability-table challenges-table">
            <thead>
              <tr>
                <th style={{ width: '90px' }}>Code</th>
                <th style={{ width: '220px' }}>Challenge Name</th>
                <th style={{ width: '130px' }}>Target Window</th>
                <th style={{ width: '200px' }}>Execution Track</th>
                <th style={{ width: '140px' }}>Current State</th>
                <th>Challenge Directives & Verification</th>
              </tr>
            </thead>
            <tbody>
              {challenges.map(ch => {
                const percent = Math.min(100, Math.round((completedRecordsCount / ch.target) * 100));

                return (
                  <tr key={ch.id} className={ch.isUnlocked ? 'row-unlocked' : 'row-in-progress'}>
                    <td>
                      <span className="code-badge">{ch.code}</span>
                    </td>
                    <td>
                      <strong className="challenge-name-text">{ch.name}</strong>
                    </td>
                    <td className="target-cell">
                      <span className="target-pill">{ch.target} Days</span>
                    </td>
                    <td>
                      <div className="table-progress-box">
                        <div className="mini-progress-track">
                          <div
                            className={`mini-progress-bar ${ch.isUnlocked ? 'bar-green' : 'bar-orange'}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="mini-progress-text">{completedRecordsCount}/{ch.target}d ({percent}%)</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge-table ${ch.isUnlocked ? 'status-completed' : 'status-pending'}`}>
                        {ch.isUnlocked ? '✓ Completed' : '⚡ In Progress'}
                      </span>
                    </td>
                    <td className="desc-cell">
                      <span className="directive-text">{ch.description}</span>
                      <div className="tamper-proof-tag">
                        <Lock size={10} /> Tamper-Proof Audit
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
