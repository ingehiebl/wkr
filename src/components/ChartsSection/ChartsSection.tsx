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
import type { ComparisonResult, PaybackResult } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import './ChartsSection.css';

interface ChartsSectionProps {
  comparison: ComparisonResult;
  payback: PaybackResult;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ comparison, payback }) => {
  // Daten für Kostenvergleich-Balkendiagramm
  const costComparisonData = [
    {
      name: 'Energiekosten',
      Bestand: comparison.existing.energyCostEur,
      Neu: comparison.new.energyCostEur,
    },
    {
      name: 'Wartungskosten',
      Bestand: comparison.existing.maintenanceCostEur,
      Neu: comparison.new.maintenanceCostEur,
    },
    {
      name: 'Gesamt',
      Bestand: comparison.existing.totalCostEur,
      Neu: comparison.new.totalCostEur,
    },
  ];

  // Daten für Cashflow-Liniendiagramm
  const maxYears = Math.min(payback.cumulativeSavings.length, 15);
  const cashflowData = Array.from({ length: maxYears }, (_, i) => ({
    year: i,
    'Kum. Einsparung': payback.cumulativeSavings[i] || 0,
    'Netto-Cashflow': payback.netCashflow[i] || 0,
  }));

  const formatYAxis = (value: number) => {
    if (value >= 1000) {
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

  return (
    <section className="card charts-section">
      <h2 className="card-title">Grafiken</h2>

      <div className="charts-grid">
        {/* Kostenvergleich */}
        <div className="chart-container">
          <h3 className="chart-title">Jährliche Kosten: Bestand vs. Neu</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis tickFormatter={formatYAxis} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Bestand" fill="#6b7280" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Neu" fill="#00A6A6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          
          {comparison.savings.costEur > 0 && (
            <div className="chart-annotation">
              Einsparung: <strong>{formatCurrency(comparison.savings.costEur)}/Jahr</strong> ({comparison.savings.percent.toFixed(1)}%)
            </div>
          )}
        </div>

        {/* Cashflow über Zeit */}
        <div className="chart-container">
          <h3 className="chart-title">Kumulierte Einsparung und Netto-Cashflow</h3>
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
              <ReferenceLine y={0} stroke="#1E2A38" strokeDasharray="3 3" />
              {payback.paybackYears !== Infinity && payback.paybackYears <= maxYears && (
                <ReferenceLine 
                  x={Math.ceil(payback.paybackYears)} 
                  stroke="#2E7D32" 
                  strokeDasharray="5 5"
                  label={{ 
                    value: `Break-Even: ${payback.paybackYears.toFixed(1)} Jahre`, 
                    fill: '#2E7D32',
                    fontSize: 11,
                    position: 'top'
                  }}
                />
              )}
              <Line 
                type="monotone" 
                dataKey="Kum. Einsparung" 
                stroke="#00A6A6" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="Netto-Cashflow" 
                stroke="#2E7D32" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          
          {payback.paybackYears !== Infinity && (
            <div className="chart-annotation payback">
              Amortisation nach <strong>{payback.paybackYears.toFixed(1)} Jahren</strong>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
