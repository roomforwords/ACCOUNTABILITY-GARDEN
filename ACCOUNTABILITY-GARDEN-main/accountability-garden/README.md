# 🌳 Accountability Garden: Supabase PostgreSQL & Authentication

> **Philosophy**: *“You cannot edit yesterday.”*  
> An immutable daily execution system backed by a permanent cloud PostgreSQL database, dedicated Banyan Tree continuous growth models, and cryptographic-style audit ledgers.

---

## 🏗 Architecture & Cloud Database

- **Frontend**: React 19 + TypeScript + Vite (Hosted on Vercel)
- **Database**: Supabase PostgreSQL (Cloud Permanent)
- **Authentication**: Supabase Auth (Email & Password with JWT Sessions)
- **Security**: PostgreSQL Row Level Security (RLS) ensuring strict user-level isolation
- **Immutability Principle**:
  - `daily_records`: Strict `SELECT` and `INSERT` only (no updates, no deletions).
  - `audit_logs`: Append-only system log (no updates, no deletions).
  - `watering_events`: Permanent historical watering record.
  - `commitments`: Dedicated Banyan tree per work. Soft archive only (`is_archived = true`); no hard deletes.

---

## 📊 Supabase Database Tables

All tables are defined in [`supabase/schema.sql`](./supabase/schema.sql):

| Table | Primary Key | Foreign Key | Description & Immutability |
| :--- | :--- | :--- | :--- |
| **`profiles`** | `id UUID` | `auth.users(id)` | User profile details, timezone, theme, accountability mode, freeze credits. Auto-created on auth signup via trigger. |
| **`commitments`** | `id TEXT` | `user_id -> auth.users(id)` | Dedicated Banyan work trees. Archival only; no deletion. |
| **`daily_records`** | `id TEXT` | `user_id`, `habit_id` | **Strictly Immutable**: Unique constraint on `(user_id, habit_id, record_date)`. Cannot be updated or deleted once locked. |
| **`todos`** | `id TEXT` | `user_id -> auth.users(id)` | Priority tasks and action items for the daily cockpit. |
| **`watering_events`** | `id TEXT` | `user_id`, `habit_id` | Append-only ledger of water bucket pours and growth deltas. |
| **`streak_breaks`** | `id TEXT` | `user_id`, `habit_id` | Permanent record of broken streaks. Never erased. |
| **`daily_journals`** | `id TEXT` | `user_id -> auth.users(id)` | Daily reflections, gratitude, and failure logs. Locked permanently upon saving. |
| **`audit_logs`** | `id TEXT` | `user_id -> auth.users(id)` | Append-only cryptographic-style ledger tracking all actions. |

---

## 🚀 Setup Guide

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New Project**, choose a name (e.g. `accountability-garden`), database password, and your preferred region.

### 2. Run the Database Schema Migration
1. In your Supabase Dashboard, navigate to the **SQL Editor** (left menu).
2. Open [`supabase/schema.sql`](./supabase/schema.sql) from this repository, copy its complete contents, and paste them into the SQL Editor.
3. Click **Run**.
   - This creates all 8 tables.
   - Enables Row Level Security (RLS) on all tables.
   - Sets up user-isolated RLS policies (`auth.uid() = user_id`).
   - Disables updates/deletions on immutable tables.
   - Creates the `on_auth_user_created` trigger for automated profile provisioning on signup.

### 3. Configure Local Environment Variables
1. In your Supabase project dashboard, navigate to **Project Settings** → **API**.
2. Copy your **Project URL** and **Project API Anon Key** (`public`).
3. Create a `.env` file in the root of this project (see [`.env.example`](./.env.example)):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 💻 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run build check
npm run build
```

Open `http://localhost:5173` in your browser.

---

## ☁️ Deploying to Vercel

1. Push your repository to GitHub or GitLab.
2. Go to [vercel.com](https://vercel.com) and click **Add New...** → **Project**.
3. Import your `accountability-garden` repository.
4. Under **Environment Variables**, add the two Supabase variables:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Public Key
5. Click **Deploy**.

Vercel will build and serve the static client application, while all user data, authentication, and immutable daily records reside permanently in your Supabase PostgreSQL cloud database!

---

## 🔒 End-to-End Verification Flow

1. **Create Account**:
   - Open website → Click **Create Account** → Enter Name, Email, and Password.
   - Account is created in Supabase Auth, and the `on_auth_user_created` trigger automatically provisions the user row in `profiles`.
2. **Add Commitment**:
   - Click **+ Commitment** → Enter commitment name (e.g. "Deep Work", 2 hours).
   - Saved directly to `commitments` in PostgreSQL with a dedicated Banyan Tree.
3. **Record Daily Execution**:
   - Click **Record Done** or pour the water bucket.
   - Record is permanently written to `daily_records` and `watering_events`.
   - Cannot be edited or deleted (enforced by application logic & PostgreSQL RLS).
4. **Multi-Device & Resilience Test**:
   - Close the browser or clear browser cache.
   - Reopen website and sign in from another browser / phone / laptop.
   - All commitments, Banyan tree growth points, streaks, streak breaks, and history are restored from PostgreSQL!
