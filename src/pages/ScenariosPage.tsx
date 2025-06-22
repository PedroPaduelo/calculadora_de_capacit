import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Scenario, Forecast, ServiceParameters, ShrinkageConfig } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { calculateAdvancedErlangC } from '../utils/advancedErlangC';
import ScenarioComparison from '../components/ScenarioComparison';
import { formatFTE, formatPercentageValue, formatInteger, formatTime } from '../utils/formatters';
import { useConfirmDialog } from '../components/ui';

interface ScenarioFormData {
  name: string;
  forecastId: string;
  serviceParameters: ServiceParameters;
  shrinkageConfig: ShrinkageConfig;
}

const defaultServiceParameters: ServiceParameters = {
  defaultAht: 300,
  serviceLevel: 80,
  targetAnswerTime: 20,
  abandonmentRate: 5
};

const defaultShrinkageConfig: ShrinkageConfig = {
  regularBreaks: 15,
  training: 5,
  meetings: 5,
  absenteeism: 10,
  other: 5,
  customFactors: []
};

export const ScenariosPage: React.FC = () => {
  const { state, getCurrentOperation, getOperationForecasts, saveScenario, updateScenario, deleteScenario, duplicateScenario } = useApp();
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showConfirm, ConfirmDialog } = useConfirmDialog();
  const [showComparison, setShowComparison] = useState(false);
  const [formData, setFormData] = useState<ScenarioFormData>({
    name: '',
    forecastId: '',
    serviceParameters: defaultServiceParameters,
    shrinkageConfig: defaultShrinkageConfig
  });

  const currentOperation = getCurrentOperation();
  const operationForecasts = currentOperation ? getOperationForecasts(currentOperation.id) : [];
  const operationScenarios = currentOperation ? state.scenarios.filter(s => s.operationId === currentOperation.id) : [];

  useEffect(() => {
    if (editingScenario) {
      setFormData({
        name: editingScenario.name,
        forecastId: editingScenario.forecastId,
        serviceParameters: editingScenario.serviceParameters,
        shrinkageConfig: editingScenario.shrinkageConfig
      });
    }
  }, [editingScenario]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleServiceParametersChange = (field: keyof ServiceParameters, value: number) => {
    setFormData(prev => ({
      ...prev,
      serviceParameters: {
        ...prev.serviceParameters,
        [field]: value
      }
    }));
  };

  const handleShrinkageConfigChange = (field: keyof ShrinkageConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      shrinkageConfig: {
        ...prev.shrinkageConfig,
        [field]: value
      }
    }));
  };

  const calculateScenario = (forecast: Forecast, serviceParams: ServiceParameters, shrinkage: ShrinkageConfig) => {
    try {
      const results = calculateAdvancedErlangC(
        forecast.points,
        serviceParams,
        shrinkage
      );

      const totalFTE = results.reduce((sum, result) => sum + result.requiredAgentsWithShrinkage, 0) / results.length;
      const averageServiceLevel = results.reduce((sum, result) => sum + result.serviceLevel, 0) / results.length;

      return { results, totalFTE, averageServiceLevel };
    } catch (error) {
      console.error('Error calculating scenario:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOperation || !formData.forecastId) return;

    setIsLoading(true);
    try {
      const forecast = operationForecasts.find(f => f.id === formData.forecastId);
      if (!forecast) {
        throw new Error('Forecast não encontrado');
      }

      const { results, totalFTE, averageServiceLevel } = calculateScenario(
        forecast,
        formData.serviceParameters,
        formData.shrinkageConfig
      );

      const scenario: Scenario = {
        id: editingScenario?.id || `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: formData.name,
        operationId: currentOperation.id,
        forecastId: formData.forecastId,
        serviceParameters: formData.serviceParameters,
        shrinkageConfig: formData.shrinkageConfig,
        results,
        totalFTE,
        averageServiceLevel,
        createdAt: editingScenario?.createdAt || new Date(),
        updatedAt: new Date()
      };

      if (editingScenario) {
        await updateScenario(scenario);
      } else {
        await saveScenario(scenario);
      }

      setShowForm(false);
      setEditingScenario(null);
    } catch (error) {
      console.error('Error saving scenario:', error);
      showConfirm({
        title: 'Erro',
        message: 'Erro ao salvar cenário. Verifique os dados e tente novamente.',
        confirmText: 'OK',
        type: 'danger',
        onConfirm: () => {}
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (scenario: Scenario) => {
    setEditingScenario(scenario);
    setShowForm(true);
  };

  const handleDelete = async (scenarioId: string) => {
    showConfirm({
      title: 'Excluir Cenário',
      message: 'Tem certeza que deseja excluir este cenário?',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteScenario(scenarioId);
        } catch (error) {
          console.error('Error deleting scenario:', error);
          showConfirm({
            title: 'Erro',
            message: 'Erro ao excluir cenário.',
            confirmText: 'OK',
            type: 'danger',
            onConfirm: () => {}
          });
        }
      }
    });
  };

  const handleDuplicate = async (scenarioId: string) => {
    try {
      setIsLoading(true);
      await duplicateScenario(scenarioId);
    } catch (error) {
      console.error('Error duplicating scenario:', error);
      showConfirm({
        title: 'Erro',
        message: 'Erro ao duplicar cenário.',
        confirmText: 'OK',
        type: 'danger',
        onConfirm: () => {}
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewScenario = () => {
    setEditingScenario(null);
    setFormData({
      name: '',
      forecastId: operationForecasts[0]?.id || '',
      serviceParameters: defaultServiceParameters,
      shrinkageConfig: defaultShrinkageConfig
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingScenario(null);
    setFormData({
      name: '',
      forecastId: operationForecasts[0]?.id || '',
      serviceParameters: defaultServiceParameters,
      shrinkageConfig: defaultShrinkageConfig
    });
  };

  if (!currentOperation) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Nenhuma operação selecionada
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Selecione uma operação para gerenciar seus cenários.
          </p>
        </div>
      </div>
    );
  }

  if (operationForecasts.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Nenhum forecast disponível
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Você precisa criar pelo menos um forecast antes de criar cenários.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Cenários - {currentOperation.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Crie e compare diferentes cenários de dimensionamento
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setShowComparison(true)}
            variant="outline"
            disabled={operationScenarios.length < 2}
          >
            Comparar Cenários
          </Button>
          <Button
            onClick={handleNewScenario}
            disabled={isLoading}
          >
            Novo Cenário
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {editingScenario ? 'Editar Cenário' : 'Novo Cenário'}
              </h3>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancelar
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Nome do Cenário"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Cenário Base, Com Shrinkage 20%"
                  required
                />
              </div>
              <div>
                <Select
                  label="Forecast Base"
                  value={formData.forecastId}
                  onChange={(value) => handleInputChange('forecastId', value)}
                  options={operationForecasts.map(f => ({
                    value: f.id,
                    label: f.name
                  }))}
                  required
                />
              </div>
            </div>

            {/* Service Parameters */}
            <div className="border-t pt-6">
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Parâmetros de Atendimento
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  label="TMA Padrão (segundos)"
                  type="number"
                  value={formData.serviceParameters.defaultAht}
                  onChange={(e) => handleServiceParametersChange('defaultAht', Number(e.target.value))}
                  min="1"
                  required
                />
                <Input
                  label="SLA Alvo (%)"
                  type="number"
                  value={formData.serviceParameters.serviceLevel}
                  onChange={(e) => handleServiceParametersChange('serviceLevel', Number(e.target.value))}
                  min="1"
                  max="100"
                  required
                />
                <Input
                  label="Tempo de Resposta (seg)"
                  type="number"
                  value={formData.serviceParameters.targetAnswerTime}
                  onChange={(e) => handleServiceParametersChange('targetAnswerTime', Number(e.target.value))}
                  min="1"
                  required
                />
                <Input
                  label="Taxa de Abandono (%)"
                  type="number"
                  value={formData.serviceParameters.abandonmentRate || 0}
                  onChange={(e) => handleServiceParametersChange('abandonmentRate', Number(e.target.value))}
                  min="0"
                  max="100"
                />
              </div>
            </div>

            {/* Shrinkage Configuration */}
            <div className="border-t pt-6">
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Configuração de Improdutividade (Shrinkage)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Input
                  label="Pausas Regulares (%)"
                  type="number"
                  value={formData.shrinkageConfig.regularBreaks}
                  onChange={(e) => handleShrinkageConfigChange('regularBreaks', Number(e.target.value))}
                  min="0"
                  max="100"
                />
                <Input
                  label="Treinamentos (%)"
                  type="number"
                  value={formData.shrinkageConfig.training}
                  onChange={(e) => handleShrinkageConfigChange('training', Number(e.target.value))}
                  min="0"
                  max="100"
                />
                <Input
                  label="Reuniões (%)"
                  type="number"
                  value={formData.shrinkageConfig.meetings}
                  onChange={(e) => handleShrinkageConfigChange('meetings', Number(e.target.value))}
                  min="0"
                  max="100"
                />
                <Input
                  label="Absenteísmo (%)"
                  type="number"
                  value={formData.shrinkageConfig.absenteeism}
                  onChange={(e) => handleShrinkageConfigChange('absenteeism', Number(e.target.value))}
                  min="0"
                  max="100"
                />
                <Input
                  label="Outros (%)"
                  type="number"
                  value={formData.shrinkageConfig.other}
                  onChange={(e) => handleShrinkageConfigChange('other', Number(e.target.value))}
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <LoadingSpinner /> : (editingScenario ? 'Atualizar' : 'Criar Cenário')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Scenarios List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Cenários Criados ({operationScenarios.length})
        </h3>
        
        {operationScenarios.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                Nenhum cenário criado ainda. Clique em "Novo Cenário" para começar.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {operationScenarios.map((scenario) => {
              const forecast = operationForecasts.find(f => f.id === scenario.forecastId);
              const totalShrinkage = scenario.shrinkageConfig.regularBreaks +
                scenario.shrinkageConfig.training +
                scenario.shrinkageConfig.meetings +
                scenario.shrinkageConfig.absenteeism +
                scenario.shrinkageConfig.other;

              return (
                <Card key={scenario.id} className={`${selectedScenario === scenario.id ? 'ring-2 ring-blue-500' : ''}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {scenario.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Baseado em: {forecast?.name || 'Forecast não encontrado'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedScenario(selectedScenario === scenario.id ? '' : scenario.id)}
                      >
                        {selectedScenario === scenario.id ? 'Ocultar' : 'Ver'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDuplicate(scenario.id)}
                        disabled={isLoading}
                      >
                        Duplicar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(scenario)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(scenario.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {scenario.totalFTE ? formatInteger(scenario.totalFTE) : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">FTE Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {scenario.averageServiceLevel ? formatPercentageValue(scenario.averageServiceLevel) : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">SLA Médio</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {scenario.serviceParameters.defaultAht}s
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">TMA</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatPercentageValue(totalShrinkage)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Shrinkage</div>
                    </div>
                  </div>

                  {selectedScenario === scenario.id && scenario.results && (
                    <div className="border-t pt-4">
                      <h5 className="font-semibold mb-3">Resultados por Intervalo</h5>
                      <div className="max-h-64 overflow-y-auto">
                        <div className="grid grid-cols-6 gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <div>Horário</div>
                          <div>Chamadas</div>
                          <div>Agentes</div>
                          <div>Com Shrinkage</div>
                          <div>SLA</div>
                          <div>Espera (s)</div>
                        </div>
                        {scenario.results.map((result, index) => (
                          <div key={index} className="grid grid-cols-6 gap-2 text-xs py-1 border-b border-gray-200 dark:border-gray-700">
                            <div>{result.time}</div>
                            <div>{result.calls}</div>
                            <div>{result.requiredAgents}</div>
                            <div className="font-semibold">{result.requiredAgentsWithShrinkage}</div>
                            <div className={result.serviceLevel >= scenario.serviceParameters.serviceLevel ? 'text-green-600' : 'text-red-600'}>
                              {formatPercentageValue(result.serviceLevel)}
                            </div>
                            <div>{formatTime(result.averageWaitTime)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Scenario Comparison Modal */}
      {showComparison && (
        <ScenarioComparison
          scenarios={operationScenarios}
          onClose={() => setShowComparison(false)}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
};

export default ScenariosPage;