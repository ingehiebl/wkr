import React from 'react';
import type { ControlSettings } from '../../types';
import { Sun, Move } from 'lucide-react';
import './ControlSection.css';

interface ControlSectionProps {
  settings: ControlSettings;
  onChange: (settings: Partial<ControlSettings>) => void;
}

export const ControlSection: React.FC<ControlSectionProps> = ({ settings, onChange }) => {
  return (
    <section className="card">
      <h2 className="card-title">Steuerung</h2>
      
      <div className="control-grid">
        <div className="control-item">
          <div className="control-info">
            <Sun className="control-icon" />
            <div>
              <div className="control-label">Tageslichtsteuerung</div>
              <div className="control-description">Reduziert Energieverbrauch um 30%</div>
            </div>
          </div>
          <div 
            className={`toggle ${settings.daylightControl ? 'active' : ''}`}
            onClick={() => onChange({ daylightControl: !settings.daylightControl })}
          >
          </div>
        </div>

        <div className="control-item">
          <div className="control-info">
            <Move className="control-icon" />
            <div>
              <div className="control-label">Bewegungssteuerung</div>
              <div className="control-description">Reduziert Energieverbrauch um 30%</div>
            </div>
          </div>
          <div 
            className={`toggle ${settings.motionControl ? 'active' : ''}`}
            onClick={() => onChange({ motionControl: !settings.motionControl })}
          >
          </div>
        </div>
      </div>

      {(settings.daylightControl || settings.motionControl) && (
        <div className="control-summary">
          Gesamtreduktion durch Steuerung: <strong>
            {settings.daylightControl && settings.motionControl 
              ? '51%' 
              : '30%'}
          </strong>
        </div>
      )}
    </section>
  );
};
