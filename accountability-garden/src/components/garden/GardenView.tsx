// ==========================================
// FULL GARDEN GROVE VIEW
// Sections 30 - 41, 95, 104
// Interactive Canvas with Weather, Day/Night & Garden Stats
// ==========================================

import React, { useState } from 'react';
import { Commitment, DailyRecord } from '../../types';
import { GardenCanvas } from './GardenCanvas';
import { PlantDossierModal } from './PlantDossierModal';
import { BanyanEngine } from '../../services/banyanEngine';
import {
  CloudDrizzle,
  CloudSun,
  Eye,
  Filter,
  Maximize2,
  Moon,
  Sparkles,
  Sprout,
  Sun,
  Wind
} from 'lucide-react';

interface GardenViewProps {
  commitments: Commitment[];
  records: DailyRecord[];
  onArchiveCommitment: (id: string) => void;
  onCreateCommitmentClick: () => void;
}

export const GardenView: React.FC<GardenViewProps> = ({
  commitments,
  records,
  onArchiveCommitment,
  onCreateCommitmentClick
}) => {
  const [selectedCommitment, setSelectedCommitment] = useState<Commitment | null>(null);
  const [weather, setWeather] = useState<'auto' | 'clear' | 'rain' | 'snow' | 'fireflies'>('auto');
  const [timeOfDay, setTimeOfDay] = useState<'auto' | 'day' | 'evening' | 'night' | 'morning'>('auto');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const activeCommitments = commitments.filter(c => !c.isArchived);
  const filteredCommitments = categoryFilter === 'ALL'
    ? activeCommitments
    : activeCommitments.filter(c => c.category === categoryFilter);

  const categories = Array.from(new Set(activeCommitments.map(c => c.category)));

  // Section 104: Garden Statistics
  const gardenStats = React.useMemo(() => {
    let totalGrowthPoints = 0;
    let totalHealth = 0;
    let healthyCount = 0;
    let strugglingCount = 0;
    let largestTree = 'None';
    let maxStage = 0;

    activeCommitments.forEach(c => {
      const state = BanyanEngine.calculateBanyanGrowth(c, records);
      totalGrowthPoints += state.growthPoints;
      totalHealth += state.healthPercent;
      if (state.healthPercent >= 70) healthyCount++;
      if (state.healthPercent < 40) strugglingCount++;
      if (state.stageIndex > maxStage) {
        maxStage = state.stageIndex;
        largestTree = c.name;
      }
    });

    const avgHealth = activeCommitments.length > 0
      ? Math.round(totalHealth / activeCommitments.length)
      : 100;

    return {
      totalPlants: activeCommitments.length,
      healthyCount,
      strugglingCount,
      avgHealth,
      totalGrowthPoints,
      largestTree
    };
  }, [activeCommitments, records]);

  return (
    <div className="full-garden-view-container">
      {/* Top Controls Toolbar */}
      <div className="garden-toolbar-card">
        <div className="toolbar-left">
          <div className="garden-title-chip">
            <Sprout size={16} className="sprout-icon" />
            <span>Living Grove ({activeCommitments.length} Plants)</span>
          </div>

          <div className="toolbar-filter-wrap">
            <label htmlFor="garden-category-select" className="filter-label">Filter:</label>
            <select
              id="garden-category-select"
              className="form-select select-compact"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Atmosphere / Environment Overrides */}
        <div className="toolbar-right">
          {/* Time of day toggle */}
          <div className="control-button-group">
            <button
              className={`ctrl-btn ${timeOfDay === 'auto' ? 'active' : ''}`}
              onClick={() => setTimeOfDay('auto')}
              title="Sync with local time"
            >
              Auto Time
            </button>
            <button
              className={`ctrl-btn ${timeOfDay === 'day' ? 'active' : ''}`}
              onClick={() => setTimeOfDay('day')}
              title="Sunny Day lighting"
            >
              <Sun size={14} />
            </button>
            <button
              className={`ctrl-btn ${timeOfDay === 'night' ? 'active' : ''}`}
              onClick={() => setTimeOfDay('night')}
              title="Midnight Starlight lighting"
            >
              <Moon size={14} />
            </button>
          </div>

          {/* Weather toggle */}
          <div className="control-button-group">
            <button
              className={`ctrl-btn ${weather === 'auto' ? 'active' : ''}`}
              onClick={() => setWeather('auto')}
              title="Auto weather"
            >
              Auto Weather
            </button>
            <button
              className={`ctrl-btn ${weather === 'rain' ? 'active' : ''}`}
              onClick={() => setWeather('rain')}
              title="Rain simulation"
            >
              <CloudDrizzle size={14} />
            </button>
            <button
              className={`ctrl-btn ${weather === 'fireflies' ? 'active' : ''}`}
              onClick={() => setWeather('fireflies')}
              title="Glowing Fireflies"
            >
              <Sparkles size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Garden Canvas */}
      <div className="garden-canvas-main-wrap">
        <GardenCanvas
          commitments={filteredCommitments}
          records={records}
          onSelectCommitment={c => setSelectedCommitment(c)}
          selectedCommitmentId={selectedCommitment?.id}
          weatherOverride={weather}
          timeOfDayOverride={timeOfDay}
        />
      </div>

      {/* Garden Statistics Dashboard Bar (Section 104) */}
      <div className="garden-stats-strip mt-3">
        <div className="stat-strip-item">
          <span className="strip-label">Total Living Plants</span>
          <span className="strip-val">{gardenStats.totalPlants}</span>
        </div>
        <div className="stat-strip-item">
          <span className="strip-label">Average Canopy Health</span>
          <span className="strip-val text-green">{gardenStats.avgHealth}%</span>
        </div>
        <div className="stat-strip-item">
          <span className="strip-label">Healthy Plants (≥70%)</span>
          <span className="strip-val">{gardenStats.healthyCount}</span>
        </div>
        <div className="stat-strip-item">
          <span className="strip-label">Cumulative Growth Points</span>
          <span className="strip-val">{gardenStats.totalGrowthPoints}</span>
        </div>
        <div className="stat-strip-item">
          <span className="strip-label">Most Mature Specimen</span>
          <span className="strip-val truncate-val">{gardenStats.largestTree}</span>
        </div>
      </div>

      {/* Plant Dossier Inspection Modal */}
      {selectedCommitment && (
        <PlantDossierModal
          commitment={selectedCommitment}
          records={records}
          onClose={() => setSelectedCommitment(null)}
          onArchive={onArchiveCommitment}
        />
      )}
    </div>
  );
};
