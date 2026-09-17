// ==========================================
// STREAK HEATMAP (GITHUB-STYLE)
// Section 24
// ==========================================

import React, { useState } from 'react';
import { Commitment, DailyRecord } from '../../types';
import { generateHeatmapGrid, HeatmapCell } from '../../services/streakEngine';
import { Lock, Snowflake, Check, X } from 'lucide-react';

interface StreakHeatmapProps {
  commitment: Commitment;
  records: DailyRecord[];
  daysCount?: number;
}

export const StreakHeatmap: React.FC<StreakHeatmapProps> = ({
  commitment,
  records,
  daysCount = 120
}) => {
  const referenceDateStr = '2026-09-17';
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);

  const cells = React.useMemo(() => {
    return generateHeatmapGrid(commitment, records, daysCount, referenceDateStr);
  }, [commitment, records, daysCount]);

  // Group into columns of 7 (Sunday to Saturday)
  const columns: HeatmapCell[][] = [];
  let currentWeek: HeatmapCell[] = [];

  cells.forEach((cell, idx) => {
    currentWeek.push(cell);
    if (currentWeek.length === 7 || idx === cells.length - 1) {
      columns.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <div className="heatmap-container">
      <div className="heatmap-header-row">
        <h4 className="heatmap-title">Contribution Grid (Last {daysCount} Days)</h4>
        <div className="heatmap-legend">
          <div className="legend-item"><span className="legend-cell cell-empty" /> Not Scheduled</div>
          <div className="legend-item"><span className="legend-cell cell-completed" /> Completed</div>
          <div className="legend-item"><span className="legend-cell cell-missed" /> Missed</div>
          <div className="legend-item"><span className="legend-cell cell-frozen" /> Frozen 🧊</div>
        </div>
      </div>

      <div className="heatmap-scroll-area">
        <div className="heatmap-grid">
          {columns.map((week, wIdx) => (
            <div key={wIdx} className="heatmap-week-column">
              {week.map(cell => {
                let cellClass = 'cell-empty';
                if (cell.status === 'COMPLETED') cellClass = 'cell-completed';
                else if (cell.status === 'MISSED') cellClass = 'cell-missed';
                else if (cell.status === 'FROZEN') cellClass = 'cell-frozen';
                else if (cell.status === 'PARTIAL') cellClass = 'cell-partial';

                return (
                  <div
                    key={cell.date}
                    className={`heatmap-cell ${cellClass} ${selectedCell?.date === cell.date ? 'selected' : ''}`}
                    onClick={() => setSelectedCell(cell)}
                    title={`${cell.date}: ${cell.status}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Cell Popover Inspection (Read-Only) */}
      {selectedCell && (
        <div className="heatmap-inspector-card">
          <div className="inspector-top">
            <span className="inspector-date">{selectedCell.date}</span>
            <span className={`inspector-status status-${selectedCell.status.toLowerCase()}`}>
              {selectedCell.status === 'COMPLETED' && '✓ Completed'}
              {selectedCell.status === 'MISSED' && '✕ Missed'}
              {selectedCell.status === 'FROZEN' && '🧊 Streak Freeze'}
              {selectedCell.status === 'NOT_SCHEDULED' && '— Not Scheduled'}
              {selectedCell.status === 'PENDING' && 'Pending Check-in'}
            </span>
          </div>

          {selectedCell.record && (
            <div className="inspector-details">
              <div className="immutability-pill">
                <Lock size={12} />
                <span>Locked at {new Date(selectedCell.record.lockedAt).toLocaleTimeString()}</span>
              </div>
              {selectedCell.record.notes && (
                <p className="inspector-note">"{selectedCell.record.notes}"</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
