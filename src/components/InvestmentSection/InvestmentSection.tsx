import React, { useState, useEffect } from 'react';
import type { InvestmentCosts } from '../../types';
import { formatCurrency, formatNumberWithThousandSeparator, parseNumberWithThousandSeparator, calculateInvestmentVariants } from '../../utils/calculations';
import './InvestmentSection.css';

interface InvestmentSectionProps {
  costs: InvestmentCosts;
  onChange: (costs: Partial<InvestmentCosts>) => void;
}

// V4: 4 input fields with subtotals
export const InvestmentSection: React.FC<InvestmentSectionProps> = ({ costs, onChange }) => {
  const investment = calculateInvestmentVariants(costs);
  
  const [displayValues, setDisplayValues] = useState({
    luminairesEur: formatNumberWithThousandSeparator(costs.luminairesEur),
    installationLuminairesEur: formatNumberWithThousandSeparator(costs.installationLuminairesEur),
    controlsEur: formatNumberWithThousandSeparator(costs.controlsEur),
    installationControlsEur: formatNumberWithThousandSeparator(costs.installationControlsEur),
  });
  
  useEffect(() => {
    setDisplayValues({
      luminairesEur: formatNumberWithThousandSeparator(costs.luminairesEur),
      installationLuminairesEur: formatNumberWithThousandSeparator(costs.installationLuminairesEur),
      controlsEur: formatNumberWithThousandSeparator(costs.controlsEur),
      installationControlsEur: formatNumberWithThousandSeparator(costs.installationControlsEur),
    });
  }, [costs.luminairesEur, costs.installationLuminairesEur, costs.controlsEur, costs.installationControlsEur]);
  
  const handleInputChange = (field: keyof InvestmentCosts, displayValue: string) => {
    setDisplayValues(prev => ({ ...prev, [field]: displayValue }));
  };
  
  const handleInputBlur = (field: keyof InvestmentCosts, displayValue: string) => {
    const numValue = parseNumberWithThousandSeparator(displayValue);
    onChange({ [field]: numValue });
    setDisplayValues(prev => ({ ...prev, [field]: formatNumberWithThousandSeparator(numValue) }));
  };

  return (
    <section className="card">
      <h2 className="card-title">Investitionskosten</h2>
      
      <div className="investment-grid-v4">
        {/* Row 1: Leuchten */}
        <div className="investment-row">
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
            <label className="form-label">Installation Leuchten</label>
            <div className="input-with-unit">
              <input
                type="text"
                className="form-input investment-input"
                value={displayValues.installationLuminairesEur}
                onChange={(e) => handleInputChange('installationLuminairesEur', e.target.value)}
                onBlur={(e) => handleInputBlur('installationLuminairesEur', e.target.value)}
              />
              <span className="input-unit">EUR</span>
            </div>
          </div>
          <div className="investment-subtotal">
            <span className="subtotal-label">Gesamt Leuchten</span>
            <span className="subtotal-value">{formatCurrency(investment.luminairesTotal)}</span>
          </div>
        </div>

        {/* Row 2: Steuerung */}
        <div className="investment-row">
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
          <div className="form-group">
            <label className="form-label">Installation Steuerung</label>
            <div className="input-with-unit">
              <input
                type="text"
                className="form-input investment-input"
                value={displayValues.installationControlsEur}
                onChange={(e) => handleInputChange('installationControlsEur', e.target.value)}
                onBlur={(e) => handleInputBlur('installationControlsEur', e.target.value)}
              />
              <span className="input-unit">EUR</span>
            </div>
          </div>
          <div className="investment-subtotal">
            <span className="subtotal-label">Gesamt Steuerung</span>
            <span className="subtotal-value">{formatCurrency(investment.controlsTotal)}</span>
          </div>
        </div>

        {/* Row 3: Total */}
        <div className="investment-total">
          <span className="total-label">Gesamtinvestition</span>
          <span className="total-value">{formatCurrency(investment.total)}</span>
        </div>
      </div>
    </section>
  );
};
