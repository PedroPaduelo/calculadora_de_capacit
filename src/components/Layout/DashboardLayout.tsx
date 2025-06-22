import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calculator, Github, Coffee } from 'lucide-react';
import Sidebar from '../Sidebar';
import ThemeToggle from '../ThemeToggle';

const DashboardLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Page Info */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-2xl">
                  <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                    WFM Calculator Pro
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
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
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600 dark:text-gray-300">
              © 2024 WFM Calculator Pro. Advanced Workforce Management Solution.
            </p>
            
            <motion.div
              className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300"
              whileHover={{ scale: 1.02 }}
            >
              <Coffee className="w-3 h-3" />
              <span>Made with precision</span>
            </motion.div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
