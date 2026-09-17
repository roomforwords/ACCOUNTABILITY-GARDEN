// ==========================================
// ACCOUNTABILITY GARDEN - ROOT APPLICATION
// Tagline: "You cannot edit yesterday."
// Cloud Architecture: Supabase PostgreSQL + Auth + RLS
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  AuditLogEntry,
  Commitment,
  DailyJournalEntry,
  DailyRecord,
  StreakBreakRecord,
  TodoItem,
  UserProfile,
  WateringEvent
} from './types';
import { INITIAL_USER } from './constants/initialData';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { supabaseStorage } from './services/supabaseStorage';

// Authentication & Setup Components
import { AuthModal } from './components/auth/AuthModal';
import { SupabaseConfigGuide } from './components/auth/SupabaseConfigGuide';

// Layout Components
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { GardenView } from './components/garden/GardenView';
import { TodayView } from './components/today/TodayView';
import { CalendarView } from './components/calendar/CalendarView';
import { StreaksView } from './components/streaks/StreaksView';
import { DeadlinesView } from './components/deadlines/DeadlinesView';
import { HistoryTimeline } from './components/history/HistoryTimeline';
import { JournalView } from './components/journal/JournalView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AchievementsView } from './components/achievements/AchievementsView';
import { SettingsView } from './components/settings/SettingsView';

// Modals
import { CreateCommitmentModal } from './components/commitments/CreateCommitmentModal';
import { FocusModeModal } from './components/focus/FocusModeModal';
import { PlantDossierModal } from './components/garden/PlantDossierModal';
import { Trees } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation State
  const [activeView, setActiveView] = useState<string>('garden');

  // Supabase Auth & Session State
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(isSupabaseConfigured);
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [configured, setConfigured] = useState<boolean>(isSupabaseConfigured);

  // Application Data States (Pure Cloud Source of Truth)
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [journals, setJournals] = useState<DailyJournalEntry[]>([]);
  const [wateringEvents, setWateringEvents] = useState<WateringEvent[]>([]);
  const [streakBreaks, setStreakBreaks] = useState<StreakBreakRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Active Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [focusCommitment, setFocusCommitment] = useState<Commitment | null>(null);
  const [dossierCommitment, setDossierCommitment] = useState<Commitment | null>(null);

  // Synchronize and load data from Supabase PostgreSQL
  const loadCloudData = useCallback(async (userId: string, email?: string) => {
    setDataLoading(true);
    try {
      const [
        userProfile,
        userCommitments,
        userRecords,
        userTodos,
        userJournals,
        userWatering,
        userBreaks,
        userAudit
      ] = await Promise.all([
        supabaseStorage.getUserProfile(userId).catch(() => supabaseStorage.initUserProfile(userId, email)),
        supabaseStorage.getCommitments(userId, true),
        supabaseStorage.getDailyRecords(userId),
        supabaseStorage.getTodos(userId),
        supabaseStorage.getJournals(userId),
        supabaseStorage.getWateringEvents(userId),
        supabaseStorage.getStreakBreaks(userId),
        supabaseStorage.getAuditLogs(userId)
      ]);

      setUser(userProfile);
      setCommitments(userCommitments);
      setRecords(userRecords);
      setTodos(userTodos);
      setJournals(userJournals);
      setWateringEvents(userWatering);
      setStreakBreaks(userBreaks);
      setAuditLogs(userAudit);
    } catch (err: any) {
      console.error('Failed to load cloud database data:', err);
      alert('Cloud sync notice: ' + (err.message || 'Error fetching data from Supabase'));
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Reload current user data
  const reloadData = useCallback(async () => {
    if (session?.user?.id) {
      await loadCloudData(session.user.id, session.user.email);
    }
  }, [session, loadCloudData]);

  // Check Supabase session on initialization
  useEffect(() => {
    if (!configured) {
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (session?.user) {
        loadCloudData(session.user.id, session.user.email);
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setAuthLoading(false);
      if (newSession?.user) {
        loadCloudData(newSession.user.id, newSession.user.email);
      } else {
        setUser(INITIAL_USER);
        setCommitments([]);
        setRecords([]);
        setTodos([]);
        setJournals([]);
        setWateringEvents([]);
        setStreakBreaks([]);
        setAuditLogs([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [configured, loadCloudData]);

  // Handlers for Immutable Actions
  const handleRecordHabit = async (
    habitId: string,
    status: 'COMPLETED' | 'MISSED' | 'PARTIAL' | 'FROZEN',
    value?: number,
    unit?: string,
    reflectionData?: any
  ) => {
    if (!session?.user?.id) return;
    const todayStr = '2026-09-17';
    try {
      await supabaseStorage.lockDailyRecord({
        userId: session.user.id,
        habitId,
        recordDate: todayStr,
        status,
        value,
        unit,
        notes: reflectionData?.notes,
        mood: reflectionData?.mood,
        energyLevel: reflectionData?.energyLevel,
        difficulty: reflectionData?.difficulty,
        reflection: reflectionData?.reflection
      });
      await reloadData();
    } catch (err: any) {
      alert(err.message || 'Failed to lock daily record in PostgreSQL.');
    }
  };

  const handleUseFreeze = async (habitId: string) => {
    if (!session?.user?.id) return;
    const todayStr = '2026-09-17';
    try {
      await supabaseStorage.useStreakFreeze(session.user.id, habitId, todayStr);
      await reloadData();
    } catch (err: any) {
      alert(err.message || 'Could not activate streak freeze.');
    }
  };

  const handleCompleteTodo = async (todoId: string) => {
    if (!session?.user?.id) return;
    try {
      await supabaseStorage.completeTodo(session.user.id, todoId);
      await reloadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateCommitment = async (
    commitmentData: Omit<Commitment, 'id' | 'createdAt' | 'isArchived' | 'plantType'>
  ) => {
    if (!session?.user?.id) return;
    try {
      await supabaseStorage.createCommitment(session.user.id, commitmentData);
      await reloadData();
    } catch (err: any) {
      alert(err.message || 'Failed to plant Banyan Tree.');
    }
  };

  const handleArchiveCommitment = async (id: string) => {
    if (!session?.user?.id) return;
    try {
      await supabaseStorage.archiveCommitment(session.user.id, id);
      await reloadData();
    } catch (err: any) {
      alert(err.message || 'Failed to archive commitment.');
    }
  };

  const handleSaveJournal = async (
    entryData: Omit<DailyJournalEntry, 'id' | 'isLocked' | 'lockedAt'>
  ) => {
    if (!session?.user?.id) return;
    try {
      await supabaseStorage.saveJournalEntry(session.user.id, entryData);
      await reloadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save daily journal.');
    }
  };

  const handleUpdateUser = async (updates: Partial<UserProfile>) => {
    if (!session?.user?.id) return;
    try {
      const updated = await supabaseStorage.updateUserProfile(session.user.id, updates);
      setUser(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to update user profile in PostgreSQL.');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out:', err);
    }
    setSession(null);
  };

  // 1. If Supabase keys are completely missing from .env
  if (!configured) {
    return (
      <SupabaseConfigGuide
        onCredentialsProvided={(url, key) => {
          // Allow setting local session connection for testing
          (window as any)._SUPABASE_URL = url;
          (window as any)._SUPABASE_KEY = key;
          setConfigured(true);
        }}
      />
    );
  }

  // 2. Loading session state
  if (authLoading || dataLoading) {
    return (
      <div className="app-loading-screen">
        <div className="loading-banyan-pulse">
          <Trees size={36} className="text-emerald-400" />
        </div>
        <div className="loading-text">Connecting to PostgreSQL Cloud Ledger...</div>
      </div>
    );
  }

  // 3. If unauthenticated, show Auth Modal
  if (!session) {
    return <AuthModal onAuthSuccess={() => {}} />;
  }

  // 4. Authenticated & Loaded: Render Full Accountability Garden
  return (
    <div className={`app-root theme-${user.theme || 'dark'}`}>
      {/* Desktop Sidebar Navigation */}
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      {/* Main Content Area */}
      <div className="app-main-viewport">
        {/* Top Header with Cloud Status and Sign Out */}
        <Header
          user={user}
          activeView={activeView}
          onCreateCommitmentClick={() => setIsCreateModalOpen(true)}
          onOpenSettings={() => setActiveView('settings')}
          onLogout={handleLogout}
        />

        {/* Dynamic Viewport Content */}
        <main className="app-content-container">
          {activeView === 'garden' && (
            <GardenView
              commitments={commitments}
              records={records}
              onArchiveCommitment={handleArchiveCommitment}
              onCreateCommitmentClick={() => setIsCreateModalOpen(true)}
            />
          )}

          {activeView === 'dashboard' && (
            <DashboardView
              user={user}
              commitments={commitments}
              records={records}
              todos={todos}
              onNavigate={setActiveView}
              onSelectCommitment={c => setDossierCommitment(c)}
              onCreateCommitmentClick={() => setIsCreateModalOpen(true)}
            />
          )}

          {activeView === 'today' && (
            <TodayView
              user={user}
              commitments={commitments}
              records={records}
              todos={todos}
              onRecordHabit={handleRecordHabit}
              onUseFreeze={handleUseFreeze}
              onCompleteTodo={handleCompleteTodo}
              onCreateCommitmentClick={() => setIsCreateModalOpen(true)}
              onOpenFocusMode={c => setFocusCommitment(c)}
            />
          )}

          {activeView === 'calendar' && (
            <CalendarView commitments={commitments} records={records} />
          )}

          {activeView === 'streaks' && (
            <StreaksView user={user} commitments={commitments} records={records} />
          )}

          {activeView === 'deadlines' && (
            <DeadlinesView commitments={commitments} todos={todos} />
          )}

          {activeView === 'history' && (
            <HistoryTimeline commitments={commitments} records={records} />
          )}

          {activeView === 'journal' && (
            <JournalView
              user={user}
              journals={journals}
              onSaveJournal={handleSaveJournal}
            />
          )}

          {activeView === 'analytics' && (
            <AnalyticsView
              user={user}
              commitments={commitments}
              records={records}
              todos={todos}
              journals={journals}
            />
          )}

          {activeView === 'achievements' && (
            <AchievementsView commitments={commitments} records={records} />
          )}

          {activeView === 'settings' && (
            <SettingsView
              user={user}
              commitments={commitments}
              records={records}
              todos={todos}
              journals={journals}
              wateringEvents={wateringEvents}
              streakBreaks={streakBreaks}
              auditLogs={auditLogs}
              onUpdateUser={handleUpdateUser}
              onLogout={handleLogout}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeView={activeView} onNavigate={setActiveView} />

      {/* Global Modals */}
      {isCreateModalOpen && (
        <CreateCommitmentModal
          userId={user.id}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateCommitment}
        />
      )}

      {focusCommitment && (
        <FocusModeModal
          commitment={focusCommitment}
          onClose={() => setFocusCommitment(null)}
          onSessionComplete={minutes => {
            alert(`Focus session complete: logged ${minutes} minutes of deep execution.`);
          }}
        />
      )}

      {dossierCommitment && (
        <PlantDossierModal
          commitment={dossierCommitment}
          records={records}
          onClose={() => setDossierCommitment(null)}
          onArchive={handleArchiveCommitment}
        />
      )}
    </div>
  );
};

export default App;
