import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Target,
  Activity,
  BarChart3
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface AnalyticsProps {
  className?: string;
}

const Analytics: React.FC<AnalyticsProps> = ({ className = '' }) => {
  const { state } = useApp();

  // Dados para gráficos de exemplo baseados nos dados reais
  const operationsData = state.operations.map((op, index) => ({
    name: op.name.substring(0, 10) + (op.name.length > 10 ? '...' : ''),
    forecasts: state.forecasts.filter(f => f.operationId === op.id).length,
    scenarios: state.scenarios.filter(s => s.operationId === op.id).length,
    results: state.scenarios.filter(s => s.operationId === op.id && s.results).length,
  }));

  // Dados de tendência temporal (últimos 7 dias simulados)
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      operacoes: Math.floor(Math.random() * 5) + state.operations.length,
      forecasts: Math.floor(Math.random() * 10) + state.forecasts.length,
      cenarios: Math.floor(Math.random() * 8) + state.scenarios.length,
    };
  });

  // Dados para gráfico de pizza - distribuição de tipos de operação
  const operationTypes = state.operations.reduce((acc, op) => {
    const type = op.type === '24h' ? '24 Horas' : 'Horário Específico';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(operationTypes).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Métricas de resumo
  const totalResults = state.scenarios.filter(s => s.results && s.results.length > 0).length;
  const avgFTE = state.scenarios.length > 0 
    ? state.scenarios.reduce((sum, s) => sum + (s.totalFTE || 0), 0) / state.scenarios.length 
    : 0;
  const avgServiceLevel = state.scenarios.length > 0
    ? state.scenarios.reduce((sum, s) => sum + (s.averageServiceLevel || 0), 0) / state.scenarios.length
    : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Total Operações
              </p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {state.operations.length}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                Resultados Gerados
              </p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {totalResults}
              </p>
            </div>
            <Target className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                FTE Médio
              </p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {avgFTE.toFixed(0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                SLA Médio
              </p>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {avgServiceLevel.toFixed(1)}%
              </p>
            </div>
            <Activity className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tendência de Atividade
            </h3>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(255 255 255)',
                    border: '1px solid rgb(229 231 235)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="operacoes"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Operações"
                />
                <Line
                  type="monotone"
                  dataKey="forecasts"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Forecasts"
                />
                <Line
                  type="monotone"
                  dataKey="cenarios"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Cenários"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Operations Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Análise por Operação
            </h3>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={operationsData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(255 255 255)',
                    border: '1px solid rgb(229 231 235)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="forecasts" fill="#3b82f6" name="Forecasts" />
                <Bar dataKey="scenarios" fill="#10b981" name="Cenários" />
                <Bar dataKey="results" fill="#f59e0b" name="Resultados" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Bottom Charts */}
      {pieData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card"
        >
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Distribuição por Tipo de Operação
            </h3>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Analytics;
