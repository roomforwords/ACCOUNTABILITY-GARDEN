// ==========================================
// POST-CHECKIN REFLECTION MODAL
// Sections 16 - 20: Mood, Energy, Difficulty, Reflections
// ==========================================

import React, { useState } from 'react';
import { Difficulty, Mood } from '../../types';
import { CheckCircle2, Lock, Sparkles, X } from 'lucide-react';

interface PostCheckinModalProps {
  habitName: string;
  status: 'COMPLETED' | 'MISSED' | 'PARTIAL' | 'FROZEN';
  onClose: () => void;
  onSubmitReflection: (reflectionData: {
    notes?: string;
    mood?: Mood;
    energyLevel?: number;
    difficulty?: Difficulty;
    reflection?: {
      completedText?: string;
      avoidedText?: string;
      reasonMissed?: string;
      wentWell?: string;
      improveTomorrow?: string;
    };
  }) => void;
}

const MOODS: { mood: Mood; icon: string }[] = [
  { mood: 'Great', icon: '😄' },
  { mood: 'Good', icon: '🙂' },
  { mood: 'Neutral', icon: '😐' },
  { mood: 'Low', icon: '😔' },
  { mood: 'Difficult', icon: '😣' }
];

export const PostCheckinModal: React.FC<PostCheckinModalProps> = ({
  habitName,
  status,
  onClose,
  onSubmitReflection
}) => {
  const [mood, setMood] = useState<Mood>('Good');
  const [energyLevel, setEnergyLevel] = useState<number>(4);
  const [difficulty, setDifficulty] = useState<Difficulty>('Normal');
  const [notes, setNotes] = useState('');
  const [avoidedText, setAvoidedText] = useState('');
  const [improveTomorrow, setImproveTomorrow] = useState('');
  const [showDetailedReflection, setShowDetailedReflection] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReflection({
      notes: notes.trim() || undefined,
      mood,
      energyLevel,
      difficulty,
      reflection: showDetailedReflection ? {
        avoidedText: avoidedText.trim() || undefined,
        improveTomorrow: improveTomorrow.trim() || undefined
      } : undefined
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content reflection-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-title-box">
            <Lock size={16} className="lock-accent" />
            <h3>Daily Context & Reflection</h3>
          </div>
          <button className="icon-btn close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="reflection-subhead">
          <span className={`status-pill pill-${status.toLowerCase()}`}>
            {status === 'COMPLETED' ? '✓ Completed' : status === 'MISSED' ? '✕ Missed' : status}
          </span>
          <span className="reflection-habit-title">{habitName}</span>
        </div>

        <form onSubmit={handleSubmit} className="reflection-form">
          {/* Mood Selector (Section 17) */}
          <div className="form-group">
            <label className="section-label">State of Mind (Mood)</label>
            <div className="mood-selector-row">
              {MOODS.map(m => (
                <button
                  type="button"
                  key={m.mood}
                  className={`mood-btn ${mood === m.mood ? 'active' : ''}`}
                  onClick={() => setMood(m.mood)}
                >
                  <span className="mood-emoji">{m.icon}</span>
                  <span className="mood-label">{m.mood}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Energy Level (Section 18: 1 - 5) */}
          <div className="form-group">
            <label className="section-label">Energy Level: {energyLevel} / 5</label>
            <div className="energy-scale-row">
              {[1, 2, 3, 4, 5].map(lvl => (
                <button
                  type="button"
                  key={lvl}
                  className={`energy-btn ${energyLevel === lvl ? 'active' : ''}`}
                  onClick={() => setEnergyLevel(lvl)}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty (Section 19) */}
          <div className="form-group">
            <label className="section-label">Execution Difficulty</label>
            <div className="difficulty-grid">
              {(['Easy', 'Normal', 'Hard', 'Very Hard'] as Difficulty[]).map(d => (
                <button
                  type="button"
                  key={d}
                  className={`choice-btn ${difficulty === d ? 'active' : ''}`}
                  onClick={() => setDifficulty(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Notes: What happened today? (Section 16) */}
          <div className="form-group">
            <label className="section-label">What happened today? (Notes)</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder={status === 'MISSED' ? 'Record the real friction or reason without excuse...' : 'Key takeaways, focus depth, or milestones...'}
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {/* Optional Reflection Questions Toggle (Section 20) */}
          {!showDetailedReflection ? (
            <button
              type="button"
              className="text-btn add-reflection-toggle"
              onClick={() => setShowDetailedReflection(true)}
            >
              <Sparkles size={14} /> Add deep reflection questions...
            </button>
          ) : (
            <div className="deep-reflection-box">
              <div className="form-group">
                <label>What did I avoid or postpone?</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Specific task or hesitation..."
                  value={avoidedText}
                  onChange={e => setAvoidedText(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>What must improve tomorrow?</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="One concrete behavioral adjustment..."
                  value={improveTomorrow}
                  onChange={e => setImproveTomorrow(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="immutability-notice-small">
            <Lock size={12} />
            <span>Once submitted, this note is permanently locked into your life archive.</span>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Skip / Leave Blank
            </button>
            <button type="submit" className="btn btn-primary">
              <Lock size={15} />
              Save & Lock Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
