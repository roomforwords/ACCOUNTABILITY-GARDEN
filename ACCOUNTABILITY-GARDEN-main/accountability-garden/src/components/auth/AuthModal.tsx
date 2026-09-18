// ==========================================
// SUPABASE AUTHENTICATION MODAL / VIEW
// Email & Password Auth with Row Level Security
// ==========================================

import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Lock, Mail, User, KeyRound, AlertCircle, ArrowRight, ShieldCheck, Trees } from 'lucide-react';

interface AuthModalProps {
  onAuthSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          throw new Error('Please enter your name.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              name: fullName.trim()
            }
          }
        });

        if (error) throw error;

        if (data.session) {
          // Auto-signed in
          onAuthSuccess();
        } else {
          setSuccessMessage('Account created! Please sign in or check your email confirmation.');
          setIsSignUp(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (error) throw error;
        onAuthSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-fullscreen-overlay">
      <div className="auth-card">
        {/* Brand Banner */}
        <div className="auth-header">
          <div className="auth-brand-badge">
            <Trees size={32} className="text-emerald-400" />
          </div>
          <h1 className="auth-title">Accountability Garden</h1>
          <p className="auth-tagline">“You cannot edit yesterday.”</p>
          <div className="auth-subinfo">
            Permanent Banyan Tree History backed by PostgreSQL & Row Level Security
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${!isSignUp ? 'active' : ''}`}
            onClick={() => {
              setIsSignUp(false);
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${isSignUp ? 'active' : ''}`}
            onClick={() => {
              setIsSignUp(true);
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
          >
            Create Account
          </button>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="auth-alert error">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="auth-alert success">
            <ShieldCheck size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  placeholder="e.g. Arjun Sharma"
                  className="form-input"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                placeholder="name@example.com"
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <KeyRound size={16} className="input-icon" />
              <input
                type="password"
                placeholder="••••••••"
                className="form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span>Connecting to Cloud Ledger...</span>
            ) : (
              <>
                <span>{isSignUp ? 'Plant Your Garden' : 'Enter the Garden'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-security-note">
          <Lock size={13} />
          <span>Encrypted PostgreSQL • Cloud Permanent • Multi-Device Sync</span>
        </div>
      </div>
    </div>
  );
};
