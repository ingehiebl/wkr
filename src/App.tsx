import { useMemo } from 'react';
import { Header } from './components/Header';
import { ProjectDataSection } from './components/ProjectDataSection';
import { ExistingLuminaireTable } from './components/ExistingLuminaireTable';
import { LuminaireTable } from './components/LuminaireTable';
import { ControlSection } from './components/ControlSection';
import { InvestmentSection } from './components/InvestmentSection';
import { ResultsSection } from './components/ResultsSection';
import { ChartsSection } from './components/ChartsSection';
import { PhotoSection } from './components/PhotoSection';
import { useWkrState } from './hooks/useWkrState';
import { calculateComparisonV3, calculatePaybackV3 } from './utils/calculations';
import './App.css';

function App() {
  const {
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
  } = useWkrState();

  // V4: Live-Berechnungen ohne Wartungskosten
  const comparison = useMemo(() => {
    return calculateComparisonV3(
      state.existingLuminaires,
      state.newLuminaires,
      state.newDefaults,
      state.projectData.annualOperatingHours,
      state.projectData.electricityPriceEur,
      state.projectData.co2FactorGPerKwh,
      state.controlSettings
    );
  }, [
    state.existingLuminaires,
    state.newLuminaires,
    state.newDefaults,
    state.projectData,
    state.controlSettings,
  ]);

  const payback = useMemo(() => {
    return calculatePaybackV3(
      state.investmentCosts,
      comparison.savingsWithoutControls.costEur,
      comparison.savingsWithControls.costEur,
      state.newDefaults.serviceLifeHours,
      state.projectData.annualOperatingHours
    );
  }, [
    state.investmentCosts,
    comparison.savingsWithoutControls.costEur,
    comparison.savingsWithControls.costEur,
    state.newDefaults.serviceLifeHours,
    state.projectData.annualOperatingHours,
  ]);

  return (
    <>
      <Header logo={state.companyLogo} onLogoChange={setCompanyLogo} />
      
      <main className="app-container">
        <ProjectDataSection
          data={state.projectData}
          onChange={updateProjectData}
        />

        <ExistingLuminaireTable
          luminaires={state.existingLuminaires}
          onLuminairesChange={setExistingLuminaires}
        />

        <LuminaireTable
          title="Leuchten Neu"
          luminaires={state.newLuminaires}
          defaults={state.newDefaults}
          onLuminairesChange={setNewLuminaires}
          onDefaultsChange={updateNewDefaults}
        />

        <ControlSection
          settings={state.controlSettings}
          onChange={updateControlSettings}
        />

        <InvestmentSection
          costs={state.investmentCosts}
          onChange={updateInvestmentCosts}
        />

        <ResultsSection 
          comparison={comparison} 
          payback={payback}
          projectData={state.projectData}
          existingLuminaires={state.existingLuminaires}
          newLuminaires={state.newLuminaires}
          controlSettings={state.controlSettings}
          investmentCosts={state.investmentCosts}
          existingPhotos={state.existingPhotos}
          newPhotos={state.newPhotos}
        />

        <ChartsSection comparison={comparison} payback={payback} />

        <PhotoSection
          existingPhotos={state.existingPhotos}
          newPhotos={state.newPhotos}
          onExistingPhotosChange={setExistingPhotos}
          onNewPhotosChange={setNewPhotos}
        />
      </main>
    </>
  );
}

export default App;
