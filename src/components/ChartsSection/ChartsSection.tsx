import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { ComparisonResultV3, PaybackResultV3 } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import './ChartsSection.css';

interface ChartsSectionProps {
  comparison: ComparisonResultV3;
  payback: PaybackResultV3;
}

// V3-17/V3-18/V3-19/V3-20: Updated for 3-bar/3-line charts with dual payback
// V3-16: Added IDs for PDF export capture
export const ChartsSection: React.FC<ChartsSectionProps> = ({ comparison, payback }) => {
  // V3-17: Daten für Kostenvergleich-Balkendiagramm mit 3 Varianten
  // V3-18: "Stromkosten" instead of "Energiekosten"
  const costComparisonData = [
    {
      name: 'Stromkosten',
      'Bestand': comparison.existing.energyCostEur,
      'Neu ohne Steuerung': comparison.newWithoutControls.energyCostEur,
      'Neu mit Steuerung': comparison.newWithControls.energyCostEur,
    },
    {
      name: 'Wartungskosten',
      'Bestand': comparison.existing.maintenanceCostEur,
      'Neu ohne Steuerung': comparison.newWithoutControls.maintenanceCostEur,
      'Neu mit Steuerung': comparison.newWithControls.maintenanceCostEur,
    },
    {
      name: 'Gesamt',
      'Bestand': comparison.existing.totalCostEur,
      'Neu ohne Steuerung': comparison.newWithoutControls.totalCostEur,
      'Neu mit Steuerung': comparison.newWithControls.totalCostEur,
    },
  ];

  // V3-19: Daten für Cashflow-Liniendiagramm mit 3 Linien
  const maxYears = Math.min(
    Math.max(
      payback.cumulativeSavingsWithoutControls.length,
      payback.cumulativeSavingsWithControls.length
    ), 
    15
  );
  
  // V3-19: Three lines for cumulative electricity costs comparison
  // Starting from 0, showing cumulative costs over time
  const cashflowData = Array.from({ length: maxYears }, (_, i) => ({
    year: i,
    // Cumulative electricity costs for Bestand
    'Stromkosten Bestand': comparison.existing.energyCostEur * i,
    // Cumulative costs for Neu ohne Steuerung (with initial investment)
    'Stromkosten Neu ohne Steuerung': comparison.newWithoutControls.energyCostEur * i + payback.investment.withoutControls,
    // Cumulative costs for Neu mit Steuerung (with initial investment including controls)
    'Stromkosten Neu mit Steuerung': comparison.newWithControls.energyCostEur * i + payback.investment.withControls,
  }));

  // Alternative: Net Cashflow view (savings minus investment)
  const netCashflowData = Array.from({ length: maxYears }, (_, i) => ({
    year: i,
    'Netto-Cashflow ohne Steuerung': payback.netCashflowWithoutControls[i] || 0,
    'Netto-Cashflow mit Steuerung': payback.netCashflowWithControls[i] || 0,
  }));

  const formatYAxis = (value: number) => {
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CashflowTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">Jahr {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Check if controls are actually being used
  const hasControls = comparison.newWithControls.energyKwh !== comparison.newWithoutControls.energyKwh;

  return (
    <section className="card charts-section" id="charts-section">
      <h2 className="card-title">Grafiken</h2>

      <div className="charts-grid">
        {/* V3-17: Kostenvergleich mit 3 Balken */}
        <div className="chart-container" id="chart-cost-comparison">
          <h3 className="chart-title">Jährliche Kosten: Bestand vs. Neu</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis tickFormatter={formatYAxis} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Bestand" fill="#6b7280" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Neu ohne Steuerung" fill="#00A6A6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Neu mit Steuerung" fill="#2E7D32" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="chart-annotation">
            Einsparung ohne Steuerung: <strong>{formatCurrency(comparison.savingsWithoutControls.costEur)}/Jahr</strong> ({comparison.savingsWithoutControls.percent.toFixed(1)}%)
            {hasControls && (
              <>
                <br />
                Einsparung mit Steuerung: <strong>{formatCurrency(comparison.savingsWithControls.costEur)}/Jahr</strong> ({comparison.savingsWithControls.percent.toFixed(1)}%)
              </>
            )}
          </div>
        </div>

        {/* V3-19: Kumulierte Stromkosten über Zeit mit 3 Linien */}
        <div className="chart-container" id="chart-cumulative-costs">
          <h3 className="chart-title">Kumulierte Stromkosten im Vergleich</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cashflowData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="year" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                label={{ value: 'Jahre', position: 'insideBottom', offset: -5, fill: '#6b7280' }}
              />
              <YAxis tickFormatter={formatYAxis} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip content={<CashflowTooltip />} />
              <Legend />
              {/* V3-19: Three lines for cost comparison */}
              <Line 
                type="monotone" 
                dataKey="Stromkosten Bestand" 
                stroke="#6b7280" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="Stromkosten Neu ohne Steuerung" 
                stroke="#00A6A6" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="Stromkosten Neu mit Steuerung" 
                stroke="#2E7D32" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          
          <div className="chart-annotation">
            Die Varianten "Neu" starten mit den jeweiligen Investitionskosten.
          </div>
        </div>

        {/* V3-20: Netto-Cashflow mit beiden Varianten und Break-Even-Punkten */}
        <div className="chart-container chart-container-full" id="chart-net-cashflow">
          <h3 className="chart-title">Netto-Cashflow (Einsparung - Investition)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={netCashflowData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="year" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                label={{ value: 'Jahre', position: 'insideBottom', offset: -5, fill: '#6b7280' }}
              />
              <YAxis tickFormatter={formatYAxis} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip content={<CashflowTooltip />} />
              <Legend />
              <ReferenceLine y={0} stroke="#1E2A38" strokeDasharray="3 3" />
              
              {/* V3-20: Break-Even markers for both variants */}
              {payback.paybackYears.withoutControls !== Infinity && payback.paybackYears.withoutControls <= maxYears && (
                <ReferenceLine 
                  x={Math.ceil(payback.paybackYears.withoutControls)} 
                  stroke="#00A6A6" 
                  strokeDasharray="5 5"
                  label={{ 
                    value: `Break-Even (o.S.): ${payback.paybackYears.withoutControls.toFixed(1)}J`, 
                    fill: '#00A6A6',
                    fontSize: 10,
                    position: 'top'
                  }}
                />
              )}
              {hasControls && payback.paybackYears.withControls !== Infinity && payback.paybackYears.withControls <= maxYears && (
                <ReferenceLine 
                  x={Math.ceil(payback.paybackYears.withControls)} 
                  stroke="#2E7D32" 
                  strokeDasharray="5 5"
                  label={{ 
                    value: `Break-Even (m.S.): ${payback.paybackYears.withControls.toFixed(1)}J`, 
                    fill: '#2E7D32',
                    fontSize: 10,
                    position: 'insideTopRight'
                  }}
                />
              )}
              
              <Line 
                type="monotone" 
                dataKey="Netto-Cashflow ohne Steuerung" 
                stroke="#00A6A6" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="Netto-Cashflow mit Steuerung" 
                stroke="#2E7D32" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          
          <div className="chart-annotation payback">
            Amortisation ohne Steuerung: <strong>{payback.paybackYears.withoutControls === Infinity ? '-' : `${payback.paybackYears.withoutControls.toFixed(1)} Jahre`}</strong>
            {hasControls && (
              <>
                {' | '}
                Mit Steuerung: <strong>{payback.paybackYears.withControls === Infinity ? '-' : `${payback.paybackYears.withControls.toFixed(1)} Jahre`}</strong>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
