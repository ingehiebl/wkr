import React from 'react';
import type { ControlSettings, ReductionLevel } from '../../types';
import { CONTROL_REDUCTION_OPTIONS } from '../../constants';
import { calculateTotalReduction } from '../../utils/calculations';
import { Sun, Move } from 'lucide-react';
import './ControlSection.css';

interface ControlSectionProps {
  settings: ControlSettings;
  onChange: (settings: Partial<ControlSettings>) => void;
}

// C07: Von Boolean-Toggles zu 4-Level-Dropdowns geändert
export const ControlSection: React.FC<ControlSectionProps> = ({ settings, onChange }) => {
  const totalReduction = calculateTotalReduction(settings);

  return (
    <section className="card">
      <h2 className="card-title">Steuerung</h2>
      
      <div className="control-grid">
        {/* C07: Tageslichtsteuerung mit Dropdown */}
        <div className="control-item">
          <div className="control-info">
            <Sun className="control-icon" />
            <div>
              <div className="control-label">Tageslichtsteuerung</div>
              <div className="control-description">Reduktion durch Tageslichtnutzung</div>
            </div>
          </div>
          <select
            className="control-select"
            value={settings.daylightReductionPercent}
            onChange={(e) => onChange({ 
              daylightReductionPercent: Number(e.target.value) as ReductionLevel 
            })}
          >
            {CONTROL_REDUCTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* C07: Bewegungssteuerung mit Dropdown */}
        <div className="control-item">
          <div className="control-info">
            <Move className="control-icon" />
            <div>
              <div className="control-label">Bewegungssteuerung</div>
              <div className="control-description">Reduktion durch Präsenzerkennung</div>
            </div>
          </div>
          <select
            className="control-select"
            value={settings.motionReductionPercent}
            onChange={(e) => onChange({ 
              motionReductionPercent: Number(e.target.value) as ReductionLevel 
            })}
          >
            {CONTROL_REDUCTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {totalReduction > 0 && (
        <div className="control-summary">
          Gesamtreduktion durch Steuerung: <strong>{totalReduction}%</strong>
        </div>
      )}
    </section>
  );
};
