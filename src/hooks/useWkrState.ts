import { useState, useEffect, useCallback } from 'react';
import type { 
  WkrState, 
  ProjectData, 
  LuminaireDefaults, 
  Luminaire, 
  ControlSettings, 
  InvestmentCosts 
} from '../types';
import {
  DEFAULT_PROJECT_DATA,
  DEFAULT_EXISTING_LUMINAIRE,
  DEFAULT_NEW_LUMINAIRE,
  DEFAULT_CONTROL_SETTINGS,
  DEFAULT_INVESTMENT,
  createEmptyLuminaire,
} from '../constants';

const STORAGE_KEY = 'wkr-state';

const getInitialState = (): WkrState => {
  // Versuche gespeicherten State zu laden
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed;
    }
  } catch (e) {
    console.warn('Fehler beim Laden des gespeicherten Zustands:', e);
  }

  // Standard-State
  return {
    projectData: DEFAULT_PROJECT_DATA,
    existingDefaults: DEFAULT_EXISTING_LUMINAIRE,
    newDefaults: DEFAULT_NEW_LUMINAIRE,
    existingLuminaires: [createEmptyLuminaire()],
    newLuminaires: [createEmptyLuminaire()],
    controlSettings: DEFAULT_CONTROL_SETTINGS,
    investmentCosts: DEFAULT_INVESTMENT,
    companyLogo: null,
  };
};

export function useWkrState() {
  const [state, setState] = useState<WkrState>(getInitialState);

  // Autosave bei Änderungen
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

  const setExistingLuminaires = useCallback((luminaires: Luminaire[]) => {
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
    const newState = {
      projectData: DEFAULT_PROJECT_DATA,
      existingDefaults: DEFAULT_EXISTING_LUMINAIRE,
      newDefaults: DEFAULT_NEW_LUMINAIRE,
      existingLuminaires: [createEmptyLuminaire()],
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
