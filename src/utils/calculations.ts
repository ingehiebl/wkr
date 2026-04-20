// Berechnungsmodul für den Wirtschaftlichkeitsrechner
// Version 3.0 - Alle Formeln gemäß App_Rechner_v3.pdf

import type { 
  Luminaire, 
  LuminaireCalculated, 
  LuminaireDefaults,
  ComparisonResult,
  PaybackResult,
  ControlSettings,
  ExistingLuminaire,
  ExistingLuminaireCalculated,
  LampType,
  ComparisonResultV3,
  PaybackResultV3,
  InvestmentVariants,
  VariantData,
  InvestmentCosts
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
// V3-08: Steuerung mit Bereichs-Mittelwerten
// ============================================

/**
 * Berechnet den Energiebedarf NEU mit Steuerung
 * V3-08: Verwendet jetzt Mittelwerte der Bereiche (0, 20, 40.5, 60.5, 85%)
 */
export function calculateEnergyNewWithControls(
  energyKwhRaw: number,
  controlSettings: ControlSettings
): number {
  const daylightReduction = controlSettings.daylightReductionPercent;
  const motionReduction = controlSettings.motionReductionPercent;
  
  // V3 Berechnung gemäß Formel:
  // energyNewWithControls = energyNewWithoutControlsKwh * (1 - daylightReduction/100) * (1 - motionReduction/100)
  const energyWithControls = energyKwhRaw * (1 - daylightReduction / 100) * (1 - motionReduction / 100);
  
  return energyWithControls;
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

// ============================================
// V3.0 NEW FUNCTIONS
// ============================================

/**
 * V3-12: Berechnet die Investitionsvarianten
 */
export function calculateInvestmentVariants(costs: InvestmentCosts): InvestmentVariants {
  const withoutControls = costs.luminairesEur + costs.installationEur;
  const withControls = costs.luminairesEur + costs.controlsEur + costs.installationEur;
  
  return {
    withoutControls,
    withControls,
    total: withControls, // For backwards compatibility
  };
}

/**
 * V3-14: Konvertiert kg CO2 zu Tonnen
 */
export function co2KgToTons(kg: number): number {
  return kg / 1000;
}

/**
 * V3-09/V3-13: Vollständiger Vergleich mit drei Varianten
 * - Bestand
 * - Neu ohne Steuerung
 * - Neu mit Steuerung
 */
export function calculateComparisonV3(
  existingLuminaires: ExistingLuminaire[],
  newLuminaires: Luminaire[],
  newDefaults: LuminaireDefaults,
  annualOperatingHours: number,
  electricityPriceEur: number,
  maintenanceCostExistingEur: number,
  maintenanceCostNewEur: number,
  co2FactorGPerKwh: number,
  controlSettings: ControlSettings
): ComparisonResultV3 {
  // ======== BESTAND berechnen ========
  const existingCalculated = existingLuminaires.map(l => calculateExistingLuminaire(l));
  const existingTotalPowerKw = calculateExistingTotalPowerKw(existingCalculated);
  const existingEnergyKwh = calculateExistingEnergyKwh(existingCalculated, annualOperatingHours);
  const existingEnergyCostEur = calculateEnergyCost(existingEnergyKwh, electricityPriceEur);
  const existingTotalCostEur = existingEnergyCostEur + maintenanceCostExistingEur;
  const existingCo2Kg = calculateCo2Emissions(existingEnergyKwh, co2FactorGPerKwh);
  
  const existing: VariantData = {
    totalPowerKw: existingTotalPowerKw,
    energyKwh: existingEnergyKwh,
    totalLumens: 0, // Bestand has no lumens in v3
    energyCostEur: existingEnergyCostEur,
    maintenanceCostEur: maintenanceCostExistingEur,
    totalCostEur: existingTotalCostEur,
    co2Kg: existingCo2Kg,
    co2Tons: co2KgToTons(existingCo2Kg),
  };
  
  // ======== NEU berechnen ========
  const newCalculated = newLuminaires.map(l => calculateLuminaire(l, newDefaults));
  const newTotalPowerKw = calculateTotalPowerKw(newCalculated);
  const newTotalLumens = calculateTotalLumens(newCalculated);
  
  // Energie ohne Steuerung (V3-09: Variante A)
  const newEnergyWithoutControlsKwh = calculateEnergyKwh(newCalculated, annualOperatingHours);
  const newEnergyCostWithoutControlsEur = calculateEnergyCost(newEnergyWithoutControlsKwh, electricityPriceEur);
  const newTotalCostWithoutControlsEur = newEnergyCostWithoutControlsEur + maintenanceCostNewEur;
  const newCo2WithoutControlsKg = calculateCo2Emissions(newEnergyWithoutControlsKwh, co2FactorGPerKwh);
  
  const newWithoutControls: VariantData = {
    totalPowerKw: newTotalPowerKw,
    energyKwh: newEnergyWithoutControlsKwh,
    totalLumens: newTotalLumens,
    energyCostEur: newEnergyCostWithoutControlsEur,
    maintenanceCostEur: maintenanceCostNewEur,
    totalCostEur: newTotalCostWithoutControlsEur,
    co2Kg: newCo2WithoutControlsKg,
    co2Tons: co2KgToTons(newCo2WithoutControlsKg),
  };
  
  // Energie mit Steuerung (V3-09: Variante B)
  const newEnergyWithControlsKwh = calculateEnergyNewWithControls(newEnergyWithoutControlsKwh, controlSettings);
  const newEnergyCostWithControlsEur = calculateEnergyCost(newEnergyWithControlsKwh, electricityPriceEur);
  const newTotalCostWithControlsEur = newEnergyCostWithControlsEur + maintenanceCostNewEur;
  const newCo2WithControlsKg = calculateCo2Emissions(newEnergyWithControlsKwh, co2FactorGPerKwh);
  
  const newWithControls: VariantData = {
    totalPowerKw: newTotalPowerKw,
    energyKwh: newEnergyWithControlsKwh,
    totalLumens: newTotalLumens,
    energyCostEur: newEnergyCostWithControlsEur,
    maintenanceCostEur: maintenanceCostNewEur,
    totalCostEur: newTotalCostWithControlsEur,
    co2Kg: newCo2WithControlsKg,
    co2Tons: co2KgToTons(newCo2WithControlsKg),
  };
  
  // ======== Einsparungen berechnen ========
  const savingsWithoutControls = {
    energyKwh: existingEnergyKwh - newEnergyWithoutControlsKwh,
    costEur: existingTotalCostEur - newTotalCostWithoutControlsEur,
    co2Kg: existingCo2Kg - newCo2WithoutControlsKg,
    co2Tons: co2KgToTons(existingCo2Kg - newCo2WithoutControlsKg),
    percent: existingTotalCostEur > 0 
      ? ((existingTotalCostEur - newTotalCostWithoutControlsEur) / existingTotalCostEur) * 100 
      : 0,
  };
  
  const savingsWithControls = {
    energyKwh: existingEnergyKwh - newEnergyWithControlsKwh,
    costEur: existingTotalCostEur - newTotalCostWithControlsEur,
    co2Kg: existingCo2Kg - newCo2WithControlsKg,
    co2Tons: co2KgToTons(existingCo2Kg - newCo2WithControlsKg),
    percent: existingTotalCostEur > 0 
      ? ((existingTotalCostEur - newTotalCostWithControlsEur) / existingTotalCostEur) * 100 
      : 0,
  };
  
  return {
    existing,
    newWithoutControls,
    newWithControls,
    savingsWithoutControls,
    savingsWithControls,
  };
}

/**
 * V3-20: Berechnet Payback und Cashflow-Daten für beide Varianten
 */
export function calculatePaybackV3(
  investmentCosts: InvestmentCosts,
  savingsPerYearWithoutControls: number,
  savingsPerYearWithControls: number,
  serviceLifeHours: number,
  annualOperatingHours: number
): PaybackResultV3 {
  const investment = calculateInvestmentVariants(investmentCosts);
  
  const serviceLifeYears = Math.ceil(calculateServiceLifeYears(serviceLifeHours, annualOperatingHours));
  
  const paybackWithoutControls = calculatePaybackYears(investment.withoutControls, savingsPerYearWithoutControls);
  const paybackWithControls = calculatePaybackYears(investment.withControls, savingsPerYearWithControls);
  
  // Berechne für Grafik - use maximum of all relevant years
  const years = Math.max(
    serviceLifeYears, 
    Math.ceil(Math.min(paybackWithoutControls, paybackWithControls)) + 2, 
    10
  );
  
  const cumulativeSavingsWithoutControls = calculateCumulativeSavings(savingsPerYearWithoutControls, years);
  const cumulativeSavingsWithControls = calculateCumulativeSavings(savingsPerYearWithControls, years);
  const netCashflowWithoutControls = calculateNetCashflow(cumulativeSavingsWithoutControls, investment.withoutControls);
  const netCashflowWithControls = calculateNetCashflow(cumulativeSavingsWithControls, investment.withControls);
  
  return {
    investment,
    savingsPerYear: {
      withoutControls: savingsPerYearWithoutControls,
      withControls: savingsPerYearWithControls,
    },
    paybackYears: {
      withoutControls: paybackWithoutControls,
      withControls: paybackWithControls,
    },
    serviceLifeYears,
    cumulativeSavingsWithoutControls,
    cumulativeSavingsWithControls,
    netCashflowWithoutControls,
    netCashflowWithControls,
  };
}

/**
 * V3-11: Formatiert eine Zahl mit Tausendertrennzeichen für Eingabefelder
 */
export function formatNumberWithThousandSeparator(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(value);
}

/**
 * V3-11: Parst eine Zahl mit Tausendertrennzeichen
 */
export function parseNumberWithThousandSeparator(value: string): number {
  // Remove thousand separators (German uses .)
  const cleanValue = value.replace(/\./g, '').replace(/,/g, '.');
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
}
