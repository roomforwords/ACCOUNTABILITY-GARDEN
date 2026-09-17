// ==========================================
// ANALYTICS & ACCOUNTABILITY REPORTS
// Sections 43 - 49, 99, 100
// Structured Tables & Empirical Ground Truth
// ==========================================

import React, { useState } from 'react';
import { Commitment, DailyJournalEntry, DailyRecord, TodoItem, UserProfile } from '../../types';
import { AnalyticsEngine } from '../../services/analyticsEngine';
import {
  AlertTriangle,
  BarChart3,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Flame,
  LineChart,
  Lock,
  PieChart,
  ShieldAlert,
  Sparkles,
  Table as TableIcon,
  Trophy
} from 'lucide-react';

interface AnalyticsViewProps {
  user: UserProfile;
  commitments: Commitment[];
  records: DailyRecord[];
  todos: TodoItem[];
  journals: DailyJournalEntry[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  user,
  commitments,
  records,
  todos,
  journals
}) => {
  const todayStr = '2026-09-17';
  const [reportPeriod, setReportPeriod] = useState<'weekly' | 'monthly'>('weekly');

  // Compute metrics
  const consistency = AnalyticsEngine.calculateConsistencyScore(records);
  const personalRecords = AnalyticsEngine.calculatePersonalRecords(commitments, records, todayStr);
  const report = AnalyticsEngine.generateReport(reportPeriod, commitments, records, todos, todayStr);
  const aiInsights = AnalyticsEngine.generateAIInsights(commitments, records, journals, todayStr);
  const habitAnalytics = AnalyticsEngine.getHabitAnalytics(commitments, records, todayStr);

  return (
    <div className="analytics-view-container">
      {/* Banner */}
      <div className="analytics-banner-card">
        <div className="banner-title-box">
          <BarChart3 size={24} className="analytics-accent" />
          <div>
            <h2 className="banner-heading">Accountability Analytics & Ground Truth</h2>
            <p className="banner-subtext">
              “Your history is not here to judge you. It is here to tell you the truth.”
            </p>
          </div>
        </div>

        {/* Consistency Score Card (Section 44) */}
        <div className="consistency-gauge-card">
          <div className="gauge-score">{consistency.score}%</div>
          <div className="gauge-info">
            <span className="gauge-label">Historical Consistency Score</span>
            <p className="gauge-desc">{consistency.explanation}</p>
          </div>
        </div>
      </div>

      {/* Personal Records & Empirical Patterns Grid (Sections 46, 47) */}
      <div className="analytics-section-title-row mt-4">
        <h3 className="section-title">Personal Records & Empirical Patterns</h3>
        <span className="badge-subtle">Factual Reality</span>
      </div>

      <div className="personal-records-grid mt-2">
        <div className="record-card">
          <div className="record-card-label">
            <Trophy size={16} className="gold-accent" />
            <span>Longest Consecutive Streak</span>
          </div>
          <div className="record-val">{personalRecords.longestStreak.streak} <small>days</small></div>
          <div className="record-sub">{personalRecords.longestStreak.habitName || 'None recorded yet'}</div>
        </div>

        <div className="record-card">
          <div className="record-card-label">
            <CheckCircle2 size={16} className="green-accent" />
            <span>Most Completed Commitment</span>
          </div>
          <div className="record-val">{personalRecords.mostCompletedHabit.count} <small>days logged</small></div>
          <div className="record-sub">{personalRecords.mostCompletedHabit.habitName || 'None recorded yet'}</div>
        </div>

        <div className="record-card">
          <div className="record-card-label">
            <Flame size={16} className="flame-accent" />
            <span>Highest Execution Rate</span>
          </div>
          <div className="record-val">{personalRecords.mostConsistentHabit.rate}%</div>
          <div className="record-sub">{personalRecords.mostConsistentHabit.habitName || 'None recorded yet'}</div>
        </div>

        <div className="record-card worst-day-card">
          <div className="record-card-label">
            <AlertTriangle size={16} className="warning-accent" />
            <span>Factual Missed-Day Pattern</span>
          </div>
          <div className="record-val">{personalRecords.worstDayOfWeek.day}s</div>
          <div className="record-sub">{personalRecords.worstDayOfWeek.missedPercentage}% of skips occur on this day</div>
        </div>
      </div>

      {/* SECTION 1: GROUNDED INTELLIGENCE AUDIT TABLE */}
      <div className="structured-section-card mt-5">
        <div className="section-card-header">
          <div className="header-title-group">
            <Brain size={20} className="text-purple" />
            <h3 className="section-title">Grounded Intelligence (Zero Hallucinations Table)</h3>
          </div>
          <span className="grounded-badge">
            <ShieldAlert size={12} /> Strictly Derived from Stored Audit Logs
          </span>
        </div>

        <div className="table-responsive-wrapper mt-2">
          <table className="accountability-table intelligence-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Pattern Focus</th>
                <th style={{ width: '220px' }}>Empirical Observation</th>
                <th>Ground Truth Evidence (Stored Logs)</th>
                <th>Accountability Directive</th>
                <th style={{ width: '110px' }}>Audit State</th>
              </tr>
            </thead>
            <tbody>
              {aiInsights.map(ins => (
                <tr key={ins.id}>
                  <td>
                    <span className={`insight-type-badge type-${ins.type}`}>
                      {ins.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <strong className="insight-title-bold">{ins.title}</strong>
                    <p className="insight-table-desc">{ins.description}</p>
                  </td>
                  <td className="evidence-cell">
                    <span className="evidence-quote">“{ins.evidence}”</span>
                  </td>
                  <td className="directive-cell">
                    <span className="directive-tag">Directive:</span>
                    <span className="directive-body">{ins.actionableStep}</span>
                  </td>
                  <td>
                    <div className="lock-tag-table">
                      <Lock size={10} /> Verified
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: PERIODIC ACCOUNTABILITY REPORT */}
      <div className="structured-section-card mt-5">
        <div className="section-card-header">
          <div>
            <h3 className="section-title">
              {reportPeriod === 'weekly' ? 'Weekly' : 'Monthly'} Accountability Report
            </h3>
            <span className="report-period-range">Period: <strong>{report.startDate}</strong> → <strong>{report.endDate}</strong></span>
          </div>

          <div className="period-switch-btns">
            <button
              type="button"
              className={`switch-btn ${reportPeriod === 'weekly' ? 'active' : ''}`}
              onClick={() => setReportPeriod('weekly')}
            >
              Weekly
            </button>
            <button
              type="button"
              className={`switch-btn ${reportPeriod === 'monthly' ? 'active' : ''}`}
              onClick={() => setReportPeriod('monthly')}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Structured Metric Table Bar */}
        <div className="report-metrics-grid mt-3">
          <div className="metric-box">
            <span className="metric-title">Actions Executed</span>
            <span className="metric-value text-green">{report.totalCompleted}</span>
            <span className="metric-sub">Watered commitments</span>
          </div>

          <div className="metric-box">
            <span className="metric-title">Actions Missed</span>
            <span className={`metric-value ${report.totalMissed > 0 ? 'text-red' : 'text-muted'}`}>{report.totalMissed}</span>
            <span className="metric-sub">Unrecorded skips</span>
          </div>

          <div className="metric-box">
            <span className="metric-title">Execution Rate</span>
            <span className="metric-value text-green">{report.completionRate}%</span>
            <span className="metric-sub">Factual consistency</span>
          </div>

          <div className="metric-box">
            <span className="metric-title">Deadlines Met</span>
            <span className="metric-value">{report.deadlinesMet.met} / {report.deadlinesMet.total}</span>
            <span className="metric-sub">On-time delivery</span>
          </div>

          <div className="metric-box">
            <span className="metric-title">Garden Expansion</span>
            <span className="metric-value text-green">+{report.gardenGrowthStages} stages</span>
            <span className="metric-sub">Banyan branch growth</span>
          </div>
        </div>

        {/* Structured 2-Column Insight Panels */}
        <div className="report-dual-panels mt-4">
          <div className="dual-panel-card data-says-card">
            <div className="panel-top-row">
              <BarChart3 size={16} className="text-green" />
              <h4>What the Data Says</h4>
            </div>
            <p className="panel-body-text">{report.factualSummary}</p>
          </div>

          <div className="dual-panel-card attention-card">
            <div className="panel-top-row">
              <AlertTriangle size={16} className="text-orange" />
              <h4>What Needs Attention</h4>
            </div>
            <p className="panel-body-text">{report.whatNeedsAttention}</p>
          </div>
        </div>

        {/* Directive Callout Banner */}
        <div className="report-directive-box mt-4">
          <span className="directive-lead">Accountability Directive:</span>
          <p className="directive-quote">“{report.toughLoveDirective}”</p>
        </div>
      </div>

      {/* SECTION 3: COMMITMENT LONGEVITY & HEALTH BREAKDOWN TABLE */}
      <div className="structured-section-card mt-5">
        <div className="section-card-header">
          <div className="header-title-group">
            <TableIcon size={18} className="text-green" />
            <h3 className="section-title">Commitment Longevity & Health Breakdown (Audit Table)</h3>
          </div>
          <span className="badge-subtle">Every Commitment Gets a Row</span>
        </div>

        <div className="table-responsive-wrapper mt-2">
          <table className="accountability-table breakdown-table">
            <thead>
              <tr>
                <th style={{ minWidth: '220px' }}>Commitment (Banyan Tree)</th>
                <th style={{ width: '130px' }}>Category</th>
                <th style={{ width: '100px' }}>Age</th>
                <th style={{ width: '120px' }}>Current Streak</th>
                <th style={{ width: '120px' }}>Best Streak</th>
                <th style={{ width: '180px' }}>Execution Rate</th>
                <th style={{ width: '140px' }}>Total Completed</th>
                <th style={{ width: '110px' }}>Audit State</th>
              </tr>
            </thead>
            <tbody>
              {habitAnalytics.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty-table-cell">
                    <p>No active commitments planted yet.</p>
                  </td>
                </tr>
              ) : (
                habitAnalytics.map(h => (
                  <tr key={h.habitId}>
                    <td className="habit-name-cell">
                      <span className="tree-icon">🌳</span>
                      <strong className="habit-title-bold">{h.name}</strong>
                    </td>
                    <td>
                      <span className="category-pill-table">{h.category}</span>
                    </td>
                    <td className="age-cell">
                      {h.ageDays} {h.ageDays === 1 ? 'day' : 'days'}
                    </td>
                    <td>
                      <span className="streak-chip-table">🔥 {h.currentStreak}d</span>
                    </td>
                    <td>
                      <span className="best-streak-chip">🏆 {h.longestStreak}d</span>
                    </td>
                    <td>
                      <div className="table-progress-box">
                        <div className="mini-progress-track">
                          <div
                            className="mini-progress-bar bar-green"
                            style={{ width: `${h.completionRate}%` }}
                          />
                        </div>
                        <span className="mini-progress-text">{h.completionRate}%</span>
                      </div>
                    </td>
                    <td className="completed-cell">
                      <strong>{h.totalCompleted}</strong> {h.totalCompleted === 1 ? 'day' : 'days'}
                    </td>
                    <td>
                      <div className="lock-tag-table">
                        <Lock size={10} /> Immutable
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
