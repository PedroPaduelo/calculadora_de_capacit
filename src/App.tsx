import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider } from './contexts/AppContext';
import DashboardLayout from './components/Layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import OperationsList from './pages/OperationsList';
import OperationsPage from './pages/OperationsPage';
import ForecastPage from './pages/ForecastPage';
import ResultsPage from './pages/ResultsPage';
import ScenariosPage from './pages/ScenariosPage';

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="operations-list" element={<OperationsList />} />
              <Route path="operations" element={<OperationsPage />} />
              <Route path="forecast" element={<ForecastPage />} />
              <Route path="results" element={<ResultsPage />} />
              <Route path="scenarios" element={<ScenariosPage />} />
            </Route>
          </Routes>
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
