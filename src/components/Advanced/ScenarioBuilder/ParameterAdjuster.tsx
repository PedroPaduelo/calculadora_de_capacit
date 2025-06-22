import React from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ShrinkageConfig, ParameterVariation } from '../../../types';
import { Button } from '../../ui';

interface ParameterAdjusterProps {
  shrinkageConfig?: ShrinkageConfig;
  customFactors: ParameterVariation[];
  onShrinkageChange: (shrinkage: ShrinkageConfig) => void;
  onCustomFactorsChange: (factors: ParameterVariation[]) => void;
}

const ParameterAdjuster: React.FC<ParameterAdjusterProps> = ({
  shrinkageConfig,
  customFactors,
  onShrinkageChange,
  onCustomFactorsChange
}) => {
  const defaultShrinkage: ShrinkageConfig = {
    regularBreaks: 10,
    training: 5,
    meetings: 3,
    absenteeism: 8,
    other: 2,
    customFactors: []
  };

  const shrinkage = shrinkageConfig || defaultShrinkage;

  const updateShrinkage = (field: keyof ShrinkageConfig, value: any) => {
    onShrinkageChange({
      ...shrinkage,
      [field]: value
    });
  };

  const addCustomFactor = () => {
    const newFactor: ParameterVariation = {
      parameter: `custom_${Date.now()}`,
      baseValue: 0,
      variations: [-20, -10, 0, 10, 20],
      unit: 'percentage',
      label: 'Novo Fator'
    };
    onCustomFactorsChange([...customFactors, newFactor]);
  };

  const removeCustomFactor = (index: number) => {
    onCustomFactorsChange(customFactors.filter((_, i) => i !== index));
  };

  const updateCustomFactor = (index: number, field: keyof ParameterVariation, value: any) => {
    const updated = [...customFactors];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    onCustomFactorsChange(updated);
  };

  const totalShrinkage = shrinkage.regularBreaks + shrinkage.training + 
                        shrinkage.meetings + shrinkage.absenteeism + shrinkage.other;

  return (
    <div className="space-y-8">
      {/* Configuração de Shrinkage */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Configuração de Shrinkage
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pausas Regulares (%)
            </label>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="30"
                step="0.5"
                value={shrinkage.regularBreaks}
                onChange={(e) => updateShrinkage('regularBreaks', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span className="font-medium text-blue-600">{shrinkage.regularBreaks}%</span>
                <span>30%</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Treinamento (%)
            </label>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={shrinkage.training}
                onChange={(e) => updateShrinkage('training', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span className="font-medium text-blue-600">{shrinkage.training}%</span>
                <span>20%</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reuniões (%)
            </label>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="15"
                step="0.5"
                value={shrinkage.meetings}
                onChange={(e) => updateShrinkage('meetings', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span className="font-medium text-blue-600">{shrinkage.meetings}%</span>
                <span>15%</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Absenteísmo (%)
            </label>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="25"
                step="0.5"
                value={shrinkage.absenteeism}
                onChange={(e) => updateShrinkage('absenteeism', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span className="font-medium text-blue-600">{shrinkage.absenteeism}%</span>
                <span>25%</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Outros (%)
            </label>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="15"
                step="0.5"
                value={shrinkage.other}
                onChange={(e) => updateShrinkage('other', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span className="font-medium text-blue-600">{shrinkage.other}%</span>
                <span>15%</span>
              </div>
            </div>
          </div>

          {/* Total de Shrinkage */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total de Shrinkage
            </label>
            <div className={`px-4 py-3 rounded-lg text-center font-bold text-lg ${
              totalShrinkage > 40 ? 'bg-red-100 text-red-800' :
              totalShrinkage > 25 ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {totalShrinkage.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">
              {totalShrinkage > 40 ? 'Muito alto' :
               totalShrinkage > 25 ? 'Moderado' : 'Normal'}
            </p>
          </div>
        </div>
      </div>

      {/* Fatores Customizados */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Fatores Personalizados
          </h3>
          <Button
            type="button"
            onClick={addCustomFactor}
            size="sm"
            className="flex items-center space-x-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Adicionar Fator</span>
          </Button>
        </div>

        {customFactors.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
            <PlusIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Nenhum fator personalizado configurado</p>
            <p className="text-sm">Clique em "Adicionar Fator" para começar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {customFactors.map((factor, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Fator
                      </label>
                      <input
                        type="text"
                        value={factor.label}
                        onChange={(e) => updateCustomFactor(index, 'label', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Clima, Feriados, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valor Base
                      </label>
                      <input
                        type="number"
                        value={factor.baseValue}
                        onChange={(e) => updateCustomFactor(index, 'baseValue', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unidade
                      </label>
                      <select
                        value={factor.unit}
                        onChange={(e) => updateCustomFactor(index, 'unit', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="percentage">Porcentagem (%)</option>
                        <option value="absolute">Valor Absoluto</option>
                        <option value="seconds">Segundos</option>
                      </select>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => removeCustomFactor(index)}
                    className="ml-4 text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>

                {/* Variações */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variações para Análise (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={factor.variations.join(', ')}
                    onChange={(e) => {
                      const variations = e.target.value
                        .split(',')
                        .map(v => parseFloat(v.trim()))
                        .filter(v => !isNaN(v));
                      updateCustomFactor(index, 'variations', variations);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: -20, -10, 0, 10, 20"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Valores que serão testados na análise de sensibilidade
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumo */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-2">Resumo da Configuração</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Shrinkage Total:</span>
            <span className="font-semibold ml-2">{totalShrinkage.toFixed(1)}%</span>
          </div>
          <div>
            <span className="text-gray-600">Fatores Customizados:</span>
            <span className="font-semibold ml-2">{customFactors.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Status:</span>
            <span className={`font-semibold ml-2 ${
              totalShrinkage > 40 ? 'text-red-600' :
              totalShrinkage > 25 ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {totalShrinkage > 40 ? 'Requer atenção' :
               totalShrinkage > 25 ? 'Moderado' : 'Adequado'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Eficiência Estimada:</span>
            <span className="font-semibold ml-2">{(100 - totalShrinkage).toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParameterAdjuster;
