import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Clock,
  Activity,
  Building2,
  GitCompare,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Analytics } from '../components/Analytics';

const Dashboard: React.FC = () => {
  const { state, getCurrentOperation } = useApp();
  const currentOperation = getCurrentOperation();

  // Estatísticas gerais
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

  // Cards de estatísticas rápidas
  const quickStats = [
    {
      icon: Building2,
      label: 'Operações',
      value: totalOperations,
      color: 'blue',
      route: '/operations'
    },
    {
      icon: TrendingUp,
      label: 'Forecasts',
      value: totalForecasts,
      color: 'green',
      route: '/forecast'
    },
    {
      icon: GitCompare,
      label: 'Cenários',
      value: totalScenarios,
      color: 'purple',
      route: '/scenarios'
    },
    {
      icon: BarChart3,
      label: 'Resultados',
      value: state.scenarios.filter(s => s.results && s.results.length > 0).length,
      color: 'orange',
      route: '/results'
    }
  ];

  // Operações recentes
  const recentOperations = state.operations
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Forecasts recentes
  const recentForecasts = state.forecasts
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard WFM
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visão geral do seu ambiente de Workforce Management
          </p>
        </div>
        
        {currentOperation && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4"
          >
            <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
              Operação Ativa
            </p>
            <p className="text-lg font-semibold text-primary-900 dark:text-primary-100">
              {currentOperation.name}
            </p>
          </motion.div>
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
            green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400',
            purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400',
            orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400'
          };

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={stat.route}>
                <div className={`card hover:shadow-lg transition-all duration-200 cursor-pointer ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium opacity-75">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <Icon className="w-10 h-10 opacity-75" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Current Operation Status */}
      {currentOperation ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Operation Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Operação Atual
              </h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Nome</p>
                <p className="font-medium text-gray-900 dark:text-white">{currentOperation.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tipo</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {currentOperation.type === '24h' ? '24 horas' : 
                   `${currentOperation.startTime} - ${currentOperation.endTime}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Descrição</p>
                <p className="text-gray-700 dark:text-gray-300">
                  {currentOperation.description || 'Sem descrição'}
                </p>
              </div>
              
              {/* Stats da operação atual */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {currentOperationForecasts.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Forecasts</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {currentOperationScenarios.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cenários</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Atividade Recente
              </h3>
            </div>
            
            <div className="space-y-3">
              {recentForecasts.length > 0 ? (
                recentForecasts.map((forecast, index) => (
                  <motion.div
                    key={forecast.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {forecast.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {forecast.points.length} intervalos • {forecast.interval}min
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(forecast.updatedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Nenhum forecast criado ainda
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      ) : (
        /* No Operation Selected */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card text-center py-12"
        >
          <AlertCircle className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma operação selecionada
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Selecione ou crie uma operação para começar a usar o WFM Calculator.
          </p>
          <Link to="/operations">
            <motion.button
              className="btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Building2 className="w-4 h-4 mr-2" />
              Gerenciar Operações
            </motion.button>
          </Link>
        </motion.div>
      )}

      {/* Recent Operations */}
      {recentOperations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Operações Recentes
              </h3>
            </div>
            <Link 
              to="/operations"
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              Ver todas
            </Link>
          </div>
          
          <div className="space-y-2">
            {recentOperations.map((operation, index) => (
              <motion.div
                key={operation.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    operation.id === currentOperation?.id 
                      ? 'bg-green-500' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {operation.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {operation.type === '24h' ? '24 horas' : 
                       `${operation.startTime} - ${operation.endTime}`}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(operation.updatedAt).toLocaleDateString('pt-BR')}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Analytics Section */}
      <Analytics />
    </div>
  );
};

export default Dashboard;
