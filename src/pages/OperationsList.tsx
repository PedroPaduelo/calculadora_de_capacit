import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Plus, 
  Clock, 
  Calendar,
  TrendingUp,
  BarChart3,
  GitCompare,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const OperationsList: React.FC = () => {
  const { state, dispatch, getCurrentOperation } = useApp();
  const currentOperation = getCurrentOperation();

  const handleSelectOperation = (operationId: string) => {
    dispatch({ type: 'SET_CURRENT_OPERATION', payload: operationId });
  };

  // Estatísticas por operação
  const getOperationStats = (operationId: string) => {
    const forecasts = state.forecasts.filter((f: any) => f.operationId === operationId).length;
    const scenarios = state.scenarios.filter((s: any) => s.operationId === operationId).length;
    const results = state.scenarios.filter((s: any) => s.operationId === operationId && s.results).length;
    
    return { forecasts, scenarios, results };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Lista de Operações
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie e selecione operações para análise WFM
          </p>
        </div>
        
        <Link to="/operations">
          <motion.button
            className="btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Operação
          </motion.button>
        </Link>
      </div>

      {/* Current Operation */}
      {currentOperation && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <Building2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100">
                Operação Ativa: {currentOperation.name}
              </h3>
              <p className="text-sm text-primary-700 dark:text-primary-300">
                {currentOperation.type === '24h' ? '24 horas' : 
                 `${currentOperation.startTime} - ${currentOperation.endTime}`}
              </p>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/forecast">
              <motion.div
                className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-primary-200 dark:border-primary-800 hover:shadow-md transition-shadow cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-gray-900 dark:text-white">Forecast</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </motion.div>
            </Link>
            
            <Link to="/results">
              <motion.div
                className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-primary-200 dark:border-primary-800 hover:shadow-md transition-shadow cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-gray-900 dark:text-white">Resultados</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </motion.div>
            </Link>
            
            <Link to="/scenarios">
              <motion.div
                className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-primary-200 dark:border-primary-800 hover:shadow-md transition-shadow cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GitCompare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="font-medium text-gray-900 dark:text-white">Cenários</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Operations Grid */}
      {state.operations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.operations.map((operation: any, index: number) => {
            const stats = getOperationStats(operation.id);
            const isActive = currentOperation?.id === operation.id;
            
            return (
              <motion.div
                key={operation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`card hover:shadow-lg transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'ring-2 ring-primary-500 dark:ring-primary-400 bg-primary-50 dark:bg-primary-900/20' 
                    : ''
                }`}
                onClick={() => handleSelectOperation(operation.id)}
                whileHover={{ scale: 1.02 }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isActive 
                        ? 'bg-primary-100 dark:bg-primary-900' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Building2 className={`w-5 h-5 ${
                        isActive 
                          ? 'text-primary-600 dark:text-primary-400' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {operation.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {operation.type === '24h' ? '24 horas' : 
                         `${operation.startTime} - ${operation.endTime}`}
                      </p>
                    </div>
                  </div>
                  
                  {isActive && (
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>

                {/* Description */}
                {operation.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {operation.description}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {stats.forecasts}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Forecasts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {stats.scenarios}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Cenários</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {stats.results}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Resultados</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Criado: {new Date(operation.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Atualizado: {new Date(operation.updatedAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center py-12"
        >
          <Building2 className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma operação encontrada
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Crie sua primeira operação para começar a usar o WFM Calculator.
          </p>
          <Link to="/operations">
            <motion.button
              className="btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Operação
            </motion.button>
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default OperationsList;
