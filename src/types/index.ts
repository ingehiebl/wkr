// Typen für den Wirtschaftlichkeitsrechner
// Version 2.0 - Updated gemäß AGENTS.md

// ============================================
// v2.0 NEW TYPES
// ============================================

// C06: Lampentyp für Leuchten Bestand
export type LampType = 
  | 'T5-549mm' 
  | 'T5-1149mm' 
  | 'T5-1449mm' 
  | 'T8-600mm' 
  | 'T8-1200mm' 
  | 'T8-1500mm';

// C06: Bestückung (1-flammig / 2-flammig)
export type FlameCount = 1 | 2;

// C07: Reduktionsstufen für Steuerung
export type ReductionLevel = 0 | 10 | 20 | 30 | 40;

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
}
