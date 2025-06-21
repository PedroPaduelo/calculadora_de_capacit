import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Github, Coffee } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import InputForm from './components/InputForm';
import ResultsDisplay from './components/ResultsDisplay';
import { CallCenterParams, CallCenterResults, calculateCallCenterStaffing } from './utils/erlangC';

function App() {
  const [results, setResults] = useState<CallCenterResults | null>(null);
  const [currentParams, setCurrentParams] = useState<CallCenterParams | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCalculate = useCallback(async (params: CallCenterParams) => {
    setIsLoading(true);
    setCurrentParams(params);
    
    // Simular um pequeno delay para melhor UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      const calculationResults = calculateCallCenterStaffing(params);
      setResults(calculationResults);
    } catch (error) {
      console.error('Erro no cálculo:', error);
      // Em uma aplicação real, você adicionaria tratamento de erro aqui
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleExport = useCallback(() => {
    if (!results || !currentParams) return;
    
    // Implementação básica de exportação - pode ser expandida
    const data = {
      parametros: currentParams,
      resultados: results,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dimensionamento-call-center-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [results, currentParams]);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo e Título */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                  <Calculator className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Calculadora Call Center
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Dimensionamento com Erlang C
                  </p>
                </div>
              </motion.div>

              {/* Ações do Header */}
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

        {/* Conteúdo Principal */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulário de Entrada */}
            <div className="lg:col-span-1">
              <InputForm onCalculate={handleCalculate} isLoading={isLoading} />
            </div>

            {/* Resultados */}
            <div className="lg:col-span-2">
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="card flex items-center justify-center py-12"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Calculando dimensionamento...
                    </p>
                  </div>
                </motion.div>
              )}

              {!isLoading && !results && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card flex items-center justify-center py-12 text-center"
                >
                  <div>
                    <Calculator className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Pronto para calcular
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                      Preencha os parâmetros ao lado e clique em "Calcular Dimensionamento" 
                      para ver os resultados baseados no modelo Erlang C.
                    </p>
                  </div>
                </motion.div>
              )}

              {!isLoading && results && currentParams && (
                <ResultsDisplay
                  results={results}
                  targetServiceLevel={currentParams.serviceLevel}
                  onExport={handleExport}
                />
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © 2024 Calculadora Call Center. Desenvolvido com React e Tailwind CSS.
              </p>
              
              <motion.div
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                whileHover={{ scale: 1.02 }}
              >
                <Coffee className="w-4 h-4" />
                <span>Feito com dedicação</span>
              </motion.div>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;
