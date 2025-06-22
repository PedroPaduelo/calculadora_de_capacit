import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Clock,
  Activity,
  Building2,
  GitCompare,
  AlertCircle,
  Plus,
  Users,
  Target,
  Zap,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  CheckCircle,
  Eye,
  Settings,
  Calendar,
  Gauge,
  Brain,
  Coffee,
  Briefcase
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Analytics } from '../components/Analytics';
import { formatFTE, formatPercentageValue, formatDecimal } from '../utils/formatters';

const Dashboard: React.FC = () => {
  const { state, getCurrentOperation, dispatch } = useApp();
  const currentOperation = getCurrentOperation();

  // Métricas computadas em tempo real
  const dashboardMetrics = useMemo(() => {
    const totalOperations = state.operations.length;
    const totalForecasts = state.forecasts.length;
    const totalScenarios = state.scenarios.length;
    
    // Estatísticas da operação atual
    const currentOperationForecasts = currentOperation 
      ? state.forecasts.filter(f => f.operationId === currentOperation.id)
      : [];
    
    const currentOperationScenarios = currentOperation
      ? state.scenarios.filter(s => s.operationId === currentOperation.id)
      : [];

    // Análise de performance
    const scenariosWithResults = state.scenarios.filter(s => s.results && s.results.length > 0);
    const avgFTE = scenariosWithResults.length > 0 
      ? scenariosWithResults.reduce((sum, s) => sum + (s.totalFTE || 0), 0) / scenariosWithResults.length
      : 0;
    
    const avgServiceLevel = scenariosWithResults.length > 0 
      ? scenariosWithResults.reduce((sum, s) => sum + (s.averageServiceLevel || 0), 0) / scenariosWithResults.length
      : 0;

    // Insights e alertas
    const insights = [];
    const alerts = [];

    // Verificar se há operação ativa
    if (!currentOperation) {
      alerts.push({
        type: 'warning',
        title: 'Nenhuma operação ativa',
        message: 'Selecione uma operação para começar a trabalhar',
        action: 'Ir para Operações',
        route: '/operations'
      });
    }

    // Verificar se operação ativa tem forecasts
    if (currentOperation && currentOperationForecasts.length === 0) {
      alerts.push({
        type: 'info',
        title: 'Forecast necessário',
        message: 'Crie um forecast para começar os cálculos',
        action: 'Criar Forecast',
        route: '/forecast'
      });
    }

    // Verificar SLA baixo
    if (avgServiceLevel > 0 && avgServiceLevel < 70) {
      alerts.push({
        type: 'danger',
        title: 'SLA abaixo do esperado',
        message: `SLA médio de ${formatPercentageValue(avgServiceLevel)} está baixo`,
        action: 'Analisar Resultados',
        route: '/results'
      });
    }

    // Insights positivos
    if (avgServiceLevel >= 90) {
      insights.push({
        type: 'success',
        title: 'Excelente performance',
        message: `SLA médio de ${formatPercentageValue(avgServiceLevel)} está ótimo`
      });
    }

    if (totalScenarios > 5) {
      insights.push({
        type: 'info',
        title: 'Análise robusta',
        message: `${totalScenarios} cenários criados demonstram análise detalhada`
      });
    }

    return {
      totalOperations,
      totalForecasts,
      totalScenarios,
      currentOperationForecasts,
      currentOperationScenarios,
      scenariosWithResults: scenariosWithResults.length,
      avgFTE,
      avgServiceLevel,
      insights,
      alerts
    };
  }, [state, currentOperation]);

  // Operações e forecasts recentes
  const recentData = useMemo(() => {
    const recentOperations = state.operations
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);

    const recentForecasts = state.forecasts
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);

    return { recentOperations, recentForecasts };
  }, [state]);

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                WFM Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                {currentOperation 
                  ? `Gerenciando: ${currentOperation.name}` 
                  : 'Centro de controle do seu Workforce Management'
                }
              </p>
            </div>
            
            {currentOperation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-200">
                      Operação Ativa
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {currentOperation.name}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Alertas e Insights */}
      {(dashboardMetrics.alerts.length > 0 || dashboardMetrics.insights.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Alertas */}
          {dashboardMetrics.alerts.map((alert, index) => (
            <motion.div
              key={`alert-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`card border-l-4 ${
                alert.type === 'danger' ? 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10' :
                alert.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10' :
                'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {alert.type === 'danger' ? (
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-1" />
                  ) : alert.type === 'warning' ? (
                    <AlertCircle className="w-5 h-5 text-yellow-500 mt-1" />
                  ) : (
                    <Brain className="w-5 h-5 text-blue-500 mt-1" />
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {alert.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {alert.message}
                    </p>
                  </div>
                </div>
                <Link to={alert.route}>
                  <button className="btn-sm btn-secondary">
                    {alert.action}
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}

          {/* Insights */}
          {dashboardMetrics.insights.map((insight, index) => (
            <motion.div
              key={`insight-${index}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-900/10"
            >
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {insight.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {insight.message}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Métricas Principais com Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Operações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card hover:shadow-xl transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <Link to="/operations">
              <button className="opacity-0 group-hover:opacity-100 transition-opacity btn-sm btn-primary">
                <Eye className="w-3 h-3 mr-1" />
                Ver
              </button>
            </Link>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {dashboardMetrics.totalOperations}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Operações criadas
            </p>
            <Link to="/operations">
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  Gerenciar operações
                </span>
                <ArrowUp className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Forecasts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card hover:shadow-xl transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <Link to="/forecast">
              <button className="opacity-0 group-hover:opacity-100 transition-opacity btn-sm btn-primary">
                <Plus className="w-3 h-3 mr-1" />
                Novo
              </button>
            </Link>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {dashboardMetrics.totalForecasts}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Forecasts ativos
            </p>
            <Link to="/forecast">
              <div className="flex items-center justify-between text-xs">
                <span className="text-green-600 dark:text-green-400 font-medium">
                  Configurar volumes
                </span>
                <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Cenários */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card hover:shadow-xl transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:scale-110 transition-transform">
              <GitCompare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <Link to="/scenarios">
              <button className="opacity-0 group-hover:opacity-100 transition-opacity btn-sm btn-primary">
                <Settings className="w-3 h-3 mr-1" />
                Config
              </button>
            </Link>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {dashboardMetrics.totalScenarios}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Cenários criados
            </p>
            <Link to="/scenarios">
              <div className="flex items-center justify-between text-xs">
                <span className="text-purple-600 dark:text-purple-400 font-medium">
                  Analisar cenários
                </span>
                <GitCompare className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card hover:shadow-xl transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl group-hover:scale-110 transition-transform">
              <Gauge className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <Link to="/results">
              <button className="opacity-0 group-hover:opacity-100 transition-opacity btn-sm btn-primary">
                <BarChart3 className="w-3 h-3 mr-1" />
                Ver
              </button>
            </Link>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {dashboardMetrics.scenariosWithResults}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Resultados gerados
            </p>
            <Link to="/results">
              <div className="flex items-center justify-between text-xs">
                <span className="text-orange-600 dark:text-orange-400 font-medium">
                  Ver performance
                </span>
                <BarChart3 className="w-3 h-3 text-orange-600 dark:text-orange-400" />
              </div>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Performance Dashboard - Quando há dados */}
      {dashboardMetrics.scenariosWithResults > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Gauge className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Performance Overview
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* FTE Médio */}
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">
                {formatFTE(dashboardMetrics.avgFTE)}
              </p>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                FTE Médio
              </p>
            </div>

            {/* SLA Médio */}
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
              <Target className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className={`text-3xl font-bold mb-1 ${
                dashboardMetrics.avgServiceLevel >= 80 
                  ? 'text-green-900 dark:text-green-100' 
                  : 'text-yellow-900 dark:text-yellow-100'
              }`}>
                {formatPercentageValue(dashboardMetrics.avgServiceLevel)}
              </p>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                SLA Médio
              </p>
            </div>

            {/* Eficiência */}
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl">
              <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-1">
                {dashboardMetrics.scenariosWithResults > 0 
                  ? formatDecimal((dashboardMetrics.avgServiceLevel / dashboardMetrics.avgFTE) * 10, 1)
                  : '0'
                }
              </p>
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Eficiência
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Seções baseadas no estado */}
      {currentOperation ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Operação Atual */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Operação Atual
                </h3>
              </div>
              <Link to="/operations">
                <button className="btn-sm btn-secondary">
                  <Settings className="w-3 h-3 mr-1" />
                  Configurar
                </button>
              </Link>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {currentOperation.name}
                </h4>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {currentOperation.type === '24h' ? '24 horas' : 
                     `${currentOperation.startTime} - ${currentOperation.endTime}`}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(currentOperation.updatedAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {dashboardMetrics.currentOperationForecasts.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Forecasts</p>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {dashboardMetrics.currentOperationScenarios.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Cenários</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Ações Rápidas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Ações Rápidas
              </h3>
            </div>
            
            <div className="space-y-12">
              <Link to="/forecast">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-secondary flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-4 h-4" />
                    <span>Criar Forecast</span>
                  </div>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                    Volume
                  </span>
                </motion.button>
              </Link>
              
              <Link to="/scenarios">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-secondary flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-3">
                    <GitCompare className="w-4 h-4" />
                    <span>Novo Cenário</span>
                  </div>
                  <span className="text-xs bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded">
                    Análise
                  </span>
                </motion.button>
              </Link>
              
              <Link to="/results">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-secondary flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-4 h-4" />
                    <span>Ver Resultados</span>
                  </div>
                  <span className="text-xs bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">
                    Relatório
                  </span>
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      ) : (
        /* Estado inicial - Nenhuma operação */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card text-center py-16"
        >
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Coffee className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Bem-vindo ao WFM Calculator!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Comece criando sua primeira operação para desbloquear todas as funcionalidades 
              de análise e dimensionamento de call center.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/operations">
                <motion.button
                  className="btn-primary flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-4 h-4" />
                  Criar Primeira Operação
                </motion.button>
              </Link>
              <Link to="/operations-list">
                <motion.button
                  className="btn-secondary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Ver Operações Existentes
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Atividade Recente */}
      {recentData.recentOperations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Atividade Recente
              </h3>
            </div>
            <Link 
              to="/operations-list"
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
            >
              Ver tudo
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentData.recentOperations.map((operation, index) => (
              <motion.div
                key={operation.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 cursor-pointer"
                onClick={() => dispatch({ type: 'SET_CURRENT_OPERATION', payload: operation.id })}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    operation.id === currentOperation?.id 
                      ? 'bg-green-500 shadow-lg shadow-green-500/50' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {operation.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {operation.type === '24h' ? '24 horas' : 
                       `${operation.startTime} - ${operation.endTime}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(operation.updatedAt).toLocaleDateString('pt-BR')}
                  </p>
                  {operation.id === currentOperation?.id && (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Ativa
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Analytics Avançado */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Analytics className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/20" />
      </motion.div>
    </div>
  );
};

export default Dashboard;