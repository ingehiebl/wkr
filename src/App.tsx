import { useMemo } from 'react';
import { Header } from './components/Header';
import { ProjectDataSection } from './components/ProjectDataSection';
import { ExistingLuminaireTable } from './components/ExistingLuminaireTable';
import { LuminaireTable } from './components/LuminaireTable';
import { ControlSection } from './components/ControlSection';
import { ComparisonSection } from './components/ComparisonSection';
import { InvestmentSection } from './components/InvestmentSection';
import { ResultsSection } from './components/ResultsSection';
import { ChartsSection } from './components/ChartsSection';
import { useWkrState } from './hooks/useWkrState';
import { calculateComparisonV2, calculatePayback } from './utils/calculations';
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
  } = useWkrState();

  // Live-Berechnungen mit useMemo für Performance (v2.0)
  const comparison = useMemo(() => {
    return calculateComparisonV2(
      state.existingLuminaires,
      state.newLuminaires,
      state.existingDefaults,
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
    state.existingDefaults,
    state.newDefaults,
    state.projectData,
    state.controlSettings,
  ]);

  const payback = useMemo(() => {
    return calculatePayback(
      state.investmentCosts.luminairesEur,
      state.investmentCosts.controlsEur,
      state.investmentCosts.installationEur,
      comparison.savings.costEur,
      state.newDefaults.serviceLifeHours,
      state.projectData.annualOperatingHours
    );
  }, [
    state.investmentCosts,
    comparison.savings.costEur,
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

        {/* C06: New ExistingLuminaireTable component for Bestand */}
        <ExistingLuminaireTable
          luminaires={state.existingLuminaires}
          onLuminairesChange={setExistingLuminaires}
        />

        {/* LuminaireTable now only used for Neu */}
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

        <ComparisonSection comparison={comparison} />

        <InvestmentSection
          costs={state.investmentCosts}
          onChange={updateInvestmentCosts}
        />

        {/* C08: ResultsSection now receives additional props for PDF export */}
        <ResultsSection 
          comparison={comparison} 
          payback={payback}
          projectData={state.projectData}
          existingLuminaires={state.existingLuminaires}
          newLuminaires={state.newLuminaires}
          controlSettings={state.controlSettings}
          investmentCosts={state.investmentCosts}
        />

        <ChartsSection comparison={comparison} payback={payback} />
      </main>
    </>
  );
}

export default App;
