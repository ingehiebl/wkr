import React from 'react';
import type { 
  ComparisonResultV3, 
  PaybackResultV3, 
  ProjectData, 
  ExistingLuminaire, 
  Luminaire, 
  ControlSettings, 
  InvestmentCosts 
} from '../../types';
import { 
  formatCurrency, 
  formatNumber, 
  calculateTotalReduction, 
  calculateExistingLuminaire,
  calculateInvestmentVariants,
  getLampPower
} from '../../utils/calculations';
import { CONTROL_REDUCTION_OPTIONS } from '../../constants';
import { Euro, Clock, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import './ResultsSection.css';

interface ResultsSectionProps {
  comparison: ComparisonResultV3;
  payback: PaybackResultV3;
  projectData: ProjectData;
  existingLuminaires: ExistingLuminaire[];
  newLuminaires: Luminaire[];
  controlSettings: ControlSettings;
  investmentCosts: InvestmentCosts;
  existingPhotos?: string[];
  newPhotos?: string[];
}

// V4: Updated results - removed maintenance, 4 cards, no Variantenvergleich
export const ResultsSection: React.FC<ResultsSectionProps> = ({ 
  comparison, 
  payback,
  projectData,
  existingLuminaires,
  newLuminaires,
  controlSettings,
  investmentCosts,
  existingPhotos = [],
  newPhotos = [],
}) => {
  const investment = calculateInvestmentVariants(investmentCosts);

  const handlePdfExport = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 20;
    const lineHeight = 7;
    const leftMargin = 20;

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

    const addRow = (label: string, value: string) => {
      doc.text(label, leftMargin, y);
      doc.text(value, leftMargin + 60, y);
      y += lineHeight;
    };

    const checkPageBreak = (requiredSpace: number = 20) => {
      if (y > pageHeight - requiredSpace) {
        doc.addPage();
        y = 20;
      }
    };

    const addChartImage = async (elementId: string, title: string) => {
      const element = document.getElementById(elementId);
      if (!element) return;

      try {
        checkPageBreak(100);
        
        const canvas = await html2canvas(element, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
          useCORS: true,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - (leftMargin * 2);
        const imgHeight = (canvas.height / canvas.width) * imgWidth;
        
        if (y + imgHeight > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(title, leftMargin, y);
        y += 8;
        
        doc.addImage(imgData, 'PNG', leftMargin, y, imgWidth, Math.min(imgHeight, 80));
        y += Math.min(imgHeight, 80) + 10;
      } catch (error) {
        console.error(`Error capturing chart ${elementId}:`, error);
      }
    };

    const addPhotos = (photos: string[], title: string) => {
      if (photos.length === 0) return;
      
      checkPageBreak(60);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(title, leftMargin, y);
      y += 8;
      
      const photoWidth = 35;
      const photoHeight = 26;
      const photosPerRow = 4;
      
      photos.forEach((photo, index) => {
        const row = Math.floor(index / photosPerRow);
        const col = index % photosPerRow;
        const x = leftMargin + (col * (photoWidth + 5));
        const photoY = y + (row * (photoHeight + 5));
        
        if (photoY + photoHeight > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        
        try {
          doc.addImage(photo, 'JPEG', x, photoY, photoWidth, photoHeight);
        } catch (error) {
          try {
            doc.addImage(photo, 'PNG', x, photoY, photoWidth, photoHeight);
          } catch (e) {
            console.error('Error adding photo:', e);
          }
        }
      });
      
      const rows = Math.ceil(photos.length / photosPerRow);
      y += rows * (photoHeight + 5) + 5;
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
      const flameText = `${lum.flameCount}-flammig`;
      addRow(
        `${idx + 1}. ${lum.quantity}x ${lum.lampType}`,
        `${getLampPower(lum.lampType)}W, ${flameText} = ${formatNumber(calc.totalPowerW / 1000, 3)} kW`
      );
      checkPageBreak();
    });
    addRow('Gesamtleistung Bestand:', `${formatNumber(comparison.existing.totalPowerKw, 3)} kW`);
    checkPageBreak();

    // Leuchten Neu
    addSection('Leuchten - Neu');
    newLuminaires.forEach((lum, idx) => {
      addRow(
        `${idx + 1}. ${lum.quantity}x ${lum.name || '(ohne Name)'}`,
        `${lum.powerW}W = ${formatNumber((lum.quantity * lum.powerW) / 1000, 3)} kW`
      );
      checkPageBreak();
    });
    addRow('Gesamtleistung Neu:', `${formatNumber(comparison.newWithoutControls.totalPowerKw, 3)} kW`);
    checkPageBreak();

    // Steuerung
    addSection('Steuerung');
    const daylightOption = CONTROL_REDUCTION_OPTIONS.find(o => o.value === controlSettings.daylightReductionPercent);
    const motionOption = CONTROL_REDUCTION_OPTIONS.find(o => o.value === controlSettings.motionReductionPercent);
    addRow('Tageslichtsteuerung:', daylightOption?.label || 'Keine');
    addRow('Bewegungssteuerung:', motionOption?.label || 'Keine');
    addRow('Gesamtreduktion:', `${calculateTotalReduction(controlSettings)}%`);
    checkPageBreak();

    // V4: Investitionskosten with 4 fields
    addSection('Investitionskosten');
    addRow('Leuchten:', formatCurrency(investmentCosts.luminairesEur));
    addRow('Installation Leuchten:', formatCurrency(investmentCosts.installationLuminairesEur));
    addRow('Gesamt Leuchten:', formatCurrency(investment.luminairesTotal));
    addRow('Steuerung:', formatCurrency(investmentCosts.controlsEur));
    addRow('Installation Steuerung:', formatCurrency(investmentCosts.installationControlsEur));
    addRow('Gesamt Steuerung:', formatCurrency(investment.controlsTotal));
    addRow('Gesamtinvestition:', formatCurrency(investment.total));
    checkPageBreak();

    // Ergebnisse
    addSection('Ergebnisse');
    y += 3;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('', leftMargin, y);
    doc.text('Bestand', leftMargin + 40, y);
    doc.text('Neu ohne Stg.', leftMargin + 75, y);
    doc.text('Neu mit Stg.', leftMargin + 115, y);
    y += lineHeight;
    doc.setFont('helvetica', 'normal');

    doc.text('Energiebedarf', leftMargin, y);
    doc.text(`${formatNumber(comparison.existing.energyKwh, 0)} kWh`, leftMargin + 40, y);
    doc.text(`${formatNumber(comparison.newWithoutControls.energyKwh, 0)} kWh`, leftMargin + 75, y);
    doc.text(`${formatNumber(comparison.newWithControls.energyKwh, 0)} kWh`, leftMargin + 115, y);
    y += lineHeight;

    doc.text('Stromkosten', leftMargin, y);
    doc.text(formatCurrency(comparison.existing.energyCostEur), leftMargin + 40, y);
    doc.text(formatCurrency(comparison.newWithoutControls.energyCostEur), leftMargin + 75, y);
    doc.text(formatCurrency(comparison.newWithControls.energyCostEur), leftMargin + 115, y);
    y += lineHeight;

    doc.text('Einsparung zu Bestand', leftMargin, y);
    doc.text('-', leftMargin + 40, y);
    doc.text(formatCurrency(comparison.savingsWithoutControls.costEur), leftMargin + 75, y);
    doc.text(formatCurrency(comparison.savingsWithControls.costEur), leftMargin + 115, y);
    y += lineHeight;

    doc.text('CO2-Emissionen (t)', leftMargin, y);
    doc.text(`${formatNumber(comparison.existing.co2Tons, 2)} t`, leftMargin + 40, y);
    doc.text(`${formatNumber(comparison.newWithoutControls.co2Tons, 2)} t`, leftMargin + 75, y);
    doc.text(`${formatNumber(comparison.newWithControls.co2Tons, 2)} t`, leftMargin + 115, y);
    y += lineHeight * 2;

    // Kennzahlen
    addSection('Kennzahlen');
    addRow('Einsparung/Jahr (ohne Stg.):', formatCurrency(comparison.savingsWithoutControls.costEur));
    addRow('Amortisation (ohne Stg.):', payback.paybackYears.withoutControls === Infinity ? '-' : `${formatNumber(payback.paybackYears.withoutControls, 1)} Jahre`);
    addRow('Einsparung/Jahr (mit Stg.):', formatCurrency(comparison.savingsWithControls.costEur));
    addRow('Amortisation (mit Stg.):', payback.paybackYears.withControls === Infinity ? '-' : `${formatNumber(payback.paybackYears.withControls, 1)} Jahre`);
    addRow('CO2-Einsparung/Jahr (mit Stg.):', `${formatNumber(comparison.savingsWithControls.co2Tons, 2)} t`);

    // Charts
    doc.addPage();
    y = 20;
    addTitle('Grafiken');
    y += 5;

    await addChartImage('chart-cost-comparison', 'Jährliche Kosten: Bestand vs. Neu');
    await addChartImage('chart-cumulative-costs', 'Kumulierte Stromkosten');
    await addChartImage('chart-net-cashflow', 'Netto-Cashflow');

    // Photos
    if (existingPhotos.length > 0 || newPhotos.length > 0) {
      doc.addPage();
      y = 20;
      addTitle('Fotos');
      y += 5;

      addPhotos(existingPhotos, 'Leuchten Bestand');
      addPhotos(newPhotos, 'Leuchten Neu');
    }

    // Footer
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text(
        `Wirtschaftlichkeitsrechner v4.0 - Seite ${i} von ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    const filename = projectData.projectName 
      ? `WKR_${projectData.projectName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
      : 'WKR_Ergebnis.pdf';
    doc.save(filename);
  };

  return (
    <section className="card">
      <div className="results-header">
        <h2 className="card-title">Ergebnisse</h2>
        <button className="btn btn-primary pdf-export-btn" onClick={handlePdfExport}>
          <Download size={16} />
          Als PDF herunterladen
        </button>
      </div>

      {/* V4: Results table */}
      <div className="table-container">
        <table className="comparison-table results-table results-table-v3">
          <thead>
            <tr>
              <th></th>
              <th>Bestand</th>
              <th>Neu ohne Steuerung</th>
              <th>Neu mit Steuerung</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Energiebedarf</td>
              <td>{formatNumber(comparison.existing.energyKwh, 0)} kWh/Jahr</td>
              <td>{formatNumber(comparison.newWithoutControls.energyKwh, 0)} kWh/Jahr</td>
              <td>{formatNumber(comparison.newWithControls.energyKwh, 0)} kWh/Jahr</td>
            </tr>
            <tr className="savings-row">
              <td>Energiebedarf Einsparung</td>
              <td className="muted">-</td>
              <td className="savings-cell">{formatNumber(comparison.savingsWithoutControls.energyKwh, 0)} kWh/Jahr</td>
              <td className="savings-cell">{formatNumber(comparison.savingsWithControls.energyKwh, 0)} kWh/Jahr</td>
            </tr>
            <tr>
              <td>Investition</td>
              <td className="muted">-</td>
              <td>{formatCurrency(investment.withoutControls)}</td>
              <td>{formatCurrency(investment.withControls)}</td>
            </tr>
            <tr>
              <td>Stromkosten</td>
              <td>{formatCurrency(comparison.existing.energyCostEur)}/Jahr</td>
              <td>{formatCurrency(comparison.newWithoutControls.energyCostEur)}/Jahr</td>
              <td>{formatCurrency(comparison.newWithControls.energyCostEur)}/Jahr</td>
            </tr>
            <tr className="savings-row">
              <td>Stromkosten Einsparung</td>
              <td className="muted">-</td>
              <td className="savings-cell">{formatCurrency(comparison.savingsWithoutControls.costEur)}/Jahr</td>
              <td className="savings-cell">{formatCurrency(comparison.savingsWithControls.costEur)}/Jahr</td>
            </tr>
            <tr>
              <td>CO₂ Emissionen</td>
              <td>{formatNumber(comparison.existing.co2Tons, 2)} t/Jahr</td>
              <td>{formatNumber(comparison.newWithoutControls.co2Tons, 2)} t/Jahr</td>
              <td>{formatNumber(comparison.newWithControls.co2Tons, 2)} t/Jahr</td>
            </tr>
            <tr className="savings-row">
              <td>CO₂ Einsparung</td>
              <td className="muted">-</td>
              <td className="savings-cell">{formatNumber(comparison.savingsWithoutControls.co2Tons, 2)} t/Jahr</td>
              <td className="savings-cell">{formatNumber(comparison.savingsWithControls.co2Tons, 2)} t/Jahr</td>
            </tr>
            <tr>
              <td>Amortisation</td>
              <td className="muted">-</td>
              <td>{payback.paybackYears.withoutControls === Infinity ? '-' : `${formatNumber(payback.paybackYears.withoutControls, 1)} Jahre`}</td>
              <td>{payback.paybackYears.withControls === Infinity ? '-' : `${formatNumber(payback.paybackYears.withControls, 1)} Jahre`}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* V4: Exactly 4 highlight cards */}
      <div className="results-highlights results-highlights-below">
        <div className="highlight-card">
          <Euro className="highlight-icon savings" />
          <div className="highlight-content">
            <div className="highlight-value positive">
              {formatCurrency(comparison.savingsWithoutControls.costEur)}
            </div>
            <div className="highlight-label">Einsparung ohne Steuerung / Jahr</div>
          </div>
        </div>

        <div className="highlight-card">
          <Clock className="highlight-icon" />
          <div className="highlight-content">
            <div className="highlight-value">
              {payback.paybackYears.withoutControls === Infinity 
                ? '-' 
                : `${formatNumber(payback.paybackYears.withoutControls, 1)} Jahre`}
            </div>
            <div className="highlight-label">Amortisation ohne Steuerung</div>
          </div>
        </div>

        <div className="highlight-card">
          <Euro className="highlight-icon savings" />
          <div className="highlight-content">
            <div className="highlight-value positive">
              {formatCurrency(comparison.savingsWithControls.costEur)}
            </div>
            <div className="highlight-label">Einsparung mit Steuerung / Jahr</div>
          </div>
        </div>

        <div className="highlight-card">
          <Clock className="highlight-icon" />
          <div className="highlight-content">
            <div className="highlight-value">
              {payback.paybackYears.withControls === Infinity 
                ? '-' 
                : `${formatNumber(payback.paybackYears.withControls, 1)} Jahre`}
            </div>
            <div className="highlight-label">Amortisation mit Steuerung</div>
          </div>
        </div>
      </div>
    </section>
  );
};
