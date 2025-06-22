import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Github, Coffee } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider } from './contexts/AppContext';
import ThemeToggle from './components/ThemeToggle';
import Sidebar from './components/Sidebar';
import OperationsPage from './pages/OperationsPage';
import ForecastPage from './pages/ForecastPage';
import ResultsPage from './pages/ResultsPage';
import ScenariosPage from './pages/ScenariosPage';
import { PageType } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>(PageType.OPERATIONS);

  const renderPage = () => {
    switch (currentPage) {
      case PageType.OPERATIONS:
        return <OperationsPage />;
      case PageType.FORECAST:
        return <ForecastPage />;
      case PageType.RESULTS:
        return <ResultsPage />;
      case PageType.SCENARIOS:
        return <ScenariosPage />;
      default:
        return <OperationsPage />;
    }
  };

  return (
    <ThemeProvider>
      <AppProvider>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          {/* Sidebar */}
          <Sidebar 
            currentPage={currentPage} 
            onPageChange={setCurrentPage} 
          />

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  {/* Page Info */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                      <Calculator className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                        WFM Calculator Pro
                      </h1>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Advanced Workforce Management & Erlang C Calculator
                      </p>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center gap-3">
                    <motion.a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="GitHub"
                    >
                      <Github className="w-5 h-5" />
                    </motion.a>
                    
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-auto">
              <div className="p-6">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderPage()}
                </motion.div>
              </div>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  © 2024 WFM Calculator Pro. Advanced Workforce Management Solution.
                </p>
                
                <motion.div
                  className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"
                  whileHover={{ scale: 1.02 }}
                >
                  <Coffee className="w-3 h-3" />
                  <span>Made with precision</span>
                </motion.div>
              </div>
            </footer>
          </div>
        </div>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
