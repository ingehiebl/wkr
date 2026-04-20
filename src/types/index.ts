// Typen für den Wirtschaftlichkeitsrechner
// Version 3.0 - Updated gemäß App_Rechner_v3.pdf

// ============================================
// v3.0 TYPES
// ============================================

// C06: Lampentyp für Leuchten Bestand
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

// C06: Neue Struktur für Leuchten Bestand (v2.0)
export interface ExistingLuminaire {
  id: string;
  quantity: number;
  lampType: LampType;
  flameCount: FlameCount;
}

// Leuchten Neu - behält die alte Struktur
export interface Luminaire {
  id: string;
  name: string;
  quantity: number;
  powerW: number;
  lumensNominal: number;
}

export interface LuminaireCalculated extends Luminaire {
  totalPowerW: number;
  lumensEffective: number;
}

// C06: Berechnete Werte für Leuchten Bestand
export interface ExistingLuminaireCalculated extends ExistingLuminaire {
  powerW: number;
  totalPowerW: number;
}

export interface ProjectData {
  projectName: string;
  roomUsage: string;
  annualOperatingHours: number;
  electricityPriceEur: number;
  maintenanceCostExistingEur: number;
  maintenanceCostNewEur: number;
  co2Source: string;
  co2FactorGPerKwh: number;
}

// C04: powerOverheadPercent REMOVED
export interface LuminaireDefaults {
  lumenFactorPercent: number;
  serviceLifeHours: number;
}

// C07: Boolean → ReductionLevel (percentage)
export interface ControlSettings {
  daylightReductionPercent: ReductionLevel;
  motionReductionPercent: ReductionLevel;
}

export interface InvestmentCosts {
  luminairesEur: number;
  controlsEur: number;
  installationEur: number;
}

export interface ComparisonResult {
  existing: {
    totalPowerKw: number;
    energyKwh: number;
    totalLumens: number;
    energyCostEur: number;
    maintenanceCostEur: number;
    totalCostEur: number;
    co2Kg: number;
  };
  new: {
    totalPowerKw: number;
    energyKwh: number;
    totalLumens: number;
    energyCostEur: number;
    maintenanceCostEur: number;
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
  existingDefaults: LuminaireDefaults;
  newDefaults: LuminaireDefaults;
  existingLuminaires: ExistingLuminaire[]; // C06: Changed type
  newLuminaires: Luminaire[];
  controlSettings: ControlSettings;
  investmentCosts: InvestmentCosts;
  companyLogo: string | null;
  // V3-21: Photo storage
  existingPhotos: string[]; // Base64 or file paths
  newPhotos: string[];
}

// ============================================
// V3.0 NEW TYPES
// ============================================

// V3-09/V3-13: Variant data for comparison
export interface VariantData {
  totalPowerKw: number;
  energyKwh: number;
  totalLumens: number;
  energyCostEur: number;
  maintenanceCostEur: number;
  totalCostEur: number;
  co2Kg: number;
  co2Tons: number; // V3-14: CO2 in Tonnen
}

// V3-13: Three-variant comparison result
export interface ComparisonResultV3 {
  existing: VariantData;
  newWithoutControls: VariantData;
  newWithControls: VariantData;
  // Savings compared to existing
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

// V3-12/V3-20: Investment variants
export interface InvestmentVariants {
  withoutControls: number; // luminaires + installation
  withControls: number;    // luminaires + controls + installation
  total: number;           // Same as withControls (for backwards compat)
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
  // Chart data for both variants
  cumulativeSavingsWithoutControls: number[];
  cumulativeSavingsWithControls: number[];
  netCashflowWithoutControls: number[];
  netCashflowWithControls: number[];
}
