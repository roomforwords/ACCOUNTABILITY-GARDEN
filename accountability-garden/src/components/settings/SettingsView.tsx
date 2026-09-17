// ==========================================
// SETTINGS & DATA EXPORT VIEW
// Sections 4, 50, 71, 74, 112
// ==========================================

import React, { useState } from 'react';
import {
  AccountabilityMode,
  AuditLogEntry,
  Commitment,
  DailyJournalEntry,
  DailyRecord,
  StreakBreakRecord,
  TodoItem,
  UserProfile,
  WateringEvent
} from '../../types';
import { ExportService } from '../../services/exportService';
import { supabaseStorage } from '../../services/supabaseStorage';
import {
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  Lock,
  LogOut,
  Save,
  Settings as SettingsIcon,
  User
} from 'lucide-react';

interface SettingsViewProps {
  user: UserProfile;
  commitments: Commitment[];
  records: DailyRecord[];
  todos: TodoItem[];
  journals: DailyJournalEntry[];
  wateringEvents?: WateringEvent[];
  streakBreaks?: StreakBreakRecord[];
  auditLogs?: AuditLogEntry[];
  onUpdateUser: (updates: Partial<UserProfile>) => void;
  onLogout?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  commitments,
  records,
  todos,
  journals,
  wateringEvents = [],
  streakBreaks = [],
  auditLogs = [],
  onUpdateUser,
  onLogout
}) => {
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [timezone, setTimezone] = useState(user.timezone);
  const [accountabilityMode, setAccountabilityMode] = useState<AccountabilityMode>(user.accountabilityMode);
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(user.theme);
  const [dailyReminders, setDailyReminders] = useState(user.notificationPreferences.dailyReminders);
  const [morningTime, setMorningTime] = useState(user.notificationPreferences.morningReminderTime);
  const [eveningTime, setEveningTime] = useState(user.notificationPreferences.eveningReminderTime);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name,
      username,
      timezone,
      accountabilityMode,
      theme,
      notificationPreferences: {
        ...user.notificationPreferences,
        dailyReminders,
        morningReminderTime: morningTime,
        eveningReminderTime: eveningTime
      }
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportJSON = () => {
    const archive = supabaseStorage.exportLifeLog(
      user,
      commitments,
      todos,
      records,
      wateringEvents,
      streakBreaks,
      journals,
      auditLogs
    );
    ExportService.downloadJSON(archive);
  };

  const handleExportCSV = () => {
    const archive = supabaseStorage.exportLifeLog(
      user,
      commitments,
      todos,
      records,
      wateringEvents,
      streakBreaks,
      journals,
      auditLogs
    );
    ExportService.downloadRecordsCSV(archive);
  };

  const handleExportMarkdown = () => {
    const archive = supabaseStorage.exportLifeLog(
      user,
      commitments,
      todos,
      records,
      wateringEvents,
      streakBreaks,
      journals,
      auditLogs
    );
    ExportService.downloadMarkdownReport(archive);
  };

  return (
    <div className="settings-view-container">
      {/* Settings Header */}
      <div className="settings-header-card">
        <div className="banner-title-box">
          <SettingsIcon size={24} className="settings-accent" />
          <div>
            <h2 className="banner-heading">Account & System Configuration</h2>
            <p className="banner-subtext">
              “Your intentions are private. Your actions become history.”
            </p>
          </div>
        </div>

        <div className="member-since-badge">
          <User size={14} />
          <span>Member since: {user.memberSince}</span>
        </div>
      </div>

      {savedSuccess && (
        <div className="save-success-alert mt-3">
          ✓ Profile settings updated and audit-logged successfully.
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="settings-form mt-4">
        {/* Profile Card */}
        <div className="settings-card">
          <h3 className="card-section-title">User Profile</h3>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Full Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group flex-1">
              <label>Username</label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Timezone (Crucial for Midnight Day Boundaries)</label>
              <select
                className="form-select"
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+05:30)</option>
                <option value="America/New_York">America/New_York (EDT - UTC-04:00)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PDT - UTC-07:00)</option>
                <option value="Europe/London">Europe/London (BST - UTC+01:00)</option>
                <option value="UTC">UTC (Universal Coordinated Time)</option>
              </select>
            </div>

            <div className="form-group flex-1">
              <label>Interface Theme</label>
              <select
                className="form-select"
                value={theme}
                onChange={e => setTheme(e.target.value as any)}
              >
                <option value="dark">Sleek Obsidian Dark (Default)</option>
                <option value="light">Crisp Light</option>
                <option value="system">System Preference</option>
              </select>
            </div>
          </div>
        </div>

        {/* Accountability Mode (Section 50) */}
        <div className="settings-card mt-4">
          <h3 className="card-section-title">Accountability Operating Mode</h3>
          <p className="card-section-sub">
            Controls the tone and philosophical candor of context-aware system responses.
          </p>

          <div className="mode-options-grid">
            {[
              {
                mode: 'Gentle',
                title: 'Gentle',
                desc: 'Supportive, encouraging reminders. Soft focus on continuation.'
              },
              {
                mode: 'Direct',
                title: 'Direct (Recommended)',
                desc: 'Straightforward, factual feedback without sugarcoating or emotional spin.'
              },
              {
                mode: 'Tough Love',
                title: 'Tough Love',
                desc: 'Uncompromising, blunt confrontation of avoidance patterns. Zero excuses.'
              },
              {
                mode: 'Silent',
                title: 'Silent',
                desc: 'Numerical metrics only. No philosophical messages or quotes.'
              }
            ].map(item => (
              <div
                key={item.mode}
                className={`mode-option-card ${accountabilityMode === item.mode ? 'active' : ''}`}
                onClick={() => setAccountabilityMode(item.mode as AccountabilityMode)}
              >
                <div className="mode-radio-dot" />
                <div>
                  <h4 className="mode-opt-title">{item.title}</h4>
                  <p className="mode-opt-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-card mt-4">
          <h3 className="card-section-title">Smart Reminder Times</h3>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={dailyReminders}
                onChange={e => setDailyReminders(e.target.checked)}
              />
              <span>Enable Scheduled Daily Reminders</span>
            </label>
          </div>

          {dailyReminders && (
            <div className="form-row mt-2">
              <div className="form-group flex-1">
                <label>Morning Alignment Reminder</label>
                <input
                  type="time"
                  className="form-input"
                  value={morningTime}
                  onChange={e => setMorningTime(e.target.value)}
                />
              </div>

              <div className="form-group flex-1">
                <label>Evening Accountability Check-in</label>
                <input
                  type="time"
                  className="form-input"
                  value={eveningTime}
                  onChange={e => setEveningTime(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary mt-4">
          <Save size={16} /> Save Configuration
        </button>
      </form>

      {/* EXPORT MY LIFE LOG (Sections 71, 112) */}
      <div className="settings-card mt-5 export-card">
        <div className="export-title-row">
          <div>
            <h3 className="card-section-title">Export My Life Log</h3>
            <p className="card-section-sub">
              Download your complete immutable history, audit logs, streaks, and journal entries.
            </p>
          </div>
          <Lock size={20} className="lock-accent" />
        </div>

        <div className="export-buttons-row mt-3">
          <button type="button" className="btn btn-outline" onClick={handleExportJSON}>
            <Download size={16} /> Export JSON Archive
          </button>
          <button type="button" className="btn btn-outline" onClick={handleExportCSV}>
            <FileSpreadsheet size={16} /> Export Records (CSV)
          </button>
          <button type="button" className="btn btn-outline" onClick={handleExportMarkdown}>
            <FileText size={16} /> Export Life Log (Markdown)
          </button>
        </div>
      </div>

      {/* Supabase Cloud Connection & Session */}
      <div className="settings-card mt-4">
        <div className="export-title-row">
          <div>
            <h3 className="card-section-title">Cloud Database & Account</h3>
            <p className="card-section-sub">
              Your Accountability Garden is backed by Supabase PostgreSQL with Row Level Security.
            </p>
          </div>
          <Database size={20} className="text-emerald-400" />
        </div>

        <div className="session-info-box mt-3">
          <div className="session-item">
            <span className="session-device">Authenticated Account: {user.email || 'Cloud User'}</span>
            <span className="session-ip">Database ID: {user.id}</span>
            <span className="session-time">RLS Protected</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-subtle">
          <span className="text-xs text-secondary">
            Session credentials are valid across multiple devices and browsers.
          </span>
          {onLogout && (
            <button
              type="button"
              className="btn btn-outline flex items-center gap-2"
              onClick={onLogout}
            >
              <LogOut size={15} /> Sign Out of Account
            </button>
          )}
        </div>
      </div>

      {/* Cloud Immutability Notice */}
      <div className="settings-card mt-4 danger-card">
        <h3 className="card-section-title text-red">Cloud Ledger Immutability</h3>
        <p className="card-section-sub">
          All past records, streak breaks, and journals are written to an append-only PostgreSQL ledger. In adherence to the central philosophy <em>“You cannot edit yesterday”</em>, past records cannot be retroactively modified or wiped through the client.
        </p>
      </div>
    </div>
  );
};
