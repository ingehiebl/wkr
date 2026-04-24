import { useState, useEffect, useCallback } from 'react';
import type { 
  WkrState, 
  ProjectData, 
  LuminaireDefaults, 
  Luminaire, 
  ExistingLuminaire,
  ControlSettings, 
  InvestmentCosts,
  ReductionLevel,
  LampTypeWithPower
} from '../types';
import {
  DEFAULT_PROJECT_DATA,
  DEFAULT_NEW_LUMINAIRE,
  DEFAULT_CONTROL_SETTINGS,
  DEFAULT_INVESTMENT,
  createEmptyLuminaire,
  createEmptyExistingLuminaire,
  CONTROL_REDUCTION_OPTIONS,
} from '../constants';

const STORAGE_KEY = 'wkr-state';
const STORAGE_VERSION = 4; // v4.0 migration

// V3-08: Map old reduction values to new midpoint values
const mapReductionToV3 = (oldValue: number): ReductionLevel => {
  if (oldValue === 0) return 0;
  if (oldValue <= 10) return 20;
  if (oldValue <= 20) return 20;
  if (oldValue <= 30) return 40.5;
  if (oldValue <= 40) return 60.5;
  return 85;
};

// Migration: v2 ControlSettings → v3 (new reduction levels)
const migrateControlSettingsV2ToV3 = (settings: unknown): ControlSettings => {
  if (!settings || typeof settings !== 'object') {
    return DEFAULT_CONTROL_SETTINGS;
  }
  
  const s = settings as Record<string, unknown>;
  
  // v1 format: { daylightEnabled: boolean, motionEnabled: boolean }
  if ('daylightEnabled' in s || 'motionEnabled' in s) {
    return {
      daylightReductionPercent: (s.daylightEnabled ? 40.5 : 0) as ReductionLevel,
      motionReductionPercent: (s.motionEnabled ? 40.5 : 0) as ReductionLevel,
    };
  }
  
  const daylightVal = s.daylightReductionPercent as number ?? 0;
  const motionVal = s.motionReductionPercent as number ?? 0;
  
  const v3Values = CONTROL_REDUCTION_OPTIONS.map(o => o.value);
  const isAlreadyV3 = v3Values.includes(daylightVal as ReductionLevel) && v3Values.includes(motionVal as ReductionLevel);
  
  if (isAlreadyV3) {
    return {
      daylightReductionPercent: daylightVal as ReductionLevel,
      motionReductionPercent: motionVal as ReductionLevel,
    };
  }
  
  return {
    daylightReductionPercent: mapReductionToV3(daylightVal),
    motionReductionPercent: mapReductionToV3(motionVal),
  };
};

// V4: Map old LampType to new LampTypeWithPower (pick most common wattage)
const migrateOldLampType = (oldType: string): LampTypeWithPower => {
  const mapping: Record<string, LampTypeWithPower> = {
    'T5-549mm': 'T5-549mm-14W',
    'T5-1149mm': 'T5-1149mm-28W',
    'T5-1449mm': 'T5-1449mm-35W',
    'T8-600mm': 'T8-600mm-18W',
    'T8-1200mm': 'T8-1200mm-36W',
    'T8-1500mm': 'T8-1500mm-58W',
  };
  // If already a v4 key, return as-is
  if (oldType.match(/\d+W$/)) return oldType as LampTypeWithPower;
  return mapping[oldType] || 'T8-1200mm-36W';
};

// Migration: existing luminaires from any version → v4
const migrateExistingLuminaires = (luminaires: unknown): ExistingLuminaire[] => {
  if (!Array.isArray(luminaires) || luminaires.length === 0) {
    return [createEmptyExistingLuminaire()];
  }
  
  const first = luminaires[0] as Record<string, unknown>;
  
  // v1 format: { id, name, quantity, powerW, lumensNominal }
  if (!('lampType' in first)) {
    return luminaires.map((lum) => {
      const l = lum as Record<string, unknown>;
      const powerW = (l.powerW as number) || 36;
      let lampType: LampTypeWithPower = 'T8-1200mm-36W';
      if (powerW <= 14) lampType = 'T5-549mm-14W';
      else if (powerW <= 18) lampType = 'T8-600mm-18W';
      else if (powerW <= 28) lampType = 'T5-1149mm-28W';
      else if (powerW <= 35) lampType = 'T5-1449mm-35W';
      else if (powerW <= 36) lampType = 'T8-1200mm-36W';
      else lampType = 'T8-1500mm-58W';
      
      return {
        id: (l.id as string) || Math.random().toString(36).substring(2, 11),
        quantity: (l.quantity as number) || 1,
        lampType,
        flameCount: 1 as const,
      };
    });
  }
  
  // v2/v3 format: has lampType but might be old format (e.g. 'T8-1200mm' without wattage)
  return luminaires.map((lum) => {
    const l = lum as Record<string, unknown>;
    return {
      id: (l.id as string) || Math.random().toString(36).substring(2, 11),
      quantity: (l.quantity as number) || 1,
      lampType: migrateOldLampType(l.lampType as string),
      flameCount: (l.flameCount as 1 | 2 | 3 | 4) || 1,
    };
  });
};

// V4: Migrate investment costs from v3 (3 fields) to v4 (4 fields)
const migrateInvestmentCosts = (costs: unknown): InvestmentCosts => {
  if (!costs || typeof costs !== 'object') return DEFAULT_INVESTMENT;
  const c = costs as Record<string, unknown>;
  
  // Already v4 format
  if ('installationLuminairesEur' in c) {
    return {
      luminairesEur: (c.luminairesEur as number) || 0,
      installationLuminairesEur: (c.installationLuminairesEur as number) || 0,
      controlsEur: (c.controlsEur as number) || 0,
      installationControlsEur: (c.installationControlsEur as number) || 0,
    };
  }
  
  // v3 format: { luminairesEur, controlsEur, installationEur }
  return {
    luminairesEur: (c.luminairesEur as number) || 0,
    installationLuminairesEur: (c.installationEur as number) || 0,
    controlsEur: (c.controlsEur as number) || 0,
    installationControlsEur: 0,
  };
};

// V4: Migrate project data (remove maintenance fields)
const migrateProjectData = (data: unknown): ProjectData => {
  if (!data || typeof data !== 'object') return DEFAULT_PROJECT_DATA;
  const d = data as Record<string, unknown>;
  return {
    projectName: (d.projectName as string) || '',
    roomUsage: (d.roomUsage as string) || DEFAULT_PROJECT_DATA.roomUsage,
    annualOperatingHours: (d.annualOperatingHours as number) || DEFAULT_PROJECT_DATA.annualOperatingHours,
    electricityPriceEur: (d.electricityPriceEur as number) ?? DEFAULT_PROJECT_DATA.electricityPriceEur,
    co2Source: (d.co2Source as string) || DEFAULT_PROJECT_DATA.co2Source,
    co2FactorGPerKwh: (d.co2FactorGPerKwh as number) ?? DEFAULT_PROJECT_DATA.co2FactorGPerKwh,
  };
};

const getInitialState = (): WkrState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const version = parsed._version || 1;
      
      if (version < STORAGE_VERSION) {
        console.info(`Migriere WKR-Daten von v${version} zu v${STORAGE_VERSION}...`);
        
        const migratedControlSettings = migrateControlSettingsV2ToV3(parsed.controlSettings);
        const migratedExistingLuminaires = migrateExistingLuminaires(parsed.existingLuminaires);
        const migratedInvestmentCosts = migrateInvestmentCosts(parsed.investmentCosts);
        const migratedProjectData = migrateProjectData(parsed.projectData);
        
        const existingPhotos = parsed.existingPhotos || [];
        const newPhotos = parsed.newPhotos || [];
        
        return {
          projectData: migratedProjectData,
          newDefaults: { ...DEFAULT_NEW_LUMINAIRE, ...(parsed.newDefaults ? { serviceLifeHours: parsed.newDefaults.serviceLifeHours } : {}) },
          existingLuminaires: migratedExistingLuminaires,
          newLuminaires: parsed.newLuminaires || [createEmptyLuminaire()],
          controlSettings: migratedControlSettings,
          investmentCosts: migratedInvestmentCosts,
          companyLogo: parsed.companyLogo || null,
          existingPhotos,
          newPhotos,
        };
      }
      
      return {
        ...parsed,
        existingPhotos: parsed.existingPhotos || [],
        newPhotos: parsed.newPhotos || [],
      };
    }
  } catch (e) {
    console.warn('Fehler beim Laden des gespeicherten Zustands:', e);
  }

  return {
    projectData: DEFAULT_PROJECT_DATA,
    newDefaults: DEFAULT_NEW_LUMINAIRE,
    existingLuminaires: [createEmptyExistingLuminaire()],
    newLuminaires: [createEmptyLuminaire()],
    controlSettings: DEFAULT_CONTROL_SETTINGS,
    investmentCosts: DEFAULT_INVESTMENT,
    companyLogo: null,
    existingPhotos: [],
    newPhotos: [],
  };
};

export function useWkrState() {
  const [state, setState] = useState<WkrState>(getInitialState);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        const stateWithVersion = { ...state, _version: STORAGE_VERSION };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithVersion));
      } catch (e) {
        console.warn('Fehler beim Speichern:', e);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [state]);

  const updateProjectData = useCallback((data: Partial<ProjectData>) => {
    setState((prev) => ({
      ...prev,
      projectData: { ...prev.projectData, ...data },
    }));
  }, []);

  const updateNewDefaults = useCallback((defaults: Partial<LuminaireDefaults>) => {
    setState((prev) => ({
      ...prev,
      newDefaults: { ...prev.newDefaults, ...defaults },
    }));
  }, []);

  const setExistingLuminaires = useCallback((luminaires: ExistingLuminaire[]) => {
    setState((prev) => ({
      ...prev,
      existingLuminaires: luminaires,
    }));
  }, []);

  const setNewLuminaires = useCallback((luminaires: Luminaire[]) => {
    setState((prev) => ({
      ...prev,
      newLuminaires: luminaires,
    }));
  }, []);

  const updateControlSettings = useCallback((settings: Partial<ControlSettings>) => {
    setState((prev) => ({
      ...prev,
      controlSettings: { ...prev.controlSettings, ...settings },
    }));
  }, []);

  const updateInvestmentCosts = useCallback((costs: Partial<InvestmentCosts>) => {
    setState((prev) => ({
      ...prev,
      investmentCosts: { ...prev.investmentCosts, ...costs },
    }));
  }, []);

  const setCompanyLogo = useCallback((logo: string | null) => {
    setState((prev) => ({
      ...prev,
      companyLogo: logo,
    }));
  }, []);

  const setExistingPhotos = useCallback((photos: string[]) => {
    setState((prev) => ({
      ...prev,
      existingPhotos: photos,
    }));
  }, []);

  const setNewPhotos = useCallback((photos: string[]) => {
    setState((prev) => ({
      ...prev,
      newPhotos: photos,
    }));
  }, []);

  const resetState = useCallback(() => {
    const newState: WkrState = {
      projectData: DEFAULT_PROJECT_DATA,
      newDefaults: DEFAULT_NEW_LUMINAIRE,
      existingLuminaires: [createEmptyExistingLuminaire()],
      newLuminaires: [createEmptyLuminaire()],
      controlSettings: DEFAULT_CONTROL_SETTINGS,
      investmentCosts: DEFAULT_INVESTMENT,
      companyLogo: null,
      existingPhotos: [],
      newPhotos: [],
    };
    setState(newState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    state,
    updateProjectData,
    updateNewDefaults,
    setExistingLuminaires,
    setNewLuminaires,
    updateControlSettings,
    updateInvestmentCosts,
    setCompanyLogo,
    setExistingPhotos,
    setNewPhotos,
    resetState,
  };
}
