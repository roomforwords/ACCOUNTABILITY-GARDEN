// ==========================================
// DEADLINES VIEW
// Section 10
// ==========================================

import React from 'react';
import { Commitment, TodoItem } from '../../types';
import { AlertTriangle, CheckCircle2, Clock, Hourglass, Lock, ShieldAlert } from 'lucide-react';

interface DeadlinesViewProps {
  commitments: Commitment[];
  todos: TodoItem[];
}

export const DeadlinesView: React.FC<DeadlinesViewProps> = ({ commitments, todos }) => {
  const referenceTime = new Date();

  // Gather all items with deadlines
  const deadlineItems = React.useMemo(() => {
    const list: {
      id: string;
      title: string;
      category: string;
      type: 'commitment' | 'todo';
      deadlineDate: string;
      deadlineTime?: string;
      isCompleted: boolean;
      daysRemaining: number;
      status: 'Overdue' | 'Due Today' | 'Due Soon' | 'Upcoming' | 'Completed';
    }[] = [];

    // Commitments
    commitments.forEach(c => {
      if (c.deadlineDate) {
        const dl = new Date(`${c.deadlineDate}T${c.deadlineTime || '23:59'}:00Z`);
        const diffMs = dl.getTime() - referenceTime.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        let status: any = 'Upcoming';
        if (diffDays < 0) status = 'Overdue';
        else if (diffDays === 0) status = 'Due Today';
        else if (diffDays <= 3) status = 'Due Soon';

        list.push({
          id: c.id,
          title: c.name,
          category: c.category,
          type: 'commitment',
          deadlineDate: c.deadlineDate,
          deadlineTime: c.deadlineTime,
          isCompleted: false, // Commitments are ongoing habits unless target met
          daysRemaining: diffDays,
          status
        });
      }
    });

    // Todos
    todos.forEach(t => {
      if (t.deadlineDate) {
        const dl = new Date(`${t.deadlineDate}T23:59:00Z`);
        const diffMs = dl.getTime() - referenceTime.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        let status: any = 'Upcoming';
        if (t.isCompleted) status = 'Completed';
        else if (diffDays < 0) status = 'Overdue';
        else if (diffDays === 0) status = 'Due Today';
        else if (diffDays <= 3) status = 'Due Soon';

        list.push({
          id: t.id,
          title: t.title,
          category: t.category,
          type: 'todo',
          deadlineDate: t.deadlineDate,
          isCompleted: t.isCompleted,
          daysRemaining: diffDays,
          status
        });
      }
    });

    return list.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [commitments, todos]);

  const overdueCount = deadlineItems.filter(i => i.status === 'Overdue').length;
  const dueSoonCount = deadlineItems.filter(i => i.status === 'Due Soon' || i.status === 'Due Today').length;

  return (
    <div className="deadlines-view-container">
      {/* Header Banner */}
      <div className="deadlines-header-card">
        <div className="banner-title-box">
          <Clock size={24} className="clock-accent" />
          <div>
            <h2 className="banner-heading">Active Deadlines & Time Horizon</h2>
            <p className="banner-subtext">
              “The deadline didn't move. Your commitment did.”
            </p>
          </div>
        </div>

        <div className="deadlines-summary-chips">
          {overdueCount > 0 && (
            <div className="chip overdue-chip">
              <ShieldAlert size={14} /> {overdueCount} Overdue
            </div>
          )}
          <div className="chip duesoon-chip">
            <Hourglass size={14} /> {dueSoonCount} Due Soon
          </div>
        </div>
      </div>

      {/* Deadline Items List */}
      <div className="deadlines-list-grid mt-4">
        {deadlineItems.length === 0 ? (
          <div className="empty-state-box">
            <p className="empty-primary">No active deadlines currently set.</p>
            <p className="empty-sub">When you establish a commitment or singular task with a target date, its countdown and on-time accountability ledger will appear here as individual cards.</p>
          </div>
        ) : (
          deadlineItems.map(item => (
            <div key={item.id} className={`deadline-card status-${item.status.toLowerCase().replace(' ', '-')}`}>
              <div className="deadline-card-top">
                <div className="type-cat-badges">
                  <span className="type-tag">{item.type === 'commitment' ? 'Commitment' : 'Singular Todo'}</span>
                  <span className="cat-tag">{item.category}</span>
                </div>
                <span className={`status-badge badge-${item.status.toLowerCase().replace(' ', '-')}`}>
                  {item.status}
                </span>
              </div>

              <h3 className="deadline-title">{item.title}</h3>

              <div className="deadline-countdown-box">
                <Clock size={15} />
                <div className="countdown-text">
                  {item.isCompleted ? (
                    <span className="completed-text">✓ Completed on time</span>
                  ) : item.daysRemaining < 0 ? (
                    <span className="overdue-text">Lapsed {Math.abs(item.daysRemaining)} days ago</span>
                  ) : item.daysRemaining === 0 ? (
                    <span className="today-text">Due Today ({item.deadlineTime || '23:59'})</span>
                  ) : (
                    <span>{item.daysRemaining} days remaining ({item.deadlineDate})</span>
                  )}
                </div>
              </div>

              <div className="immutability-stamp">
                <Lock size={12} />
                <span>Record becomes historical reality on deadline passage.</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
