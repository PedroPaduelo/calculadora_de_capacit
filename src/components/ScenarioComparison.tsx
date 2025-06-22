import React, { useState } from 'react';
import { Scenario } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface ScenarioComparisonProps {
  scenarios: Scenario[];
  onClose: () => void;
}

export const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  scenarios,
  onClose
}) => {
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);

  const handleScenarioToggle = (scenarioId: string) => {
    setSelectedScenarios(prev => {
      if (prev.includes(scenarioId)) {
        return prev.filter(id => id !== scenarioId);
      } else if (prev.length < 3) {
        return [...prev, scenarioId];
      } else {
        alert('Máximo de 3 cenários para comparação');
        return prev;
      }
    });
  };

  const selectedScenarioObjects = scenarios.filter(s => selectedScenarios.includes(s.id));

  const getComparisonMetrics = () => {
    if (selectedScenarioObjects.length < 2) return null;

    const baseScenario = selectedScenarioObjects[0];
    return selectedScenarioObjects.slice(1).map(scenario => ({
      scenario,
      fteDifference: scenario.totalFTE - baseScenario.totalFTE,
      slaDifference: scenario.averageServiceLevel - baseScenario.averageServiceLevel,
      shrinkageDifference: getTotalShrinkage(scenario.shrinkageConfig) - getTotalShrinkage(baseScenario.shrinkageConfig)
    }));
  };

  const getTotalShrinkage = (shrinkageConfig: any) => {
    return shrinkageConfig.regularBreaks +
           shrinkageConfig.training +
           shrinkageConfig.meetings +
           shrinkageConfig.absenteeism +
           shrinkageConfig.other;
  };

  const comparisonMetrics = getComparisonMetrics();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Comparação de Cenários
            </h2>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Selecione até 3 cenários para comparar (máximo)
          </p>
        </div>

        <div className="p-6">
          {/* Scenario Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Selecionar Cenários
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scenarios.map(scenario => (
                <Card 
                  key={scenario.id} 
                  className={`cursor-pointer transition-all ${
                    selectedScenarios.includes(scenario.id) 
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => handleScenarioToggle(scenario.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {scenario.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        FTE: {Math.ceil(scenario.totalFTE)} | SLA: {scenario.averageServiceLevel.toFixed(1)}%
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedScenarios.includes(scenario.id)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`} />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Comparison Table */}
          {selectedScenarioObjects.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Comparação Detalhada
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="border border-gray-300 dark:border-gray-600 p-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                        Métrica
                      </th>
                      {selectedScenarioObjects.map(scenario => (
                        <th key={scenario.id} className="border border-gray-300 dark:border-gray-600 p-3 text-center font-semibold text-gray-900 dark:text-gray-100">
                          {scenario.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-600 p-3 font-medium text-gray-900 dark:text-gray-100">
                        FTE Total
                      </td>
                      {selectedScenarioObjects.map(scenario => (
                        <td key={scenario.id} className="border border-gray-300 dark:border-gray-600 p-3 text-center text-gray-900 dark:text-gray-100">
                          {Math.ceil(scenario.totalFTE)}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <td className="border border-gray-300 dark:border-gray-600 p-3 font-medium text-gray-900 dark:text-gray-100">
                        SLA Médio (%)
                      </td>
                      {selectedScenarioObjects.map(scenario => (
                        <td key={scenario.id} className="border border-gray-300 dark:border-gray-600 p-3 text-center text-gray-900 dark:text-gray-100">
                          {scenario.averageServiceLevel.toFixed(1)}%
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-600 p-3 font-medium text-gray-900 dark:text-gray-100">
                        TMA (segundos)
                      </td>
                      {selectedScenarioObjects.map(scenario => (
                        <td key={scenario.id} className="border border-gray-300 dark:border-gray-600 p-3 text-center text-gray-900 dark:text-gray-100">
                          {scenario.serviceParameters.defaultAht}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <td className="border border-gray-300 dark:border-gray-600 p-3 font-medium text-gray-900 dark:text-gray-100">
                        SLA Alvo (%)
                      </td>
                      {selectedScenarioObjects.map(scenario => (
                        <td key={scenario.id} className="border border-gray-300 dark:border-gray-600 p-3 text-center text-gray-900 dark:text-gray-100">
                          {scenario.serviceParameters.serviceLevel}%
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-600 p-3 font-medium text-gray-900 dark:text-gray-100">
                        Shrinkage Total (%)
                      </td>
                      {selectedScenarioObjects.map(scenario => (
                        <td key={scenario.id} className="border border-gray-300 dark:border-gray-600 p-3 text-center text-gray-900 dark:text-gray-100">
                          {getTotalShrinkage(scenario.shrinkageConfig).toFixed(1)}%
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <td className="border border-gray-300 dark:border-gray-600 p-3 font-medium text-gray-900 dark:text-gray-100">
                        Data de Criação
                      </td>
                      {selectedScenarioObjects.map(scenario => (
                        <td key={scenario.id} className="border border-gray-300 dark:border-gray-600 p-3 text-center text-sm">
                          {scenario.createdAt.toLocaleDateString('pt-BR')}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Comparison Insights */}
          {comparisonMetrics && comparisonMetrics.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Insights da Comparação
              </h3>
              <div className="space-y-4">
                {comparisonMetrics.map((metric, index) => (
                  <Card key={index}>
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {metric.scenario.name} vs {selectedScenarioObjects[0].name}
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${
                          metric.fteDifference > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {metric.fteDifference > 0 ? '+' : ''}{Math.round(metric.fteDifference)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Diferença FTE
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${
                          metric.slaDifference > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metric.slaDifference > 0 ? '+' : ''}{metric.slaDifference.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Diferença SLA
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${
                          metric.shrinkageDifference > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {metric.shrinkageDifference > 0 ? '+' : ''}{metric.shrinkageDifference.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Diferença Shrinkage
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Interval Comparison */}
          {selectedScenarioObjects.length > 0 && selectedScenarioObjects[0].results && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Comparação por Intervalo
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="border border-gray-300 dark:border-gray-600 p-2 text-left text-gray-900 dark:text-gray-100">
                        Horário
                      </th>
                      {selectedScenarioObjects.map(scenario => (
                        <th key={scenario.id} className="border border-gray-300 dark:border-gray-600 p-2 text-center text-gray-900 dark:text-gray-100" colSpan={3}>
                          {scenario.name}
                        </th>
                      ))}
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="border border-gray-300 dark:border-gray-600 p-2"></th>
                      {selectedScenarioObjects.map(scenario => (
                        <React.Fragment key={scenario.id}>
                          <th className="border border-gray-300 dark:border-gray-600 p-2 text-xs text-gray-900 dark:text-gray-100">Agentes</th>
                          <th className="border border-gray-300 dark:border-gray-600 p-2 text-xs text-gray-900 dark:text-gray-100">SLA</th>
                          <th className="border border-gray-300 dark:border-gray-600 p-2 text-xs text-gray-900 dark:text-gray-100">Espera</th>
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedScenarioObjects[0].results?.map((_, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                        <td className="border border-gray-300 dark:border-gray-600 p-2 font-medium text-gray-900 dark:text-gray-100">
                          {selectedScenarioObjects[0].results![index].time}
                        </td>
                        {selectedScenarioObjects.map(scenario => {
                          const result = scenario.results?.[index];
                          return result ? (
                            <React.Fragment key={scenario.id}>
                              <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-gray-900 dark:text-gray-100">
                                {result.requiredAgentsWithShrinkage}
                              </td>
                              <td className={`border border-gray-300 dark:border-gray-600 p-2 text-center ${
                                result.serviceLevel >= scenario.serviceParameters.serviceLevel 
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                              }`}>
                                {result.serviceLevel.toFixed(1)}%
                              </td>
                              <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-gray-900 dark:text-gray-100">
                                {result.averageWaitTime.toFixed(1)}s
                              </td>
                            </React.Fragment>
                          ) : (
                            <React.Fragment key={scenario.id}>
                              <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-gray-900 dark:text-gray-100">-</td>
                              <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-gray-900 dark:text-gray-100">-</td>
                              <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-gray-900 dark:text-gray-100">-</td>
                            </React.Fragment>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedScenarioObjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                Selecione pelo menos um cenário para visualizar a comparação.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioComparison;