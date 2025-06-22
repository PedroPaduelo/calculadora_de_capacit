import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  TrendingUp, 
  BarChart3, 
  GitCompare,
  ChevronLeft,
  ChevronRight,
  Plus,
  Home
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface SidebarProps {}

const Sidebar: React.FC<SidebarProps> = () => {
  const { state, dispatch, getCurrentOperation } = useApp();
  const { sidebarCollapsed } = state.config;
  const currentOperation = getCurrentOperation();
  const location = useLocation();
  const navigate = useNavigate();

  interface NavigationItem {
    id: string;
    label: string;
    icon: string;
    description?: string;
    disabled?: boolean;
    path: string;
  }

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'Home',
      description: 'Visão geral',
      path: '/'
    },
    {
      id: 'operations-list',
      label: 'Lista Operações',
      icon: 'Building2',
      description: 'Ver todas operações',
      path: '/operations-list'
    },
    {
      id: 'operations',
      label: 'Gerenciar',
      icon: 'Plus',
      description: 'Criar/Editar operações',
      path: '/operations'
    },
    {
      id: 'forecast',
      label: 'Forecast',
      icon: 'TrendingUp',
      description: 'Curva e parâmetros',
      disabled: !currentOperation,
      path: '/forecast'
    },
    {
      id: 'results',
      label: 'Resultados',
      icon: 'BarChart3',
      description: 'Dimensionamento',
      disabled: !currentOperation,
      path: '/results'
    },
    {
      id: 'scenarios',
      label: 'Cenários',
      icon: 'GitCompare',
      description: 'Comparar cenários',
      disabled: !currentOperation,
      path: '/scenarios'
    },
    {
      id: 'advanced-scenarios',
      label: 'Cenários Avançados',
      icon: 'Zap',
      description: 'Análise multivariável',
      path: '/advanced-scenarios'
    }
  ];

  const getIcon = (iconName: string) => {
    const icons = {
      Home: Home,
      Building2,
      Plus,
      TrendingUp,
      BarChart3,
      GitCompare
    };
    const IconComponent = icons[iconName as keyof typeof icons];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
  };

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: sidebarCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="p-1.5 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <Building2 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  WFM Calculator
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Advanced Erlang C
                </p>
              </div>
            </motion.div>
          )}
          
          <button
            onClick={toggleSidebar}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Current Operation Info */}
      {!sidebarCollapsed && currentOperation && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide">
              Operação Atual
            </p>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {currentOperation.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-300">
            {currentOperation.type === '24h' ? '24 horas' : 
             `${currentOperation.startTime} - ${currentOperation.endTime}`}
          </p>
        </motion.div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isDisabled = item.disabled;

            return (
              <motion.button
                key={item.id}
                onClick={() => !isDisabled && navigate(item.path)}
                disabled={isDisabled}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200
                  ${isActive 
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' 
                    : isDisabled
                      ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }
                  ${sidebarCollapsed ? 'justify-center' : ''}
                `}
                whileHover={!isDisabled ? { scale: 1.02 } : {}}
                whileTap={!isDisabled ? { scale: 0.98 } : {}}
              >
                <div className={`flex-shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                  {getIcon(item.icon)}
                </div>
                
                {!sidebarCollapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {item.label}
                    </p>
                    {item.description && (
                      <p className="text-xs opacity-75 truncate">
                        {item.description}
                      </p>
                    )}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Quick Actions */}
      {!sidebarCollapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <motion.button
            onClick={() => navigate('/operations')}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4" />
            Nova Operação
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

export default Sidebar;