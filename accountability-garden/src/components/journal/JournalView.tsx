// ==========================================
// PERSONAL ACCOUNTABILITY JOURNAL & ARCHIVE LEDGER
// Sections 61 - 64
// Structured Matrix Form & Past Reflections Table
// ==========================================

import React, { useState } from 'react';
import { DailyJournalEntry, Difficulty, Mood, UserProfile } from '../../types';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Heart,
  Lock,
  ShieldAlert,
  Sparkles,
  Table as TableIcon
} from 'lucide-react';

interface JournalViewProps {
  user: UserProfile;
  journals: DailyJournalEntry[];
  onSaveJournal: (entry: Omit<DailyJournalEntry, 'id' | 'isLocked' | 'lockedAt'>) => void;
}

export const JournalView: React.FC<JournalViewProps> = ({ user, journals, onSaveJournal }) => {
  const todayStr = '2026-09-17';
  const existingTodayJournal = journals.find(j => j.date === todayStr);

  const [entryText, setEntryText] = useState('');
  const [gratitude1, setGratitude1] = useState('');
  const [gratitude2, setGratitude2] = useState('');
  const [gratitude3, setGratitude3] = useState('');
  const [win1, setWin1] = useState('');
  const [win2, setWin2] = useState('');
  const [failureLog, setFailureLog] = useState('');
  const [highlight, setHighlight] = useState('');
  const [mood, setMood] = useState<Mood>('Good');
  const [energyLevel, setEnergyLevel] = useState<number>(4);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (existingTodayJournal?.isLocked) return;

    onSaveJournal({
      userId: user.id,
      date: todayStr,
      entryText: entryText.trim() || 'Daily reflection recorded.',
      gratitude: [gratitude1.trim(), gratitude2.trim(), gratitude3.trim()].filter(Boolean),
      dailyWins: [win1.trim(), win2.trim()].filter(Boolean),
      failureLog: failureLog.trim(),
      highlight: highlight.trim(),
      mood,
      energyLevel
    });
  };

  return (
    <div className="journal-view-container">
      {/* Journal Header Banner */}
      <div className="journal-header-card">
        <div className="banner-title-box">
          <BookOpen size={24} className="book-accent" />
          <div>
            <h2 className="banner-heading">Personal Accountability Journal</h2>
            <p className="banner-subtext">
              “Your intentions are private. Your actions become history.”
            </p>
          </div>
        </div>

        <div className="journal-permanence-tag">
          <Lock size={14} />
          <span>Journal submissions are locked into immutable history.</span>
        </div>
      </div>

      {/* SECTION 1: TODAY'S JOURNAL COCKPIT */}
      <div className="structured-section-card mt-4">
        <div className="section-card-header">
          <div className="header-title-group">
            <Sparkles size={18} className="text-green" />
            <h3 className="section-title">Today's Reflection Cockpit — {todayStr}</h3>
          </div>
          {existingTodayJournal?.isLocked ? (
            <span className="locked-pill"><Lock size={12} /> Entry Locked on {new Date(existingTodayJournal.lockedAt).toLocaleTimeString()}</span>
          ) : (
            <span className="badge-subtle">Editable until locked</span>
          )}
        </div>

        {existingTodayJournal?.isLocked ? (
          /* Locked State Render */
          <div className="locked-journal-view p-3">
            <div className="locked-journal-notice">
              <Lock size={16} />
              <span>This reflection has been permanently committed to your immutable archive.</span>
            </div>

            <div className="locked-journal-grid mt-3">
              <div className="locked-card-col">
                <label className="journal-section-label">General Reflection</label>
                <p className="journal-text-quote">"{existingTodayJournal.entryText}"</p>

                {existingTodayJournal.highlight && (
                  <div className="highlight-pill-box mt-3">
                    <span className="pill-title">Daily Highlight:</span>
                    <span className="pill-content">🌟 {existingTodayJournal.highlight}</span>
                  </div>
                )}
              </div>

              <div className="locked-card-col">
                <label className="journal-section-label">Three Things Grateful For</label>
                <ul className="journal-bullet-list">
                  {existingTodayJournal.gratitude.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>

                <label className="journal-section-label mt-3">Daily Behavioral Wins</label>
                <ul className="journal-bullet-list wins-list">
                  {existingTodayJournal.dailyWins.map((w, i) => (
                    <li key={i}>✓ {w}</li>
                  ))}
                </ul>

                {existingTodayJournal.failureLog && (
                  <div className="failure-log-box mt-3">
                    <label className="journal-section-label text-orange">Friction Analysis</label>
                    <p className="failure-quote">"{existingTodayJournal.failureLog}"</p>
                  </div>
                )}
              </div>
            </div>

            <div className="journal-footer-meta mt-3">
              <span>Mood: <strong>{existingTodayJournal.mood}</strong></span>
              <span>Energy: <strong>{existingTodayJournal.energyLevel}/5</strong></span>
              <span className="lock-stamp">🔒 Locked at {new Date(existingTodayJournal.lockedAt).toLocaleTimeString()}</span>
            </div>
          </div>
        ) : (
          /* Active Form Render with Tabular Formats */
          <form onSubmit={handleSave} className="journal-entry-form p-3">
            {/* Top Row: Reflection Textarea */}
            <div className="form-group mb-3">
              <label className="journal-form-label">
                <strong>1. Today's General Reflection</strong> (What occurred? What did you prioritize? Where was resistance?)
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Describe what occurred today. What did you prioritize? Where did resistance manifest?"
                value={entryText}
                onChange={e => setEntryText(e.target.value)}
                required
              />
            </div>

            {/* Gratitude Matrix Table */}
            <div className="journal-matrix-box mb-3">
              <label className="journal-form-label">
                <strong>2. Three Things I'm Grateful For</strong> (Section 62: Grounded Truths)
              </label>
              <div className="table-responsive-wrapper mt-1">
                <table className="accountability-table matrix-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>#</th>
                      <th style={{ width: '220px' }}>Focus Vector</th>
                      <th>Your Observed Reality</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className="code-badge">Truth 1</span></td>
                      <td className="text-muted">Mental clarity, health, or focus</td>
                      <td>
                        <input
                          type="text"
                          className="form-input table-input"
                          placeholder="e.g. Sharp morning mental clarity before dawn..."
                          value={gratitude1}
                          onChange={e => setGratitude1(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td><span className="code-badge">Truth 2</span></td>
                      <td className="text-muted">Opportunity, environment, or person</td>
                      <td>
                        <input
                          type="text"
                          className="form-input table-input"
                          placeholder="e.g. Dedicated uninterrupted quiet workspace..."
                          value={gratitude2}
                          onChange={e => setGratitude2(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td><span className="code-badge">Truth 3</span></td>
                      <td className="text-muted">Challenge that sharpened resolve</td>
                      <td>
                        <input
                          type="text"
                          className="form-input table-input"
                          placeholder="e.g. Navigated severe complexity without giving in..."
                          value={gratitude3}
                          onChange={e => setGratitude3(e.target.value)}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Behavioral Wins & Friction Matrix Table */}
            <div className="journal-matrix-box mb-3">
              <label className="journal-form-label">
                <strong>3. Behavioral Wins & Friction Analysis Matrix</strong> (Sections 63, 64)
              </label>
              <div className="table-responsive-wrapper mt-1">
                <table className="accountability-table matrix-table">
                  <thead>
                    <tr>
                      <th style={{ width: '130px' }}>Category</th>
                      <th style={{ width: '200px' }}>Behavioral Metric</th>
                      <th>Empirical Log</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className="status-badge-table status-completed">✓ Win 1</span></td>
                      <td className="text-muted">Direct Execution</td>
                      <td>
                        <input
                          type="text"
                          className="form-input table-input"
                          placeholder="e.g. Executed difficult deep work block without checking phone"
                          value={win1}
                          onChange={e => setWin1(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td><span className="status-badge-table status-completed">✓ Win 2</span></td>
                      <td className="text-muted">Distraction Resistance</td>
                      <td>
                        <input
                          type="text"
                          className="form-input table-input"
                          placeholder="e.g. Maintained discipline during evening fatigue"
                          value={win2}
                          onChange={e => setWin2(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td><span className="status-badge-table status-missed">⚡ Friction</span></td>
                      <td className="text-muted">Factual Log (Not Identity)</td>
                      <td>
                        <input
                          type="text"
                          className="form-input table-input"
                          placeholder="What didn't happen today? (Analyzed as external friction, not self-shame)"
                          value={failureLog}
                          onChange={e => setFailureLog(e.target.value)}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Row: Highlight, Mood & Energy */}
            <div className="form-row-grid mb-3">
              <div className="form-group flex-2">
                <label className="journal-form-label"><strong>4. Daily Highlight</strong></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="One clear moment of significance or alignment..."
                  value={highlight}
                  onChange={e => setHighlight(e.target.value)}
                />
              </div>

              <div className="form-group flex-1">
                <label className="journal-form-label"><strong>Mood</strong></label>
                <select
                  className="form-select"
                  value={mood}
                  onChange={e => setMood(e.target.value as Mood)}
                >
                  <option value="Great">😄 Great</option>
                  <option value="Good">🙂 Good</option>
                  <option value="Neutral">😐 Neutral</option>
                  <option value="Low">😔 Low</option>
                  <option value="Difficult">😣 Difficult</option>
                </select>
              </div>

              <div className="form-group flex-1">
                <label className="journal-form-label"><strong>Energy (1-5)</strong></label>
                <input
                  type="number"
                  className="form-input"
                  min={1}
                  max={5}
                  value={energyLevel}
                  onChange={e => setEnergyLevel(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Permanent Lock Action Ribbon */}
            <div className="submit-ribbon-bar">
              <div className="permanence-warning-inline">
                <Lock size={15} />
                <span>Submitting locks this entry permanently. You cannot edit yesterday.</span>
              </div>

              <button type="submit" className="btn btn-primary btn-lock-journal">
                <Lock size={16} /> Submit & Permanently Lock Journal
              </button>
            </div>
          </form>
        )}
      </div>

      {/* SECTION 2: PAST LOCKED REFLECTIONS ARCHIVE TABLE */}
      <div className="structured-section-card mt-5">
        <div className="section-card-header">
          <div className="header-title-group">
            <TableIcon size={18} className="text-purple" />
            <h3 className="section-title">Past Locked Reflections (Archive Ledger Table)</h3>
          </div>
          <span className="badge-subtle">{journals.length} Permanent {journals.length === 1 ? 'Entry' : 'Entries'}</span>
        </div>

        <div className="table-responsive-wrapper mt-2">
          <table className="accountability-table journal-archive-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Entry Date</th>
                <th style={{ width: '140px' }}>State (Mood/Energy)</th>
                <th>General Reflection</th>
                <th>Daily Highlight</th>
                <th style={{ width: '180px' }}>Wins Logged</th>
                <th style={{ width: '120px' }}>Audit Stamp</th>
              </tr>
            </thead>
            <tbody>
              {journals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-table-cell">
                    <p>No historical journal entries recorded yet. Submissions for today will be permanently archived here.</p>
                  </td>
                </tr>
              ) : (
                journals.map(j => (
                  <tr key={j.id}>
                    <td className="date-cell">
                      <strong>{j.date}</strong>
                    </td>
                    <td>
                      <span className="mood-pill-cell">{j.mood}</span>
                      <span className="energy-pill-cell">⚡ {j.energyLevel}/5</span>
                    </td>
                    <td className="reflection-cell">
                      <p className="reflection-preview-text">"{j.entryText}"</p>
                    </td>
                    <td>
                      {j.highlight ? (
                        <span className="highlight-cell-text">🌟 {j.highlight}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <span className="wins-count-tag">✓ {j.dailyWins?.length || 0} Wins</span>
                      {j.failureLog && <span className="friction-tag">⚡ Friction</span>}
                    </td>
                    <td>
                      <div className="lock-tag-table">
                        <Lock size={10} /> Locked
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
