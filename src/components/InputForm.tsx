import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Clock, Target, Phone, AlertCircle } from 'lucide-react';
import { CallCenterParams, validateParams } from '../utils/erlangC';

interface InputFormProps {
  onCalculate: (params: CallCenterParams) => void;
  isLoading?: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onCalculate, isLoading = false }) => {
  const [formData, setFormData] = useState<CallCenterParams>({
    callsPerHour: 100,
    averageHandleTime: 300, // 5 minutos em segundos
    serviceLevel: 80,
    targetAnswerTime: 20,
    abandonmentRate: 5
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [timeUnit, setTimeUnit] = useState<'seconds' | 'minutes'>('minutes');

  const handleInputChange = (field: keyof CallCenterParams, value: string) => {
    const numValue = parseFloat(value) || 0;
    
    let finalValue = numValue;
    if (field === 'averageHandleTime' && timeUnit === 'minutes') {
      finalValue = numValue * 60; // Converter minutos para segundos
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: finalValue
    }));
    
    // Limpar erros quando o usuário começar a digitar
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleTimeUnitChange = (unit: 'seconds' | 'minutes') => {
    setTimeUnit(unit);
    // Converter o valor atual baseado na nova unidade
    if (unit === 'minutes') {
      setFormData(prev => ({
        ...prev,
        averageHandleTime: prev.averageHandleTime / 60
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        averageHandleTime: prev.averageHandleTime * 60
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Garantir que o tempo está em segundos para o cálculo
    const calculationParams = {
      ...formData,
      averageHandleTime: timeUnit === 'minutes' ? formData.averageHandleTime * 60 : formData.averageHandleTime
    };
    
    const validationErrors = validateParams(calculationParams);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors([]);
    onCalculate(calculationParams);
  };

  const displayAHT = timeUnit === 'minutes' ? formData.averageHandleTime / 60 : formData.averageHandleTime;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
          <Calculator className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Parâmetros de Dimensionamento
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Insira os dados do seu call center
          </p>
        </div>
      </div>

      {errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
        >
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
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Volume de Chamadas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Volume de Chamadas (por hora)
            </label>
            <input
              type="number"
              value={formData.callsPerHour}
              onChange={(e) => handleInputChange('callsPerHour', e.target.value)}
              className="input-field"
              placeholder="Ex: 100"
              min="1"
              step="1"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Número total de chamadas recebidas por hora
            </p>
          </div>

          {/* Tempo Médio de Atendimento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Tempo Médio de Atendimento
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={displayAHT}
                onChange={(e) => handleInputChange('averageHandleTime', e.target.value)}
                className="input-field flex-1"
                placeholder="Ex: 5"
                min="0.1"
                step="0.1"
              />
              <select
                value={timeUnit}
                onChange={(e) => handleTimeUnitChange(e.target.value as 'seconds' | 'minutes')}
                className="input-field w-24"
              >
                <option value="minutes">min</option>
                <option value="seconds">seg</option>
              </select>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Tempo médio para atender uma chamada
            </p>
          </div>

          {/* Nível de Serviço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Target className="w-4 h-4 inline mr-2" />
              Nível de Serviço Alvo (%)
            </label>
            <input
              type="number"
              value={formData.serviceLevel}
              onChange={(e) => handleInputChange('serviceLevel', e.target.value)}
              className="input-field"
              placeholder="Ex: 80"
              min="1"
              max="100"
              step="1"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Porcentagem de chamadas atendidas no tempo alvo
            </p>
          </div>

          {/* Tempo de Resposta Alvo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Tempo de Resposta Alvo (segundos)
            </label>
            <input
              type="number"
              value={formData.targetAnswerTime}
              onChange={(e) => handleInputChange('targetAnswerTime', e.target.value)}
              className="input-field"
              placeholder="Ex: 20"
              min="0"
              step="1"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Tempo máximo de espera desejado
            </p>
          </div>
        </div>

        {/* Taxa de Abandono (Opcional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Taxa de Abandono (%) - Opcional
          </label>
          <input
            type="number"
            value={formData.abandonmentRate || ''}
            onChange={(e) => handleInputChange('abandonmentRate', e.target.value)}
            className="input-field max-w-xs"
            placeholder="Ex: 5"
            min="0"
            max="100"
            step="0.1"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Porcentagem esperada de chamadas abandonadas
          </p>
        </div>

        {/* Botão de Calcular */}
        <motion.button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full md:w-auto"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Calculando...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Calcular Dimensionamento
            </div>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default InputForm;