// Typen für den Wirtschaftlichkeitsrechner

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

export interface LuminaireDefaults {
  powerOverheadPercent: number;
  lumenFactorPercent: number;
  serviceLifeHours: number;
}

export interface ControlSettings {
  daylightControl: boolean;
  motionControl: boolean;
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

export interface RoomUsageOption {
  label: string;
  hoursPerYear: number | null; // null = benutzerdefiniert
}

export interface Co2SourceOption {
  label: string;
  factorGPerKwh: number | null; // null = benutzerdefiniert
}

export interface WkrState {
  projectData: ProjectData;
  existingDefaults: LuminaireDefaults;
  newDefaults: LuminaireDefaults;
  existingLuminaires: Luminaire[];
  newLuminaires: Luminaire[];
  controlSettings: ControlSettings;
  investmentCosts: InvestmentCosts;
  companyLogo: string | null;
}
