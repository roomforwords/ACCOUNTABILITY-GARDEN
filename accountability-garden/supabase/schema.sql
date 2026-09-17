-- ==============================================================================
-- ACCOUNTABILITY GARDEN: POSTGRESQL DATABASE SCHEMA (SUPABASE)
-- Tagline: "You cannot edit yesterday."
-- Architecture: Supabase Auth + PostgreSQL + Row Level Security (RLS)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. PROFILES TABLE
-- Linked 1:1 with Supabase auth.users
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Gardener',
  username TEXT NOT NULL DEFAULT 'gardener',
  email TEXT,
  avatar_url TEXT,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  preferred_language TEXT NOT NULL DEFAULT 'English',
  theme TEXT NOT NULL DEFAULT 'dark',
  accountability_mode TEXT NOT NULL DEFAULT 'Tough Love',
  notification_preferences JSONB NOT NULL DEFAULT '{
    "dailyReminders": true,
    "morningReminderTime": "08:00",
    "eveningReminderTime": "20:00",
    "deadlineWarnings": true,
    "browserPush": false
  }'::jsonb,
  member_since DATE NOT NULL DEFAULT CURRENT_DATE,
  freeze_credits INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. COMMITMENTS TABLE
-- Every commitment gets a dedicated Banyan Tree. No physical deletion; only archive.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.commitments (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Medium',
  tracking_type TEXT NOT NULL DEFAULT 'YES_NO',
  goal_value NUMERIC,
  goal_unit TEXT,
  frequency JSONB NOT NULL DEFAULT '{"type": "daily"}'::jsonb,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  deadline_date DATE,
  deadline_time TEXT,
  plant_type TEXT NOT NULL DEFAULT 'banyan',
  tough_love_mode TEXT NOT NULL DEFAULT 'Tough Love',
  notes TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  linked_dependency_id TEXT
);

-- ==============================================================================
-- 4. DAILY RECORDS TABLE
-- Strict immutability: UNIQUE(user_id, habit_id, record_date)
-- Once inserted, cannot be updated or deleted.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.daily_records (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id TEXT NOT NULL REFERENCES public.commitments(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('COMPLETED', 'MISSED', 'PARTIAL', 'FROZEN')),
  value NUMERIC,
  target_value NUMERIC,
  unit TEXT,
  is_locked BOOLEAN NOT NULL DEFAULT TRUE,
  locked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  mood TEXT,
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  difficulty TEXT,
  reflection JSONB,
  freeze_used BOOLEAN NOT NULL DEFAULT FALSE,
  water_bucket_poured BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT unique_habit_record_per_date UNIQUE (user_id, habit_id, record_date)
);

-- ==============================================================================
-- 5. TODOS TABLE
-- Priority action items for the daily cockpit.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.todos (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Work',
  priority TEXT NOT NULL DEFAULT 'Medium',
  deadline_date DATE,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. WATERING EVENTS TABLE
-- Permanent historical ledger of Banyan watering. Append-only.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.watering_events (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id TEXT NOT NULL REFERENCES public.commitments(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  growth_delta NUMERIC NOT NULL,
  CONSTRAINT unique_watering_event UNIQUE (user_id, habit_id, date)
);

-- ==============================================================================
-- 7. STREAK BREAKS TABLE
-- Permanent streak break ledger. Never erased.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.streak_breaks (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id TEXT NOT NULL REFERENCES public.commitments(id) ON DELETE CASCADE,
  break_date DATE NOT NULL,
  previous_streak INTEGER NOT NULL,
  recovery_date DATE,
  new_streak INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_streak_break UNIQUE (user_id, habit_id, break_date)
);

-- ==============================================================================
-- 8. DAILY JOURNALS TABLE
-- Daily reflections, wins, failure analysis, locked permanently upon save.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.daily_journals (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  entry_text TEXT NOT NULL DEFAULT '',
  gratitude JSONB NOT NULL DEFAULT '[]'::jsonb,
  daily_wins JSONB NOT NULL DEFAULT '[]'::jsonb,
  failure_log TEXT NOT NULL DEFAULT '',
  highlight TEXT NOT NULL DEFAULT '',
  mood TEXT NOT NULL DEFAULT 'Neutral',
  energy_level INTEGER NOT NULL DEFAULT 3,
  is_locked BOOLEAN NOT NULL DEFAULT TRUE,
  locked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_journal_date UNIQUE (user_id, date)
);

-- ==============================================================================
-- 9. AUDIT LOGS TABLE
-- Cryptographic-style append-only ledger of all user and system events.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  description TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB
);

-- ==============================================================================
-- 10. INDEXES FOR HIGH-SPEED LOOKUPS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_commitments_user_id ON public.commitments(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_records_user_id ON public.daily_records(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_records_habit_date ON public.daily_records(habit_id, record_date);
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON public.todos(user_id);
CREATE INDEX IF NOT EXISTS idx_watering_user_habit ON public.watering_events(user_id, habit_id);
CREATE INDEX IF NOT EXISTS idx_streak_breaks_user_habit ON public.streak_breaks(user_id, habit_id);
CREATE INDEX IF NOT EXISTS idx_journals_user_date ON public.daily_journals(user_id, date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- Each user can only ever access their own data.
-- Immutability rules:
--   - daily_records: INSERT and SELECT only (NO UPDATE, NO DELETE)
--   - audit_logs: INSERT and SELECT only (NO UPDATE, NO DELETE)
--   - watering_events: INSERT and SELECT only (NO UPDATE, NO DELETE)
--   - commitments: INSERT, SELECT, UPDATE only (NO DELETE - only soft archive)
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watering_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_breaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 11.1 PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 11.2 COMMITMENTS POLICIES (No physical DELETE)
CREATE POLICY "Users can view their own commitments"
  ON public.commitments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own commitments"
  ON public.commitments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own commitments"
  ON public.commitments FOR UPDATE
  USING (auth.uid() = user_id);

-- 11.3 DAILY RECORDS POLICIES (IMMUTABLE: No UPDATE, No DELETE)
CREATE POLICY "Users can view their own daily records"
  ON public.daily_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily records"
  ON public.daily_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 11.4 TODOS POLICIES
CREATE POLICY "Users can view their own todos"
  ON public.todos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos"
  ON public.todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos"
  ON public.todos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos"
  ON public.todos FOR DELETE
  USING (auth.uid() = user_id);

-- 11.5 WATERING EVENTS POLICIES (Append-only: No UPDATE, No DELETE)
CREATE POLICY "Users can view their own watering events"
  ON public.watering_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watering events"
  ON public.watering_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 11.6 STREAK BREAKS POLICIES (No DELETE)
CREATE POLICY "Users can view their own streak breaks"
  ON public.streak_breaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streak breaks"
  ON public.streak_breaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streak breaks"
  ON public.streak_breaks FOR UPDATE
  USING (auth.uid() = user_id);

-- 11.7 DAILY JOURNALS POLICIES (No DELETE)
CREATE POLICY "Users can view their own journals"
  ON public.daily_journals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journals"
  ON public.daily_journals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journals"
  ON public.daily_journals FOR UPDATE
  USING (auth.uid() = user_id);

-- 11.8 AUDIT LOGS POLICIES (STRICT APPEND-ONLY: No UPDATE, No DELETE)
CREATE POLICY "Users can view their own audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 12. AUTOMATIC PROFILE CREATION TRIGGER
-- When a user signs up via Supabase Auth, create their profile automatically.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
