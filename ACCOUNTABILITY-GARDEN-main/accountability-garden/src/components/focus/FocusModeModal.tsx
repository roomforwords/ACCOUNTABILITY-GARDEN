// ==========================================
// FOCUS MODE (DISTRACTION-FREE POMODORO)
// Section 107
// ==========================================

import React, { useState, useEffect } from 'react';
import { Commitment } from '../../types';
import { CheckCircle2, Clock, Pause, Play, RotateCcw, Volume2, X } from 'lucide-react';

interface FocusModeModalProps {
  commitment: Commitment | null;
  onClose: () => void;
  onSessionComplete: (minutes: number) => void;
}

export const FocusModeModal: React.FC<FocusModeModalProps> = ({
  commitment,
  onClose,
  onSessionComplete
}) => {
  if (!commitment) return null;

  const [sessionDurationMinutes, setSessionDurationMinutes] = useState<number>(25);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [completedMinutes, setCompletedMinutes] = useState<number>(0);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(sec => sec - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isActive) {
      setIsActive(false);
      const minutesSpent = sessionDurationMinutes;
      setCompletedMinutes(m => m + minutesSpent);
      onSessionComplete(minutesSpent);
    }

    return () => clearInterval(interval);
  }, [isActive, secondsRemaining, sessionDurationMinutes, onSessionComplete]);

  const selectPreset = (mins: number) => {
    setIsActive(false);
    setSessionDurationMinutes(mins);
    setSecondsRemaining(mins * 60);
  };

  const toggleTimer = () => {
    setIsActive(prev => !prev);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsRemaining(sessionDurationMinutes * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = 100 - (secondsRemaining / (sessionDurationMinutes * 60)) * 100;

  return (
    <div className="focus-mode-overlay">
      <div className="focus-container">
        {/* Top bar */}
        <div className="focus-header">
          <div className="focus-badge">
            <Clock size={15} />
            <span>Deep Execution Cockpit</span>
          </div>
          <button className="icon-btn focus-close-btn" onClick={onClose} aria-label="Exit Focus Mode">
            <X size={20} />
          </button>
        </div>

        {/* Commitment details */}
        <div className="focus-target-box">
          <span className="focus-category-tag">{commitment.category}</span>
          <h2 className="focus-commitment-title">{commitment.name}</h2>
          {commitment.description && (
            <p className="focus-commitment-desc">{commitment.description}</p>
          )}
        </div>

        {/* Circular Timer Visual */}
        <div className="focus-timer-visual">
          <div className="focus-timer-ring">
            <div className="timer-number">{formatTime(secondsRemaining)}</div>
            <span className="timer-status-sub">{isActive ? 'Execution in progress' : 'Paused / Ready'}</span>
          </div>
        </div>

        {/* Presets (Section 107: 25/5, 50/10, Custom) */}
        <div className="focus-presets-row">
          {[15, 25, 50, 90].map(mins => (
            <button
              key={mins}
              className={`preset-btn ${sessionDurationMinutes === mins ? 'active' : ''}`}
              onClick={() => selectPreset(mins)}
            >
              {mins} min
            </button>
          ))}
        </div>

        {/* Primary Controls */}
        <div className="focus-controls-row">
          <button className="btn focus-control-btn reset-btn" onClick={resetTimer} title="Reset Timer">
            <RotateCcw size={18} />
          </button>

          <button className="btn focus-primary-play-btn" onClick={toggleTimer}>
            {isActive ? <Pause size={24} /> : <Play size={24} />}
            <span>{isActive ? 'Pause' : 'Start Focus'}</span>
          </button>

          <button
            className="btn focus-control-btn complete-btn"
            onClick={() => {
              const minutes = Math.ceil((sessionDurationMinutes * 60 - secondsRemaining) / 60);
              onSessionComplete(Math.max(1, minutes));
              onClose();
            }}
            title="Conclude and Log Session"
          >
            <CheckCircle2 size={18} />
          </button>
        </div>

        <div className="focus-philosophy-footer">
          <p>“You don't need another plan. You need to do what you already decided.”</p>
        </div>
      </div>
    </div>
  );
};
