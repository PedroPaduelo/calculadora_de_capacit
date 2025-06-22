import React, { useState, useEffect, useCallback } from 'react';
import { AdvancedScenario, SensitivityResults } from '../../../types';
import { TornadoChart, HeatmapChart } from '../../Charts';
import { Button } from '../../ui';

// Ícones simples como componentes
const PlayIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m2-7a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DocumentChartBarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const TableCellsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V10z" />
  </svg>
);

interface SensitivityAnalysisProps {
  scenario: AdvancedScenario;
  onResultsChange?: (results: SensitivityResults) => void;
  className?: string;
}

const SensitivityAnalysis: React.FC<SensitivityAnalysisProps> = ({
  scenario,
  onResultsChange,
  className = ""
}) => {
  const [results, setResults] = useState<SensitivityResults | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeView, setActiveView] = useState<'tornado' | 'heatmap' | 'table'>('tornado');
  const [error, setError] = useState<string | null>(null);

  // Executar análise automaticamente quando o cenário mudar
  const runAnalysis = useCallback(async () => {
    setIsRunning(true);
    setError(null);
    
    try {
      // Simular análise de sensibilidade (substituir por implementação real)
      const mockResults: SensitivityResults = {
        parameters: [
          { name: 'sla', label: 'SLA (%)', baseValue: scenario.parameters.sla, variations: [-20, -10, 0, 10, 20], impacts: [], sensitivity: 75 },
          { name: 'tma', label: 'TMA (seg)', baseValue: scenario.parameters.tma, variations: [-20, -10, 0, 10, 20], impacts: [], sensitivity: 85 },
          { name: 'shrinkage', label: 'Shrinkage (%)', baseValue: 25, variations: [-20, -10, 0, 10, 20], impacts: [], sensitivity: 65 }
        ],
        tornadoData: [
          { parameter: 'TMA (seg)', negativeImpact: -15, positiveImpact: 18, range: 33, color: '#10B981' },
          { parameter: 'SLA (%)', negativeImpact: -12, positiveImpact: 14, range: 26, color: '#3B82F6' },
          { parameter: 'Shrinkage (%)', negativeImpact: -8, positiveImpact: 10, range: 18, color: '#F59E0B' }
        ],
        heatmapData: [
          { xParameter: 'sla', yParameter: 'tma', xValue: scenario.parameters.sla, yValue: scenario.parameters.tma, impact: 75, color: '#F59E0B' },
          { xParameter: 'tma', yParameter: 'shrinkage', xValue: scenario.parameters.tma, yValue: 25, impact: 60, color: '#10B981' }
        ],
        summary: {
          mostSensitiveParameter: 'TMA (seg)',
          sensitivityRange: 33,
          robustness: 'medium'
        }
      };
      
      setResults(mockResults);
      onResultsChange?.(mockResults);
    } catch (err) {
      setError('Erro ao executar análise de sensibilidade');
      console.error('Erro na análise:', err);
    } finally {
      setIsRunning(false);
    }
  }, [scenario, onResultsChange]);

  useEffect(() => {
    if (scenario) {
      runAnalysis();
    }
  }, [scenario, runAnalysis]);

  const getSensitivityColor = (sensitivity: number): string => {
    if (sensitivity >= 80) return 'text-red-600';
    if (sensitivity >= 60) return 'text-orange-600';
    if (sensitivity >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getSensitivityLabel = (sensitivity: number): string => {
    if (sensitivity >= 80) return 'Muito Alta';
    if (sensitivity >= 60) return 'Alta';
    if (sensitivity >= 40) return 'Moderada';
    return 'Baixa';
  };

  if (isRunning) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Executando Análise de Sensibilidade
          </h3>
          <p className="text-gray-600">
            Calculando impacto dos parâmetros no resultado...
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <p>• Variando SLA ±20%</p>
            <p>• Variando TMA ±20%</p>
            <p>• Variando Shrinkage ±20%</p>
            <p>• Analisando combinações...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-red-200 ${className}`}>
        <div className="p-8 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DocumentChartBarIcon className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Erro na Análise</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={runAnalysis}
            className="bg-red-600 hover:bg-red-700"
          >
            <PlayIcon className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
        <div className="p-8 text-center">
          <DocumentChartBarIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Análise de Sensibilidade
          </h3>
          <p className="text-gray-600 mb-4">
            Execute a análise para identificar quais parâmetros têm maior impacto no resultado
          </p>
          <Button
            onClick={runAnalysis}
            disabled={isRunning}
          >
            <PlayIcon className="w-4 h-4 mr-2" />
            Executar Análise
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Análise de Sensibilidade
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Impacto de variações nos parâmetros sobre o resultado final
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={runAnalysis}
              disabled={isRunning}
            >
              <PlayIcon className="w-4 h-4 mr-2" />
              Reexecutar
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-0 mt-4">
          {[
            { id: 'tornado', name: 'Gráfico Tornado', icon: DocumentChartBarIcon },
            { id: 'heatmap', name: 'Mapa de Calor', icon: DocumentChartBarIcon },
            { id: 'table', name: 'Tabela', icon: TableCellsIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeView === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Resumo */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {results.summary.mostSensitiveParameter}
            </div>
            <div className="text-sm text-gray-600">Parâmetro Mais Sensível</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {results.summary.sensitivityRange.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Range de Impacto</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              results.summary.robustness === 'high' ? 'text-green-600' :
              results.summary.robustness === 'medium' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {results.summary.robustness === 'high' ? 'Alta' :
               results.summary.robustness === 'medium' ? 'Média' : 'Baixa'}
            </div>
            <div className="text-sm text-gray-600">Robustez do Modelo</div>
          </div>
        </div>
      </div>

      {/* Conteúdo baseado na aba ativa */}
      <div className="p-4">
        {activeView === 'tornado' && (
          <TornadoChart
            data={results.tornadoData}
            title="Análise de Sensibilidade - Gráfico Tornado"
            height={400}
          />
        )}

        {activeView === 'heatmap' && (
          <HeatmapChart
            data={results.heatmapData}
            title="Mapa de Calor - Interação entre Parâmetros"
            xAxisLabel="Parâmetro X"
            yAxisLabel="Parâmetro Y"
          />
        )}

        {activeView === 'table' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Detalhamento por Parâmetro</h4>
            
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Parâmetro
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                      Valor Base
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                      Sensibilidade
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                      Impacto Negativo
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                      Impacto Positivo
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                      Range
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results.parameters.map((param, index) => {
                    const tornadoData = results.tornadoData.find(t => t.parameter === param.label);
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">
                          {param.label}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">
                          {param.baseValue} {param.name === 'sla' ? '%' : param.name === 'tma' ? 's' : '%'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-sm font-medium ${getSensitivityColor(param.sensitivity)}`}>
                            {getSensitivityLabel(param.sensitivity)}
                          </span>
                          <div className="text-xs text-gray-500">
                            {param.sensitivity.toFixed(1)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-red-600">
                          {tornadoData?.negativeImpact.toFixed(1) || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-green-600">
                          {tornadoData?.positiveImpact.toFixed(1) || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-center font-medium">
                          {tornadoData?.range.toFixed(1) || 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Interpretação */}
            <div className="bg-blue-50 rounded-lg p-4 mt-6">
              <h5 className="font-medium text-blue-800 mb-2">Como Interpretar</h5>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• <strong>Sensibilidade Alta:</strong> Pequenas mudanças causam grande impacto</p>
                <p>• <strong>Range:</strong> Diferença entre o maior e menor impacto possível</p>
                <p>• <strong>Parâmetros críticos:</strong> Aqueles com maior sensibilidade necessitam controle rigoroso</p>
                <p>• <strong>Robustez:</strong> Modelos robustos são menos sensíveis a variações</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SensitivityAnalysis;
