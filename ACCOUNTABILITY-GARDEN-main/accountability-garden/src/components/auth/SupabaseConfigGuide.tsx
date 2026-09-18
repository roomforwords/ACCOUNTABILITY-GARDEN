// ==========================================
// SUPABASE CONFIGURATION GUIDE
// Rendered when environment variables are missing
// ==========================================

import React, { useState } from 'react';
import { Database, Key, ShieldCheck, AlertCircle } from 'lucide-react';

interface SupabaseConfigGuideProps {
  onCredentialsProvided?: (url: string, key: string) => void;
}

export const SupabaseConfigGuide: React.FC<SupabaseConfigGuideProps> = ({ onCredentialsProvided }) => {
  const [manualUrl, setManualUrl] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim() || !manualKey.trim()) {
      setSaveStatus('Please enter both Supabase URL and Anon Key.');
      return;
    }

    if (onCredentialsProvided) {
      onCredentialsProvided(manualUrl.trim(), manualKey.trim());
    } else {
      setSaveStatus('Please add these to your .env file or Vercel Environment Variables.');
    }
  };

  return (
    <div className="auth-fullscreen-overlay">
      <div className="auth-card config-guide-card">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <Database size={28} className="text-emerald-400" />
          </div>
          <h2 className="auth-title">Supabase Cloud Database Setup</h2>
          <p className="auth-subtitle">
            Accountability Garden requires a permanent PostgreSQL database so your immutable history is never lost.
          </p>
        </div>

        <div className="config-steps-box">
          <div className="config-step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <strong>Create a Supabase Project</strong>
              <p>Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline">supabase.com</a> (free tier) and click <em>New Project</em>.</p>
            </div>
          </div>

          <div className="config-step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <strong>Execute Database Schema</strong>
              <p>Open Supabase <strong>SQL Editor</strong>, paste the contents of <code>supabase/schema.sql</code>, and click <strong>Run</strong>.</p>
            </div>
          </div>

          <div className="config-step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <strong>Set Environment Variables</strong>
              <p>Add to your local <code>.env</code> file (or Vercel Project Settings):</p>
              <pre className="env-code-snippet">
{`VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...`}
              </pre>
            </div>
          </div>
        </div>

        {/* Quick Connect Session Option */}
        <form onSubmit={handleApply} className="config-quick-form">
          <div className="quick-form-title">
            <Key size={16} />
            <span>Connect Current Browser Session</span>
          </div>

          <div className="form-group">
            <label className="form-label">Supabase Project URL</label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              className="form-input"
              value={manualUrl}
              onChange={e => setManualUrl(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Supabase Anon Public API Key</label>
            <input
              type="password"
              placeholder="eyJhbGciOi..."
              className="form-input"
              value={manualKey}
              onChange={e => setManualKey(e.target.value)}
              required
            />
          </div>

          {saveStatus && (
            <div className="config-alert">
              <AlertCircle size={15} />
              <span>{saveStatus}</span>
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full mt-3">
            <ShieldCheck size={16} /> Connect Database
          </button>
        </form>

        <div className="auth-footer-tagline">
          <span>“You cannot edit yesterday.”</span>
        </div>
      </div>
    </div>
  );
};
