// ==========================================
// TODAY VIEW
// Sections 14, 15, 22, 23, 24
// Banyan Watering & Today Cockpit
// ==========================================

import React, { useState } from 'react';
import { Commitment, DailyRecord, TodoItem, UserProfile } from '../../types';
import { CommitmentCard } from './CommitmentCard';
import { PostCheckinModal } from './PostCheckinModal';
import { WaterBucketAnimation } from '../garden/WaterBucketAnimation';
import { isHabitScheduledOnDate, calculateHabitStreaks } from '../../services/streakEngine';
import { getContextualQuote } from '../../constants/quotes';
import { getLocalDateString, formatDisplayDate } from '../../utils/dateUtils';
import confetti from 'canvas-confetti';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Droplets,
  Flame,
  Lock,
  Plus,
  Sprout
} from 'lucide-react';

interface TodayViewProps {
  user: UserProfile;
  commitments: Commitment[];
  records: DailyRecord[];
  todos: TodoItem[];
  onRecordHabit: (
    habitId: string,
    status: 'COMPLETED' | 'MISSED' | 'PARTIAL' | 'FROZEN',
    value?: number,
    unit?: string,
    reflectionData?: any
  ) => void;
  onUseFreeze: (habitId: string) => void;
  onCompleteTodo: (todoId: string) => void;
  onCreateCommitmentClick: () => void;
  onOpenFocusMode: (commitment: Commitment) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  user,
  commitments,
  records,
  todos,
  onRecordHabit,
  onUseFreeze,
  onCompleteTodo,
  onCreateCommitmentClick,
  onOpenFocusMode
}) => {
  const todayStr = getLocalDateString();
  const [activeReflectionHabit, setActiveReflectionHabit] = useState<{
    id: string;
    name: string;
    status: 'COMPLETED' | 'MISSED' | 'PARTIAL' | 'FROZEN';
    value?: number;
    unit?: string;
  } | null>(null);

  // Active Water Bucket Animation state
  const [wateringTarget, setWateringTarget] = useState<{
    commitment: Commitment;
    streak: number;
    value?: number;
    unit?: string;
  } | null>(null);

  const scheduledCommitments = commitments.filter(c => 
    !c.isArchived && isHabitScheduledOnDate(c, todayStr)
  );

  const todayRecords = records.filter(r => r.recordDate === todayStr);
  const recordsMap = new Map<string, DailyRecord>();
  todayRecords.forEach(r => recordsMap.set(r.habitId, r));

  const completedCount = scheduledCommitments.filter(c => {
    const r = recordsMap.get(c.id);
    return r?.status === 'COMPLETED' || r?.status === 'FROZEN';
  }).length;

  const totalScheduled = scheduledCommitments.length;
  const allCompleted = totalScheduled > 0 && completedCount === totalScheduled;

  React.useEffect(() => {
    if (allCompleted) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  }, [allCompleted]);

  const bannerQuote = React.useMemo(() => {
    const hour = new Date().getHours();
    const timeOfDay = hour >= 5 && hour < 12 ? 'morning' : hour >= 18 ? 'evening' : 'day';
    return getContextualQuote(user.accountabilityMode, {
      timeOfDay,
      isAllCompleted: allCompleted,
      category: 'general_philosophy'
    });
  }, [user.accountabilityMode, allCompleted]);

  const handleDecisionClick = (
    commitment: Commitment,
    status: 'COMPLETED' | 'MISSED' | 'PARTIAL',
    value?: number,
    unit?: string
  ) => {
    if (status === 'COMPLETED') {
      const stats = calculateHabitStreaks(commitment, records, todayStr);
      // Trigger physical water bucket animation sequence first!
      setWateringTarget({
        commitment,
        streak: stats.currentStreak + 1,
        value,
        unit
      });
    } else {
      // Record missed directly
      onRecordHabit(commitment.id, status, value, unit);
      setActiveReflectionHabit({
        id: commitment.id,
        name: commitment.name,
        status,
        value,
        unit
      });
    }
  };

  const handleWateringAnimationDone = () => {
    if (wateringTarget) {
      onRecordHabit(wateringTarget.commitment.id, 'COMPLETED', wateringTarget.value, wateringTarget.unit);
      setActiveReflectionHabit({
        id: wateringTarget.commitment.id,
        name: wateringTarget.commitment.name,
        status: 'COMPLETED',
        value: wateringTarget.value,
        unit: wateringTarget.unit
      });
      setWateringTarget(null);
    }
  };

  return (
    <div className="today-view-container">
      {/* Date Header & Philosophy Banner */}
      <div className="today-header-banner">
        <div className="today-date-row">
          <div className="date-badge">
            <Calendar size={18} className="calendar-icon" />
            <span className="date-text">{formatDisplayDate(todayStr)}</span>
          </div>

          <div className="mode-pill-tag">
            <span>Tone: {user.accountabilityMode}</span>
          </div>
        </div>

        {bannerQuote && (
          <div className="philosophical-callout">
            <span className="quote-mark">“</span>
            <p className="callout-text">{bannerQuote}</p>
          </div>
        )}

        {/* Daily Completion Progress Bar */}
        <div className="daily-completion-card">
          <div className="progress-info-row">
            <span className="progress-label">Daily Banyan Watering Status</span>
            <span className="progress-fraction">
              {completedCount} / {totalScheduled} watered ({totalScheduled > 0 ? Math.round((completedCount / totalScheduled) * 100) : 0}%)
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${totalScheduled > 0 ? (completedCount / totalScheduled) * 100 : 0}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Commitments Section */}
      <div className="commitments-section">
        <div className="section-header-bar">
          <div className="title-with-count">
            <h2 className="section-main-heading">Today's Works & Banyan Trees</h2>
            <span className="counter-pill">{scheduledCommitments.length}</span>
          </div>

          <button
            type="button"
            className="btn btn-outline"
            onClick={onCreateCommitmentClick}
          >
            <Plus size={16} /> Establish Commitment
          </button>
        </div>

        {scheduledCommitments.length === 0 ? (
          <div className="empty-state-box">
            <p className="empty-primary">Your Banyan Grove is currently clean with no active commitments.</p>
            <p className="empty-sub">Establish your first work. A dedicated Banyan Tree will be planted immediately.</p>
            <button className="btn btn-primary mt-3" onClick={onCreateCommitmentClick}>
              + Establish Commitment
            </button>
          </div>
        ) : (
          <div className="commitments-grid">
            {scheduledCommitments.map(c => {
              const record = recordsMap.get(c.id);
              const streakStats = calculateHabitStreaks(c, records, todayStr);

              return (
                <CommitmentCard
                  key={c.id}
                  commitment={c}
                  record={record}
                  currentStreak={streakStats.currentStreak}
                  longestStreak={streakStats.longestStreak}
                  freezeCredits={user.freezeCredits}
                  allRecords={records}
                  onRecordDecision={(status, value, unit) =>
                    handleDecisionClick(c, status, value, unit)
                  }
                  onUseFreeze={() => onUseFreeze(c.id)}
                  onOpenFocusMode={onOpenFocusMode}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Single-Day Todos Section */}
      {todos.length > 0 && (
        <div className="todos-section mt-5">
          <div className="section-header-bar">
            <div className="title-with-count">
              <h3 className="section-sub-heading">Today's Singular Tasks</h3>
              <span className="counter-pill">{todos.length}</span>
            </div>
          </div>

          <div className="todos-list-card">
            {todos.map(todo => (
              <div
                key={todo.id}
                className={`todo-row-item ${todo.isCompleted ? 'is-completed' : ''}`}
              >
                <button
                  type="button"
                  className={`todo-check-btn ${todo.isCompleted ? 'checked' : ''}`}
                  disabled={todo.isLocked && todo.isCompleted}
                  onClick={() => !todo.isCompleted && onCompleteTodo(todo.id)}
                  title={todo.isCompleted ? 'Locked permanent record' : 'Mark completed'}
                >
                  {todo.isCompleted ? <CheckCircle2 size={18} /> : <div className="circle-ring" />}
                </button>

                <div className="todo-content-col">
                  <span className="todo-title">{todo.title}</span>
                  {todo.description && (
                    <p className="todo-description">{todo.description}</p>
                  )}
                  <div className="todo-meta-tags">
                    <span className="todo-cat-tag">{todo.category}</span>
                    {todo.deadlineDate && (
                      <span className="todo-deadline-tag">
                        <Clock size={11} /> Due {todo.deadlineDate}
                      </span>
                    )}
                    {todo.isLocked && (
                      <span className="todo-locked-tag">
                        <Lock size={11} /> Locked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Physical Water Bucket Animation Sequence */}
      {wateringTarget && (
        <WaterBucketAnimation
          commitment={wateringTarget.commitment}
          streakCount={wateringTarget.streak}
          onAnimationComplete={handleWateringAnimationDone}
        />
      )}

      {/* Reflection Modal */}
      {activeReflectionHabit && (
        <PostCheckinModal
          habitName={activeReflectionHabit.name}
          status={activeReflectionHabit.status}
          onClose={() => setActiveReflectionHabit(null)}
          onSubmitReflection={reflectionData => {
            onRecordHabit(
              activeReflectionHabit.id,
              activeReflectionHabit.status,
              activeReflectionHabit.value,
              activeReflectionHabit.unit,
              reflectionData
            );
            setActiveReflectionHabit(null);
          }}
        />
      )}
    </div>
  );
};
