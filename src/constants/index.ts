// Lookup-Listen und Konstanten basierend auf AGENTS.md

import type { RoomUsageOption, Co2SourceOption, LuminaireDefaults } from '../types';

export const ROOM_USAGE_OPTIONS: RoomUsageOption[] = [
  { label: 'Benutzerdefiniert', hoursPerYear: null },
  { label: 'Büro', hoursPerYear: 2500 },
  { label: 'Einzelhandel', hoursPerYear: 3600 },
  { label: 'Lager (Bedarfsfall)', hoursPerYear: 800 },
  { label: 'Lager (Dauerbetrieb)', hoursPerYear: 2500 },
  { label: 'Produktion 1-Schicht', hoursPerYear: 2000 },
  { label: 'Produktion 2-Schicht', hoursPerYear: 4000 },
  { label: 'Produktion 3-Schicht', hoursPerYear: 6500 },
];

export const CO2_SOURCE_OPTIONS: Co2SourceOption[] = [
  { label: 'EU Strommix', factorGPerKwh: 250 },
  { label: 'Wasserkraft', factorGPerKwh: 25 },
  { label: 'Benutzerdefiniert', factorGPerKwh: null },
];

export const DEFAULT_EXISTING_LUMINAIRE: LuminaireDefaults = {
  powerOverheadPercent: 10,
  lumenFactorPercent: 53,
  serviceLifeHours: 10000,
};

export const DEFAULT_NEW_LUMINAIRE: LuminaireDefaults = {
  powerOverheadPercent: 0,
  lumenFactorPercent: 100,
  serviceLifeHours: 50000,
};

export const CONTROL_REDUCTIONS = {
  daylight: 30, // 30% Reduktion
  motion: 30,   // 30% Reduktion
};

export const DEFAULT_PROJECT_DATA = {
  projectName: '',
  roomUsage: 'Büro',
  annualOperatingHours: 2500,
  electricityPriceEur: 0.25,
  maintenanceCostExistingEur: 500,
  maintenanceCostNewEur: 100,
  co2Source: 'EU Strommix',
  co2FactorGPerKwh: 250,
};

export const DEFAULT_INVESTMENT = {
  luminairesEur: 0,
  controlsEur: 0,
  installationEur: 0,
};

export const DEFAULT_CONTROL_SETTINGS = {
  daylightControl: false,
  motionControl: false,
};

// Hilfsfunktion zum Generieren einer eindeutigen ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Beispiel-Leuchte für initiale Daten
export const createEmptyLuminaire = () => ({
  id: generateId(),
  name: '',
  quantity: 1,
  powerW: 0,
  lumensNominal: 0,
});
