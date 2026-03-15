// Berechnungsmodul für den Wirtschaftlichkeitsrechner
// Version 2.0 - Alle Formeln gemäß AGENTS.md Abschnitt 4, 5 und 8

import type { 
  Luminaire, 
  LuminaireCalculated, 
  LuminaireDefaults,
  ComparisonResult,
  PaybackResult,
  ControlSettings,
  ExistingLuminaire,
  ExistingLuminaireCalculated,
  LampType
} from '../types';
import { LAMP_POWER_LOOKUP } from '../constants';

// ============================================
// C06: Neue Berechnung für Leuchten Bestand
// ============================================

/**
 * Holt die Leistung eines Lampentyps
 */
export function getLampPower(lampType: LampType): number {
  return LAMP_POWER_LOOKUP[lampType];
}

/**
 * Berechnet die Werte einer Bestandsleuchte (v2.0)
 */
export function calculateExistingLuminaire(
  luminaire: ExistingLuminaire
): ExistingLuminaireCalculated {
  const powerW = getLampPower(luminaire.lampType);
  const totalPowerW = luminaire.quantity * powerW * luminaire.flameCount;
  
  return {
    ...luminaire,
    powerW,
    totalPowerW,
  };
}

/**
 * Berechnet die Gesamtleistung aller Bestandsleuchten in kW
 */
export function calculateExistingTotalPowerKw(
  luminaires: ExistingLuminaireCalculated[]
): number {
  return luminaires.reduce(
    (sum, lum) => sum + lum.totalPowerW,
    0
  ) / 1000;
}

/**
 * Berechnet den jährlichen Energiebedarf für Bestand in kWh
 */
export function calculateExistingEnergyKwh(
  luminaires: ExistingLuminaireCalculated[],
  annualOperatingHours: number
): number {
  const totalPowerKw = calculateExistingTotalPowerKw(luminaires);
  return totalPowerKw * annualOperatingHours;
}

// ============================================
// Leuchten Neu Berechnungen (C04: powerOverhead entfernt)
// ============================================

/**
 * Berechnet die effektiven Werte einer neuen Leuchte
 * C04: powerOverheadPercent wurde entfernt
 */
export function calculateLuminaire(
  luminaire: Luminaire,
  defaults: LuminaireDefaults
): LuminaireCalculated {
  // C04: Kein powerOverhead mehr - direkte Leistung
  const totalPowerW = luminaire.powerW;
  const lumensEffective = luminaire.lumensNominal * (defaults.lumenFactorPercent / 100);
  
  return {
    ...luminaire,
    totalPowerW,
    lumensEffective,
  };
}

/**
 * Berechnet die Gesamtleistung aller neuen Leuchten in kW
 */
export function calculateTotalPowerKw(
  luminaires: LuminaireCalculated[]
): number {
  return luminaires.reduce(
    (sum, lum) => sum + (lum.quantity * lum.totalPowerW),
    0
  ) / 1000;
}

/**
 * Berechnet die Gesamt-Lumen
 */
export function calculateTotalLumens(
  luminaires: LuminaireCalculated[]
): number {
  return luminaires.reduce(
    (sum, lum) => sum + (lum.quantity * lum.lumensEffective),
    0
  );
}

/**
 * Berechnet den jährlichen Energiebedarf in kWh
 */
export function calculateEnergyKwh(
  luminaires: LuminaireCalculated[],
  annualOperatingHours: number
): number {
  const totalPowerKw = calculateTotalPowerKw(luminaires);
  return totalPowerKw * annualOperatingHours;
}

// ============================================
// C07: Steuerung mit variablen Prozentsätzen
// ============================================

/**
 * Berechnet den Energiebedarf NEU mit Steuerung
 * C07: Verwendet jetzt variable Prozentsätze (0, 10, 20, 30, 40%)
 */
export function calculateEnergyNewWithControls(
  energyKwhRaw: number,
  controlSettings: ControlSettings
): number {
  const daylightReduction = controlSettings.daylightReductionPercent;
  const motionReduction = controlSettings.motionReductionPercent;
  
  // Berechnung gemäß Formel
  const energyAfterDaylight = energyKwhRaw * (1 - daylightReduction / 100);
  
  const motionBase = daylightReduction > 0 ? energyAfterDaylight : energyKwhRaw;
  const energyAfterMotion = motionBase * (1 - motionReduction / 100);
  
  // Minimum aus allen Varianten
  return Math.min(energyKwhRaw, energyAfterDaylight, energyAfterMotion);
}

/**
 * Berechnet die kombinierte Reduktion durch Steuerung
 */
export function calculateTotalReduction(controlSettings: ControlSettings): number {
  const daylightReduction = controlSettings.daylightReductionPercent;
  const motionReduction = controlSettings.motionReductionPercent;
  
  if (daylightReduction === 0 && motionReduction === 0) {
    return 0;
  }
  
  // Sequentielle Anwendung: erst Tageslicht, dann Bewegung
  const afterDaylight = 1 - (daylightReduction / 100);
  const afterMotion = afterDaylight * (1 - motionReduction / 100);
  
  return Math.round((1 - afterMotion) * 100);
}

// ============================================
// Allgemeine Berechnungsfunktionen
// ============================================

/**
 * Berechnet die Energiekosten
 */
export function calculateEnergyCost(
  energyKwh: number,
  electricityPriceEur: number
): number {
  return energyKwh * electricityPriceEur;
}

/**
 * Berechnet die CO₂-Emissionen in kg
 */
export function calculateCo2Emissions(
  energyKwh: number,
  co2FactorGPerKwh: number
): number {
  return (energyKwh * co2FactorGPerKwh) / 1000;
}

/**
 * Berechnet das Gesamtinvestment
 */
export function calculateTotalInvestment(
  luminairesEur: number,
  controlsEur: number,
  installationEur: number
): number {
  return luminairesEur + controlsEur + installationEur;
}

/**
 * Berechnet die Nutzungsdauer in Jahren
 */
export function calculateServiceLifeYears(
  serviceLifeHours: number,
  annualOperatingHours: number
): number {
  if (annualOperatingHours === 0) return 0;
  return serviceLifeHours / annualOperatingHours;
}

/**
 * Berechnet die Payback-Zeit in Jahren
 */
export function calculatePaybackYears(
  investmentTotalEur: number,
  savingsPerYearEur: number
): number {
  if (savingsPerYearEur <= 0) return Infinity;
  return investmentTotalEur / savingsPerYearEur;
}

/**
 * Berechnet die kumulierten Einsparungen pro Jahr
 */
export function calculateCumulativeSavings(
  savingsPerYearEur: number,
  years: number
): number[] {
  return Array.from({ length: years + 1 }, (_, y) => y * savingsPerYearEur);
}

/**
 * Berechnet den Netto-Cashflow pro Jahr
 */
export function calculateNetCashflow(
  cumulativeSavings: number[],
  investmentTotalEur: number
): number[] {
  return cumulativeSavings.map(saving => saving - investmentTotalEur);
}

// ============================================
// Hauptvergleichsfunktion (v2.0 Updated)
// ============================================

/**
 * Vollständiger Vergleich Bestand vs. Neu (v2.0)
 * C04: Ohne powerOverhead
 * C06: Mit neuer Bestandsstruktur
 * C07: Mit variablen Steuerungsreduktionen
 * 
 * Hinweis: existingDefaults wird für Kompatibilität übergeben, aber in v2.0
 * nicht mehr für powerOverhead verwendet (nur lumenFactor für Bestand entfällt ebenfalls)
 */
export function calculateComparisonV2(
  existingLuminaires: ExistingLuminaire[],
  newLuminaires: Luminaire[],
  _existingDefaults: LuminaireDefaults, // Für Kompatibilität, aber ungenutzt in v2.0
  newDefaults: LuminaireDefaults,
  annualOperatingHours: number,
  electricityPriceEur: number,
  maintenanceCostExistingEur: number,
  maintenanceCostNewEur: number,
  co2FactorGPerKwh: number,
  controlSettings: ControlSettings
): ComparisonResult {
  return calculateComparison(
    existingLuminaires,
    newLuminaires,
    newDefaults,
    annualOperatingHours,
    electricityPriceEur,
    maintenanceCostExistingEur,
    maintenanceCostNewEur,
    co2FactorGPerKwh,
    controlSettings
  );
}

/**
 * Vollständiger Vergleich Bestand vs. Neu
 * C04: Ohne powerOverhead
 * C06: Mit neuer Bestandsstruktur
 * C07: Mit variablen Steuerungsreduktionen
 */
export function calculateComparison(
  existingLuminaires: ExistingLuminaire[],
  newLuminaires: Luminaire[],
  newDefaults: LuminaireDefaults,
  annualOperatingHours: number,
  electricityPriceEur: number,
  maintenanceCostExistingEur: number,
  maintenanceCostNewEur: number,
  co2FactorGPerKwh: number,
  controlSettings: ControlSettings
): ComparisonResult {
  // Bestand berechnen (C06: neue Struktur)
  const existingCalculated = existingLuminaires.map(l => calculateExistingLuminaire(l));
  const existingTotalPowerKw = calculateExistingTotalPowerKw(existingCalculated);
  const existingEnergyKwh = calculateExistingEnergyKwh(existingCalculated, annualOperatingHours);
  const existingEnergyCostEur = calculateEnergyCost(existingEnergyKwh, electricityPriceEur);
  const existingTotalCostEur = existingEnergyCostEur + maintenanceCostExistingEur;
  const existingCo2Kg = calculateCo2Emissions(existingEnergyKwh, co2FactorGPerKwh);
  
  // Bestand hat keine Lumen mehr in v2.0 (wird als 0 behandelt)
  const existingTotalLumens = 0;
  
  // Neu berechnen
  const newCalculated = newLuminaires.map(l => calculateLuminaire(l, newDefaults));
  const newTotalPowerKw = calculateTotalPowerKw(newCalculated);
  const newTotalLumens = calculateTotalLumens(newCalculated);
  const newEnergyKwhRaw = calculateEnergyKwh(newCalculated, annualOperatingHours);
  // C07: Variable Steuerungsreduktion
  const newEnergyKwh = calculateEnergyNewWithControls(newEnergyKwhRaw, controlSettings);
  const newEnergyCostEur = calculateEnergyCost(newEnergyKwh, electricityPriceEur);
  const newTotalCostEur = newEnergyCostEur + maintenanceCostNewEur;
  const newCo2Kg = calculateCo2Emissions(newEnergyKwh, co2FactorGPerKwh);
  
  // Einsparungen
  const savingsEnergyKwh = existingEnergyKwh - newEnergyKwh;
  const savingsCostEur = existingTotalCostEur - newTotalCostEur;
  const savingsCo2Kg = existingCo2Kg - newCo2Kg;
  const savingsPercent = existingTotalCostEur > 0 
    ? (savingsCostEur / existingTotalCostEur) * 100 
    : 0;
  
  return {
    existing: {
      totalPowerKw: existingTotalPowerKw,
      energyKwh: existingEnergyKwh,
      totalLumens: existingTotalLumens,
      energyCostEur: existingEnergyCostEur,
      maintenanceCostEur: maintenanceCostExistingEur,
      totalCostEur: existingTotalCostEur,
      co2Kg: existingCo2Kg,
    },
    new: {
      totalPowerKw: newTotalPowerKw,
      energyKwh: newEnergyKwh,
      totalLumens: newTotalLumens,
      energyCostEur: newEnergyCostEur,
      maintenanceCostEur: maintenanceCostNewEur,
      totalCostEur: newTotalCostEur,
      co2Kg: newCo2Kg,
    },
    savings: {
      energyKwh: savingsEnergyKwh,
      costEur: savingsCostEur,
      co2Kg: savingsCo2Kg,
      percent: savingsPercent,
    },
  };
}

/**
 * Berechnet Payback und Cashflow-Daten
 */
export function calculatePayback(
  investmentLuminairesEur: number,
  investmentControlsEur: number,
  investmentInstallationEur: number,
  savingsPerYearEur: number,
  serviceLifeHours: number,
  annualOperatingHours: number
): PaybackResult {
  const investmentTotalEur = calculateTotalInvestment(
    investmentLuminairesEur,
    investmentControlsEur,
    investmentInstallationEur
  );
  
  const serviceLifeYears = Math.ceil(calculateServiceLifeYears(serviceLifeHours, annualOperatingHours));
  const paybackYears = calculatePaybackYears(investmentTotalEur, savingsPerYearEur);
  
  // Berechne für Grafik
  const years = Math.max(serviceLifeYears, Math.ceil(paybackYears) + 2, 10);
  const cumulativeSavings = calculateCumulativeSavings(savingsPerYearEur, years);
  const netCashflow = calculateNetCashflow(cumulativeSavings, investmentTotalEur);
  
  return {
    investmentTotalEur,
    savingsPerYearEur,
    paybackYears,
    serviceLifeYears,
    cumulativeSavings,
    netCashflow,
  };
}

// ============================================
// Formatierungsfunktionen
// ============================================

/**
 * Formatiert eine Zahl als Währung
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formatiert eine Zahl mit Tausendertrennzeichen
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formatiert eine Zahl als Prozent
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}
