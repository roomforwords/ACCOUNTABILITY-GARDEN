// ==============================================================================
// SUPABASE POSTGRESQL DATA SERVICE
// Permanent Cloud Source of Truth with Row Level Security & Immutability
// ==============================================================================

import { supabase } from './supabaseClient';
import {
  AuditLogEntry,
  Commitment,
  DailyJournalEntry,
  DailyRecord,
  LifeLogExport,
  StreakBreakRecord,
  TodoItem,
  UserProfile,
  WateringEvent
} from '../types';
import { INITIAL_USER } from '../constants/initialData';
import { getLocalDateString } from '../utils/dateUtils';

// Legacy keys to purge completely from user's browser
const LEGACY_STORAGE_KEYS = [
  'ag_user_profile_banyan',
  'ag_commitments_banyan',
  'ag_todos_banyan',
  'ag_daily_records_banyan',
  'ag_watering_events_banyan',
  'ag_streak_breaks_banyan',
  'ag_journals_banyan',
  'ag_audit_logs_banyan',
  'ag_banyan_v2_clean',
  'ag_commitments',
  'ag_daily_records',
  'ag_todos',
  'ag_journals',
  'ag_audit_logs',
  'ag_initialized_v1'
];

export class SupabaseStorageService {
  private static instance: SupabaseStorageService;

  private constructor() {
    this.purgeLegacyLocalStorage();
  }

  public static getInstance(): SupabaseStorageService {
    if (!SupabaseStorageService.instance) {
      SupabaseStorageService.instance = new SupabaseStorageService();
    }
    return SupabaseStorageService.instance;
  }

  /**
   * Purges all former local storage mock database keys so browser storage
   * is never used as a database or local cache mirror.
   */
  public purgeLegacyLocalStorage(): void {
    try {
      LEGACY_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
    } catch {
      // Ignore in non-browser environments
    }
  }

  // ============================================================================
  // USER PROFILE
  // ============================================================================
  public async getUserProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile from Supabase:', error.message);
      throw new Error(`Failed to load profile: ${error.message}`);
    }

    if (!data) {
      // Auto-provision default profile if not present
      return this.initUserProfile(userId);
    }

    return {
      id: data.id,
      name: data.name || 'Gardener',
      username: data.username || 'gardener',
      email: data.email || '',
      avatarUrl: data.avatar_url,
      timezone: data.timezone || 'Asia/Kolkata',
      preferredLanguage: data.preferred_language || 'English',
      theme: data.theme || 'dark',
      accountabilityMode: data.accountability_mode || 'Tough Love',
      notificationPreferences: data.notification_preferences || {
        dailyReminders: true,
        morningReminderTime: '08:00',
        eveningReminderTime: '20:00',
        deadlineWarnings: true,
        browserPush: false
      },
      memberSince: data.member_since || getLocalDateString(),
      freezeCredits: data.freeze_credits ?? 3
    };
  }

  public async initUserProfile(userId: string, email?: string, name?: string): Promise<UserProfile> {
    const newProfile = {
      id: userId,
      email: email || '',
      name: name || INITIAL_USER.name,
      username: (name || 'gardener').toLowerCase().replace(/\s+/g, '_'),
      avatar_url: INITIAL_USER.avatarUrl,
      timezone: INITIAL_USER.timezone,
      preferred_language: INITIAL_USER.preferredLanguage,
      theme: INITIAL_USER.theme,
      accountability_mode: INITIAL_USER.accountabilityMode,
      notification_preferences: INITIAL_USER.notificationPreferences,
      member_since: getLocalDateString(),
      freeze_credits: INITIAL_USER.freezeCredits
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(newProfile)
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile in Supabase:', error.message);
      return { ...INITIAL_USER, id: userId, email: email || '' };
    }

    return {
      id: data.id,
      name: data.name,
      username: data.username,
      email: data.email,
      avatarUrl: data.avatar_url,
      timezone: data.timezone,
      preferredLanguage: data.preferred_language,
      theme: data.theme,
      accountabilityMode: data.accountability_mode,
      notificationPreferences: data.notification_preferences,
      memberSince: data.member_since,
      freezeCredits: data.freeze_credits
    };
  }

  public async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.username !== undefined) payload.username = updates.username;
    if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
    if (updates.timezone !== undefined) payload.timezone = updates.timezone;
    if (updates.preferredLanguage !== undefined) payload.preferred_language = updates.preferredLanguage;
    if (updates.theme !== undefined) payload.theme = updates.theme;
    if (updates.accountabilityMode !== undefined) payload.accountability_mode = updates.accountabilityMode;
    if (updates.notificationPreferences !== undefined) payload.notification_preferences = updates.notificationPreferences;
    if (updates.freezeCredits !== undefined) payload.freeze_credits = updates.freezeCredits;

    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    await this.appendAuditLog(
      userId,
      'settings_updated',
      userId,
      'User profile configuration updated in cloud database.'
    );

    return {
      id: data.id,
      name: data.name,
      username: data.username,
      email: data.email,
      avatarUrl: data.avatar_url,
      timezone: data.timezone,
      preferredLanguage: data.preferred_language,
      theme: data.theme,
      accountabilityMode: data.accountability_mode,
      notificationPreferences: data.notification_preferences,
      memberSince: data.member_since,
      freezeCredits: data.freeze_credits
    };
  }

  // ============================================================================
  // COMMITMENTS (ONE WORK = ONE DEDICATED BANYAN TREE)
  // No physical DELETE; only Archive.
  // ============================================================================
  public async getCommitments(userId: string, includeArchived: boolean = true): Promise<Commitment[]> {
    let query = supabase
      .from('commitments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to load commitments: ${error.message}`);
    }

    return (data || []).map(row => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      description: row.description,
      category: row.category,
      priority: row.priority,
      trackingType: row.tracking_type,
      goalValue: row.goal_value ? Number(row.goal_value) : undefined,
      goalUnit: row.goal_unit,
      frequency: row.frequency,
      startDate: row.start_date,
      deadlineDate: row.deadline_date,
      deadlineTime: row.deadline_time,
      plantType: row.plant_type,
      toughLoveMode: row.tough_love_mode,
      notes: row.notes,
      isArchived: row.is_archived,
      archivedAt: row.archived_at,
      createdAt: row.created_at,
      linkedDependencyId: row.linked_dependency_id
    }));
  }

  public async createCommitment(
    userId: string,
    commitment: Omit<Commitment, 'id' | 'createdAt' | 'isArchived' | 'plantType'>
  ): Promise<Commitment> {
    const id = `work_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const createdAt = new Date().toISOString();

    const row = {
      id,
      user_id: userId,
      name: commitment.name,
      description: commitment.description,
      category: commitment.category,
      priority: commitment.priority,
      tracking_type: commitment.trackingType,
      goal_value: commitment.goalValue,
      goal_unit: commitment.goalUnit,
      frequency: commitment.frequency,
      start_date: commitment.startDate || getLocalDateString(),
      deadline_date: commitment.deadlineDate,
      deadline_time: commitment.deadlineTime,
      plant_type: 'banyan',
      tough_love_mode: commitment.toughLoveMode || 'Tough Love',
      notes: commitment.notes,
      is_archived: false,
      created_at: createdAt,
      linked_dependency_id: commitment.linkedDependencyId
    };

    const { error } = await supabase.from('commitments').insert(row);
    if (error) {
      throw new Error(`Failed to create commitment: ${error.message}`);
    }

    await this.appendAuditLog(
      userId,
      'commitment_created',
      id,
      `Planted dedicated Banyan Tree for work: "${row.name}" (${row.category})`
    );

    return {
      ...commitment,
      id,
      userId,
      plantType: 'banyan',
      isArchived: false,
      createdAt
    };
  }

  public async archiveCommitment(userId: string, id: string): Promise<void> {
    const archivedAt = new Date().toISOString();
    const { error } = await supabase
      .from('commitments')
      .update({
        is_archived: true,
        archived_at: archivedAt
      })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to archive commitment: ${error.message}`);
    }

    await this.appendAuditLog(
      userId,
      'commitment_archived',
      id,
      `Archived commitment ${id}. Banyan tree and immutable historical records remain permanent.`
    );
  }

  // ============================================================================
  // DAILY RECORDS: STRICT IMMUTABILITY ENFORCEMENT
  // INSERT allowed. UPDATE & DELETE forbidden.
  // ============================================================================
  public async getDailyRecords(userId: string): Promise<DailyRecord[]> {
    const { data, error } = await supabase
      .from('daily_records')
      .select('*')
      .eq('user_id', userId)
      .order('record_date', { ascending: true });

    if (error) {
      throw new Error(`Failed to load daily records: ${error.message}`);
    }

    return (data || []).map(row => ({
      id: row.id,
      userId: row.user_id,
      habitId: row.habit_id,
      recordDate: row.record_date,
      status: row.status,
      value: row.value ? Number(row.value) : undefined,
      targetValue: row.target_value ? Number(row.target_value) : undefined,
      unit: row.unit,
      isLocked: row.is_locked,
      lockedAt: row.locked_at,
      notes: row.notes,
      mood: row.mood,
      energyLevel: row.energy_level,
      difficulty: row.difficulty,
      reflection: row.reflection,
      freezeUsed: row.freeze_used,
      waterBucketPoured: row.water_bucket_poured
    }));
  }

  public async lockDailyRecord(
    recordData: Omit<DailyRecord, 'id' | 'isLocked' | 'lockedAt'>
  ): Promise<DailyRecord> {
    // 1. Verify that a record does not already exist
    const { data: existing } = await supabase
      .from('daily_records')
      .select('id')
      .eq('user_id', recordData.userId)
      .eq('habit_id', recordData.habitId)
      .eq('record_date', recordData.recordDate)
      .maybeSingle();

    if (existing) {
      throw new Error(
        `IMMUTABILITY VIOLATION: A permanent record for work ${recordData.habitId} on ${recordData.recordDate} already exists in the cloud ledger. You cannot edit yesterday.`
      );
    }

    const id = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const lockedAt = new Date().toISOString();

    const row = {
      id,
      user_id: recordData.userId,
      habit_id: recordData.habitId,
      record_date: recordData.recordDate,
      status: recordData.status,
      value: recordData.value,
      target_value: recordData.targetValue,
      unit: recordData.unit,
      is_locked: true,
      locked_at: lockedAt,
      notes: recordData.notes,
      mood: recordData.mood,
      energy_level: recordData.energyLevel,
      difficulty: recordData.difficulty,
      reflection: recordData.reflection,
      freeze_used: Boolean(recordData.freezeUsed),
      water_bucket_poured: recordData.status === 'COMPLETED'
    };

    const { error } = await supabase.from('daily_records').insert(row);
    if (error) {
      if (error.code === '23505') {
        throw new Error(
          `IMMUTABILITY VIOLATION: A permanent record for work ${recordData.habitId} on ${recordData.recordDate} already exists. You cannot edit yesterday.`
        );
      }
      throw new Error(`Failed to lock daily record: ${error.message}`);
    }

    // 2. Record corresponding permanent watering or shrink event
    if (recordData.status === 'COMPLETED') {
      await this.recordWateringEvent({
        id: `water_${id}`,
        userId: recordData.userId,
        habitId: recordData.habitId,
        date: recordData.recordDate,
        status: 'WATERED',
        timestamp: lockedAt,
        growthDelta: 10
      });

      await this.appendAuditLog(
        recordData.userId,
        'banyan_watered',
        recordData.habitId,
        `Water bucket poured over Banyan Tree for ${recordData.recordDate}. Growth points +10.`
      );
    } else if (recordData.status === 'MISSED') {
      await this.recordWateringEvent({
        id: `water_miss_${id}`,
        userId: recordData.userId,
        habitId: recordData.habitId,
        date: recordData.recordDate,
        status: 'MISSED',
        timestamp: lockedAt,
        growthDelta: -3
      });

      await this.appendAuditLog(
        recordData.userId,
        'banyan_shrunk',
        recordData.habitId,
        `Missed day permanently recorded for ${recordData.recordDate}. Banyan Tree shrunken.`
      );
    } else if (recordData.status === 'FROZEN') {
      await this.recordWateringEvent({
        id: `water_frz_${id}`,
        userId: recordData.userId,
        habitId: recordData.habitId,
        date: recordData.recordDate,
        status: 'FROZEN',
        timestamp: lockedAt,
        growthDelta: 0
      });
    }

    await this.appendAuditLog(
      recordData.userId,
      'record_locked',
      recordData.habitId,
      `Recorded permanent immutable decision for ${recordData.recordDate}: ${recordData.status} [LOCKED]`
    );

    return {
      ...recordData,
      id,
      isLocked: true,
      lockedAt
    };
  }

  // ============================================================================
  // STREAK FREEZE
  // ============================================================================
  public async useStreakFreeze(userId: string, habitId: string, recordDate: string): Promise<DailyRecord> {
    const profile = await this.getUserProfile(userId);
    if (profile.freezeCredits <= 0) {
      throw new Error("No streak freeze credits remaining.");
    }

    const record = await this.lockDailyRecord({
      userId,
      habitId,
      recordDate,
      status: 'FROZEN',
      freezeUsed: true,
      notes: 'Streak freeze used to preserve consistency without faking completion.'
    });

    await this.updateUserProfile(userId, {
      freezeCredits: profile.freezeCredits - 1
    });

    await this.appendAuditLog(
      userId,
      'freeze_used',
      habitId,
      `Used streak freeze credit for ${recordDate}. Record reflects 🧊 STREAK FREEZE.`
    );

    return record;
  }

  // ============================================================================
  // WATERING EVENTS (Permanent append-only history)
  // ============================================================================
  public async getWateringEvents(userId: string, habitId?: string): Promise<WateringEvent[]> {
    let query = supabase
      .from('watering_events')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });

    if (habitId) {
      query = query.eq('habit_id', habitId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Failed to fetch watering events:', error.message);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      userId: row.user_id,
      habitId: row.habit_id,
      date: row.date,
      status: row.status,
      timestamp: row.timestamp,
      growthDelta: Number(row.growth_delta)
    }));
  }

  public async recordWateringEvent(event: WateringEvent): Promise<void> {
    const row = {
      id: event.id,
      user_id: event.userId,
      habit_id: event.habitId,
      date: event.date,
      status: event.status,
      timestamp: event.timestamp,
      growth_delta: event.growthDelta
    };

    const { error } = await supabase
      .from('watering_events')
      .upsert(row, { onConflict: 'user_id,habit_id,date' });

    if (error) {
      console.warn('Could not record watering event:', error.message);
    }
  }

  // ============================================================================
  // STREAK BREAKS (Permanent history - never reset!)
  // ============================================================================
  public async getStreakBreaks(userId: string, habitId?: string): Promise<StreakBreakRecord[]> {
    let query = supabase
      .from('streak_breaks')
      .select('*')
      .eq('user_id', userId)
      .order('break_date', { ascending: true });

    if (habitId) {
      query = query.eq('habit_id', habitId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Failed to fetch streak breaks:', error.message);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      userId: row.user_id,
      habitId: row.habit_id,
      breakDate: row.break_date,
      previousStreak: row.previous_streak,
      recoveryDate: row.recovery_date,
      newStreak: row.new_streak
    }));
  }

  public async recordStreakBreak(breakRecord: StreakBreakRecord): Promise<void> {
    const row = {
      id: breakRecord.id,
      user_id: breakRecord.userId,
      habit_id: breakRecord.habitId,
      break_date: breakRecord.breakDate,
      previous_streak: breakRecord.previousStreak,
      recovery_date: breakRecord.recoveryDate,
      new_streak: breakRecord.newStreak
    };

    const { error } = await supabase
      .from('streak_breaks')
      .upsert(row, { onConflict: 'user_id,habit_id,break_date' });

    if (error) {
      console.warn('Could not record streak break:', error.message);
      return;
    }

    await this.appendAuditLog(
      breakRecord.userId,
      'streak_broken',
      breakRecord.habitId,
      `Streak broken on ${breakRecord.breakDate} after ${breakRecord.previousStreak} days. Permanent break recorded in PostgreSQL.`
    );
  }

  // ============================================================================
  // TODOS
  // ============================================================================
  public async getTodos(userId: string): Promise<TodoItem[]> {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to load todos: ${error.message}`);
    }

    return (data || []).map(row => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description,
      category: row.category,
      priority: row.priority,
      deadlineDate: row.deadline_date,
      isCompleted: row.is_completed,
      completedAt: row.completed_at,
      isLocked: row.is_locked,
      createdAt: row.created_at
    }));
  }

  public async createTodo(
    userId: string,
    todo: Omit<TodoItem, 'id' | 'createdAt' | 'isCompleted' | 'isLocked'>
  ): Promise<TodoItem> {
    const id = `todo_${Date.now()}`;
    const createdAt = new Date().toISOString();

    const row = {
      id,
      user_id: userId,
      title: todo.title,
      description: todo.description,
      category: todo.category,
      priority: todo.priority,
      deadline_date: todo.deadlineDate,
      is_completed: false,
      is_locked: false,
      created_at: createdAt
    };

    const { error } = await supabase.from('todos').insert(row);
    if (error) {
      throw new Error(`Failed to create todo: ${error.message}`);
    }

    return {
      ...todo,
      id,
      userId,
      isCompleted: false,
      isLocked: false,
      createdAt
    };
  }

  public async completeTodo(userId: string, id: string): Promise<TodoItem> {
    const completedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from('todos')
      .update({
        is_completed: true,
        completed_at: completedAt,
        is_locked: true
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to complete todo: ${error.message}`);
    }

    await this.appendAuditLog(
      userId,
      'record_locked',
      id,
      `Todo completed and locked: "${data.title}"`
    );

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      deadlineDate: data.deadline_date,
      isCompleted: data.is_completed,
      completedAt: data.completed_at,
      isLocked: data.is_locked,
      createdAt: data.created_at
    };
  }

  // ============================================================================
  // DAILY JOURNALS
  // ============================================================================
  public async getJournals(userId: string): Promise<DailyJournalEntry[]> {
    const { data, error } = await supabase
      .from('daily_journals')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      throw new Error(`Failed to load journal entries: ${error.message}`);
    }

    return (data || []).map(row => ({
      id: row.id,
      userId: row.user_id,
      date: row.date,
      entryText: row.entry_text,
      gratitude: row.gratitude || [],
      dailyWins: row.daily_wins || [],
      failureLog: row.failure_log || '',
      highlight: row.highlight || '',
      mood: row.mood || 'Neutral',
      energyLevel: row.energy_level || 3,
      isLocked: row.is_locked,
      lockedAt: row.locked_at
    }));
  }

  public async saveJournalEntry(
    userId: string,
    entry: Omit<DailyJournalEntry, 'id' | 'isLocked' | 'lockedAt'>
  ): Promise<DailyJournalEntry> {
    // Check if journal for this date is already locked
    const { data: existing } = await supabase
      .from('daily_journals')
      .select('id, is_locked')
      .eq('user_id', userId)
      .eq('date', entry.date)
      .maybeSingle();

    if (existing && existing.is_locked) {
      throw new Error("This journal entry is already locked and cannot be rewritten.");
    }

    const id = `jrnl_${entry.date}`;
    const lockedAt = new Date().toISOString();

    const row = {
      id,
      user_id: userId,
      date: entry.date,
      entry_text: entry.entryText,
      gratitude: entry.gratitude,
      daily_wins: entry.dailyWins,
      failure_log: entry.failureLog,
      highlight: entry.highlight,
      mood: entry.mood,
      energy_level: entry.energyLevel,
      is_locked: true,
      locked_at: lockedAt
    };

    const { error } = await supabase
      .from('daily_journals')
      .upsert(row, { onConflict: 'user_id,date' });

    if (error) {
      throw new Error(`Failed to save journal entry: ${error.message}`);
    }

    await this.appendAuditLog(
      userId,
      'journal_locked',
      id,
      `Daily journal reflection locked for ${entry.date}`
    );

    return {
      ...entry,
      id,
      userId,
      isLocked: true,
      lockedAt
    };
  }

  // ============================================================================
  // AUDIT LOGS (STRICT APPEND-ONLY LEDGER)
  // ============================================================================
  public async getAuditLogs(userId: string): Promise<AuditLogEntry[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.warn('Failed to load audit logs:', error.message);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      userId: row.user_id,
      eventType: row.event_type as AuditLogEntry['eventType'],
      entityId: row.entity_id,
      description: row.description,
      timestamp: row.timestamp,
      metadata: row.metadata
    }));
  }

  public async appendAuditLog(
    userId: string,
    eventType: AuditLogEntry['eventType'],
    entityId: string,
    description: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const timestamp = new Date().toISOString();

    const row = {
      id,
      user_id: userId,
      event_type: eventType,
      entity_id: entityId,
      description,
      timestamp,
      metadata
    };

    const { error } = await supabase.from('audit_logs').insert(row);
    if (error) {
      console.warn('Could not insert audit log entry:', error.message);
    }
  }

  // ============================================================================
  // EXPORT LIFE LOG
  // ============================================================================
  public exportLifeLog(
    user: UserProfile,
    commitments: Commitment[],
    todos: TodoItem[],
    dailyRecords: DailyRecord[],
    wateringEvents: WateringEvent[],
    streakBreaks: StreakBreakRecord[],
    journalEntries: DailyJournalEntry[],
    auditLogs: AuditLogEntry[]
  ): LifeLogExport {
    const completed = dailyRecords.filter(r => r.status === 'COMPLETED').length;
    const total = dailyRecords.length;

    return {
      exportVersion: '3.0.0-supabase-postgres',
      generatedAt: new Date().toISOString(),
      user,
      commitments,
      todos,
      dailyRecords,
      wateringEvents,
      streakBreaks,
      journalEntries,
      auditLogs,
      summaryStats: {
        totalCommitments: commitments.length,
        totalActive: commitments.filter(c => !c.isArchived).length,
        totalRecords: total,
        overallCompletionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        longestOverallStreak: 0
      }
    };
  }
}

export const supabaseStorage = SupabaseStorageService.getInstance();
