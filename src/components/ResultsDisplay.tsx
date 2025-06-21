import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Clock, 
  Target, 
  TrendingUp, 
  Activity,
  Download,
  BarChart3
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { CallCenterResults } from '../utils/erlangC';

interface ResultsDisplayProps {
  results: CallCenterResults;
  targetServiceLevel: number;
  onExport?: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  results, 
  targetServiceLevel,
  onExport 
}) => {
  const chartData = results.agentsSuggested.map((agents, index) => ({
    agents,
    serviceLevel: results.serviceLevels[index],
    isOptimal: agents === results.agentsRequired
  }));

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  };

  const getStatusColor = (actual: number, target: number, higherIsBetter: boolean = true) => {
    const isGood = higherIsBetter ? actual >= target : actual <= target;
    return isGood ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  const getStatusBg = (actual: number, target: number, higherIsBetter: boolean = true) => {
    const isGood = higherIsBetter ? actual >= target : actual <= target;
    return isGood 
      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Header com ações */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Resultados do Dimensionamento
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Baseado no modelo Erlang C
            </p>
          </div>
        </div>
        
        {onExport && (
          <motion.button
            onClick={onExport}
            className="btn-secondary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </motion.button>
        )}
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Agentes Necessários */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className={`card ${getStatusBg(results.actualServiceLevel, targetServiceLevel)}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Agentes Necessários
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {results.agentsRequired}
              </p>
            </div>
            <Users className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
        </motion.div>

        {/* Nível de Serviço Atual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Nível de Serviço
              </p>
              <p className={`text-2xl font-bold ${getStatusColor(results.actualServiceLevel, targetServiceLevel)}`}>
                {results.actualServiceLevel}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Meta: {targetServiceLevel}%
              </p>
            </div>
            <Target className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </motion.div>

        {/* Tempo Médio de Espera */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tempo Médio de Espera
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatTime(results.averageWaitTime)}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </motion.div>

        {/* Taxa de Ocupação */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Taxa de Ocupação
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {results.utilizationRate}%
              </p>
            </div>
            <Activity className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </motion.div>
      </div>

      {/* Métricas Detalhadas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Métricas Detalhadas
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Tráfego (Erlangs)</span>
              <span className="font-medium text-gray-900 dark:text-white">{results.traffic}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Probabilidade de Espera</span>
              <span className="font-medium text-gray-900 dark:text-white">{results.probabilityOfWaiting}%</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Agentes Mínimos Teoricos</span>
              <span className="font-medium text-gray-900 dark:text-white">{Math.ceil(results.traffic)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Agentes Adicionais</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {results.agentsRequired - Math.ceil(results.traffic)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Gráfico de Sensibilidade */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="card"
      >
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Análise de Sensibilidade
          </h3>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="agents" 
                label={{ value: 'Número de Agentes', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                label={{ value: 'Nível de Serviço (%)', angle: -90, position: 'insideLeft' }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(255 255 255)',
                  border: '1px solid rgb(229 231 235)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)}%`,
                  'Nível de Serviço'
                ]}
                labelFormatter={(label: number) => `${label} agentes`}
              />
              <ReferenceLine 
                y={targetServiceLevel} 
                stroke="#ef4444" 
                strokeDasharray="5 5"
                label={{ value: `Meta: ${targetServiceLevel}%`, position: 'left' }}
              />
              <Line
                type="monotone"
                dataKey="serviceLevel"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={payload.isOptimal ? 6 : 4}
                      fill={payload.isOptimal ? "#10b981" : "#3b82f6"}
                      stroke="white"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            O ponto verde indica o número ótimo de agentes ({results.agentsRequired}) para atingir o nível de serviço desejado.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ResultsDisplay;