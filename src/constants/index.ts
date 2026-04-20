// Lookup-Listen und Konstanten basierend auf App_Rechner_v3.pdf
// Version 3.0

import type { 
  RoomUsageOption, 
  Co2SourceOption, 
  LuminaireDefaults,
  LampType,
  ControlReductionOption,
  ReductionLevel
} from '../types';

// ============================================
// C02: Neue Raumnutzung gemäß DIN/Norm (42 Einträge)
// ============================================
export const ROOM_USAGE_OPTIONS: RoomUsageOption[] = [
  { label: 'Benutzerdefiniert', code: '', hoursPerYear: null },
  { label: 'Einzelbüro (A.1)', code: 'A.1', hoursPerYear: 2750 },
  { label: 'Gruppenbüro (A.2)', code: 'A.2', hoursPerYear: 2750 },
  { label: 'Großraumbüro (A.3)', code: 'A.3', hoursPerYear: 2750 },
  { label: 'Besprechung/Sitzungszimmer/Seminar (A.4)', code: 'A.4', hoursPerYear: 2750 },
  { label: 'Schalterhall (A.5)', code: 'A.5', hoursPerYear: 2750 },
  { label: 'Einzelhandel/Kaufhaus (A.6)', code: 'A.6', hoursPerYear: 3600 },
  { label: 'Einzelhandel/Kaufhaus (Lebensmittelabteilung mit Kühlprodukten) (A.7)', code: 'A.7', hoursPerYear: 3600 },
  { label: 'Klassenzimmer (Schule), Gruppenraum (Kindergarten) (A.8)', code: 'A.8', hoursPerYear: 1400 },
  { label: 'Hörsaal, Auditorium (A.9)', code: 'A.9', hoursPerYear: 1500 },
  { label: 'Bettenzimmer: Zweibettzimmer im Krankenhaus, Pflegeheim (A.10)', code: 'A.10', hoursPerYear: 8760 },
  { label: 'Hotelzimmer: Doppelzimmer (A.11)', code: 'A.11', hoursPerYear: 4745 },
  { label: 'Kantine (A.12)', code: 'A.12', hoursPerYear: 1750 },
  { label: 'Restaurant (A.13)', code: 'A.13', hoursPerYear: 4200 },
  { label: 'Küche in Nichtwohngebäuden (A.14)', code: 'A.14', hoursPerYear: 3900 },
  { label: 'Küche – Vorbereitung, Lager (A.15)', code: 'A.15', hoursPerYear: 3900 },
  { label: 'WC und Sanitärräume in Nichtwohngebäuden (A.16)', code: 'A.16', hoursPerYear: 2750 },
  { label: 'Sonstige Aufenthaltsräume z. B. Pausenraum, Wartezimmer (A.17)', code: 'A.17', hoursPerYear: 2750 },
  { label: 'Nebenflächen ohne Aufenthaltsräume z. B. Garderobe, Teeküche, Lager, Archiv, Flur (A.18)', code: 'A.18', hoursPerYear: 2750 },
  { label: 'Verkehrsfläche (A.19)', code: 'A.19', hoursPerYear: 2750 },
  { label: 'Lager: Technik, Archiv (A.20)', code: 'A.20', hoursPerYear: 2750 },
  { label: 'Rechenzentrum (A.21)', code: 'A.21', hoursPerYear: 8760 },
  { label: 'Gewerbliche und industrielle Hallen – schwere Arbeit (A.22.1)', code: 'A.22.1', hoursPerYear: 2250 },
  { label: 'Gewerbliche und industrielle Hallen – mittelschwere Arbeit (A.22.2)', code: 'A.22.2', hoursPerYear: 2250 },
  { label: 'Gewerbliche und industrielle Hallen – leichte Arbeit (A.22.3)', code: 'A.22.3', hoursPerYear: 2250 },
  { label: 'Fertigungshalle — grobe Arbeit — zweischichtig (A.22.4)', code: 'A.22.4', hoursPerYear: 4000 },
  { label: 'Zuschauerbereich Theater und Veranstaltungsbauten (A.23)', code: 'A.23', hoursPerYear: 1000 },
  { label: 'Theater – Foyer (A.24)', code: 'A.24', hoursPerYear: 1000 },
  { label: 'Bühne Theater und Veranstaltungsbauten (A.25)', code: 'A.25', hoursPerYear: 2500 },
  { label: 'Messe/Kongress (A.26)', code: 'A.26', hoursPerYear: 1350 },
  { label: 'Ausstellungsräume und Museum (A.27)', code: 'A.27', hoursPerYear: 2000 },
  { label: 'Bibliothek – Lesesaal (A.28)', code: 'A.28', hoursPerYear: 3600 },
  { label: 'Bibliothek – Freihandbereich (A.29)', code: 'A.29', hoursPerYear: 3600 },
  { label: 'Bibliothek – Magazin und Depot (A.30)', code: 'A.30', hoursPerYear: 3600 },
  { label: 'Turnhalle ohne Zuschauerbereich (A.31)', code: 'A.31', hoursPerYear: 3750 },
  { label: 'Parkhaus Büro- und Privatnutzung (A.32)', code: 'A.32', hoursPerYear: 2750 },
  { label: 'Parkhaus öffentliche Nutzung (A.33)', code: 'A.33', hoursPerYear: 5475 },
  { label: 'Saunabereich (A.34)', code: 'A.34', hoursPerYear: 4380 },
  { label: 'Fitnessraum (A.35)', code: 'A.35', hoursPerYear: 5475 },
  { label: 'Labor (A.36)', code: 'A.36', hoursPerYear: 2750 },
  { label: 'Untersuchungs- und Behandlungsräume (A.37)', code: 'A.37', hoursPerYear: 2750 },
  { label: 'Spezialpflegebereiche z. B. Intensivmedizin, Aufwachräume (A.38)', code: 'A.38', hoursPerYear: 8760 },
  { label: 'Flure des allgemeinen Pflegebereichs (A.39)', code: 'A.39', hoursPerYear: 8760 },
  { label: 'Arztpraxen und therapeutische Praxen (A.40)', code: 'A.40', hoursPerYear: 2500 },
  { label: 'Lagerhallen, Logistikhallen (A.41)', code: 'A.41', hoursPerYear: 8760 },
];

export const CO2_SOURCE_OPTIONS: Co2SourceOption[] = [
  { label: 'EU Strommix', factorGPerKwh: 250 },
  { label: 'Wasserkraft', factorGPerKwh: 25 },
  { label: 'Benutzerdefiniert', factorGPerKwh: null },
];

// ============================================
// C06: Lampentyp-Leistung Lookup
// ============================================
export const LAMP_POWER_LOOKUP: Record<LampType, number> = {
  'T5-549mm': 14,
  'T5-1149mm': 28,
  'T5-1449mm': 35,
  'T8-600mm': 18,
  'T8-1200mm': 36,
  'T8-1500mm': 58,
};

export const LAMP_TYPE_OPTIONS: { value: LampType; label: string }[] = [
  { value: 'T5-549mm', label: 'T5 – 549 mm' },
  { value: 'T5-1149mm', label: 'T5 – 1149 mm' },
  { value: 'T5-1449mm', label: 'T5 – 1449 mm' },
  { value: 'T8-600mm', label: 'T8 – 600 mm' },
  { value: 'T8-1200mm', label: 'T8 – 1200 mm' },
  { value: 'T8-1500mm', label: 'T8 – 1500 mm' },
];

// V3-04: Bestückung erweitert (1-4 flammig)
export const FLAME_COUNT_OPTIONS: { value: 1 | 2 | 3 | 4; label: string }[] = [
  { value: 1, label: '1-flammig' },
  { value: 2, label: '2-flammig' },
  { value: 3, label: '3-flammig' },
  { value: 4, label: '4-flammig' },
];

// ============================================
// V3-08: Steuerungs-Reduktionsstufen mit Bereichen und Mittelwerten
// wenig 10-30% → Mittelwert 20%
// mittel 31-50% → Mittelwert 40.5%
// viel 51-70% → Mittelwert 60.5%
// sehr viel >70% (70-100%) → Mittelwert 85%
// ============================================
export const CONTROL_REDUCTION_OPTIONS: ControlReductionOption[] = [
  { label: 'Keine (0%)', value: 0 },
  { label: 'Wenig (10-30%)', value: 20 },
  { label: 'Mittel (31-50%)', value: 40.5 },
  { label: 'Viel (51-70%)', value: 60.5 },
  { label: 'Sehr viel (>70%)', value: 85 },
];

// ============================================
// C04: Leistungsaufschlag ENTFERNT
// ============================================
export const DEFAULT_EXISTING_LUMINAIRE: LuminaireDefaults = {
  // powerOverheadPercent: 10, // REMOVED in v2.0
  lumenFactorPercent: 53,
  serviceLifeHours: 10000,
};

export const DEFAULT_NEW_LUMINAIRE: LuminaireDefaults = {
  // powerOverheadPercent: 0, // REMOVED in v2.0
  lumenFactorPercent: 100,
  serviceLifeHours: 50000,
};

// C02: Default Raumnutzung mit neuer Liste
export const DEFAULT_PROJECT_DATA = {
  projectName: '',
  roomUsage: 'Einzelbüro (A.1)',
  annualOperatingHours: 2750,
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

// V3-08: Default Steuerung mit neuen Mittelwert-Prozenten (0 = Keine)
export const DEFAULT_CONTROL_SETTINGS = {
  daylightReductionPercent: 0 as ReductionLevel,
  motionReductionPercent: 0 as ReductionLevel,
};

// Hilfsfunktion zum Generieren einer eindeutigen ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// C06: Neue Funktion für leere Bestandsleuchte
export const createEmptyExistingLuminaire = () => ({
  id: generateId(),
  quantity: 1,
  lampType: 'T8-1200mm' as LampType,
  flameCount: 1 as const,
});

// Beispiel-Leuchte für Neu (behält alte Struktur)
export const createEmptyLuminaire = () => ({
  id: generateId(),
  name: '',
  quantity: 1,
  powerW: 0,
  lumensNominal: 0,
});
