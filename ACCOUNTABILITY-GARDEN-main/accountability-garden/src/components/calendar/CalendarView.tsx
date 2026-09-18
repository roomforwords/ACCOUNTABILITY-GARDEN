// ==========================================
// CALENDAR VIEW (MONTH / WEEK / DAY)
// Section 25
// ==========================================

import React, { useState } from 'react';
import { Commitment, DailyRecord } from '../../types';
import { isHabitScheduledOnDate } from '../../services/streakEngine';
import { getLocalDateString, getCurrentYear, getCurrentMonth } from '../../utils/dateUtils';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Lock,
  ShieldAlert
} from 'lucide-react';

interface CalendarViewProps {
  commitments: Commitment[];
  records: DailyRecord[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ commitments, records }) => {
  // Current view mode: 'month' | 'week'
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedCommitmentId, setSelectedCommitmentId] = useState<string>('ALL');

  const todayStr = getLocalDateString();

  // Month navigation (Defaults to current local month & year)
  const [currentYear, setCurrentYear] = useState<number>(getCurrentYear());
  const [currentMonth, setCurrentMonth] = useState<number>(getCurrentMonth());

  const [inspectedDate, setInspectedDate] = useState<string>(todayStr);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  // Generate calendar days for current month
  const calendarDays = React.useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sun

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Leading days from previous month
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dNum = prevMonthLastDay - i;
      const prevM = currentMonth === 0 ? 12 : currentMonth;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: dNum, isCurrentMonth: false });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: true });
    }

    // Trailing days to fill 35 or 42 grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let r = 1; r <= remaining; r++) {
      const nextM = currentMonth === 11 ? 1 : currentMonth + 2;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(r).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: r, isCurrentMonth: false });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Filtered commitments
  const relevantCommitments = selectedCommitmentId === 'ALL'
    ? commitments.filter(c => !c.isArchived)
    : commitments.filter(c => c.id === selectedCommitmentId);

  // Day records map: key = `${habitId}_${dateStr}`
  const recordsMap = new Map<string, DailyRecord>();
  records.forEach(r => recordsMap.set(`${r.habitId}_${r.recordDate}`, r));

  // Records for inspected date
  const inspectedDayRecords = records.filter(r => r.recordDate === inspectedDate);

  return (
    <div className="calendar-view-container">
      {/* Calendar Header & Filters */}
      <div className="calendar-header-bar">
        <div className="calendar-month-controls">
          <button className="icon-btn" onClick={handlePrevMonth} aria-label="Previous month">
            <ChevronLeft size={18} />
          </button>
          <h2 className="calendar-month-title">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <button className="icon-btn" onClick={handleNextMonth} aria-label="Next month">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="calendar-filter-controls">
          <label htmlFor="calendar-habit-select" className="filter-label">Filter Commitment:</label>
          <select
            id="calendar-habit-select"
            className="form-select select-compact"
            value={selectedCommitmentId}
            onChange={e => setSelectedCommitmentId(e.target.value)}
          >
            <option value="ALL">All Active Commitments</option>
            {commitments.filter(c => !c.isArchived).map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="calendar-grid-card">
        <div className="calendar-days-header">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="day-header-cell">{d}</div>
          ))}
        </div>

        <div className="calendar-cells-grid">
          {calendarDays.map(cell => {
            const isToday = cell.dateStr === todayStr;
            const isSelected = cell.dateStr === inspectedDate;

            // Calculate markers for this cell
            let completedCount = 0;
            let missedCount = 0;
            let scheduledCount = 0;
            let hasDeadline = false;

            relevantCommitments.forEach(c => {
              if (c.deadlineDate === cell.dateStr) hasDeadline = true;

              if (isHabitScheduledOnDate(c, cell.dateStr)) {
                scheduledCount++;
                const rec = recordsMap.get(`${c.id}_${cell.dateStr}`);
                if (rec) {
                  if (rec.status === 'COMPLETED' || rec.status === 'FROZEN') completedCount++;
                  else if (rec.status === 'MISSED') missedCount++;
                } else if (cell.dateStr < todayStr) {
                  missedCount++;
                }
              }
            });

            return (
              <div
                key={cell.dateStr}
                className={`calendar-cell ${!cell.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}`}
                onClick={() => setInspectedDate(cell.dateStr)}
              >
                <div className="cell-top-row">
                  <span className="cell-day-num">{cell.dayNum}</span>
                  {hasDeadline && <span className="deadline-dot" title="Deadline on this day">⏰</span>}
                  {isToday && <span className="today-chip">TODAY</span>}
                </div>

                <div className="cell-markers-area">
                  {scheduledCount > 0 && (
                    <div className="markers-summary">
                      {completedCount > 0 && (
                        <span className="marker-badge marker-check">
                          ✓ {completedCount}
                        </span>
                      )}
                      {missedCount > 0 && (
                        <span className="marker-badge marker-cross">
                          ✕ {missedCount}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Date Dossier / Immutable Day Inspection (Section 26) */}
      <div className="day-inspector-section mt-4">
        <div className="inspector-header">
          <div className="inspector-date-title">
            <Lock size={16} className="lock-accent" />
            <h3>Permanent Records for {inspectedDate}</h3>
            {inspectedDate < todayStr && (
              <span className="yesterday-locked-pill">🔒 Yesterday is locked</span>
            )}
          </div>
        </div>

        {inspectedDayRecords.length === 0 ? (
          <div className="empty-inspector-box">
            <p>No locked records found for this date.</p>
          </div>
        ) : (
          <div className="inspected-records-grid">
            {inspectedDayRecords.map(rec => {
              const habit = commitments.find(c => c.id === rec.habitId);
              return (
                <div key={rec.id} className="inspected-record-card">
                  <div className="rec-card-top">
                    <span className="rec-habit-name">{habit?.name || 'Commitment'}</span>
                    <span className={`status-pill pill-${rec.status.toLowerCase()}`}>
                      {rec.status === 'COMPLETED' && '✓ Completed'}
                      {rec.status === 'MISSED' && '✕ Missed'}
                      {rec.status === 'FROZEN' && '🧊 Streak Freeze'}
                      {rec.status === 'PARTIAL' && '◑ Partial'}
                    </span>
                  </div>

                  {rec.notes && (
                    <p className="rec-note-text">"{rec.notes}"</p>
                  )}

                  <div className="rec-meta-footer">
                    <div className="rec-mood-energy">
                      {rec.mood && <span>Mood: {rec.mood}</span>}
                      {rec.energyLevel && <span>Energy: {rec.energyLevel}/5</span>}
                    </div>
                    <span className="rec-locked-ts">
                      Locked at {new Date(rec.lockedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
