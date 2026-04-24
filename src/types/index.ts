// Typen für den Wirtschaftlichkeitsrechner
// Version 4.0 - Updated gemäß App_Rechner_v4.pdf

// ============================================
// v4.0 TYPES
// ============================================

// V4: Combined Lampentyp/Länge/Leistung as single dropdown key
// Each entry represents a unique combination of lamp type, length, and wattage
export type LampTypeWithPower =
  | 'T5-549mm-14W'
  | 'T5-549mm-24W'
  | 'T5-1149mm-28W'
  | 'T5-1149mm-54W'
  | 'T5-1449mm-35W'
  | 'T5-1449mm-49W'
  | 'T5-1449mm-80W'
  | 'T8-600mm-18W'
  | 'T8-1200mm-36W'
  | 'T8-1500mm-58W';

// Keep old LampType for backwards compatibility during migration
export type LampType = 
  | 'T5-549mm' 
  | 'T5-1149mm' 
  | 'T5-1449mm' 
  | 'T8-600mm' 
  | 'T8-1200mm' 
  | 'T8-1500mm';

// V3-04: Bestückung erweitert (1-flammig bis 4-flammig)
export type FlameCount = 1 | 2 | 3 | 4;

// V3-08: Reduktionsstufen für Steuerung mit Mittelwerten der Bereiche
// Keine (0%), Wenig (10-30% → 20%), Mittel (31-50% → 40.5%), Viel (51-70% → 60.5%), Sehr viel (>70% → 85%)
export type ReductionLevel = 0 | 20 | 40.5 | 60.5 | 85;

// V4: Leuchten Bestand - now uses combined LampTypeWithPower
export interface ExistingLuminaire {
  id: string;
  quantity: number;
  lampType: LampTypeWithPower;
  flameCount: FlameCount;
}

// V4: Leuchten Neu - removed lumensNominal (Lumen columns deleted)
export interface Luminaire {
  id: string;
  name: string;
  quantity: number;
  powerW: number;
}

// V4: Simplified - no more lumens
export interface LuminaireCalculated extends Luminaire {
  totalPowerW: number;
}

// Berechnete Werte für Leuchten Bestand
export interface ExistingLuminaireCalculated extends ExistingLuminaire {
  powerW: number;
  totalPowerW: number;
}

// V4: Removed maintenanceCostExistingEur and maintenanceCostNewEur
export interface ProjectData {
  projectName: string;
  roomUsage: string;
  annualOperatingHours: number;
  electricityPriceEur: number;
  co2Source: string;
  co2FactorGPerKwh: number;
}

// V4: Removed lumenFactorPercent from defaults (Lumenfaktor deleted for Neu)
export interface LuminaireDefaults {
  serviceLifeHours: number;
}

// C07: Boolean → ReductionLevel (percentage)
export interface ControlSettings {
  daylightReductionPercent: ReductionLevel;
  motionReductionPercent: ReductionLevel;
}

// V4: Restructured investment costs - 4 input fields
export interface InvestmentCosts {
  luminairesEur: number;
  installationLuminairesEur: number;
  controlsEur: number;
  installationControlsEur: number;
}

export interface ComparisonResult {
  existing: {
    totalPowerKw: number;
    energyKwh: number;
    totalLumens: number;
    energyCostEur: number;
    totalCostEur: number;
    co2Kg: number;
  };
  new: {
    totalPowerKw: number;
    energyKwh: number;
    totalLumens: number;
    energyCostEur: number;
    totalCostEur: number;
    co2Kg: number;
  };
  savings: {
    energyKwh: number;
    costEur: number;
    co2Kg: number;
    percent: number;
  };
}

export interface PaybackResult {
  investmentTotalEur: number;
  savingsPerYearEur: number;
  paybackYears: number;
  serviceLifeYears: number;
  cumulativeSavings: number[];
  netCashflow: number[];
}

// C02: Room usage with code
export interface RoomUsageOption {
  label: string;
  code: string;
  hoursPerYear: number | null; // null = benutzerdefiniert
}

export interface Co2SourceOption {
  label: string;
  factorGPerKwh: number | null; // null = benutzerdefiniert
}

// C07: Control reduction options
export interface ControlReductionOption {
  label: string;
  value: ReductionLevel;
}

export interface WkrState {
  projectData: ProjectData;
  newDefaults: LuminaireDefaults;
  existingLuminaires: ExistingLuminaire[];
  newLuminaires: Luminaire[];
  controlSettings: ControlSettings;
  investmentCosts: InvestmentCosts;
  companyLogo: string | null;
  existingPhotos: string[];
  newPhotos: string[];
}

// ============================================
// V4.0 TYPES
// ============================================

// V4: Variant data - removed maintenance
export interface VariantData {
  totalPowerKw: number;
  energyKwh: number;
  totalLumens: number;
  energyCostEur: number;
  totalCostEur: number;
  co2Kg: number;
  co2Tons: number;
}

// V3-13: Three-variant comparison result
export interface ComparisonResultV3 {
  existing: VariantData;
  newWithoutControls: VariantData;
  newWithControls: VariantData;
  savingsWithoutControls: {
    energyKwh: number;
    costEur: number;
    co2Kg: number;
    co2Tons: number;
    percent: number;
  };
  savingsWithControls: {
    energyKwh: number;
    costEur: number;
    co2Kg: number;
    co2Tons: number;
    percent: number;
  };
}

// V4: Investment variants - restructured
export interface InvestmentVariants {
  luminairesTotal: number;  // luminaires + installation luminaires
  controlsTotal: number;    // controls + installation controls
  withoutControls: number;  // = luminairesTotal
  withControls: number;     // = luminairesTotal + controlsTotal
  total: number;            // = withControls
}

// V3-20: Dual payback result
export interface PaybackResultV3 {
  investment: InvestmentVariants;
  savingsPerYear: {
    withoutControls: number;
    withControls: number;
  };
  paybackYears: {
    withoutControls: number;
    withControls: number;
  };
  serviceLifeYears: number;
  cumulativeSavingsWithoutControls: number[];
  cumulativeSavingsWithControls: number[];
  netCashflowWithoutControls: number[];
  netCashflowWithControls: number[];
}
