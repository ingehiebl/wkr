import React from 'react';
import type { ProjectData } from '../../types';
import { ROOM_USAGE_OPTIONS, CO2_SOURCE_OPTIONS } from '../../constants';
import { HelpCircle } from 'lucide-react';
import './ProjectDataSection.css';

interface ProjectDataSectionProps {
  data: ProjectData;
  onChange: (data: Partial<ProjectData>) => void;
}

export const ProjectDataSection: React.FC<ProjectDataSectionProps> = ({ data, onChange }) => {
  const handleRoomUsageChange = (value: string) => {
    const option = ROOM_USAGE_OPTIONS.find(o => o.label === value);
    onChange({
      roomUsage: value,
      annualOperatingHours: option?.hoursPerYear ?? data.annualOperatingHours,
    });
  };

  const handleCo2SourceChange = (value: string) => {
    const option = CO2_SOURCE_OPTIONS.find(o => o.label === value);
    onChange({
      co2Source: value,
      co2FactorGPerKwh: option?.factorGPerKwh ?? data.co2FactorGPerKwh,
    });
  };

  const isCustomRoomUsage = data.roomUsage === 'Benutzerdefiniert';
  const isCustomCo2 = data.co2Source === 'Benutzerdefiniert';

  return (
    <section className="card">
      <h2 className="card-title">Projektdaten</h2>
      
      <div className="project-grid">
        <div className="form-group">
          <label className="form-label">Projektname</label>
          <input
            type="text"
            className="form-input"
            value={data.projectName}
            onChange={(e) => onChange({ projectName: e.target.value })}
            placeholder="Beleuchtungsprojekt..."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Raumnutzung</label>
          <select
            className="form-select"
            value={data.roomUsage}
            onChange={(e) => handleRoomUsageChange(e.target.value)}
          >
            {ROOM_USAGE_OPTIONS.map((option) => (
              <option key={option.label} value={option.label}>
                {option.label}{option.hoursPerYear ? ` (${option.hoursPerYear} h/Jahr)` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            Betriebsstunden
            <span className="tooltip-trigger">
              <HelpCircle size={14} className="tooltip-icon" />
            </span>
          </label>
          <div className="input-with-unit">
            <input
              type="number"
              className="form-input"
              value={data.annualOperatingHours}
              onChange={(e) => onChange({ annualOperatingHours: Number(e.target.value) })}
              disabled={!isCustomRoomUsage}
              min={0}
            />
            <span className="input-unit">h/Jahr</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Strompreis</label>
          <div className="input-with-unit">
            <input
              type="number"
              className="form-input"
              value={data.electricityPriceEur}
              onChange={(e) => onChange({ electricityPriceEur: Number(e.target.value) })}
              step={0.01}
              min={0}
            />
            <span className="input-unit">EUR/kWh</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Wartungskosten Bestand</label>
          <div className="input-with-unit">
            <input
              type="number"
              className="form-input"
              value={data.maintenanceCostExistingEur}
              onChange={(e) => onChange({ maintenanceCostExistingEur: Number(e.target.value) })}
              min={0}
            />
            <span className="input-unit">EUR/Jahr</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Wartungskosten Neu</label>
          <div className="input-with-unit">
            <input
              type="number"
              className="form-input"
              value={data.maintenanceCostNewEur}
              onChange={(e) => onChange({ maintenanceCostNewEur: Number(e.target.value) })}
              min={0}
            />
            <span className="input-unit">EUR/Jahr</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">CO2-Faktor</label>
          <select
            className="form-select"
            value={data.co2Source}
            onChange={(e) => handleCo2SourceChange(e.target.value)}
          >
            {CO2_SOURCE_OPTIONS.map((option) => (
              <option key={option.label} value={option.label}>
                {option.label}{option.factorGPerKwh ? ` (${option.factorGPerKwh} g/kWh)` : ''}
              </option>
            ))}
          </select>
        </div>

        {isCustomCo2 && (
          <div className="form-group">
            <label className="form-label">CO2-Faktor (benutzerdefiniert)</label>
            <div className="input-with-unit">
              <input
                type="number"
                className="form-input"
                value={data.co2FactorGPerKwh}
                onChange={(e) => onChange({ co2FactorGPerKwh: Number(e.target.value) })}
                min={0}
              />
              <span className="input-unit">g/kWh</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
