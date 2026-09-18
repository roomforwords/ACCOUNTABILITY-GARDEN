// ==========================================
// BANYAN TREE DOSSIER MODAL
// Sections 13, 14, 16, 23
// Continuous Growth, Watering History, Aerial Roots & Permanent Break History
// ==========================================

import React from 'react';
import { Commitment, DailyRecord } from '../../types';
import { BanyanEngine } from '../../services/banyanEngine';
import { calculateHabitStreaks } from '../../services/streakEngine';
import { getLocalDateString } from '../../utils/dateUtils';
import {
  AlertTriangle,
  Archive,
  Calendar,
  CheckCircle2,
  Droplets,
  Flame,
  GitCommit,
  Heart,
  Lock,
  ShieldCheck,
  Sparkles,
  Sprout,
  X
} from 'lucide-react';

interface PlantDossierModalProps {
  commitment: Commitment | null;
  records: DailyRecord[];
  onClose: () => void;
  onArchive: (id: string) => void;
  onSelectDateView?: (habitId: string) => void;
}

export const PlantDossierModal: React.FC<PlantDossierModalProps> = ({
  commitment,
  records,
  onClose,
  onArchive
}) => {
  if (!commitment) return null;

  const todayStr = getLocalDateString();
  const banyan = BanyanEngine.calculateBanyanGrowth(commitment, records, todayStr);
  const streaks = calculateHabitStreaks(commitment, records, todayStr);

  // Filter records for this commitment (descending)
  const habitRecords = records
    .filter(r => r.habitId === commitment.id)
    .sort((a, b) => b.recordDate.localeCompare(a.recordDate));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content plant-dossier-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="dossier-header">
          <div className="dossier-archetype-badge">
            <span className="plant-archetype-tag">🌳 Dedicated Banyan Tree</span>
            <span className="stage-pill">{banyan.stage}</span>
            {banyan.isWateredToday && (
              <span className="watered-pill">💧 Watered Today</span>
            )}
          </div>
          <button className="icon-btn close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Title & Philosophy */}
        <div className="dossier-title-section">
          <h2 className="dossier-name">{commitment.name}</h2>
          {commitment.description && (
            <p className="dossier-desc">{commitment.description}</p>
          )}
          <div className="immutability-badge">
            <Lock size={13} />
            <span>Age: <strong>{streaks.commitmentAgeDays} days</strong> • Planted {new Date(commitment.createdAt).toLocaleDateString()} • Cannot be deleted</span>
          </div>
        </div>

        {/* Core Stats Grid */}
        <div className="dossier-stats-grid">
          <div className="stat-card">
            <div className="stat-icon-label">
              <Flame size={16} className="flame-accent" />
              <span>Current Streak</span>
            </div>
            <div className="stat-val">{streaks.currentStreak} <small>days</small></div>
            <div className="stat-sub">Best: {streaks.longestStreak} days</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-label">
              <Heart size={16} className="heart-accent" />
              <span>Tree Health</span>
            </div>
            <div className="stat-val">{banyan.healthPercent}%</div>
            <div className="stat-sub">{banyan.healthState} (recent watering)</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-label">
              <Sparkles size={16} className="growth-accent" />
              <span>Growth Points</span>
            </div>
            <div className="stat-val">{banyan.growthPoints} <small>pts</small></div>
            <div className="stat-sub">Stage {banyan.stageIndex} • Infinite Scale</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-label">
              <Sprout size={16} className="roots-accent" />
              <span>Root Architecture</span>
            </div>
            <div className="stat-val">{banyan.aerialRootsCount} <small>roots</small></div>
            <div className="stat-sub">{banyan.pillarTrunksCount} secondary pillar trunks</div>
          </div>
        </div>

        {/* Visual Watering History (Section 13) */}
        <div className="dossier-section">
          <div className="section-title-row">
            <h4 className="section-title">Visual Watering History (Locked & Immutable)</h4>
            <span className="subtle-tag">“I showed up today”</span>
          </div>

          {habitRecords.length === 0 ? (
            <p className="empty-subtext">No watering events recorded yet. Mark today as DONE to pour the first bucket.</p>
          ) : (
            <div className="watering-history-grid">
              {habitRecords.slice(0, 14).map(rec => (
                <div key={rec.id} className={`watering-day-chip status-${rec.status.toLowerCase()}`}>
                  <span className="wd-date">{rec.recordDate.slice(5)}</span>
                  <span className="wd-icon">
                    {rec.status === 'COMPLETED' && '💧 Watered'}
                    {rec.status === 'MISSED' && '❌ Missed'}
                    {rec.status === 'FROZEN' && '🧊 Frozen'}
                    {rec.status === 'PARTIAL' && '◑ Partial'}
                  </span>
                  <Lock size={10} className="lock-subtle" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tree Growth Timeline (Section 14) */}
        <div className="dossier-section">
          <h4 className="section-title">Banyan Growth Timeline (Continues Indefinitely)</h4>
          <div className="milestones-timeline">
            {banyan.milestones.map((m, idx) => (
              <div key={idx} className="milestone-item">
                <div className="milestone-dot" />
                <div className="milestone-content">
                  <span className="milestone-stage">🌳 {m.stage}</span>
                  <span className="milestone-date">{m.unlockedAt ? new Date(m.unlockedAt).toLocaleDateString() : 'Active'}</span>
                  {m.notes && <p className="milestone-notes">{m.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Streak Break & Recovery History (Sections 4 & 23: NEVER REMOVE PREVIOUS BREAKS) */}
        <div className="dossier-section">
          <div className="section-title-row">
            <h4 className="section-title">Recovery & Streak Break History</h4>
            <span className="permanent-badge">{streaks.brokenStreaksCount} previous breaks recorded</span>
          </div>

          {streaks.breakRecords && streaks.breakRecords.length > 0 ? (
            <div className="break-history-list">
              {streaks.breakRecords.map((brk, bIdx) => (
                <div key={brk.id || bIdx} className="break-history-item">
                  <div className="break-item-header">
                    <span className="break-tag">Break #{bIdx + 1} → {brk.breakDate}</span>
                    <span className="break-prev-streak">Ended {brk.previousStreak}-day streak</span>
                  </div>
                  {brk.recoveryDate ? (
                    <div className="break-recovered-note text-green">
                      ✓ Recovered on {brk.recoveryDate} (Banyan began growing again)
                    </div>
                  ) : (
                    <div className="break-recovered-note text-orange">
                      🌱 Currently in recovery phase
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-subtext">No streak breaks recorded yet. Unbroken consistency maintains dense foliage.</p>
          )}
        </div>

        {/* Archive Footer (No Delete!) */}
        <div className="dossier-footer">
          <div className="archive-philosophy-notice">
            <AlertTriangle size={15} />
            <span>Archiving removes this work from the active Today list. The dedicated Banyan Tree and entire watering history remain permanently recorded.</span>
          </div>

          {!commitment.isArchived ? (
            <button
              className="btn btn-secondary btn-archive"
              onClick={() => {
                if (window.confirm(`Archive "${commitment.name}"? The Banyan Tree and history will remain permanent.`)) {
                  onArchive(commitment.id);
                  onClose();
                }
              }}
            >
              <Archive size={16} />
              Archive Commitment
            </button>
          ) : (
            <div className="archived-tag-box">
              <Archive size={14} /> Archived on {commitment.archivedAt?.slice(0, 10)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
