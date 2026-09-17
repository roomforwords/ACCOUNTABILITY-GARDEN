// ==========================================
// COMMITMENT CARD (TODAY VIEW)
// Sections 14, 15, 22, 23, 24, 25
// Dedicated Banyan Tree Cockpit & Strict Lock Display
// ==========================================

import React, { useState } from 'react';
import { Commitment, DailyRecord } from '../../types';
import { BanyanEngine } from '../../services/banyanEngine';
import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  Droplets,
  Flame,
  Heart,
  Lock,
  Minus,
  Plus,
  Snowflake,
  Sprout,
  Trophy,
  X
} from 'lucide-react';

interface CommitmentCardProps {
  commitment: Commitment;
  record?: DailyRecord;
  currentStreak: number;
  longestStreak: number;
  freezeCredits: number;
  allRecords: DailyRecord[];
  onRecordDecision: (
    status: 'COMPLETED' | 'MISSED' | 'PARTIAL',
    value?: number,
    unit?: string
  ) => void;
  onUseFreeze: () => void;
  onOpenFocusMode?: (commitment: Commitment) => void;
}

export const CommitmentCard: React.FC<CommitmentCardProps> = ({
  commitment,
  record,
  currentStreak,
  longestStreak,
  freezeCredits,
  allRecords,
  onRecordDecision,
  onUseFreeze,
  onOpenFocusMode
}) => {
  const isLocked = !!record?.isLocked;
  const banyanState = BanyanEngine.calculateBanyanGrowth(commitment, allRecords);

  const [valInput, setValInput] = useState<number>(commitment.goalValue || 0);

  // Deadline calculation
  const deadlineInfo = React.useMemo(() => {
    if (!commitment.deadlineDate) return null;
    const now = new Date('2026-09-17T00:00:00Z');
    const dl = new Date(commitment.deadlineDate + 'T00:00:00Z');
    const diffDays = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return {
      dateStr: commitment.deadlineDate,
      daysRemaining: diffDays,
      isOverdue: diffDays < 0,
      isDueToday: diffDays === 0
    };
  }, [commitment.deadlineDate]);

  return (
    <div className={`commitment-card ${isLocked ? 'is-locked-card' : ''} priority-${commitment.priority.toLowerCase()}`}>
      {/* Top Meta Bar */}
      <div className="card-top-bar">
        <div className="category-archetype-wrap">
          <span className="category-tag">{commitment.category}</span>
          <span className="plant-tag">🌳 Dedicated Banyan Tree</span>
          <span className={`priority-tag priority-${commitment.priority.toLowerCase()}`}>
            {commitment.priority}
          </span>
        </div>

        <div className="streak-indicator-badge">
          <Flame size={15} className="flame-icon" />
          <span className="streak-num">{currentStreak}</span>
          <span className="streak-unit">day streak</span>
        </div>
      </div>

      {/* Main Commitment Title & Banyan Tree Metrics (Section 22) */}
      <div className="card-main-content">
        <h3 className="commitment-title">{commitment.name}</h3>
        {commitment.description && (
          <p className="commitment-desc">{commitment.description}</p>
        )}

        {/* Banyan Tree Dashboard Status Strip */}
        <div className="banyan-status-strip">
          <div className="banyan-status-item">
            <span className="bs-label">Growth Stage</span>
            <span className="bs-val">🌳 {banyanState.stage}</span>
          </div>

          <div className="banyan-status-item">
            <span className="bs-label">Today's Water</span>
            <span className={`bs-val ${banyanState.isWateredToday ? 'text-green' : 'text-orange'}`}>
              {banyanState.isWateredToday ? '💧 Watered Today' : '⏳ Dry / Awaiting Water'}
            </span>
          </div>

          <div className="banyan-status-item">
            <span className="bs-label">Tree Health</span>
            <span className="bs-val">{banyanState.healthPercent}% ({banyanState.healthState})</span>
          </div>

          <div className="banyan-status-item">
            <span className="bs-label">Aerial Roots</span>
            <span className="bs-val">{banyanState.aerialRootsCount} Roots ({banyanState.pillarTrunksCount} Pillars)</span>
          </div>
        </div>

        {deadlineInfo && (
          <div className={`deadline-banner ${deadlineInfo.isOverdue ? 'overdue' : deadlineInfo.isDueToday ? 'due-today' : ''}`}>
            <Clock size={13} />
            <span>
              {deadlineInfo.isOverdue
                ? `Overdue by ${Math.abs(deadlineInfo.daysRemaining)} days`
                : deadlineInfo.isDueToday
                ? 'Due Today!'
                : `Deadline in ${deadlineInfo.daysRemaining} days (${deadlineInfo.dateStr})`}
            </span>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* STATE A: PERMANENTLY LOCKED RECORD (Sections 15, 23, 24) */}
      {/* ---------------------------------------------------- */}
      {isLocked ? (
        <div className="locked-record-panel">
          <div className="locked-badge-row">
            <div className="permanent-lock-tag">
              <Lock size={14} className="lock-icon-active" />
              <span>PERMANENT RECORD</span>
            </div>

            <div className={`record-status-display status-${record.status.toLowerCase()}`}>
              {record.status === 'COMPLETED' && '✓ Completed Today • 💧 Watered • 🌱 Tree Growing'}
              {record.status === 'MISSED' && '❌ Not Completed • 🍂 Tree Shrunk • 💧 No Water'}
              {record.status === 'FROZEN' && '🧊 STREAK FREEZE'}
              {record.status === 'PARTIAL' && '◑ PARTIAL EXECUTION'}
            </div>
          </div>

          <p className="locked-philosophy-quote">
            {record.status === 'COMPLETED'
              ? '“You watered it today. Keep going.”'
              : record.status === 'MISSED'
              ? '“The tree didn’t need your promise. It needed your action. You cannot edit yesterday.”'
              : '“Streak protected by freeze credit. Historical record remains honest.”'}
          </p>

          {(record.notes || record.mood || record.energyLevel) && (
            <div className="locked-notes-box">
              {record.mood && <span className="locked-mood">State: {record.mood}</span>}
              {record.energyLevel && <span className="locked-energy">Energy: {record.energyLevel}/5</span>}
              {record.notes && <p className="locked-note-text">"{record.notes}"</p>}
            </div>
          )}

          <div className="timestamp-audit-note">
            <span>Permanently locked on {new Date(record.lockedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Cannot be modified</span>
          </div>
        </div>
      ) : (
        /* ---------------------------------------------------- */
        /* STATE B: ACTIVE DECISION COCKPIT (Section 14, 22)   */
        /* ---------------------------------------------------- */
        <div className="active-decision-panel">
          <div className="decision-prompt-row">
            <span className="did-you-do-it-label">Did you do today's work?</span>
            {onOpenFocusMode && (
              <button
                type="button"
                className="focus-mode-btn"
                onClick={() => onOpenFocusMode(commitment)}
                title="Enter distraction-free focus timer"
              >
                <Clock size={13} /> Focus Timer
              </button>
            )}
          </div>

          {/* Quantitative target input */}
          {commitment.trackingType !== 'YES_NO' && commitment.trackingType !== 'DONE_NOT_DONE' && (
            <div className="quantitative-input-row">
              <span className="goal-label">
                Target: {commitment.goalValue} {commitment.goalUnit}
              </span>
              <div className="quantity-stepper">
                <button
                  type="button"
                  className="step-btn"
                  onClick={() => setValInput(v => Math.max(0, v - 5))}
                >
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  className="step-input"
                  value={valInput}
                  onChange={e => setValInput(Number(e.target.value))}
                />
                <span className="unit-label">{commitment.goalUnit}</span>
                <button
                  type="button"
                  className="step-btn"
                  onClick={() => setValInput(v => v + 5)}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Touch-Friendly Action Buttons */}
          <div className="decision-actions-row">
            {/* DONE / YES (Pours Water Bucket) */}
            <button
              type="button"
              className="action-btn btn-done"
              onClick={() => {
                const isQuantitative = commitment.trackingType !== 'YES_NO' && commitment.trackingType !== 'DONE_NOT_DONE';
                const status = isQuantitative && valInput < (commitment.goalValue || 0)
                  ? (valInput > 0 ? 'PARTIAL' : 'MISSED')
                  : 'COMPLETED';
                onRecordDecision(status, valInput, commitment.goalUnit);
              }}
            >
              <Droplets size={20} className="action-icon" />
              <span>{commitment.trackingType === 'YES_NO' ? 'YES (WATER TREE)' : 'DONE (WATER TREE)'}</span>
            </button>

            {/* NOT DONE / NO (Tree Shrinks) */}
            <button
              type="button"
              className="action-btn btn-not-done"
              onClick={() => {
                onRecordDecision('MISSED', 0, commitment.goalUnit);
              }}
            >
              <X size={20} className="action-icon" />
              <span>{commitment.trackingType === 'YES_NO' ? 'NO (TREE SHRINKS)' : 'NOT DONE (TREE SHRINKS)'}</span>
            </button>
          </div>

          {/* Streak Freeze Credit Action */}
          {freezeCredits > 0 && (
            <div className="freeze-option-row">
              <button
                type="button"
                className="freeze-action-btn"
                onClick={onUseFreeze}
                title="Preserves streak integrity as an explicit freeze. Never fakes completion."
              >
                <Snowflake size={13} />
                <span>Use Streak Freeze ({freezeCredits} credits left)</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
