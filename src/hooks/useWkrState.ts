import { useState, useEffect, useCallback } from 'react';
import type { 
  WkrState, 
  ProjectData, 
  LuminaireDefaults, 
  Luminaire, 
  ExistingLuminaire,
  ControlSettings, 
  InvestmentCosts,
  ReductionLevel
} from '../types';
import {
  DEFAULT_PROJECT_DATA,
  DEFAULT_EXISTING_LUMINAIRE,
  DEFAULT_NEW_LUMINAIRE,
  DEFAULT_CONTROL_SETTINGS,
  DEFAULT_INVESTMENT,
  createEmptyLuminaire,
  createEmptyExistingLuminaire,
} from '../constants';

const STORAGE_KEY = 'wkr-state';
const STORAGE_VERSION = 2; // v2.0 migration

// Migration: v1 ControlSettings (boolean) → v2 (ReductionLevel %)
const migrateControlSettings = (settings: unknown): ControlSettings => {
  if (!settings || typeof settings !== 'object') {
    return DEFAULT_CONTROL_SETTINGS;
  }
  
  const s = settings as Record<string, unknown>;
  
  // v1 format: { daylightEnabled: boolean, motionEnabled: boolean }
  // v2 format: { daylightReductionPercent: ReductionLevel, motionReductionPercent: ReductionLevel }
  if ('daylightEnabled' in s || 'motionEnabled' in s) {
    return {
      daylightReductionPercent: (s.daylightEnabled ? 30 : 0) as ReductionLevel,
      motionReductionPercent: (s.motionEnabled ? 30 : 0) as ReductionLevel,
    };
  }
  
  // Already v2 format
  return {
    daylightReductionPercent: (s.daylightReductionPercent ?? 0) as ReductionLevel,
    motionReductionPercent: (s.motionReductionPercent ?? 0) as ReductionLevel,
  };
};

// Migration: v1 existingLuminaires (Luminaire[]) → v2 (ExistingLuminaire[])
const migrateExistingLuminaires = (luminaires: unknown): ExistingLuminaire[] => {
  if (!Array.isArray(luminaires) || luminaires.length === 0) {
    return [createEmptyExistingLuminaire()];
  }
  
  // Check if already v2 format (has lampType property)
  const first = luminaires[0] as Record<string, unknown>;
  if ('lampType' in first) {
    return luminaires as ExistingLuminaire[];
  }
  
  // v1 format: { id, name, quantity, powerW, lumensNominal }
  // v2 format: { id, quantity, lampType, flameCount }
  // Best effort migration - map to closest T8 lamp type based on power
  return luminaires.map((lum) => {
    const l = lum as Record<string, unknown>;
    const powerW = (l.powerW as number) || 36;
    
    // Map power to closest lamp type
    let lampType: 'T5-549mm' | 'T5-1149mm' | 'T5-1449mm' | 'T8-600mm' | 'T8-1200mm' | 'T8-1500mm' = 'T8-1200mm';
    if (powerW <= 14) lampType = 'T5-549mm';
    else if (powerW <= 18) lampType = 'T8-600mm';
    else if (powerW <= 28) lampType = 'T5-1149mm';
    else if (powerW <= 36) lampType = 'T8-1200mm';
    else if (powerW <= 35) lampType = 'T5-1449mm';
    else lampType = 'T8-1500mm';
    
    return {
      id: (l.id as string) || Math.random().toString(36).substring(2, 11),
      quantity: (l.quantity as number) || 1,
      lampType,
      flameCount: 1 as const,
    };
  });
};

const getInitialState = (): WkrState => {
  // Versuche gespeicherten State zu laden
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      
      // Check version and migrate if needed
      const version = parsed._version || 1;
      
      if (version < STORAGE_VERSION) {
        console.info('Migriere WKR-Daten von v1 zu v2...');
        
        // Migrate control settings (C07)
        const migratedControlSettings = migrateControlSettings(parsed.controlSettings);
        
        // Migrate existing luminaires (C06)
        const migratedExistingLuminaires = migrateExistingLuminaires(parsed.existingLuminaires);
        
        // Return migrated state
        return {
          projectData: { ...DEFAULT_PROJECT_DATA, ...parsed.projectData },
          existingDefaults: { ...DEFAULT_EXISTING_LUMINAIRE, ...parsed.existingDefaults },
          newDefaults: { ...DEFAULT_NEW_LUMINAIRE, ...parsed.newDefaults },
          existingLuminaires: migratedExistingLuminaires,
          newLuminaires: parsed.newLuminaires || [createEmptyLuminaire()],
          controlSettings: migratedControlSettings,
          investmentCosts: { ...DEFAULT_INVESTMENT, ...parsed.investmentCosts },
          companyLogo: parsed.companyLogo || null,
        };
      }
      
      return parsed;
    }
  } catch (e) {
    console.warn('Fehler beim Laden des gespeicherten Zustands:', e);
  }

  // Standard-State (v2.0)
  return {
    projectData: DEFAULT_PROJECT_DATA,
    existingDefaults: DEFAULT_EXISTING_LUMINAIRE,
    newDefaults: DEFAULT_NEW_LUMINAIRE,
    existingLuminaires: [createEmptyExistingLuminaire()],
    newLuminaires: [createEmptyLuminaire()],
    controlSettings: DEFAULT_CONTROL_SETTINGS,
    investmentCosts: DEFAULT_INVESTMENT,
    companyLogo: null,
  };
};

export function useWkrState() {
  const [state, setState] = useState<WkrState>(getInitialState);

  // Autosave bei Änderungen (mit Version für Migration)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        const stateWithVersion = { ...state, _version: STORAGE_VERSION };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithVersion));
      } catch (e) {
        console.warn('Fehler beim Speichern:', e);
      }
    }, 500); // Debounce für 500ms

    return () => clearTimeout(timeoutId);
  }, [state]);

  // Update Funktionen
  const updateProjectData = useCallback((data: Partial<ProjectData>) => {
    setState((prev) => ({
      ...prev,
      projectData: { ...prev.projectData, ...data },
    }));
  }, []);

  const updateExistingDefaults = useCallback((defaults: Partial<LuminaireDefaults>) => {
    setState((prev) => ({
      ...prev,
      existingDefaults: { ...prev.existingDefaults, ...defaults },
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

  const resetState = useCallback(() => {
    const newState: WkrState = {
      projectData: DEFAULT_PROJECT_DATA,
      existingDefaults: DEFAULT_EXISTING_LUMINAIRE,
      newDefaults: DEFAULT_NEW_LUMINAIRE,
      existingLuminaires: [createEmptyExistingLuminaire()],
      newLuminaires: [createEmptyLuminaire()],
      controlSettings: DEFAULT_CONTROL_SETTINGS,
      investmentCosts: DEFAULT_INVESTMENT,
      companyLogo: null,
    };
    setState(newState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    state,
    updateProjectData,
    updateExistingDefaults,
    updateNewDefaults,
    setExistingLuminaires,
    setNewLuminaires,
    updateControlSettings,
    updateInvestmentCosts,
    setCompanyLogo,
    resetState,
  };
}
