// ==========================================
// CREATE COMMITMENT MODAL
// Sections 5, 6 & Banyan Tree System
// Every Work = One Dedicated Banyan Tree
// ==========================================

import React, { useState } from 'react';
import {
  AccountabilityMode,
  Category,
  Commitment,
  FrequencyType,
  Priority,
  TrackingType
} from '../../types';
import { AlertCircle, Droplets, Lock, ShieldAlert, Sprout, X } from 'lucide-react';

interface CreateCommitmentModalProps {
  onClose: () => void;
  onCreate: (commitment: Omit<Commitment, 'id' | 'createdAt' | 'isArchived' | 'plantType'>) => void;
  userId: string;
}

const CATEGORIES: Category[] = [
  'Study',
  'Coding',
  'Blockchain',
  'Fitness',
  'Reading',
  'Health',
  'Finance',
  'Work',
  'Personal',
  'Creativity',
  'Other'
];

export const CreateCommitmentModal: React.FC<CreateCommitmentModalProps> = ({
  onClose,
  onCreate,
  userId
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Study');
  const [customCategory, setCustomCategory] = useState('');
  const [priority, setPriority] = useState<Priority>('High');
  const [trackingType, setTrackingType] = useState<TrackingType>('DONE_NOT_DONE');
  const [goalValue, setGoalValue] = useState<number>(30);
  const [goalUnit, setGoalUnit] = useState<string>('minutes');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState<string>('');
  const [deadlineTime, setDeadlineTime] = useState<string>('23:59');
  const [toughLoveMode, setToughLoveMode] = useState<AccountabilityMode>('Direct');
  const [notes, setNotes] = useState('');

  const [understandsPermanence, setUnderstandsPermanence] = useState(false);
  const [showConfirmationStep, setShowConfirmationStep] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProceedToConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a commitment name.');
      return;
    }
    setError(null);
    setShowConfirmationStep(true);
  };

  const handleFinalSubmit = () => {
    if (!understandsPermanence) {
      setError('You must acknowledge that daily records are permanent.');
      return;
    }

    const finalCategory = category === 'Other' && customCategory.trim() ? customCategory.trim() : category;

    onCreate({
      userId,
      name: name.trim(),
      description: description.trim() || undefined,
      category: finalCategory,
      priority,
      trackingType,
      goalValue: trackingType !== 'YES_NO' && trackingType !== 'DONE_NOT_DONE' ? goalValue : undefined,
      goalUnit: trackingType !== 'YES_NO' && trackingType !== 'DONE_NOT_DONE' ? goalUnit : undefined,
      frequency: {
        type: frequencyType,
        daysOfWeek: frequencyType === 'specific_days' ? selectedDays : undefined
      },
      startDate,
      deadlineDate: hasDeadline && deadlineDate ? deadlineDate : undefined,
      deadlineTime: hasDeadline && deadlineDate ? deadlineTime : undefined,
      toughLoveMode,
      notes: notes.trim() || undefined
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content commitment-form-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-title-box">
            <Lock size={18} className="lock-accent" />
            <h3>Establish Commitment & Plant Banyan Tree</h3>
          </div>
          <button className="icon-btn close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {!showConfirmationStep ? (
          <form onSubmit={handleProceedToConfirmation} className="commitment-form">
            {error && (
              <div className="form-error-alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Banyan Tree Guarantee Card */}
            <div className="banyan-assignment-banner">
              <div className="banyan-banner-icon">🌳</div>
              <div className="banyan-banner-text">
                <strong>One Work = One Dedicated Banyan Tree</strong>
                <p>This commitment will be permanently represented by its own living Banyan Tree. Every day you show up, you water it; every day you stay consistent, its aerial roots and canopy expand.</p>
              </div>
            </div>

            {/* Commitment Name */}
            <div className="form-group mt-3">
              <label htmlFor="commit-name">Commitment / Work Title *</label>
              <input
                id="commit-name"
                type="text"
                className="form-input"
                placeholder="e.g. Study Blockchain & Cairo"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="commit-desc">Purpose & Core Objective</label>
              <textarea
                id="commit-desc"
                className="form-textarea"
                rows={2}
                placeholder="What reality must be recorded every scheduled day?"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            {/* Category & Priority */}
            <div className="form-row">
              <div className="form-group flex-1">
                <label>Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={e => setCategory(e.target.value as Category)}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {category === 'Other' && (
                <div className="form-group flex-1">
                  <label>Custom Category</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Distributed Systems"
                    value={customCategory}
                    onChange={e => setCustomCategory(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group flex-1">
                <label>Priority</label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={e => setPriority(e.target.value as Priority)}
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            {/* Tracking Mode */}
            <div className="form-group">
              <label>Daily Execution Mode</label>
              <div className="tracking-type-grid">
                {[
                  { id: 'DONE_NOT_DONE', label: 'DONE / NOT DONE' },
                  { id: 'YES_NO', label: 'YES / NO' },
                  { id: 'GOAL', label: 'GOAL (Target vs Actual)' },
                  { id: 'QUANTITY', label: 'QUANTITY (e.g. Pushups)' },
                  { id: 'TIME', label: 'TIME (e.g. Minutes)' },
                  { id: 'PERCENTAGE', label: 'PERCENTAGE (%)' }
                ].map(item => (
                  <button
                    type="button"
                    key={item.id}
                    className={`choice-card ${trackingType === item.id ? 'active' : ''}`}
                    onClick={() => setTrackingType(item.id as TrackingType)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantitative Target */}
            {trackingType !== 'YES_NO' && trackingType !== 'DONE_NOT_DONE' && (
              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Target Value</label>
                  <input
                    type="number"
                    className="form-input"
                    value={goalValue}
                    onChange={e => setGoalValue(Number(e.target.value))}
                    min={1}
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Goal Unit</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="minutes, reps, pages"
                    value={goalUnit}
                    onChange={e => setGoalUnit(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Frequency */}
            <div className="form-row">
              <div className="form-group flex-1">
                <label>Frequency</label>
                <select
                  className="form-select"
                  value={frequencyType}
                  onChange={e => setFrequencyType(e.target.value as FrequencyType)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekdays">Weekdays (Mon-Fri)</option>
                  <option value="weekends">Weekends (Sat-Sun)</option>
                  <option value="specific_days">Specific Days</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="form-group flex-1">
                <label>Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
            </div>

            {/* Deadline */}
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={hasDeadline}
                  onChange={e => setHasDeadline(e.target.checked)}
                />
                <span>Set a specific deadline for this commitment</span>
              </label>

              {hasDeadline && (
                <div className="form-row mt-2">
                  <input
                    type="date"
                    className="form-input flex-1"
                    value={deadlineDate}
                    onChange={e => setDeadlineDate(e.target.value)}
                    required={hasDeadline}
                  />
                  <input
                    type="time"
                    className="form-input"
                    value={deadlineTime}
                    onChange={e => setDeadlineTime(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Accountability Tone */}
            <div className="form-group">
              <label>Accountability Tone</label>
              <select
                className="form-select"
                value={toughLoveMode}
                onChange={e => setToughLoveMode(e.target.value as AccountabilityMode)}
              >
                <option value="Gentle">Gentle</option>
                <option value="Direct">Direct (Recommended)</option>
                <option value="Tough Love">Tough Love</option>
                <option value="Silent">Silent</option>
              </select>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Continue to Permanence Verification →
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: DECLARATION OF PERMANENCE */
          <div className="confirmation-step">
            <div className="permanence-warning-banner">
              <ShieldAlert size={36} className="warning-icon" />
              <h4>Declaration of Permanence</h4>
              <p className="philosophy-quote">
                “Once you create this commitment, its history cannot be rewritten.”
              </p>
              <p className="philosophy-sub">
                “You can fail it. You can archive it. But you cannot erase what happened.”
              </p>
            </div>

            <div className="confirmation-details-box">
              <div className="conf-item">
                <span className="conf-label">Work / Commitment:</span>
                <span className="conf-val">{name}</span>
              </div>
              <div className="conf-item">
                <span className="conf-label">Living Representation:</span>
                <span className="conf-val">🌳 Dedicated Banyan Tree</span>
              </div>
              <div className="conf-item">
                <span className="conf-label">Daily Rule:</span>
                <span className="conf-val">Water bucket on completion • Shrink on missed days</span>
              </div>
            </div>

            {error && (
              <div className="form-error-alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="acknowledgement-box">
              <label className="checkbox-label checkbox-prominent">
                <input
                  type="checkbox"
                  checked={understandsPermanence}
                  onChange={e => {
                    setUnderstandsPermanence(e.target.checked);
                    if (e.target.checked) setError(null);
                  }}
                />
                <span>I understand that every daily watering and missed record is permanent and cannot be altered.</span>
              </label>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowConfirmationStep(false)}
              >
                ← Back
              </button>
              <button
                type="button"
                className="btn btn-primary btn-commit-lock"
                disabled={!understandsPermanence}
                onClick={handleFinalSubmit}
              >
                <Lock size={16} />
                PLANT BANYAN SEED & LOCK COMMITMENT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
