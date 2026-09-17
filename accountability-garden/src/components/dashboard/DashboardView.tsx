// ==========================================
// DASHBOARD VIEW
// Sections 42, 87, 88
// Today's Progress, Streak, Deadlines, Garden Preview & Recent History
// ==========================================

import React from 'react';
import { Commitment, DailyRecord, TodoItem, UserProfile } from '../../types';
import { GardenCanvas } from '../garden/GardenCanvas';
import { calculateHabitStreaks } from '../../services/streakEngine';
import { AnalyticsEngine } from '../../services/analyticsEngine';
import { getContextualQuote } from '../../constants/quotes';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Flame,
  History,
  Lock,
  Plus,
  ShieldAlert,
  Sparkles,
  Trophy
} from 'lucide-react';

interface DashboardViewProps {
  user: UserProfile;
  commitments: Commitment[];
  records: DailyRecord[];
  todos: TodoItem[];
  onNavigate: (view: string) => void;
  onSelectCommitment: (commitment: Commitment) => void;
  onCreateCommitmentClick: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  commitments,
  records,
  todos,
  onNavigate,
  onSelectCommitment,
  onCreateCommitmentClick
}) => {
  const todayStr = '2026-09-17';
  const activeCommitments = commitments.filter(c => !c.isArchived);

  // Today's completion
  const dailyScore = AnalyticsEngine.calculateDailyCompletion(commitments, records, todayStr);

  // Highest streak
  let bestStreak = 0;
  let currentTopStreak = 0;
  activeCommitments.forEach(c => {
    const s = calculateHabitStreaks(c, records, todayStr);
    if (s.longestStreak > bestStreak) bestStreak = s.longestStreak;
    if (s.currentStreak > currentTopStreak) currentTopStreak = s.currentStreak;
  });

  // Upcoming deadlines count
  const upcomingDeadlines = todos.filter(t => !t.isCompleted && t.deadlineDate).length +
    commitments.filter(c => !c.isArchived && c.deadlineDate).length;

  // Recent history (last 5 records)
  const recentHistory = [...records]
    .sort((a, b) => b.lockedAt.localeCompare(a.lockedAt))
    .slice(0, 5);

  const habitMap = new Map<string, Commitment>();
  commitments.forEach(c => habitMap.set(c.id, c));

  // Contextual quote
  const quote = getContextualQuote(user.accountabilityMode, {
    consecutiveMisses: 0,
    timeOfDay: 'day'
  });

  return (
    <div className="dashboard-view-container">
      {/* Hero Banner (Section 88) */}
      <div className="dashboard-hero-card">
        <div className="hero-content">
          <span className="hero-badge">ACCOUNTABILITY OPERATING SYSTEM</span>
          <h1 className="hero-heading">Your Garden</h1>
          <p className="hero-subtext">“What you do repeatedly becomes visible.”</p>
        </div>

        {quote && (
          <div className="hero-quote-box">
            <span className="quote-label">Direct Accountability:</span>
            <p className="quote-text">“{quote}”</p>
          </div>
        )}
      </div>

      {/* Primary KPI Grid (Section 42) */}
      <div className="dashboard-kpi-grid mt-4">
        {/* Today's Progress */}
        <div className="kpi-card" onClick={() => onNavigate('today')}>
          <div className="kpi-card-top">
            <CheckCircle2 size={18} className="kpi-icon text-green" />
            <span className="kpi-title">Today's Progress</span>
          </div>
          <div className="kpi-val">{dailyScore.completed} / {dailyScore.totalScheduled}</div>
          <div className="kpi-sub">{dailyScore.percentage}% completed today</div>
        </div>

        {/* Current Streak */}
        <div className="kpi-card" onClick={() => onNavigate('streaks')}>
          <div className="kpi-card-top">
            <Flame size={18} className="kpi-icon text-orange" />
            <span className="kpi-title">Current Streak</span>
          </div>
          <div className="kpi-val">🔥 {currentTopStreak} <small>days</small></div>
          <div className="kpi-sub">Active top run</div>
        </div>

        {/* Best Streak */}
        <div className="kpi-card" onClick={() => onNavigate('streaks')}>
          <div className="kpi-card-top">
            <Trophy size={18} className="kpi-icon text-gold" />
            <span className="kpi-title">Best Streak</span>
          </div>
          <div className="kpi-val">🏆 {bestStreak} <small>days</small></div>
          <div className="kpi-sub">All-time personal record</div>
        </div>

        {/* Deadlines */}
        <div className="kpi-card" onClick={() => onNavigate('deadlines')}>
          <div className="kpi-card-top">
            <Clock size={18} className="kpi-icon text-purple" />
            <span className="kpi-title">Deadlines</span>
          </div>
          <div className="kpi-val">{upcomingDeadlines} <small>pending</small></div>
          <div className="kpi-sub">Approaching deadlines</div>
        </div>
      </div>

      {/* Garden Preview Section */}
      <div className="dashboard-garden-preview-card mt-5">
        <div className="preview-card-header">
          <div>
            <h3 className="section-title">Garden State Preview</h3>
            <span className="section-subtext">Visual consequences of your daily execution</span>
          </div>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => onNavigate('garden')}
          >
            Enter Full Garden Grove <ArrowRight size={15} />
          </button>
        </div>

        <div className="dashboard-canvas-wrap">
          <GardenCanvas
            commitments={commitments}
            records={records}
            onSelectCommitment={onSelectCommitment}
          />
        </div>
      </div>

      {/* Two-Column: Quick Action Today & Recent History */}
      <div className="dashboard-bottom-grid mt-5">
        {/* Today's Commitments Snapshot */}
        <div className="dash-column-card">
          <div className="card-header-clean">
            <h3 className="card-title">Today's Decisions (Cockpit)</h3>
            <button
              type="button"
              className="link-btn"
              onClick={() => onNavigate('today')}
            >
              Open Full Today Cockpit →
            </button>
          </div>

          <div className="dash-commitments-list">
            {activeCommitments.length === 0 ? (
              <div className="empty-state-clean p-4 text-center">
                <p className="text-muted mb-3">No active Banyan commitments yet.</p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={onCreateCommitmentClick}
                >
                  <Plus size={14} /> Plant Your First Banyan Tree
                </button>
              </div>
            ) : (
              activeCommitments.slice(0, 4).map(c => {
                const rec = records.find(r => r.habitId === c.id && r.recordDate === todayStr);
                return (
                  <div key={c.id} className="dash-habit-row">
                    <div className="dash-habit-info">
                      <span className="dash-habit-name">🌳 {c.name}</span>
                      <span className="dash-habit-cat">{c.category}</span>
                    </div>

                    {rec ? (
                      <span className={`status-pill pill-${rec.status.toLowerCase()}`}>
                        <Lock size={11} /> {rec.status}
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="btn-quick-check"
                        onClick={() => onNavigate('today')}
                      >
                        Record Now
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Immutable History */}
        <div className="dash-column-card">
          <div className="card-header-clean">
            <h3 className="card-title">Recent Immutable Records</h3>
            <button
              type="button"
              className="link-btn"
              onClick={() => onNavigate('history')}
            >
              View Full Timeline →
            </button>
          </div>

          <div className="dash-history-list">
            {recentHistory.map(rec => {
              const habit = habitMap.get(rec.habitId);
              return (
                <div key={rec.id} className="dash-history-row">
                  <span className={`rec-bullet status-${rec.status.toLowerCase()}`}>
                    {rec.status === 'COMPLETED' ? '✓' : rec.status === 'FROZEN' ? '🧊' : '✕'}
                  </span>
                  <div className="dash-rec-info">
                    <span className="dash-rec-habit">{habit?.name || 'Commitment'}</span>
                    <small className="dash-rec-date">{rec.recordDate}</small>
                  </div>
                  <Lock size={12} className="lock-subtle" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
