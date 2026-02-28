import React from 'react';
import type { ComparisonResult } from '../../types';
import { formatNumber } from '../../utils/calculations';
import './ComparisonSection.css';

interface ComparisonSectionProps {
  comparison: ComparisonResult;
}

export const ComparisonSection: React.FC<ComparisonSectionProps> = ({ comparison }) => {
  return (
    <section className="card">
      <h2 className="card-title">Vergleich Bestand vs. Neu</h2>
      
      <div className="table-container">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Metrik</th>
              <th>Bestand</th>
              <th>Neu</th>
              <th>Differenz</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Gesamtleistung</td>
              <td>{formatNumber(comparison.existing.totalPowerKw, 2)} kW</td>
              <td>{formatNumber(comparison.new.totalPowerKw, 2)} kW</td>
              <td className={comparison.existing.totalPowerKw > comparison.new.totalPowerKw ? 'savings-cell' : ''}>
                {formatNumber(comparison.existing.totalPowerKw - comparison.new.totalPowerKw, 2)} kW
              </td>
            </tr>
            <tr>
              <td>Energiebedarf</td>
              <td>{formatNumber(comparison.existing.energyKwh, 0)} kWh/Jahr</td>
              <td>{formatNumber(comparison.new.energyKwh, 0)} kWh/Jahr</td>
              <td className={comparison.savings.energyKwh > 0 ? 'savings-cell' : ''}>
                {formatNumber(comparison.savings.energyKwh, 0)} kWh/Jahr
              </td>
            </tr>
            <tr>
              <td>Lichtleistung (effektiv)</td>
              <td>{formatNumber(comparison.existing.totalLumens, 0)} lm</td>
              <td>{formatNumber(comparison.new.totalLumens, 0)} lm</td>
              <td>
                {formatNumber(comparison.new.totalLumens - comparison.existing.totalLumens, 0)} lm
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};
