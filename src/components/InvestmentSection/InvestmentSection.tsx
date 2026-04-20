import React, { useState, useEffect } from 'react';
import type { InvestmentCosts } from '../../types';
import { formatCurrency, formatNumberWithThousandSeparator, parseNumberWithThousandSeparator } from '../../utils/calculations';
import './InvestmentSection.css';

interface InvestmentSectionProps {
  costs: InvestmentCosts;
  onChange: (costs: Partial<InvestmentCosts>) => void;
}

// V3-10/V3-11: Updated labels and thousand separator formatting
export const InvestmentSection: React.FC<InvestmentSectionProps> = ({ costs, onChange }) => {
  const total = costs.luminairesEur + costs.controlsEur + costs.installationEur;
  
  // V3-11: State for formatted display values
  const [displayValues, setDisplayValues] = useState({
    luminairesEur: formatNumberWithThousandSeparator(costs.luminairesEur),
    controlsEur: formatNumberWithThousandSeparator(costs.controlsEur),
    installationEur: formatNumberWithThousandSeparator(costs.installationEur),
  });
  
  // Update display values when costs change externally
  useEffect(() => {
    setDisplayValues({
      luminairesEur: formatNumberWithThousandSeparator(costs.luminairesEur),
      controlsEur: formatNumberWithThousandSeparator(costs.controlsEur),
      installationEur: formatNumberWithThousandSeparator(costs.installationEur),
    });
  }, [costs.luminairesEur, costs.controlsEur, costs.installationEur]);
  
  const handleInputChange = (field: keyof InvestmentCosts, displayValue: string) => {
    // Update display immediately
    setDisplayValues(prev => ({ ...prev, [field]: displayValue }));
  };
  
  const handleInputBlur = (field: keyof InvestmentCosts, displayValue: string) => {
    // Parse and update actual value on blur
    const numValue = parseNumberWithThousandSeparator(displayValue);
    onChange({ [field]: numValue });
    // Re-format display value
    setDisplayValues(prev => ({ ...prev, [field]: formatNumberWithThousandSeparator(numValue) }));
  };

  return (
    <section className="card">
      <h2 className="card-title">Investitionskosten</h2>
      
      <div className="investment-grid">
        <div className="form-group">
          <label className="form-label">Invest Leuchten</label>
          <div className="input-with-unit">
            <input
              type="text"
              className="form-input investment-input"
              value={displayValues.luminairesEur}
              onChange={(e) => handleInputChange('luminairesEur', e.target.value)}
              onBlur={(e) => handleInputBlur('luminairesEur', e.target.value)}
            />
            <span className="input-unit">EUR</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Invest Steuerung</label>
          <div className="input-with-unit">
            <input
              type="text"
              className="form-input investment-input"
              value={displayValues.controlsEur}
              onChange={(e) => handleInputChange('controlsEur', e.target.value)}
              onBlur={(e) => handleInputBlur('controlsEur', e.target.value)}
            />
            <span className="input-unit">EUR</span>
          </div>
        </div>

        {/* V3-10: Changed label from "Einbau" to "Installation" */}
        <div className="form-group">
          <label className="form-label">Invest Installation</label>
          <div className="input-with-unit">
            <input
              type="text"
              className="form-input investment-input"
              value={displayValues.installationEur}
              onChange={(e) => handleInputChange('installationEur', e.target.value)}
              onBlur={(e) => handleInputBlur('installationEur', e.target.value)}
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
