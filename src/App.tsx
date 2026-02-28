import { useMemo } from 'react';
import { Header } from './components/Header';
import { ProjectDataSection } from './components/ProjectDataSection';
import { LuminaireTable } from './components/LuminaireTable';
import { ControlSection } from './components/ControlSection';
import { ComparisonSection } from './components/ComparisonSection';
import { InvestmentSection } from './components/InvestmentSection';
import { ResultsSection } from './components/ResultsSection';
import { ChartsSection } from './components/ChartsSection';
import { useWkrState } from './hooks/useWkrState';
import { calculateComparison, calculatePayback } from './utils/calculations';
import './App.css';

function App() {
  const {
    state,
    updateProjectData,
    updateExistingDefaults,
    updateNewDefaults,
    setExistingLuminaires,
    setNewLuminaires,
    updateControlSettings,
    updateInvestmentCosts,
    setCompanyLogo,
  } = useWkrState();

  // Live-Berechnungen mit useMemo für Performance
  const comparison = useMemo(() => {
    return calculateComparison(
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

        <LuminaireTable
          title="Leuchten Bestand"
          luminaires={state.existingLuminaires}
          defaults={state.existingDefaults}
          onLuminairesChange={setExistingLuminaires}
          onDefaultsChange={updateExistingDefaults}
          variant="existing"
        />

        <LuminaireTable
          title="Leuchten Neu"
          luminaires={state.newLuminaires}
          defaults={state.newDefaults}
          onLuminairesChange={setNewLuminaires}
          onDefaultsChange={updateNewDefaults}
          variant="new"
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

        <ResultsSection comparison={comparison} payback={payback} />

        <ChartsSection comparison={comparison} payback={payback} />
      </main>
    </>
  );
}

export default App;
