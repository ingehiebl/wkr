import React from 'react';
import type { ComparisonResult, PaybackResult } from '../../types';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/calculations';
import { TrendingDown, Leaf, Clock, Euro } from 'lucide-react';
import './ResultsSection.css';

interface ResultsSectionProps {
  comparison: ComparisonResult;
  payback: PaybackResult;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({ comparison, payback }) => {
  return (
    <section className="card">
      <h2 className="card-title">Ergebnisse</h2>

      {/* Key Metrics */}
      <div className="results-highlights">
        <div className="highlight-card">
          <Euro className="highlight-icon savings" />
          <div className="highlight-content">
            <div className="highlight-value positive">{formatCurrency(comparison.savings.costEur)}</div>
            <div className="highlight-label">Einsparung pro Jahr</div>
          </div>
        </div>

        <div className="highlight-card">
          <Clock className="highlight-icon" />
          <div className="highlight-content">
            <div className="highlight-value">
              {payback.paybackYears === Infinity ? '-' : formatNumber(payback.paybackYears, 1)} Jahre
            </div>
            <div className="highlight-label">Amortisationszeit</div>
          </div>
        </div>

        <div className="highlight-card">
          <TrendingDown className="highlight-icon energy" />
          <div className="highlight-content">
            <div className="highlight-value">{formatPercent(comparison.savings.percent)}</div>
            <div className="highlight-label">Kostenreduktion</div>
          </div>
        </div>

        <div className="highlight-card">
          <Leaf className="highlight-icon co2" />
          <div className="highlight-content">
            <div className="highlight-value positive">{formatNumber(comparison.savings.co2Kg, 0)} kg</div>
            <div className="highlight-label">CO2-Einsparung pro Jahr</div>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="table-container">
        <table className="comparison-table results-table">
          <thead>
            <tr>
              <th>Kostenart</th>
              <th>Bestand</th>
              <th>Neu</th>
              <th>Einsparung</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Energiebedarf</td>
              <td>{formatNumber(comparison.existing.energyKwh, 0)} kWh/Jahr</td>
              <td>{formatNumber(comparison.new.energyKwh, 0)} kWh/Jahr</td>
              <td className="savings-cell">{formatNumber(comparison.savings.energyKwh, 0)} kWh/Jahr</td>
            </tr>
            <tr>
              <td>Energiekosten</td>
              <td>{formatCurrency(comparison.existing.energyCostEur)}/Jahr</td>
              <td>{formatCurrency(comparison.new.energyCostEur)}/Jahr</td>
              <td className="savings-cell">
                {formatCurrency(comparison.existing.energyCostEur - comparison.new.energyCostEur)}/Jahr
              </td>
            </tr>
            <tr>
              <td>Wartungskosten</td>
              <td>{formatCurrency(comparison.existing.maintenanceCostEur)}/Jahr</td>
              <td>{formatCurrency(comparison.new.maintenanceCostEur)}/Jahr</td>
              <td className="savings-cell">
                {formatCurrency(comparison.existing.maintenanceCostEur - comparison.new.maintenanceCostEur)}/Jahr
              </td>
            </tr>
            <tr className="total-row">
              <td><strong>Gesamtkosten</strong></td>
              <td><strong>{formatCurrency(comparison.existing.totalCostEur)}/Jahr</strong></td>
              <td><strong>{formatCurrency(comparison.new.totalCostEur)}/Jahr</strong></td>
              <td className="savings-cell"><strong>{formatCurrency(comparison.savings.costEur)}/Jahr</strong></td>
            </tr>
            <tr>
              <td>CO2-Emissionen</td>
              <td>{formatNumber(comparison.existing.co2Kg, 0)} kg/Jahr</td>
              <td>{formatNumber(comparison.new.co2Kg, 0)} kg/Jahr</td>
              <td className="savings-cell">{formatNumber(comparison.savings.co2Kg, 0)} kg/Jahr</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};
