// ==========================================
// MOBILE BOTTOM NAVIGATION
// Section 84: Garden, Today, Calendar, History, Menu
// ==========================================

import React, { useState } from 'react';
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
  Menu,
  Settings,
  Sprout,
  X
} from 'lucide-react';

interface BottomNavProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate }) => {
  const [showDrawer, setShowDrawer] = useState(false);

  const mainItems = [
    { id: 'garden', label: 'Garden', icon: Sprout },
    { id: 'today', label: 'Today', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'history', label: 'History', icon: History }
  ];

  const drawerItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'streaks', label: 'Streaks', icon: Flame },
    { id: 'deadlines', label: 'Deadlines', icon: Clock },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <>
      <nav className="mobile-bottom-nav">
        {mainItems.map(item => {
          const IconComponent = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              className={`bottom-nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <IconComponent size={20} />
              <span className="bottom-nav-label">{item.label}</span>
            </button>
          );
        })}

        {/* Menu toggle for secondary views */}
        <button
          className={`bottom-nav-btn ${showDrawer ? 'active' : ''}`}
          onClick={() => setShowDrawer(d => !d)}
        >
          <Menu size={20} />
          <span className="bottom-nav-label">Menu</span>
        </button>
      </nav>

      {/* Slide-up Menu Drawer for mobile */}
      {showDrawer && (
        <div className="mobile-drawer-backdrop" onClick={() => setShowDrawer(false)}>
          <div className="mobile-drawer-content" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h4>All Navigation</h4>
              <button className="icon-btn" onClick={() => setShowDrawer(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="drawer-items-list">
              {drawerItems.map(item => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`drawer-item-btn ${activeView === item.id ? 'active' : ''}`}
                    onClick={() => {
                      onNavigate(item.id);
                      setShowDrawer(false);
                    }}
                  >
                    <IconComponent size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
