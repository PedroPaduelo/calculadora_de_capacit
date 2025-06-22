import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Clock, 
  Target, 
  TrendingUp,
  Download,
  Zap,
  Activity,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Eye
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  ReferenceLine
} from 'recharts';
import { IntervalResult, Scenario } from '../types';
import { useApp } from '../contexts/AppContext';
import { 
  calculateIntervalStaffing, 
  calculateTotalFTE, 
  calculateAverageServiceLevel 
} from '../utils/advancedErlangC';
import { exportToCSV, exportToPDF, exportSummaryToPDF } from '../utils/exportUtils';
import { formatDecimal, formatPercentageValue, formatFTE, formatTime } from '../utils/formatters';

const ResultsPage: React.FC = () => {
  const { state, dispatch, getCurrentOperation } = useApp();
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'overview' | 'detailed' | 'comparison'>('overview');
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [timeFilter, setTimeFilter] = useState<{ start: string; end: string } | null>(null);
  
  const currentOperation = getCurrentOperation();
  const operationForecasts = currentOperation 
    ? state.forecasts.filter(f => f.operationId === currentOperation.id && f.results && f.results.length > 0)
    : [];
  const operationScenarios = currentOperation 
    ? state.scenarios.filter(s => s.operationId === currentOperation.id)
    : [];

  // Calcular resultados se não existirem nos cenários
  const scenariosWithResults = useMemo(() => {
    return operationScenarios.map(scenario => {
      if (scenario.results && scenario.results.length > 0) {
        return scenario;
      }

      const forecast = operationForecasts.find(f => f.id === scenario.forecastId);
      if (!forecast) return scenario;

      const results = calculateIntervalStaffing(
        forecast.points,
        scenario.serviceParameters,
        scenario.shrinkageConfig
      );

      const updatedScenario: Scenario = {
        ...scenario,
        results,
        totalFTE: calculateTotalFTE(results),
        averageServiceLevel: calculateAverageServiceLevel(results),
        updatedAt: new Date()
      };

      // Atualizar no estado
      dispatch({ type: 'UPDATE_SCENARIO', payload: updatedScenario });
      
      return updatedScenario;
    });
  }, [operationScenarios, operationForecasts, dispatch]);

  const selectedScenarioData = selectedScenario 
    ? scenariosWithResults.find(s => s.id === selectedScenario)
    : scenariosWithResults[0];

  // Se não há cenários, usar o primeiro forecast como fonte de dados
  const selectedForecast = operationForecasts[0];
  // Função para filtrar resultados por intervalo de tempo
  const filterResultsByTime = (results: IntervalResult[] | undefined) => {
    if (!results || !timeFilter) return results;
    
    return results.filter(result => {
      return result.time >= timeFilter.start && result.time <= timeFilter.end;
    });
  };

  const displayData = selectedScenarioData || (selectedForecast ? {
    id: selectedForecast.id,
    name: selectedForecast.name,
    operationId: selectedForecast.operationId,
    forecastId: selectedForecast.id,
    serviceParameters: selectedForecast.serviceParameters,
    shrinkageConfig: selectedForecast.shrinkageConfig,
    results: filterResultsByTime(selectedForecast.results),
    totalFTE: selectedForecast.totalFTE!,
    averageServiceLevel: selectedForecast.averageServiceLevel!,
    createdAt: selectedForecast.createdAt,
    updatedAt: selectedForecast.updatedAt
  } : null);

  // Aplicar filtro de tempo ao displayData se existir
  if (displayData && displayData.results && timeFilter) {
    displayData.results = filterResultsByTime(displayData.results);
  }

  if (!currentOperation) {
    return (
      <div className="card text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Selecione uma operação
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Vá para a página de Operações e selecione uma operação para ver resultados.
        </p>
      </div>
    );
  }

  if (operationForecasts.length === 0 && scenariosWithResults.length === 0) {
    return (
      <div className="card text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Nenhum resultado encontrado
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Crie forecasts com parâmetros configurados para visualizar resultados de dimensionamento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Resultados - {currentOperation.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Dimensionamento baseado em Erlang C com análise por intervalos
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Type Selector */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {[
              { key: 'overview', label: 'Visão Geral', icon: Eye },
              { key: 'detailed', label: 'Detalhado', icon: BarChart3 },
              { key: 'comparison', label: 'Comparação', icon: TrendingUp }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setViewType(key as any)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewType === key
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 mr-1.5 inline" />
                {label}
              </button>
            ))}
          </div>

          {/* Export Dropdown */}
          {displayData && (
            <div className="relative">
              <motion.button
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="btn-primary relative"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
                <ArrowDown className="w-4 h-4 ml-2" />
              </motion.button>
              
              {showExportOptions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-10"
                >
                  <div className="p-2">
                    <button
                      onClick={() => {
                        exportToCSV(displayData);
                        setShowExportOptions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2 inline" />
                      Exportar CSV
                    </button>
                    <button
                      onClick={() => {
                        exportToPDF(displayData);
                        setShowExportOptions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2 inline" />
                      Relatório PDF Completo
                    </button>
                    <button
                      onClick={() => {
                        exportSummaryToPDF(displayData);
                        setShowExportOptions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2 inline" />
                      Resumo Executivo PDF
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Time Filter */}
      {displayData && displayData.results && displayData.results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Filtro por Intervalo de Tempo
              </h3>
            </div>
            
            {timeFilter && (
              <button
                onClick={() => setTimeFilter(null)}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Limpar Filtro
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Horário Inicial
              </label>
              <input
                type="time"
                value={timeFilter?.start || ''}
                onChange={(e) => setTimeFilter(prev => ({ 
                  start: e.target.value, 
                  end: prev?.end || '23:59' 
                }))}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Horário Final
              </label>
              <input
                type="time"
                value={timeFilter?.end || ''}
                onChange={(e) => setTimeFilter(prev => ({ 
                  start: prev?.start || '00:00', 
                  end: e.target.value 
                }))}
                className="input-field"
              />
            </div>
            
            <div className="flex gap-2">
              {/* Presets de Horários */}
              {[
                { label: 'Manhã', start: '06:00', end: '12:00' },
                { label: 'Tarde', start: '12:00', end: '18:00' },
                { label: 'Noite', start: '18:00', end: '23:59' },
                { label: 'Comercial', start: '08:00', end: '18:00' }
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setTimeFilter({ start: preset.start, end: preset.end })}
                  className="px-3 py-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          
          {timeFilter && displayData.results && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Filtro aplicado:</strong> {timeFilter.start} - {timeFilter.end}
                <span className="ml-2 text-blue-600 dark:text-blue-400">
                  ({displayData.results.length} intervalos exibidos)
                </span>
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Forecast Selector */}
      {operationForecasts.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Forecasts com Resultados Calculados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {operationForecasts.map((forecast) => (
              <motion.div
                key={forecast.id}
                className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
                whileHover={{ scale: 1.02 }}
              >
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {forecast.name}
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>FTE Total: {forecast.totalFTE ? formatFTE(forecast.totalFTE) : 'N/A'}</p>
                  <p>SLA Médio: {forecast.averageServiceLevel ? formatPercentageValue(forecast.averageServiceLevel) : 'N/A'}</p>
                  <p>Intervalos: {forecast.points.length}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Scenario Selector */}
      {scenariosWithResults.length > 1 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Selecionar Cenário
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenariosWithResults.map((scenario) => (
              <motion.button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedScenario === scenario.id || (!selectedScenario && scenario === scenariosWithResults[0])
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {scenario.name}
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>FTE Total: {scenario.totalFTE ? formatFTE(scenario.totalFTE) : 'N/A'}</p>
                  <p>SLA Médio: {scenario.averageServiceLevel ? formatPercentageValue(scenario.averageServiceLevel) : 'N/A'}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {displayData && (
        <>
          {viewType === 'overview' && (
            <OverviewView scenario={displayData} />
          )}
          
          {viewType === 'detailed' && (
            <DetailedView scenario={displayData} />
          )}
          
          {viewType === 'comparison' && scenariosWithResults.length > 1 && (
            <ComparisonView scenarios={scenariosWithResults} />
          )}
        </>
      )}
    </div>
  );
};

// Overview View Component
interface OverviewViewProps {
  scenario: Scenario;
}

const OverviewView: React.FC<OverviewViewProps> = ({ scenario }) => {
  if (!scenario.results) return null;

  const results = scenario.results;
  const peakAgents = Math.max(...results.map(r => r.requiredAgentsWithShrinkage));
  const totalTraffic = results.reduce((sum, r) => sum + r.traffic, 0);
  const avgOccupancy = results.reduce((sum, r) => sum + r.occupancyRate, 0) / results.length;
  const avgProbabilityOfWaiting = results.reduce((sum, r) => sum + r.probabilityOfWaiting, 0) / results.length;
  const avgWaitTime = results.reduce((sum, r) => sum + r.averageWaitTime, 0) / results.length;
  
  const chartData = results.map(result => ({
    time: result.time,
    agents: result.requiredAgentsWithShrinkage,
    calls: result.calls,
    serviceLevel: result.serviceLevel,
    waitTime: result.averageWaitTime
  }));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-kpi bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                FTE Total
              </p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {scenario.totalFTE ? formatFTE(scenario.totalFTE) : 'N/A'}
              </p>
            </div>
            <Users className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-kpi bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                SLA Médio
              </p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                {scenario.averageServiceLevel ? formatPercentageValue(scenario.averageServiceLevel) : 'N/A'}
              </p>
            </div>
            <Target className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-kpi bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                Pico de Agentes
              </p>
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {peakAgents}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-kpi bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                Ocupação Média
              </p>
              <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                {formatPercentageValue(avgOccupancy)}
              </p>
            </div>
            <Activity className="w-10 h-10 text-orange-600 dark:text-orange-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-kpi bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                Prob. de Espera
              </p>
              <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                {formatPercentageValue(avgProbabilityOfWaiting * 100)}
              </p>
            </div>
            <Clock className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-kpi bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                ASA (Tempo Espera)
              </p>
              <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                {formatTime(avgWaitTime)}
              </p>
            </div>
            <Zap className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
        </motion.div>
      </div>

      {/* Main Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Dimensionamento por Intervalo
          </h3>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12 }}
                label={{ value: 'Agentes / Chamadas', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                tick={{ fontSize: 12 }}
                label={{ value: 'SLA (%)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(255 255 255)',
                  border: '1px solid rgb(229 231 235)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number, name: string) => {
                  switch (name) {
                    case 'agents': return [value, 'Agentes Necessários'];
                    case 'calls': return [value, 'Chamadas'];
                    case 'serviceLevel': return [`${value}%`, 'Nível de Serviço'];
                    default: return [value, name];
                  }
                }}
                labelFormatter={(label: string) => `Horário: ${label}`}
              />
              <ReferenceLine 
                y={scenario.serviceParameters.serviceLevel} 
                yAxisId="right"
                stroke="#ef4444" 
                strokeDasharray="5 5"
                label={{ value: `Meta: ${scenario.serviceParameters.serviceLevel}%`, position: 'left' }}
              />
              <Bar 
                yAxisId="left"
                dataKey="calls" 
                fill="#e5e7eb" 
                opacity={0.6}
                radius={[2, 2, 0, 0]}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="agents"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="serviceLevel"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

// Detailed View Component
interface DetailedViewProps {
  scenario: Scenario;
}

const DetailedView: React.FC<DetailedViewProps> = ({ scenario }) => {
  if (!scenario.results) return null;

  const results = scenario.results;
  
  return (
    <div className="space-y-6">
      {/* Detailed Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Resultados Detalhados por Intervalo
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Horário</th>
                <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">Chamadas</th>
                <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">Tráfego (Erl)</th>
                <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">Agentes Base</th>
                <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">Agentes + Shrink</th>
                <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">SLA (%)</th>
                <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">Tempo Espera</th>
                <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">Ocupação (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {results.map((result, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {result.time}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                    {result.calls}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                    {formatDecimal(result.traffic)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                    {result.requiredAgents}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                    {result.requiredAgentsWithShrinkage}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${
                    result.serviceLevel >= scenario.serviceParameters.serviceLevel
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatPercentageValue(result.serviceLevel)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                    {formatTime(result.averageWaitTime)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                    {formatPercentageValue(result.occupancyRate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Performance Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Análise de Performance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* SLA Analysis */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Análise de SLA
            </h4>
            <div className="space-y-2">
              {(() => {
                const totalIntervals = results.length;
                const metSLA = results.filter(r => r.serviceLevel >= scenario.serviceParameters.serviceLevel).length;
                const slaCompliance = (metSLA / totalIntervals) * 100;
                
                return (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Intervalos no SLA:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {metSLA}/{totalIntervals}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Taxa de Conformidade:</span>
                      <span className={`font-medium ${
                        slaCompliance >= 90 
                          ? 'text-green-600 dark:text-green-400'
                          : slaCompliance >= 70
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatPercentageValue(slaCompliance)}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Efficiency Analysis */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Eficiência Operacional
            </h4>
            <div className="space-y-2">
              {(() => {
                const avgOccupancy = results.reduce((sum, r) => sum + r.occupancyRate, 0) / results.length;
                const maxOccupancy = Math.max(...results.map(r => r.occupancyRate));
                const minOccupancy = Math.min(...results.map(r => r.occupancyRate));
                
                return (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Ocupação Média:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatPercentageValue(avgOccupancy)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Variação:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatPercentageValue(minOccupancy)} - {formatPercentageValue(maxOccupancy)}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Resource Analysis */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Análise de Recursos
            </h4>
            <div className="space-y-2">
              {(() => {
                const totalAgentsWithShrinkage = results.reduce((sum, r) => sum + r.requiredAgentsWithShrinkage, 0);
                const totalAgentsBase = results.reduce((sum, r) => sum + r.requiredAgents, 0);
                const shrinkageImpact = ((totalAgentsWithShrinkage - totalAgentsBase) / totalAgentsBase) * 100;
                
                return (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Impacto Shrinkage:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        +{formatPercentageValue(shrinkageImpact)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Agentes Extras:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        +{formatDecimal(totalAgentsWithShrinkage - totalAgentsBase, 0)}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Comparison View Component
interface ComparisonViewProps {
  scenarios: Scenario[];
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ scenarios }) => {
  const scenariosWithResults = scenarios.filter(s => s.results && s.results.length > 0);
  
  if (scenariosWithResults.length < 2) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Comparação Indisponível
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Pelo menos 2 cenários com resultados são necessários para comparação.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comparison Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Comparação de Cenários
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Cenário</th>
                <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">FTE Total</th>
                <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">SLA Médio</th>
                <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">Pico Agentes</th>
                <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">Ocupação Média</th>
                <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">Diferença FTE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {scenariosWithResults.map((scenario, index) => {
                const baseline = scenariosWithResults[0];
                const fteDifference = scenario.totalFTE - baseline.totalFTE;
                const peakAgents = Math.max(...scenario.results!.map(r => r.requiredAgentsWithShrinkage));
                const avgOccupancy = scenario.results!.reduce((sum, r) => sum + r.occupancyRate, 0) / scenario.results!.length;
                
                return (
                  <tr key={scenario.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {scenario.name}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                      {scenario.totalFTE ? formatFTE(scenario.totalFTE) : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                      {scenario.averageServiceLevel ? formatPercentageValue(scenario.averageServiceLevel) : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                      {peakAgents}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                      {formatPercentageValue(avgOccupancy)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {index === 0 ? (
                        <span className="text-gray-500 dark:text-gray-400">baseline</span>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          {fteDifference > 0 ? (
                            <ArrowUp className="w-3 h-3 text-red-500" />
                          ) : fteDifference < 0 ? (
                            <ArrowDown className="w-3 h-3 text-green-500" />
                          ) : null}
                          <span className={`font-medium ${
                            fteDifference > 0 
                              ? 'text-red-600 dark:text-red-400'
                              : fteDifference < 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {fteDifference > 0 ? '+' : ''}{formatFTE(fteDifference)}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Comparison Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Comparação Visual - Agentes por Intervalo
        </h3>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {(() => {
              // Preparar dados unificados para comparação
              const timePoints = scenariosWithResults[0]?.results?.map(r => r.time) || [];
              const comparisonData = timePoints.map(time => {
                const dataPoint: any = { time };
                scenariosWithResults.forEach(scenario => {
                  const result = scenario.results?.find(r => r.time === time);
                  dataPoint[`agents_${scenario.id}`] = result?.requiredAgentsWithShrinkage || 0;
                });
                return dataPoint;
              });

              return (
                <LineChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Agentes Necessários', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgb(255 255 255)',
                      border: '1px solid rgb(229 231 235)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: number, name: string) => {
                      const scenario = scenariosWithResults.find(s => name === `agents_${s.id}`);
                      return [value, scenario?.name || name];
                    }}
                    labelFormatter={(label: string) => `Horário: ${label}`}
                  />
                  {scenariosWithResults.map((scenario, index) => {
                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                    
                    return (
                      <Line
                        key={scenario.id}
                        type="monotone"
                        dataKey={`agents_${scenario.id}`}
                        stroke={colors[index % colors.length]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name={scenario.name}
                      />
                    );
                  })}
                </LineChart>
              );
            })()}
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultsPage;