// ==========================================
// WATER BUCKET ANIMATION COMPONENT
// Sections 2, 23
// Physical watering bucket pouring water over the Banyan Tree
// ==========================================

import React, { useEffect, useState } from 'react';
import { Commitment } from '../../types';
import { Droplets, Sparkles, Sprout } from 'lucide-react';

interface WaterBucketAnimationProps {
  commitment: Commitment;
  streakCount: number;
  onAnimationComplete: () => void;
}

export const WaterBucketAnimation: React.FC<WaterBucketAnimationProps> = ({
  commitment,
  streakCount,
  onAnimationComplete
}) => {
  const [phase, setPhase] = useState<'appear' | 'pouring' | 'absorbing' | 'grown'>('appear');

  useEffect(() => {
    // Sequence timing:
    // 0ms: Bucket appears
    // 600ms: Bucket tilts & starts pouring droplets
    // 2200ms: Tree pulses and absorbs
    // 3400ms: Growth recorded & finish
    const t1 = setTimeout(() => setPhase('pouring'), 600);
    const t2 = setTimeout(() => setPhase('absorbing'), 2000);
    const t3 = setTimeout(() => setPhase('grown'), 3200);
    const t4 = setTimeout(() => onAnimationComplete(), 4200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onAnimationComplete]);

  return (
    <div className="water-bucket-modal-overlay">
      <div className="water-animation-card">
        {/* Status Phase Header */}
        <div className="water-phase-header">
          <span className="water-status-pill">
            <Droplets size={14} className="water-icon-pulse" />
            {phase === 'appear' && 'Water Bucket Arriving...'}
            {phase === 'pouring' && 'Pouring Nourishment over Banyan...'}
            {phase === 'absorbing' && 'Absorbing Water into Aerial Roots...'}
            {phase === 'grown' && '✓ Banyan Tree Flourishing & Growing!'}
          </span>
        </div>

        <h3 className="water-commitment-name">{commitment.name}</h3>

        {/* Animated Canvas / SVG Bucket & Tree Stage */}
        <div className="bucket-stage-container">
          {/* Animated Bucket */}
          <div className={`animated-bucket ${phase}`}>
            <div className="bucket-handle" />
            <div className="bucket-body">
              <span className="bucket-water-label">💧</span>
            </div>
            {/* Water Stream */}
            {(phase === 'pouring' || phase === 'absorbing') && (
              <div className="water-stream-flow">
                <div className="stream-line" />
                <div className="droplet d1">💧</div>
                <div className="droplet d2">💧</div>
                <div className="droplet d3">💧</div>
                <div className="droplet d4">💧</div>
              </div>
            )}
          </div>

          {/* Banyan Tree Representation */}
          <div className={`stage-banyan-tree ${phase}`}>
            <div className="banyan-canopy-glow" />
            <div className="banyan-tree-art">
              {/* Trunk & Aerial Roots SVG */}
              <svg viewBox="0 0 200 160" className="banyan-svg-preview">
                {/* Lateral Canopy */}
                <ellipse cx="100" cy="50" rx={phase === 'grown' ? 85 : 75} ry="35" fill="#2d6a4f" opacity="0.9" />
                <ellipse cx="65" cy="55" rx="45" ry="25" fill="#40916c" opacity="0.85" />
                <ellipse cx="135" cy="55" rx="45" ry="25" fill="#52b788" opacity="0.85" />
                <ellipse cx="100" cy="35" rx="55" ry="22" fill="#74c69d" opacity="0.75" />

                {/* Main Central Trunk */}
                <path d="M 85 160 L 92 75 L 108 75 L 115 160 Z" fill="#5c3d2e" />

                {/* Aerial Prop Roots descending to ground */}
                <path d="M 60 65 Q 58 110 55 160" stroke="#4a3525" strokeWidth="4" fill="none" />
                <path d="M 140 65 Q 142 110 145 160" stroke="#4a3525" strokeWidth="4" fill="none" />
                <path d="M 40 70 Q 42 115 45 160" stroke="#4a3525" strokeWidth="3" fill="none" opacity="0.8" />
                <path d="M 160 70 Q 158 115 155 160" stroke="#4a3525" strokeWidth="3" fill="none" opacity="0.8" />

                {/* Ground */}
                <line x1="10" y1="158" x2="190" y2="158" stroke="#1b4332" strokeWidth="4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Dynamic Philosophy Message */}
        <div className="water-message-box">
          {phase === 'grown' ? (
            <>
              <p className="water-success-text">
                <Sparkles size={16} /> “You watered it today. Keep going.”
              </p>
              <div className="water-stats-badges">
                <span className="badge-item">🔥 Streak: {streakCount} Days</span>
                <span className="badge-item">💧 Watered</span>
                <span className="badge-item">🌱 Growth Points +10</span>
              </div>
            </>
          ) : (
            <p className="water-waiting-text">
              “The Banyan grows from what you actually do.”
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
