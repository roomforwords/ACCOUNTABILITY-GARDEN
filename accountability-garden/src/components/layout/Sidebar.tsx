// ==========================================
// SIDEBAR COMPONENT (DESKTOP NAVIGATION)
// Section 84
// ==========================================

import React from 'react';
import {
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  CheckSquare,
  Clock,
  Flame,
  History,
  LayoutDashboard,
  Lock,
  Settings,
  Sprout
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {
  const navItems = [
    { id: 'garden', label: '🌱 Garden', icon: Sprout },
    { id: 'dashboard', label: '▣ Dashboard', icon: LayoutDashboard },
    { id: 'today', label: '✓ Today', icon: CheckSquare },
    { id: 'calendar', label: '📅 Calendar', icon: Calendar },
    { id: 'streaks', label: '🔥 Streaks', icon: Flame },
    { id: 'deadlines', label: '⏰ Deadlines', icon: Clock },
    { id: 'history', label: '📜 History', icon: History },
    { id: 'journal', label: '📓 Journal', icon: BookOpen },
    { id: 'analytics', label: '📊 Analytics', icon: BarChart3 },
    { id: 'achievements', label: '🏆 Achievements', icon: Award },
    { id: 'settings', label: '⚙ Settings', icon: Settings }
  ];

  return (
    <aside className="app-sidebar">
      {/* Brand & Tagline */}
      <div className="sidebar-brand">
        <div className="brand-logo-wrap">
          <span className="brand-icon">🌱</span>
          <div className="brand-text-block">
            <h1 className="brand-title">ACCOUNTABILITY</h1>
            <span className="brand-garden-title">GARDEN</span>
          </div>
        </div>
        <p className="brand-tagline">“You cannot edit yesterday.”</p>
      </div>

      {/* Nav links */}
      <nav className="sidebar-nav">
        {navItems.map(item => {
          const IconComponent = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item-btn ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <IconComponent size={18} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
              {isActive && <div className="active-indicator" />}
            </button>
          );
        })}
      </nav>

      {/* Footer / Immutability reminder */}
      <div className="sidebar-footer">
        <div className="immutability-badge-box">
          <Lock size={13} />
          <span>History is Immutable</span>
        </div>
        <small className="audit-subtext">Append-Only Audit Engine v1.0</small>
      </div>
    </aside>
  );
};
