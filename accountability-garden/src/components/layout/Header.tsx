// ==========================================
// HEADER COMPONENT
// Top bar with time, quote ticker, user profile & action
// ==========================================

import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { CENTRAL_PHILOSOPHY_QUOTES } from '../../constants/quotes';
import { Clock, Database, Lock, LogOut, Plus } from 'lucide-react';

interface HeaderProps {
  user: UserProfile;
  activeView: string;
  onCreateCommitmentClick: () => void;
  onOpenSettings: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onCreateCommitmentClick,
  onOpenSettings,
  onLogout
}) => {
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Rotate philosophy tagline every 15s
  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setQuoteIndex(i => (i + 1) % CENTRAL_PHILOSOPHY_QUOTES.length);
    }, 15000);
    return () => clearInterval(quoteTimer);
  }, []);

  return (
    <header className="app-header">
      {/* Philosophy Rotating Ticker */}
      <div className="header-quote-ticker">
        <span className="ticker-lock-icon"><Lock size={12} /></span>
        <span className="ticker-text">{CENTRAL_PHILOSOPHY_QUOTES[quoteIndex]}</span>
      </div>

      {/* Right Controls */}
      <div className="header-right-controls">
        {/* Cloud Status Badge */}
        <div className="cloud-status-badge" title="PostgreSQL Cloud Connected via Supabase & RLS">
          <Database size={12} />
          <span>Cloud Ledger</span>
        </div>

        {/* Live Clock */}
        <div className="header-clock-box">
          <Clock size={14} className="clock-icon" />
          <span className="clock-time">{currentTimeStr || '02:08:36 AM'}</span>
          <span className="clock-tz">IST</span>
        </div>

        {/* Quick Action: Establish Commitment */}
        <button
          type="button"
          className="btn btn-primary header-add-btn"
          onClick={onCreateCommitmentClick}
        >
          <Plus size={16} />
          <span>+ Commitment</span>
        </button>

        {/* User profile avatar / name */}
        <div className="header-user-pill" onClick={onOpenSettings} title="Open settings & profile">
          <div className="user-avatar-circle">
            {(user.name || 'G').charAt(0)}
          </div>
          <span className="user-display-name">{user.name || 'Gardener'}</span>
          <span className="user-mode-tag">{user.accountabilityMode}</span>
        </div>

        {/* Quick Logout Button */}
        {onLogout && (
          <button
            type="button"
            className="header-logout-btn"
            onClick={onLogout}
            title="Sign out of Accountability Garden"
          >
            <LogOut size={13} />
            <span>Exit</span>
          </button>
        )}
      </div>
    </header>
  );
};

