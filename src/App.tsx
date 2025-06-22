import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider } from './contexts/AppContext';
import { initializeDatabase } from './services/database';
import DashboardLayout from './components/Layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import OperationsList from './pages/OperationsList';
import OperationsPage from './pages/OperationsPage';
import ForecastPage from './pages/ForecastPage';
import ResultsPage from './pages/ResultsPage';
import ScenariosPage from './pages/ScenariosPage';
import AdvancedScenariosPage from './pages/AdvancedScenariosPage';
import DatabaseTest from './pages/DatabaseTest';

function App() {
  useEffect(() => {
    // Inicializar banco de dados de forma assíncrona
    initializeDatabase().then(success => {
      if (success) {
        console.log('Database initialized successfully');
      } else {
        console.warn('Database initialization failed, but app will continue');
      }
    });
  }, []);

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
              <Route path="advanced-scenarios" element={<AdvancedScenariosPage />} />
              <Route path="database-test" element={<DatabaseTest />} />
            </Route>
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
