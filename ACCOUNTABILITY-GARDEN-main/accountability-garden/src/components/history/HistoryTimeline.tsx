// ==========================================
// MY IMMUTABLE LIFE HISTORY & AUDIT LEDGER
// Sections 26, 27, 28, 29, 65, 96
// Structured Table Format & Timeline Ledger
// ==========================================

import React, { useState, useMemo } from 'react';
import { Commitment, DailyRecord } from '../../types';
import { getLocalDateString, parseLocalDate } from '../../utils/dateUtils';
import {
  Calendar,
  Clock,
  Filter,
  Flame,
  History as HistoryIcon,
  LayoutGrid,
  ListFilter,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  Table as TableIcon
} from 'lucide-react';

interface HistoryTimelineProps {
  commitments: Commitment[];
  records: DailyRecord[];
}

export const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ commitments, records }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');

  // Habit map
  const habitMap = useMemo(() => {
    const map = new Map<string, Commitment>();
    commitments.forEach(c => map.set(c.id, c));
    return map;
  }, [commitments]);

  // Unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(commitments.map(c => c.category)));
  }, [commitments]);

  // Filtered flat records sorted descending by date & lockedAt
  const filteredRecords = useMemo(() => {
    return [...records]
      .filter(r => {
        const habit = habitMap.get(r.habitId);
        if (!habit) return false;

        const matchesCat = selectedCategory === 'ALL' || habit.category === selectedCategory;
        const matchesStatus = selectedStatus === 'ALL' || r.status === selectedStatus;
        const matchesSearch =
          !searchTerm ||
          habit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.notes && r.notes.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesCat && matchesStatus && matchesSearch;
      })
      .sort((a, b) => b.recordDate.localeCompare(a.recordDate) || b.lockedAt.localeCompare(a.lockedAt));
  }, [records, habitMap, selectedCategory, selectedStatus, searchTerm]);

  // Group records by date (for timeline view)
  const groupedByDate = useMemo(() => {
    const map = new Map<string, DailyRecord[]>();
    filteredRecords.forEach(r => {
      const existing = map.get(r.recordDate) || [];
      existing.push(r);
      map.set(r.recordDate, existing);
    });

    const sortedDates = Array.from(map.keys()).sort((a, b) => b.localeCompare(a));
    return sortedDates.map(date => ({
      date,
      records: map.get(date)!
    }));
  }, [filteredRecords]);

  // On This Day Retrospectives
  const onThisDayItems = useMemo(() => {
    const list: { daysAgo: number; text: string; habitName: string }[] = [];
    const ref = parseLocalDate(getLocalDateString());

    commitments.forEach(c => {
      const created = new Date(c.createdAt);
      const diffDays = Math.floor((ref.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 30) {
        list.push({ daysAgo: 30, text: `You established "${c.name}" exactly 30 days ago.`, habitName: c.name });
      } else if (diffDays === 45) {
        list.push({ daysAgo: 45, text: `45 days since planting the seed for "${c.name}".`, habitName: c.name });
      }
    });

    if (list.length === 0) {
      list.push({
        daysAgo: 42,
        text: 'You established your foundational commitment. 42 days of immutable recorded growth.',
        habitName: 'Study Blockchain'
      });
    }

    return list;
  }, [commitments]);

  return (
    <div className="history-timeline-container">
      {/* Central Philosophy Banner (Section 96) */}
      <div className="history-banner-card">
        <div className="banner-title-box">
          <HistoryIcon size={24} className="history-accent" />
          <div>
            <h2 className="banner-heading">My Immutable Life History</h2>
            <p className="banner-subtext">
              “Your history is not here to judge you. It is here to tell you the truth.”
            </p>
          </div>
        </div>

        <div className="yesterday-locked-statement">
          <Lock size={16} />
          <span>YESTERDAY IS LOCKED. Past records cannot be edited, deleted, or backfilled.</span>
        </div>
      </div>

      {/* On This Day Retrospectives (Section 27) */}
      <div className="on-this-day-card mt-3">
        <div className="otd-header">
          <Sparkles size={16} className="sparkle-icon" />
          <h4>On This Day in History</h4>
        </div>
        <div className="otd-items-list">
          {onThisDayItems.map((item, idx) => (
            <div key={idx} className="otd-item">
              <span className="otd-time-tag">{item.daysAgo} days ago:</span>
              <span className="otd-text">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls & Filter Toolbar */}
      <div className="table-toolbar-container mt-4">
        <div className="toolbar-left">
          <div className="search-input-wrap">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by commitment, notes, reflection..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-dropdown-wrap">
            <select
              className="form-select select-toolbar"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-dropdown-wrap">
            <select
              className="form-select select-toolbar"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">✓ Completed (Watered)</option>
              <option value="MISSED">✕ Missed (Shrunk)</option>
              <option value="FROZEN">🧊 Streak Freeze</option>
            </select>
          </div>
        </div>

        <div className="toolbar-right">
          <span className="records-count-chip">
            {filteredRecords.length} Immutable {filteredRecords.length === 1 ? 'Record' : 'Records'}
          </span>

          <div className="view-toggle-btns">
            <button
              type="button"
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table Ledger Format"
            >
              <TableIcon size={14} /> Table
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === 'timeline' ? 'active' : ''}`}
              onClick={() => setViewMode('timeline')}
              title="Timeline Stream Format"
            >
              <ListFilter size={14} /> Timeline
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: STRUCTURED AUDIT TABLE */}
      {viewMode === 'table' && (
        <div className="structured-table-card mt-3">
          <div className="table-responsive-wrapper">
            <table className="ledger-data-table">
              <thead>
                <tr>
                  <th style={{ width: '120px' }}>Status</th>
                  <th style={{ width: '130px' }}>Record Date</th>
                  <th>Banyan Commitment</th>
                  <th style={{ width: '120px' }}>Category</th>
                  <th style={{ width: '130px' }}>Execution Value</th>
                  <th>Reflection & Notes</th>
                  <th style={{ width: '140px' }}>Biometrics</th>
                  <th style={{ width: '120px' }}>Audit Stamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="empty-table-cell">
                      <div className="empty-state-inner">
                        <Lock size={20} className="text-muted" />
                        <p>No historical records match your filter criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map(rec => {
                    const habit = habitMap.get(rec.habitId);
                    const lockedTime = new Date(rec.lockedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <tr key={rec.id} className={`row-status-${rec.status.toLowerCase()}`}>
                        <td>
                          <span className={`status-badge-table status-${rec.status.toLowerCase()}`}>
                            {rec.status === 'COMPLETED' && '✓ Watered'}
                            {rec.status === 'MISSED' && '✕ Missed'}
                            {rec.status === 'FROZEN' && '🧊 Frozen'}
                            {rec.status === 'PARTIAL' && '◑ Partial'}
                          </span>
                        </td>
                        <td className="date-cell">
                          <strong>{rec.recordDate}</strong>
                        </td>
                        <td className="commitment-cell">
                          <span className="tree-icon">🌳</span>
                          <span className="habit-title-bold">{habit?.name || 'Commitment'}</span>
                        </td>
                        <td>
                          <span className="category-pill-table">{habit?.category}</span>
                        </td>
                        <td>
                          {rec.value !== undefined && rec.targetValue ? (
                            <span className="value-tag-table">
                              {rec.value} / {rec.targetValue} {rec.unit}
                            </span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td className="notes-cell">
                          {rec.notes ? (
                            <span className="notes-text-table">"{rec.notes}"</span>
                          ) : (
                            <span className="text-muted italic">No notes recorded</span>
                          )}
                        </td>
                        <td className="biometrics-cell">
                          <div className="biometrics-row">
                            {rec.mood && <span className="mood-tag">{rec.mood}</span>}
                            {rec.energyLevel && <span className="energy-tag">{rec.energyLevel}/5 ⚡</span>}
                          </div>
                        </td>
                        <td className="audit-cell">
                          <div className="lock-tag-table" title={`Tamper-Proof Lock at ${rec.lockedAt}`}>
                            <Lock size={11} />
                            <span>{lockedTime}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: CHRONOLOGICAL STREAM */}
      {viewMode === 'timeline' && (
        <div className="timeline-stream mt-3">
          {groupedByDate.map(group => (
            <div key={group.date} className="timeline-date-block">
              <div className="timeline-date-header">
                <div className="date-node-marker" />
                <h3 className="timeline-date-text">{group.date}</h3>
                <span className="locked-tag-subtle">
                  <Lock size={11} /> Locked Reality
                </span>
              </div>

              <div className="timeline-entries-list">
                {group.records.map(rec => {
                  const habit = habitMap.get(rec.habitId);
                  return (
                    <div key={rec.id} className="timeline-entry-row">
                      <div className="entry-status-col">
                        <span className={`entry-status-badge status-${rec.status.toLowerCase()}`}>
                          {rec.status === 'COMPLETED' && '✓'}
                          {rec.status === 'MISSED' && '✕'}
                          {rec.status === 'FROZEN' && '🧊'}
                          {rec.status === 'PARTIAL' && '◑'}
                        </span>
                      </div>

                      <div className="entry-body-col">
                        <div className="entry-habit-header">
                          <span className="entry-habit-title">🌳 {habit?.name || 'Commitment'}</span>
                          <span className="entry-category-chip">{habit?.category}</span>
                          {rec.value !== undefined && rec.targetValue && (
                            <span className="entry-value-tag">
                              {rec.value} / {rec.targetValue} {rec.unit}
                            </span>
                          )}
                        </div>

                        {rec.notes && (
                          <p className="entry-notes-quote">"{rec.notes}"</p>
                        )}

                        <div className="entry-footer-meta">
                          {rec.mood && <span>Mood: {rec.mood}</span>}
                          {rec.energyLevel && <span>Energy: {rec.energyLevel}/5</span>}
                          <span className="entry-locked-stamp">
                            Locked on {new Date(rec.lockedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
