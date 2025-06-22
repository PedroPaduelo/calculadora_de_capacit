import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { PlusIcon, DocumentDuplicateIcon, PlayIcon } from '@heroicons/react/24/outline';
import { AdvancedScenario, ParameterVariation, Channel } from '../../../types';
import { Button } from '../../ui';
import ParameterAdjuster from './ParameterAdjuster';
import ChannelManager from './ChannelManager';

interface ScenarioBuilderProps {
  initialScenario?: AdvancedScenario;
  onSave: (scenario: AdvancedScenario) => void;
  onCancel: () => void;
  onRun?: (scenario: AdvancedScenario) => void;
  className?: string;
}

// Schema de validação
const scenarioValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Nome é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  description: Yup.string()
    .max(200, 'Descrição deve ter no máximo 200 caracteres'),
  parameters: Yup.object().shape({
    sla: Yup.number()
      .required('SLA é obrigatório')
      .min(0, 'SLA deve ser maior que 0')
      .max(100, 'SLA deve ser menor ou igual a 100'),
    tma: Yup.number()
      .required('TMA é obrigatório')
      .min(1, 'TMA deve ser maior que 0')
      .max(3600, 'TMA deve ser menor que 1 hora'),
  })
});

const ScenarioBuilder: React.FC<ScenarioBuilderProps> = ({
  initialScenario,
  onSave,
  onCancel,
  onRun,
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'parameters' | 'channels' | 'variations'>('basic');
  const [customFactors, setCustomFactors] = useState<ParameterVariation[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Valores iniciais do formulário
  const initialValues: Partial<AdvancedScenario> = {
    name: initialScenario?.name || '',
    description: initialScenario?.description || '',
    parameters: {
      sla: initialScenario?.parameters.sla || 80,
      tma: initialScenario?.parameters.tma || 300,
      shrinkage: initialScenario?.parameters.shrinkage || {
        regularBreaks: 10,
        training: 5,
        meetings: 3,
        absenteeism: 8,
        other: 2,
        customFactors: []
      },
      customFactors: initialScenario?.parameters.customFactors || [],
      channels: initialScenario?.parameters.channels || []
    },
    tags: initialScenario?.tags || [],
    isTemplate: initialScenario?.isTemplate || false
  };

  useEffect(() => {
    if (initialScenario) {
      setCustomFactors(initialScenario.parameters.customFactors || []);
      setChannels(initialScenario.parameters.channels || []);
    }
  }, [initialScenario]);

  const handleSubmit = async (values: any) => {
    try {
      console.log('ScenarioBuilder: handleSubmit called with values:', values);
      
      const scenario: AdvancedScenario = {
        id: initialScenario?.id || `scenario_${Date.now()}`,
        name: values.name,
        description: values.description,
        baseScenarioId: initialScenario?.baseScenarioId || '',
        version: (initialScenario?.version || 0) + 1,
        parameters: {
          ...values.parameters,
          customFactors,
          channels
        },
        variations: initialScenario?.variations || [],
        results: initialScenario?.results || {
          intervals: [],
          summary: {
            totalFTE: 0,
            averageServiceLevel: 0,
            peakAgents: 0,
            peakTime: '12:00',
            efficiency: 0
          }
        },
        tags: values.tags || [],
        isTemplate: values.isTemplate || false,
        createdAt: initialScenario?.createdAt || new Date(),
        updatedAt: new Date()
      };

      console.log('ScenarioBuilder: calling onSave with scenario:', scenario);
      onSave(scenario);
    } catch (error) {
      console.error('ScenarioBuilder: Erro ao salvar cenário:', error);
    }
  };

  const handleRun = async (values: any) => {
    if (onRun) {
      setIsRunning(true);
      try {
        const scenario: AdvancedScenario = {
          id: initialScenario?.id || `scenario_${Date.now()}`,
          name: values.name,
          description: values.description,
          baseScenarioId: initialScenario?.baseScenarioId || '',
          version: (initialScenario?.version || 0) + 1,
          parameters: {
            ...values.parameters,
            customFactors,
            channels
          },
          variations: initialScenario?.variations || [],
          results: {
            intervals: [],
            summary: {
              totalFTE: 0,
              averageServiceLevel: 0,
              peakAgents: 0,
              peakTime: '12:00',
              efficiency: 0
            }
          },
          tags: values.tags || [],
          isTemplate: values.isTemplate || false,
          createdAt: initialScenario?.createdAt || new Date(),
          updatedAt: new Date()
        };

        await onRun(scenario);
      } finally {
        setIsRunning(false);
      }
    }
  };

  // Future feature: Custom factors management
  // const addCustomFactor = () => {
  //   const newFactor: ParameterVariation = {
  //     parameter: `custom_${Date.now()}`,
  //     baseValue: 0,
  //     variations: [-20, -10, 0, 10, 20],
  //     unit: 'percentage',
  //     label: 'Novo Fator'
  //   };
  //   setCustomFactors([...customFactors, newFactor]);
  // };

  // const removeCustomFactor = (index: number) => {
  //   setCustomFactors(customFactors.filter((_, i) => i !== index));
  // };

  // const updateCustomFactor = (index: number, factor: ParameterVariation) => {
  //   const updated = [...customFactors];
  //   updated[index] = factor;
  //   setCustomFactors(updated);
  // };

  const tabs = [
    { id: 'basic', name: 'Básico', icon: DocumentDuplicateIcon },
    { id: 'parameters', name: 'Parâmetros', icon: PlusIcon },
    { id: 'channels', name: 'Canais', icon: DocumentDuplicateIcon },
    { id: 'variations', name: 'Variações', icon: PlayIcon }
  ];

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="border-b border-gray-200">
        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {initialScenario ? 'Editar Cenário' : 'Novo Cenário Avançado'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure parâmetros avançados e execute simulações
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={scenarioValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue, isValid }) => (
          <Form className="p-6">
            {/* Tab: Básico */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Cenário *
                    </label>
                    <Field
                      name="name"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Cenário Alto Volume"
                    />
                    <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <Field
                      name="tags"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="separadas,por,vírgula"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <Field
                    name="description"
                    as="textarea"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descreva o cenário..."
                  />
                  <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SLA (%) *
                    </label>
                    <Field
                      name="parameters.sla"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage name="parameters.sla" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TMA (segundos) *
                    </label>
                    <Field
                      name="parameters.tma"
                      type="number"
                      min="1"
                      max="3600"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage name="parameters.tma" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </div>

                <div className="flex items-center">
                  <Field
                    name="isTemplate"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Salvar como template
                  </label>
                </div>
              </div>
            )}

            {/* Tab: Parâmetros */}
            {activeTab === 'parameters' && (
              <ParameterAdjuster
                shrinkageConfig={values.parameters?.shrinkage}
                customFactors={customFactors}
                onShrinkageChange={(shrinkage: any) => setFieldValue('parameters.shrinkage', shrinkage)}
                onCustomFactorsChange={setCustomFactors}
              />
            )}

            {/* Tab: Canais */}
            {activeTab === 'channels' && (
              <ChannelManager
                channels={channels}
                onChannelsChange={setChannels}
              />
            )}

            {/* Tab: Variações */}
            {activeTab === 'variations' && (
              <div className="space-y-6">
                <div className="text-center py-8 text-gray-500">
                  <PlayIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Configuração de variações será implementada em breve</p>
                  <p className="text-sm">Por enquanto, use a análise de sensibilidade automática</p>
                </div>
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
              >
                Cancelar
              </Button>

              <div className="flex space-x-3">
                {onRun && (
                  <Button
                    type="button"
                    onClick={() => handleRun(values)}
                    disabled={!isValid || isRunning}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isRunning ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Calculando...
                      </>
                    ) : (
                      <>
                        <PlayIcon className="w-4 h-4 mr-2" />
                        Executar
                      </>
                    )}
                  </Button>
                )}

                <Button
                  type="submit"
                  disabled={!isValid}
                >
                  <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ScenarioBuilder;
