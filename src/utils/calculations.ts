// Berechnungsmodul für den Wirtschaftlichkeitsrechner
// Version 4.0 - Alle Formeln gemäß App_Rechner_v4.pdf

import type { 
  Luminaire, 
  LuminaireCalculated, 
  LuminaireDefaults,
  ComparisonResult,
  PaybackResult,
  ControlSettings,
  ExistingLuminaire,
  ExistingLuminaireCalculated,
  LampTypeWithPower,
  ComparisonResultV3,
  PaybackResultV3,
  InvestmentVariants,
  VariantData,
  InvestmentCosts
} from '../types';
import { LAMP_TYPE_POWER_LOOKUP } from '../constants';

// ============================================
// V4: Berechnung für Leuchten Bestand (combined type+power)
// ============================================

/**
 * Holt die Leistung eines Lampentyps (V4: combined key)
 */
export function getLampPower(lampType: LampTypeWithPower): number {
  return LAMP_TYPE_POWER_LOOKUP[lampType] || 0;
}

/**
 * Berechnet die Werte einer Bestandsleuchte
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
// V4: Leuchten Neu Berechnungen (simplified - no lumen, no powerOverhead)
// ============================================

/**
 * Berechnet die effektiven Werte einer neuen Leuchte
 * V4: Removed lumen calculation entirely
 */
export function calculateLuminaire(
  luminaire: Luminaire,
  _defaults: LuminaireDefaults
): LuminaireCalculated {
  const totalPowerW = luminaire.powerW;
  
  return {
    ...luminaire,
    totalPowerW,
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
// V3-08/V4: Steuerung mit Bereichs-Mittelwerten
// ============================================

/**
 * Berechnet den Energiebedarf NEU mit Steuerung
 */
export function calculateEnergyNewWithControls(
  energyKwhRaw: number,
  controlSettings: ControlSettings
): number {
  const daylightReduction = controlSettings.daylightReductionPercent;
  const motionReduction = controlSettings.motionReductionPercent;
  
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
  
  const afterDaylight = 1 - (daylightReduction / 100);
  const afterMotion = afterDaylight * (1 - motionReduction / 100);
  
  return Math.round((1 - afterMotion) * 100);
}

// ============================================
// Allgemeine Berechnungsfunktionen
// ============================================

export function calculateEnergyCost(
  energyKwh: number,
  electricityPriceEur: number
): number {
  return energyKwh * electricityPriceEur;
}

export function calculateCo2Emissions(
  energyKwh: number,
  co2FactorGPerKwh: number
): number {
  return (energyKwh * co2FactorGPerKwh) / 1000;
}

export function calculateTotalInvestment(
  luminairesEur: number,
  controlsEur: number,
  installationEur: number
): number {
  return luminairesEur + controlsEur + installationEur;
}

export function calculateServiceLifeYears(
  serviceLifeHours: number,
  annualOperatingHours: number
): number {
  if (annualOperatingHours === 0) return 0;
  return serviceLifeHours / annualOperatingHours;
}

export function calculatePaybackYears(
  investmentTotalEur: number,
  savingsPerYearEur: number
): number {
  if (savingsPerYearEur <= 0) return Infinity;
  return investmentTotalEur / savingsPerYearEur;
}

export function calculateCumulativeSavings(
  savingsPerYearEur: number,
  years: number
): number[] {
  return Array.from({ length: years + 1 }, (_, y) => y * savingsPerYearEur);
}

export function calculateNetCashflow(
  cumulativeSavings: number[],
  investmentTotalEur: number
): number[] {
  return cumulativeSavings.map(saving => saving - investmentTotalEur);
}

// ============================================
// V2/V3 legacy comparison (kept for backwards compat)
// ============================================

export function calculateComparison(
  existingLuminaires: ExistingLuminaire[],
  newLuminaires: Luminaire[],
  newDefaults: LuminaireDefaults,
  annualOperatingHours: number,
  electricityPriceEur: number,
  co2FactorGPerKwh: number,
  controlSettings: ControlSettings
): ComparisonResult {
  const existingCalculated = existingLuminaires.map(l => calculateExistingLuminaire(l));
  const existingTotalPowerKw = calculateExistingTotalPowerKw(existingCalculated);
  const existingEnergyKwh = calculateExistingEnergyKwh(existingCalculated, annualOperatingHours);
  const existingEnergyCostEur = calculateEnergyCost(existingEnergyKwh, electricityPriceEur);
  const existingTotalCostEur = existingEnergyCostEur;
  const existingCo2Kg = calculateCo2Emissions(existingEnergyKwh, co2FactorGPerKwh);
  
  const newCalculated = newLuminaires.map(l => calculateLuminaire(l, newDefaults));
  const newTotalPowerKw = calculateTotalPowerKw(newCalculated);
  const newEnergyKwhRaw = calculateEnergyKwh(newCalculated, annualOperatingHours);
  const newEnergyKwh = calculateEnergyNewWithControls(newEnergyKwhRaw, controlSettings);
  const newEnergyCostEur = calculateEnergyCost(newEnergyKwh, electricityPriceEur);
  const newTotalCostEur = newEnergyCostEur;
  const newCo2Kg = calculateCo2Emissions(newEnergyKwh, co2FactorGPerKwh);
  
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
      totalLumens: 0,
      energyCostEur: existingEnergyCostEur,
      totalCostEur: existingTotalCostEur,
      co2Kg: existingCo2Kg,
    },
    new: {
      totalPowerKw: newTotalPowerKw,
      energyKwh: newEnergyKwh,
      totalLumens: 0,
      energyCostEur: newEnergyCostEur,
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

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

// ============================================
// V4 FUNCTIONS
// ============================================

/**
 * V4: Berechnet die Investitionsvarianten (restructured)
 */
export function calculateInvestmentVariants(costs: InvestmentCosts): InvestmentVariants {
  const luminairesTotal = costs.luminairesEur + costs.installationLuminairesEur;
  const controlsTotal = costs.controlsEur + costs.installationControlsEur;
  const withoutControls = luminairesTotal;
  const withControls = luminairesTotal + controlsTotal;
  
  return {
    luminairesTotal,
    controlsTotal,
    withoutControls,
    withControls,
    total: withControls,
  };
}

/**
 * V3-14: Konvertiert kg CO2 zu Tonnen
 */
export function co2KgToTons(kg: number): number {
  return kg / 1000;
}

/**
 * V4: Vollständiger Vergleich mit drei Varianten (no maintenance)
 */
export function calculateComparisonV3(
  existingLuminaires: ExistingLuminaire[],
  newLuminaires: Luminaire[],
  newDefaults: LuminaireDefaults,
  annualOperatingHours: number,
  electricityPriceEur: number,
  co2FactorGPerKwh: number,
  controlSettings: ControlSettings
): ComparisonResultV3 {
  // ======== BESTAND berechnen ========
  const existingCalculated = existingLuminaires.map(l => calculateExistingLuminaire(l));
  const existingTotalPowerKw = calculateExistingTotalPowerKw(existingCalculated);
  const existingEnergyKwh = calculateExistingEnergyKwh(existingCalculated, annualOperatingHours);
  const existingEnergyCostEur = calculateEnergyCost(existingEnergyKwh, electricityPriceEur);
  const existingTotalCostEur = existingEnergyCostEur;
  const existingCo2Kg = calculateCo2Emissions(existingEnergyKwh, co2FactorGPerKwh);
  
  const existing: VariantData = {
    totalPowerKw: existingTotalPowerKw,
    energyKwh: existingEnergyKwh,
    totalLumens: 0,
    energyCostEur: existingEnergyCostEur,
    totalCostEur: existingTotalCostEur,
    co2Kg: existingCo2Kg,
    co2Tons: co2KgToTons(existingCo2Kg),
  };
  
  // ======== NEU berechnen ========
  const newCalculated = newLuminaires.map(l => calculateLuminaire(l, newDefaults));
  const newTotalPowerKw = calculateTotalPowerKw(newCalculated);
  
  // Energie ohne Steuerung
  const newEnergyWithoutControlsKwh = calculateEnergyKwh(newCalculated, annualOperatingHours);
  const newEnergyCostWithoutControlsEur = calculateEnergyCost(newEnergyWithoutControlsKwh, electricityPriceEur);
  const newTotalCostWithoutControlsEur = newEnergyCostWithoutControlsEur;
  const newCo2WithoutControlsKg = calculateCo2Emissions(newEnergyWithoutControlsKwh, co2FactorGPerKwh);
  
  const newWithoutControls: VariantData = {
    totalPowerKw: newTotalPowerKw,
    energyKwh: newEnergyWithoutControlsKwh,
    totalLumens: 0,
    energyCostEur: newEnergyCostWithoutControlsEur,
    totalCostEur: newTotalCostWithoutControlsEur,
    co2Kg: newCo2WithoutControlsKg,
    co2Tons: co2KgToTons(newCo2WithoutControlsKg),
  };
  
  // Energie mit Steuerung
  const newEnergyWithControlsKwh = calculateEnergyNewWithControls(newEnergyWithoutControlsKwh, controlSettings);
  const newEnergyCostWithControlsEur = calculateEnergyCost(newEnergyWithControlsKwh, electricityPriceEur);
  const newTotalCostWithControlsEur = newEnergyCostWithControlsEur;
  const newCo2WithControlsKg = calculateCo2Emissions(newEnergyWithControlsKwh, co2FactorGPerKwh);
  
  const newWithControls: VariantData = {
    totalPowerKw: newTotalPowerKw,
    energyKwh: newEnergyWithControlsKwh,
    totalLumens: 0,
    energyCostEur: newEnergyCostWithControlsEur,
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
 * V4: Berechnet Payback und Cashflow-Daten für beide Varianten
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
  
  // V4: ~14 years for charts
  const years = Math.max(
    serviceLifeYears, 
    Math.ceil(Math.min(
      paybackWithoutControls === Infinity ? 14 : paybackWithoutControls, 
      paybackWithControls === Infinity ? 14 : paybackWithControls
    )) + 2, 
    14
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
  const cleanValue = value.replace(/\./g, '').replace(/,/g, '.');
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * V4: Formatiert EUR-Werte für Y-Achse mit Tausenderpunkt (nicht "k")
 */
export function formatEurAxis(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value) + ' EUR';
}
