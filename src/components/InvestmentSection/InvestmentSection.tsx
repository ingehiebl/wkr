import React from 'react';
import type { InvestmentCosts } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import './InvestmentSection.css';

interface InvestmentSectionProps {
  costs: InvestmentCosts;
  onChange: (costs: Partial<InvestmentCosts>) => void;
}

export const InvestmentSection: React.FC<InvestmentSectionProps> = ({ costs, onChange }) => {
  const total = costs.luminairesEur + costs.controlsEur + costs.installationEur;

  return (
    <section className="card">
      <h2 className="card-title">Investitionskosten</h2>
      
      <div className="investment-grid">
        <div className="form-group">
          <label className="form-label">Invest Leuchten</label>
          <div className="input-with-unit">
            <input
              type="number"
              className="form-input"
              value={costs.luminairesEur}
              onChange={(e) => onChange({ luminairesEur: Number(e.target.value) })}
              min={0}
            />
            <span className="input-unit">EUR</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Invest Steuerung</label>
          <div className="input-with-unit">
            <input
              type="number"
              className="form-input"
              value={costs.controlsEur}
              onChange={(e) => onChange({ controlsEur: Number(e.target.value) })}
              min={0}
            />
            <span className="input-unit">EUR</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Invest Einbau</label>
          <div className="input-with-unit">
            <input
              type="number"
              className="form-input"
              value={costs.installationEur}
              onChange={(e) => onChange({ installationEur: Number(e.target.value) })}
              min={0}
            />
            <span className="input-unit">EUR</span>
          </div>
        </div>

        <div className="investment-total">
          <span className="total-label">Gesamtinvestition</span>
          <span className="total-value">{formatCurrency(total)}</span>
        </div>
      </div>
    </section>
  );
};
