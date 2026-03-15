import React from 'react';
import type { ComparisonResult, PaybackResult, ProjectData, ExistingLuminaire, Luminaire, ControlSettings, InvestmentCosts } from '../../types';
import { formatCurrency, formatNumber, formatPercent, calculateTotalReduction, calculateExistingLuminaire } from '../../utils/calculations';
import { LAMP_POWER_LOOKUP, CONTROL_REDUCTION_OPTIONS } from '../../constants';
import { TrendingDown, Leaf, Clock, Euro, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import './ResultsSection.css';

interface ResultsSectionProps {
  comparison: ComparisonResult;
  payback: PaybackResult;
  projectData: ProjectData;
  existingLuminaires: ExistingLuminaire[];
  newLuminaires: Luminaire[];
  controlSettings: ControlSettings;
  investmentCosts: InvestmentCosts;
}

// C08: PDF-Export Funktionalität
export const ResultsSection: React.FC<ResultsSectionProps> = ({ 
  comparison, 
  payback,
  projectData,
  existingLuminaires,
  newLuminaires,
  controlSettings,
  investmentCosts
}) => {

  const handlePdfExport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;
    const lineHeight = 7;
    const leftMargin = 20;
    const rightCol = 110;

    // Helper Funktionen
    const addTitle = (text: string) => {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(text, leftMargin, y);
      y += lineHeight + 2;
    };

    const addSection = (title: string) => {
      y += 5;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(title, leftMargin, y);
      y += lineHeight;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
    };

    const addRow = (label: string, value: string, col2Label?: string, col2Value?: string) => {
      doc.text(label, leftMargin, y);
      doc.text(value, leftMargin + 50, y);
      if (col2Label && col2Value) {
        doc.text(col2Label, rightCol, y);
        doc.text(col2Value, rightCol + 50, y);
      }
      y += lineHeight;
    };

    const checkPageBreak = () => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    };

    // Titel
    addTitle('Wirtschaftlichkeitsrechner - Ergebnisbericht');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, leftMargin, y);
    y += lineHeight * 2;

    // Projektdaten
    addSection('Projektdaten');
    addRow('Projektname:', projectData.projectName || '(nicht angegeben)');
    addRow('Raumnutzung:', projectData.roomUsage);
    addRow('Betriebsstunden:', `${formatNumber(projectData.annualOperatingHours)} h/Jahr`);
    addRow('Strompreis:', `${projectData.electricityPriceEur.toFixed(2)} EUR/kWh`);
    addRow('CO2-Faktor:', `${projectData.co2FactorGPerKwh} g/kWh`);
    checkPageBreak();

    // Leuchten Bestand
    addSection('Leuchten - Bestand');
    existingLuminaires.forEach((lum, idx) => {
      const calc = calculateExistingLuminaire(lum);
      const flameText = lum.flameCount === 1 ? '1-flammig' : '2-flammig';
      addRow(
        `${idx + 1}. ${lum.quantity}x ${lum.lampType}`,
        `${LAMP_POWER_LOOKUP[lum.lampType]}W, ${flameText} = ${calc.totalPowerW}W`
      );
      checkPageBreak();
    });
    addRow('Gesamtleistung Bestand:', `${formatNumber(comparison.existing.totalPowerKw * 1000, 0)} W`);
    checkPageBreak();

    // Leuchten Neu
    addSection('Leuchten - Neu');
    newLuminaires.forEach((lum, idx) => {
      addRow(
        `${idx + 1}. ${lum.quantity}x ${lum.name || '(ohne Name)'}`,
        `${lum.powerW}W = ${lum.quantity * lum.powerW}W`
      );
      checkPageBreak();
    });
    addRow('Gesamtleistung Neu:', `${formatNumber(comparison.new.totalPowerKw * 1000, 0)} W`);
    checkPageBreak();

    // Steuerung
    addSection('Steuerung');
    const daylightOption = CONTROL_REDUCTION_OPTIONS.find(o => o.value === controlSettings.daylightReductionPercent);
    const motionOption = CONTROL_REDUCTION_OPTIONS.find(o => o.value === controlSettings.motionReductionPercent);
    addRow('Tageslichtsteuerung:', daylightOption?.label || 'Keine');
    addRow('Bewegungssteuerung:', motionOption?.label || 'Keine');
    addRow('Gesamtreduktion:', `${calculateTotalReduction(controlSettings)}%`);
    checkPageBreak();

    // Investitionskosten
    addSection('Investitionskosten');
    addRow('Leuchten:', formatCurrency(investmentCosts.luminairesEur));
    addRow('Steuerung:', formatCurrency(investmentCosts.controlsEur));
    addRow('Einbau:', formatCurrency(investmentCosts.installationEur));
    addRow('Gesamt:', formatCurrency(payback.investmentTotalEur));
    checkPageBreak();

    // Ergebnisse
    addSection('Ergebnisse');
    y += 3;
    
    // Tabellenkopf
    doc.setFont('helvetica', 'bold');
    doc.text('Kostenart', leftMargin, y);
    doc.text('Bestand', leftMargin + 45, y);
    doc.text('Neu', leftMargin + 85, y);
    doc.text('Einsparung', leftMargin + 125, y);
    y += lineHeight;
    doc.setFont('helvetica', 'normal');

    // Tabellenzeilen
    addRow('Energiebedarf', 
      `${formatNumber(comparison.existing.energyKwh, 0)} kWh`,
      `${formatNumber(comparison.new.energyKwh, 0)} kWh`
    );
    doc.text(`${formatNumber(comparison.savings.energyKwh, 0)} kWh`, leftMargin + 125, y - lineHeight);

    addRow('Energiekosten',
      `${formatCurrency(comparison.existing.energyCostEur)}`,
      `${formatCurrency(comparison.new.energyCostEur)}`
    );
    doc.text(`${formatCurrency(comparison.existing.energyCostEur - comparison.new.energyCostEur)}`, leftMargin + 125, y - lineHeight);

    addRow('Wartungskosten',
      `${formatCurrency(comparison.existing.maintenanceCostEur)}`,
      `${formatCurrency(comparison.new.maintenanceCostEur)}`
    );
    doc.text(`${formatCurrency(comparison.existing.maintenanceCostEur - comparison.new.maintenanceCostEur)}`, leftMargin + 125, y - lineHeight);

    doc.setFont('helvetica', 'bold');
    addRow('Gesamtkosten',
      `${formatCurrency(comparison.existing.totalCostEur)}`,
      `${formatCurrency(comparison.new.totalCostEur)}`
    );
    doc.text(`${formatCurrency(comparison.savings.costEur)}`, leftMargin + 125, y - lineHeight);
    doc.setFont('helvetica', 'normal');

    addRow('CO2-Emissionen',
      `${formatNumber(comparison.existing.co2Kg, 0)} kg`,
      `${formatNumber(comparison.new.co2Kg, 0)} kg`
    );
    doc.text(`${formatNumber(comparison.savings.co2Kg, 0)} kg`, leftMargin + 125, y - lineHeight);
    checkPageBreak();

    // Kennzahlen
    y += 5;
    addSection('Kennzahlen');
    addRow('Jährliche Einsparung:', formatCurrency(comparison.savings.costEur));
    addRow('Kostenreduktion:', formatPercent(comparison.savings.percent));
    addRow('Amortisationszeit:', payback.paybackYears === Infinity ? '-' : `${formatNumber(payback.paybackYears, 1)} Jahre`);
    addRow('CO2-Einsparung/Jahr:', `${formatNumber(comparison.savings.co2Kg, 0)} kg`);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(
      'Erstellt mit Wirtschaftlichkeitsrechner v2.0',
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );

    // PDF speichern
    const filename = projectData.projectName 
      ? `WKR_${projectData.projectName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
      : 'WKR_Ergebnis.pdf';
    doc.save(filename);
  };

  return (
    <section className="card">
      <div className="results-header">
        <h2 className="card-title">Ergebnisse</h2>
        {/* C08: PDF Download Button */}
        <button className="btn btn-primary pdf-export-btn" onClick={handlePdfExport}>
          <Download size={16} />
          Als PDF herunterladen
        </button>
      </div>

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
