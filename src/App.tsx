import { useMemo } from 'react';
import { Header } from './components/Header';
import { ProjectDataSection } from './components/ProjectDataSection';
import { ExistingLuminaireTable } from './components/ExistingLuminaireTable';
import { LuminaireTable } from './components/LuminaireTable';
import { ControlSection } from './components/ControlSection';
// V3-22: ComparisonSection hidden but kept for reference
// import { ComparisonSection } from './components/ComparisonSection';
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

  // V3: Live-Berechnungen mit useMemo für Performance
  const comparison = useMemo(() => {
    return calculateComparisonV3(
      state.existingLuminaires,
      state.newLuminaires,
      state.newDefaults,
      state.projectData.annualOperatingHours,
      state.projectData.electricityPriceEur,
      state.projectData.maintenanceCostExistingEur,
      state.projectData.maintenanceCostNewEur,
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

  // V3-20: Dual payback calculation
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

        {/* V3-04/V3-05/V3-06: Updated ExistingLuminaireTable */}
        <ExistingLuminaireTable
          luminaires={state.existingLuminaires}
          onLuminairesChange={setExistingLuminaires}
        />

        {/* V3-07: LuminaireTable with kW display */}
        <LuminaireTable
          title="Leuchten Neu"
          luminaires={state.newLuminaires}
          defaults={state.newDefaults}
          onLuminairesChange={setNewLuminaires}
          onDefaultsChange={updateNewDefaults}
        />

        {/* V3-08: ControlSection with new range-based dropdowns */}
        <ControlSection
          settings={state.controlSettings}
          onChange={updateControlSettings}
        />

        {/* V3-22: ComparisonSection hidden - comparison now shown in ResultsSection */}
        {/* <ComparisonSection comparison={comparison} /> */}

        {/* V3-10/V3-11: Updated InvestmentSection */}
        <InvestmentSection
          costs={state.investmentCosts}
          onChange={updateInvestmentCosts}
        />

        {/* V3-13/V3-14/V3-15/V3-16: Updated ResultsSection with 3 columns and PDF export with charts/photos */}
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

        {/* V3-17/V3-19/V3-20: Updated ChartsSection with 3 variants */}
        <ChartsSection comparison={comparison} payback={payback} />

        {/* V3-21: New PhotoSection */}
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
