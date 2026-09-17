// ==========================================
// STREAKS & HEATMAP VIEW
// Sections 2, 3, 4, 21, 23
// ==========================================

import React, { useState } from 'react';
import { Commitment, DailyRecord, UserProfile } from '../../types';
import { calculateHabitStreaks } from '../../services/streakEngine';
import { StreakHeatmap } from '../calendar/StreakHeatmap';
import { Flame, Heart, History, Lock, ShieldCheck, Snowflake, Trophy } from 'lucide-react';

interface StreaksViewProps {
  user: UserProfile;
  commitments: Commitment[];
  records: DailyRecord[];
}

export const StreaksView: React.FC<StreaksViewProps> = ({ user, commitments, records }) => {
  const todayStr = '2026-09-17';
  const activeCommitments = commitments.filter(c => !c.isArchived);
  const [selectedHabitId, setSelectedHabitId] = useState<string>(
    activeCommitments[0]?.id || ''
  );

  const selectedCommitment = commitments.find(c => c.id === selectedHabitId) || activeCommitments[0];

  return (
    <div className="streaks-view-container">
      {/* Top Banner & Freeze Balance (Sections 2 & 3) */}
      <div className="streaks-banner-card">
        <div className="streaks-banner-content">
          <div className="banner-title-box">
            <Flame size={24} className="flame-primary" />
            <div>
              <h2 className="banner-heading">Streak & Consistency Architecture</h2>
              <p className="banner-subtext">
                “Your streak was not luck. You built it. A broken streak remains an honest record.”
              </p>
            </div>
          </div>

          {/* Streak Freeze Component (Section 3) */}
          <div className="freeze-balance-card">
            <div className="freeze-icon-box">
              <Snowflake size={20} className="snowflake-icon" />
            </div>
            <div>
              <div className="freeze-val">{user.freezeCredits} Credits</div>
              <div className="freeze-desc">Streak Freeze Allowance</div>
            </div>
          </div>
        </div>

        <div className="freeze-philosophy-bar">
          <Lock size={13} />
          <span>
            Streak Freeze Rule (Section 3): When activated, the streak is protected, but the record explicitly logs <strong>🧊 STREAK FREEZE</strong>. It never pretends the user completed the habit.
          </span>
        </div>
      </div>

      {activeCommitments.length === 0 ? (
        <div className="empty-state-box mt-4">
          <p className="empty-primary">No active commitments in your Banyan Grove.</p>
          <p className="empty-sub">Establish a commitment to begin recording streaks and watering history.</p>
        </div>
      ) : (
        <>
          {/* Commitment Tabs */}
          <div className="habit-tabs-row">
            {activeCommitments.map(c => {
              const stats = calculateHabitStreaks(c, records, todayStr);
              const isSelected = c.id === selectedCommitment?.id;

              return (
                <button
                  key={c.id}
                  className={`habit-tab-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedHabitId(c.id)}
                >
                  <span className="tab-plant-icon">🌳</span>
                  <div className="tab-info">
                    <span className="tab-name">{c.name}</span>
                    <span className="tab-streak">🔥 {stats.currentStreak}d (Best: {stats.longestStreak}d)</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Commitment Deep-Dive */}
          {selectedCommitment && (
            <div className="streak-details-container">
              {(() => {
                const stats = calculateHabitStreaks(selectedCommitment, records, todayStr);
                return (
                  <>
                    {/* Current Streak Statistics Grid (Section 4) */}
                    <div className="streak-summary-cards-grid">
                      <div className="streak-metric-card">
                        <div className="metric-label">
                          <Flame size={16} className="flame-accent" />
                          <span>Current Streak</span>
                        </div>
                        <div className="metric-value">{stats.currentStreak} <small>days</small></div>
                        <div className="metric-sub">Active consecutive days</div>
                      </div>

                      <div className="streak-metric-card">
                        <div className="metric-label">
                          <Trophy size={16} className="trophy-accent" />
                          <span>Longest Streak</span>
                        </div>
                        <div className="metric-value">{stats.longestStreak} <small>days</small></div>
                        <div className="metric-sub">Permanent personal record</div>
                      </div>

                      <div className="streak-metric-card">
                        <div className="metric-label">
                          <ShieldCheck size={16} className="rate-accent" />
                          <span>Completion Rate</span>
                        </div>
                        <div className="metric-value">{stats.completionPercentage}%</div>
                        <div className="metric-sub">{stats.totalCompletedDays} of {stats.totalScheduledDays} scheduled</div>
                      </div>

                      <div className="streak-metric-card">
                        <div className="metric-label">
                          <Heart size={16} className="heart-accent" />
                          <span>Recovery History</span>
                        </div>
                        <div className="metric-value">{stats.recoveredStreaksCount} <small>times</small></div>
                        <div className="metric-sub font-semibold text-orange">
                          {stats.brokenStreaksCount} previous breaks recorded
                        </div>
                      </div>
                    </div>

                    {/* Contribution Grid — Last 140 Days (Section 21) */}
                    <div className="heatmap-section-wrapper mt-4">
                      <StreakHeatmap
                        commitment={selectedCommitment}
                        records={records}
                        daysCount={140}
                      />
                    </div>

                    {/* Immutable Streak Break History (Sections 4, 23) */}
                    <div className="break-history-section-card mt-4">
                      <div className="card-header-clean">
                        <div className="title-with-count">
                          <History size={16} className="history-accent" />
                          <h4 className="card-title">Immutable Break & Recovery Ledger</h4>
                        </div>
                        <span className="permanent-badge">{stats.brokenStreaksCount} previous breaks recorded</span>
                      </div>

                      {stats.breakRecords && stats.breakRecords.length > 0 ? (
                        <div className="break-ledger-grid">
                          {stats.breakRecords.map((brk, bIdx) => (
                            <div key={brk.id || bIdx} className="break-ledger-row">
                              <span className="ledger-break-num">Break #{bIdx + 1}</span>
                              <span className="ledger-date">Date: {brk.breakDate}</span>
                              <span className="ledger-streak">Ended: {brk.previousStreak}-day streak</span>
                              <span className="ledger-status">
                                {brk.recoveryDate ? `✓ Recovered on ${brk.recoveryDate}` : '🌱 In Recovery'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="empty-subtext">Zero streak breaks recorded. Unbroken discipline nurtures strong aerial roots.</p>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </>
      )}
    </div>
  );
};
