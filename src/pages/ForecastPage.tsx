import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Upload, 
  Plus, 
  Download, 
  Edit3, 
  Trash2,
  Clock,
  BarChart3,
  AlertCircle,
  FileText,
  Eye,
  Target,
  Users,
  Coffee,
  GraduationCap,
  MessageSquare,
  UserMinus,
  Settings
} from 'lucide-react';
import Papa from 'papaparse';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area 
} from 'recharts';
import { Forecast, ForecastPoint, ForecastInterval, Operation, ServiceParameters, ShrinkageConfig } from '../types';
import { useApp } from '../contexts/AppContext';
import { validateForecast, generateSampleForecast, calculateIntervalStaffing, calculateTotalFTE, calculateAverageServiceLevel, calculateTotalShrinkage } from '../utils/advancedErlangC';
import { generateTimeIntervals, createEmptyForecastPoints, fillMissingIntervals, calculateTotalOperationHours } from '../utils/intervalUtils';

const ForecastPage: React.FC = () => {
  const { state, dispatch, getCurrentOperation } = useApp();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingForecast, setEditingForecast] = useState<Forecast | null>(null);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentOperation = getCurrentOperation();
  const operationForecasts = currentOperation 
    ? state.forecasts.filter(f => f.operationId === currentOperation.id)
    : [];

  const handleCreateForecast = () => {
    if (!currentOperation) return;
    setEditingForecast(null);
    setShowCreateForm(true);
  };

  const handleEditForecast = (forecast: Forecast) => {
    setEditingForecast(forecast);
    setShowCreateForm(true);
  };

  const handleDeleteForecast = (forecastId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este forecast? Todos os cenários relacionados serão perdidos.')) {
      dispatch({ type: 'DELETE_FORECAST', payload: forecastId });
    }
  };

  const handleDuplicateForecast = (forecast: Forecast) => {
    const newForecast: Forecast = {
      ...forecast,
      id: `forecast_${Date.now()}`,
      name: `${forecast.name} (Cópia)`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    dispatch({ type: 'ADD_FORECAST', payload: newForecast });
  };

  const exportForecastCSV = (forecast: Forecast) => {
    const csvData = forecast.points.map(point => ({
      'Horário': point.time,
      'Chamadas': point.calls,
      'TMA (segundos)': point.aht || forecast.averageAht
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `forecast-${forecast.name}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!currentOperation) {
    return (
      <div className="card text-center py-12">
        <TrendingUp className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Selecione uma operação
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Vá para a página de Operações e selecione uma operação para gerenciar forecasts.
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
            Forecast - {currentOperation.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure curvas de chamadas por intervalo de tempo
          </p>
        </div>

        <motion.button
          onClick={handleCreateForecast}
          className="btn-primary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Forecast
        </motion.button>
      </div>

      {/* Forecasts List */}
      {operationForecasts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center py-12"
        >
          <BarChart3 className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum forecast configurado
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Crie seu primeiro forecast importando um arquivo CSV ou inserindo dados manualmente.
          </p>
          <div className="flex gap-3 justify-center">
            <motion.button
              onClick={handleCreateForecast}
              className="btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Forecast
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {operationForecasts.map((forecast, index) => (
            <ForecastCard
              key={forecast.id}
              forecast={forecast}
              onEdit={() => handleEditForecast(forecast)}
              onDelete={() => handleDeleteForecast(forecast.id)}
              onDuplicate={() => handleDuplicateForecast(forecast)}
              onExport={() => exportForecastCSV(forecast)}
              onPreview={() => setShowPreview(forecast.id)}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <ForecastFormModal
          operation={currentOperation}
          forecast={editingForecast}
          onClose={() => setShowCreateForm(false)}
          onSave={(forecast) => {
            if (editingForecast) {
              dispatch({ type: 'UPDATE_FORECAST', payload: forecast });
            } else {
              dispatch({ type: 'ADD_FORECAST', payload: forecast });
            }
            setShowCreateForm(false);
          }}
        />
      )}

      {/* Preview Modal */}
      {showPreview && (
        <ForecastPreviewModal
          forecast={operationForecasts.find(f => f.id === showPreview)!}
          onClose={() => setShowPreview(null)}
        />
      )}
    </div>
  );
};

// Forecast Card Component
interface ForecastCardProps {
  forecast: Forecast;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  onPreview: () => void;
  index: number;
}

const ForecastCard: React.FC<ForecastCardProps> = ({
  forecast,
  onEdit,
  onDelete,
  onDuplicate,
  onExport,
  onPreview,
  index
}) => {
  const peakCalls = Math.max(...forecast.points.map(p => p.calls));
  const avgCalls = Math.round(forecast.totalCalls / forecast.points.length);

  // Preparar dados para mini gráfico
  const chartData = forecast.points.slice(0, 24).map(point => ({
    time: point.time,
    calls: point.calls
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card hover:shadow-lg transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {forecast.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {forecast.points.length} intervalos de {forecast.interval}min
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <motion.button
            onClick={onPreview}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Visualizar"
          >
            <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </motion.button>
          
          <motion.button
            onClick={onEdit}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Editar"
          >
            <Edit3 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </motion.button>
          
          <motion.button
            onClick={onDelete}
            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Excluir"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </motion.button>
        </div>
      </div>

      {/* Mini Chart */}
      <div className="h-32 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`colorCalls_${forecast.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="calls"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#colorCalls_${forecast.id})`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgb(255 255 255)',
                border: '1px solid rgb(229 231 235)',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: number) => [value, 'Chamadas']}
              labelFormatter={(label: string) => `${label}`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Chamadas</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {forecast.totalCalls.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pico</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {peakCalls}
          </p>
        </div>
        {forecast.totalFTE && (
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">FTE Total</p>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {forecast.totalFTE}
            </p>
          </div>
        )}
        {forecast.averageServiceLevel && (
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">SLA Médio</p>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
              {forecast.averageServiceLevel}%
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <motion.button
          onClick={onDuplicate}
          className="btn-secondary flex-1 text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Duplicar
        </motion.button>
        <motion.button
          onClick={onExport}
          className="btn-secondary flex-1 text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Download className="w-3 h-3 mr-1" />
          CSV
        </motion.button>
      </div>

      {/* Meta Info */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>TMA: {forecast.averageAht}s</span>
          <span>{forecast.createdAt.toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </motion.div>
  );
};

// Forecast Form Modal Component
interface ForecastFormModalProps {
  operation: any;
  forecast: Forecast | null;
  onClose: () => void;
  onSave: (forecast: Forecast) => void;
}

const ForecastFormModal: React.FC<ForecastFormModalProps> = ({
  operation,
  forecast,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: forecast?.name || '',
    interval: forecast?.interval || 60 as ForecastInterval,
    averageAht: forecast?.averageAht || 300
  });
  
  const [serviceParams, setServiceParams] = useState<ServiceParameters>(
    forecast?.serviceParameters || {
      defaultAht: 300,
      serviceLevel: 80,
      targetAnswerTime: 20,
      abandonmentRate: 5
    }
  );

  const [shrinkageConfig, setShrinkageConfig] = useState<ShrinkageConfig>(
    forecast?.shrinkageConfig || {
      regularBreaks: 15,
      training: 5,
      meetings: 3,
      absenteeism: 8,
      other: 2,
      customFactors: []
    }
  );
  
  const [points, setPoints] = useState<ForecastPoint[]>(
    forecast?.points || generateSampleForecast(formData.interval)
  );
  
  const [inputMethod, setInputMethod] = useState<'manual' | 'csv'>('manual');
  const [errors, setErrors] = useState<string[]>([]);
  const [csvError, setCsvError] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'forecast' | 'parameters'>('forecast');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalShrinkage = calculateTotalShrinkage(shrinkageConfig);

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvError('');
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const csvData = results.data as any[];
          const newPoints: ForecastPoint[] = [];
          
          csvData.forEach((row, index) => {
            // Tentar diferentes formatos de coluna
            const time = row['Horário'] || row['Horario'] || row['Time'] || row['time'];
            const calls = parseInt(row['Chamadas'] || row['Calls'] || row['calls'] || row['volume']);
            const aht = parseFloat(row['TMA'] || row['AHT'] || row['aht']);
            
            if (!time || isNaN(calls)) {
              throw new Error(`Linha ${index + 2}: Horário ou número de chamadas inválido`);
            }
            
            // Validar formato de tempo
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(time)) {
              throw new Error(`Linha ${index + 2}: Formato de horário inválido (use HH:mm)`);
            }
            
            newPoints.push({
              time,
              calls: Math.max(0, calls),
              aht: !isNaN(aht) ? aht : undefined
            });
          });
          
          if (newPoints.length === 0) {
            throw new Error('Nenhum dado válido encontrado no arquivo');
          }
          
          setPoints(newPoints);
          setInputMethod('csv');
        } catch (error) {
          setCsvError(error instanceof Error ? error.message : 'Erro ao processar arquivo CSV');
        }
      },
      error: (error) => {
        setCsvError(`Erro ao ler arquivo: ${error.message}`);
      }
    });
  };

  const generateSample = () => {
    let samplePoints: ForecastPoint[];
    
    if (operation.type === '24h') {
      // Para operações 24h, gerar intervalos automáticos
      const intervals = generateTimeIntervals(operation, formData.interval);
      samplePoints = createEmptyForecastPoints(intervals);
      
      // Preencher com dados de exemplo baseados em padrões típicos de call center
      samplePoints = samplePoints.map((point, index) => {
        const hour = parseInt(point.time.split(':')[0]);
        let calls = 0;
        
        // Padrão típico: picos às 10h, 14h e 20h
        if (hour >= 8 && hour <= 10) {
          calls = Math.round(50 + (hour - 8) * 25 + Math.random() * 20);
        } else if (hour >= 11 && hour <= 13) {
          calls = Math.round(80 + Math.random() * 30);
        } else if (hour >= 14 && hour <= 16) {
          calls = Math.round(90 + Math.random() * 40);
        } else if (hour >= 17 && hour <= 21) {
          calls = Math.round(70 + Math.random() * 35);
        } else if (hour >= 22 || hour <= 6) {
          calls = Math.round(10 + Math.random() * 15);
        } else {
          calls = Math.round(40 + Math.random() * 25);
        }
        
        return {
          ...point,
          calls: Math.max(0, calls)
        };
      });
    } else {
      // Para operações com horário específico, usar o método original
      samplePoints = generateSampleForecast(formData.interval);
    }
    
    setPoints(samplePoints);
    setInputMethod('manual');
  };

  const addInterval = () => {
    const lastTime = points.length > 0 ? points[points.length - 1].time : '08:00';
    const [hours, minutes] = lastTime.split(':').map(Number);
    const newMinutes = minutes + formData.interval;
    const newHours = hours + Math.floor(newMinutes / 60);
    const finalMinutes = newMinutes % 60;
    
    if (newHours < 24) {
      const newTime = `${newHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
      setPoints([...points, { time: newTime, calls: 0 }]);
    }
  };

  const updatePoint = (index: number, field: keyof ForecastPoint, value: string | number) => {
    const updatedPoints = [...points];
    if (field === 'calls') {
      updatedPoints[index].calls = Math.max(0, Number(value));
    } else if (field === 'aht') {
      updatedPoints[index].aht = value ? Number(value) : undefined;
    } else {
      updatedPoints[index][field] = value as any;
    }
    setPoints(updatedPoints);
  };

  const removePoint = (index: number) => {
    setPoints(points.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForecast(points);
    
    if (!formData.name.trim()) {
      validationErrors.push('Nome do forecast é obrigatório');
    }
    
    if (formData.averageAht <= 0) {
      validationErrors.push('TMA médio deve ser maior que zero');
    }

    if (serviceParams.serviceLevel <= 0 || serviceParams.serviceLevel > 100) {
      validationErrors.push('Nível de serviço deve estar entre 1 e 100%');
    }

    if (totalShrinkage >= 100) {
      validationErrors.push('Shrinkage total não pode ser 100% ou mais');
    }
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    const totalCalls = points.reduce((sum, point) => sum + point.calls, 0);
    
    // Calcular resultados automaticamente
    const results = calculateIntervalStaffing(points, serviceParams, shrinkageConfig);
    const totalFTE = calculateTotalFTE(results);
    const averageServiceLevel = calculateAverageServiceLevel(results);
    
    const forecastData: Forecast = {
      id: forecast?.id || `forecast_${Date.now()}`,
      name: formData.name.trim(),
      operationId: operation.id,
      interval: formData.interval,
      points: points.sort((a, b) => a.time.localeCompare(b.time)),
      totalCalls,
      averageAht: formData.averageAht,
      serviceParameters: serviceParams,
      shrinkageConfig,
      results,
      totalFTE,
      averageServiceLevel,
      createdAt: forecast?.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    onSave(forecastData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {forecast ? 'Editar Forecast' : 'Novo Forecast'}
          </h2>
          
          {/* Step Navigation */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setCurrentStep('forecast')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentStep === 'forecast'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2 inline" />
              Forecast
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep('parameters')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentStep === 'parameters'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 mr-2 inline" />
              Parâmetros
            </button>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                  Corrija os seguintes erros:
                </h3>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 'forecast' && (
            <div className="space-y-6">
              {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome do Forecast
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input-field"
                placeholder="Ex: Forecast Janeiro 2024"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Intervalo (minutos)
              </label>
              <select
                value={formData.interval}
                onChange={(e) => {
                  const newInterval = Number(e.target.value) as ForecastInterval;
                  setFormData(prev => ({ ...prev, interval: newInterval }));
                  
                  // Se for operação 24h, regenerar pontos automaticamente
                  if (operation.type === '24h') {
                    const intervals = generateTimeIntervals(operation, newInterval);
                    const newPoints = createEmptyForecastPoints(intervals);
                    setPoints(newPoints);
                  }
                }}
                className="input-field"
              >
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={60}>60 minutos</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                TMA Médio (segundos)
              </label>
              <input
                type="number"
                value={formData.averageAht}
                onChange={(e) => setFormData(prev => ({ ...prev, averageAht: Number(e.target.value) }))}
                className="input-field"
                min="1"
                step="1"
              />
            </div>
          </div>

          {/* Preview de Intervalos para Operação 24h */}
          {operation.type === '24h' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Preview de Intervalos
                </h4>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                    Intervalo de Forecast
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                    {formData.interval} minutos
                  </p>
                </div>
                
                {(() => {
                  const intervals = generateTimeIntervals(operation, formData.interval);
                  const totalHours = calculateTotalOperationHours(operation);
                  
                  return (
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="mb-2">
                        <strong>{intervals.length} intervalos</strong> de {formData.interval} minutos cada
                      </p>
                      <p className="mb-3">
                        <strong>Cobertura: {totalHours} horas</strong> (00:00 - 23:59)
                      </p>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 max-h-32 overflow-y-auto">
                        <div className="grid grid-cols-6 gap-2 text-xs">
                          {intervals.slice(0, 12).map((interval, idx) => (
                            <span key={idx} className="text-gray-600 dark:text-gray-400 font-mono">
                              {interval.start}
                            </span>
                          ))}
                          {intervals.length > 12 && (
                            <span className="text-gray-500 dark:text-gray-500 col-span-6 text-center mt-2 italic">
                              ... e mais {intervals.length - 12} intervalos
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Input Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Método de Entrada
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="manual"
                  checked={inputMethod === 'manual'}
                  onChange={(e) => setInputMethod(e.target.value as 'manual' | 'csv')}
                  className="mr-2"
                />
                Entrada Manual
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="csv"
                  checked={inputMethod === 'csv'}
                  onChange={(e) => setInputMethod(e.target.value as 'manual' | 'csv')}
                  className="mr-2"
                />
                Upload CSV
              </label>
            </div>
          </div>

          {/* CSV Upload */}
          {inputMethod === 'csv' && (
            <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
              <div className="text-center">
                <Upload className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary mb-2"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Selecionar Arquivo CSV
                </button>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Formato esperado: Horário, Chamadas, TMA (opcional)
                </p>
                {csvError && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    {csvError}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Manual Entry Actions */}
          {inputMethod === 'manual' && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={generateSample}
                className="btn-secondary"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Gerar Exemplo
              </button>
              <button
                type="button"
                onClick={addInterval}
                className="btn-secondary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Intervalo
              </button>
            </div>
          )}

          {/* Data Points */}
          {points.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Dados do Forecast ({points.length} intervalos)
              </h3>
              <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">Horário</th>
                      <th className="px-4 py-2 text-left">Chamadas</th>
                      <th className="px-4 py-2 text-left">TMA (opcional)</th>
                      <th className="px-4 py-2 text-left">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {points.map((point, index) => (
                      <tr key={index} className="border-t border-gray-200 dark:border-gray-600">
                        <td className="px-4 py-2">
                          <input
                            type="time"
                            value={point.time}
                            onChange={(e) => updatePoint(index, 'time', e.target.value)}
                            className="w-full text-sm border-0 bg-transparent focus:ring-1 focus:ring-primary-500 rounded"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={point.calls}
                            onChange={(e) => updatePoint(index, 'calls', e.target.value)}
                            className="w-full text-sm border-0 bg-transparent focus:ring-1 focus:ring-primary-500 rounded"
                            min="0"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={point.aht || ''}
                            onChange={(e) => updatePoint(index, 'aht', e.target.value)}
                            className="w-full text-sm border-0 bg-transparent focus:ring-1 focus:ring-primary-500 rounded"
                            placeholder={formData.averageAht.toString()}
                            min="1"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => removePoint(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
            </div>
          )}

          {currentStep === 'parameters' && (
            <div className="space-y-6">
              {/* Service Parameters */}
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Parâmetros de Atendimento
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Configurações de SLA e qualidade
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nível de Serviço Alvo (%)
                      </label>
                      <input
                        type="number"
                        value={serviceParams.serviceLevel}
                        onChange={(e) => setServiceParams(prev => ({ ...prev, serviceLevel: Number(e.target.value) }))}
                        className="input-field"
                        min="1"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tempo de Resposta Alvo (segundos)
                      </label>
                      <input
                        type="number"
                        value={serviceParams.targetAnswerTime}
                        onChange={(e) => setServiceParams(prev => ({ ...prev, targetAnswerTime: Number(e.target.value) }))}
                        className="input-field"
                        min="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Taxa de Abandono (% - Opcional)
                    </label>
                    <input
                      type="number"
                      value={serviceParams.abandonmentRate || ''}
                      onChange={(e) => setServiceParams(prev => ({ ...prev, abandonmentRate: Number(e.target.value) }))}
                      className="input-field"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="Ex: 5"
                    />
                  </div>
                </div>
              </div>

              {/* Shrinkage Configuration */}
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Configuração de Shrinkage
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Fatores de improdutividade operacional
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Coffee className="w-4 h-4 inline mr-2" />
                      Pausas Regulamentares (%)
                    </label>
                    <input
                      type="number"
                      value={shrinkageConfig.regularBreaks}
                      onChange={(e) => setShrinkageConfig(prev => ({ ...prev, regularBreaks: Number(e.target.value) }))}
                      className="input-field"
                      min="0"
                      max="50"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <GraduationCap className="w-4 h-4 inline mr-2" />
                      Treinamentos (%)
                    </label>
                    <input
                      type="number"
                      value={shrinkageConfig.training}
                      onChange={(e) => setShrinkageConfig(prev => ({ ...prev, training: Number(e.target.value) }))}
                      className="input-field"
                      min="0"
                      max="30"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      Reuniões (%)
                    </label>
                    <input
                      type="number"
                      value={shrinkageConfig.meetings}
                      onChange={(e) => setShrinkageConfig(prev => ({ ...prev, meetings: Number(e.target.value) }))}
                      className="input-field"
                      min="0"
                      max="20"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <UserMinus className="w-4 h-4 inline mr-2" />
                      Absenteísmo (%)
                    </label>
                    <input
                      type="number"
                      value={shrinkageConfig.absenteeism}
                      onChange={(e) => setShrinkageConfig(prev => ({ ...prev, absenteeism: Number(e.target.value) }))}
                      className="input-field"
                      min="0"
                      max="30"
                      step="0.5"
                    />
                  </div>
                </div>

                {/* Shrinkage Summary */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Shrinkage Total
                      </p>
                      <p className={`text-2xl font-bold ${
                        totalShrinkage > 50 
                          ? 'text-orange-600 dark:text-orange-400' 
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        {totalShrinkage.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Multiplicador
                      </p>
                      <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                        {(1 / (1 - totalShrinkage / 100)).toFixed(2)}x
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={points.length === 0}
            >
              {forecast ? 'Atualizar' : 'Criar'} Forecast
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Forecast Preview Modal Component
interface ForecastPreviewModalProps {
  forecast: Forecast;
  onClose: () => void;
}

const ForecastPreviewModal: React.FC<ForecastPreviewModalProps> = ({
  forecast,
  onClose
}) => {
  const chartData = forecast.points.map(point => ({
    time: point.time,
    calls: point.calls,
    aht: point.aht || forecast.averageAht
  }));

  const stats = {
    total: forecast.totalCalls,
    peak: Math.max(...forecast.points.map(p => p.calls)),
    average: Math.round(forecast.totalCalls / forecast.points.length),
    peakTime: forecast.points.find(p => p.calls === Math.max(...forecast.points.map(p => p.calls)))?.time
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {forecast.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Visualização do Forecast
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total de Chamadas</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.total.toLocaleString()}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500 dark:text-gray-400">Pico</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.peak}
            </p>
            <p className="text-xs text-gray-400">às {stats.peakTime}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500 dark:text-gray-400">Média</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.average}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500 dark:text-gray-400">TMA Médio</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {forecast.averageAht}s
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Curva de Chamadas
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
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
                  label={{ value: 'Chamadas', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'TMA (s)', angle: 90, position: 'insideRight' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(255 255 255)',
                    border: '1px solid rgb(229 231 235)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'calls' ? value : `${value}s`,
                    name === 'calls' ? 'Chamadas' : 'TMA'
                  ]}
                  labelFormatter={(label: string) => `Horário: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="calls"
                  yAxisId="left"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="aht"
                  yAxisId="right"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ForecastPage;