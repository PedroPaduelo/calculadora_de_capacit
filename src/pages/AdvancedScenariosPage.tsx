import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AdvancedScenario, SensitivityResults } from '../types';
import { ScenarioBuilder } from '../components/Advanced/ScenarioBuilder';
import { SensitivityAnalysis } from '../components/Advanced/SensitivityAnalysis';
import { GaugeChart } from '../components/Charts';
import { Button, Card } from '../components/ui';
import { db } from '../services/database';

const AdvancedScenariosPage: React.FC = () => {
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState<AdvancedScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<AdvancedScenario | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [showSensitivity, setShowSensitivity] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    console.log('AdvancedScenariosPage: Verificando estado do banco...');
    
    const initializePage = async () => {
      try {
        // Testar se o banco está funcional
        await db.advancedScenarios.count();
        console.log('AdvancedScenariosPage: Banco está funcional');
        setDbReady(true);
        
        console.log('AdvancedScenariosPage: Iniciando carregamento de cenários...');
        await loadScenarios();
      } catch (error) {
        console.error('AdvancedScenariosPage: Erro na inicialização:', error);
        toast.error('Erro ao inicializar página avançada');
        setIsLoading(false);
      }
    };
    
    initializePage();
  }, []);

  const loadScenarios = async () => {
    try {
      console.log('AdvancedScenariosPage: Carregando cenários do banco...');
      setIsLoading(true);
      const loadedScenarios = await db.advancedScenarios.toArray();
      console.log('AdvancedScenariosPage: Cenários carregados:', loadedScenarios.length);
      setScenarios(loadedScenarios);
    } catch (error) {
      console.error('Erro ao carregar cenários:', error);
      toast.error('Erro ao carregar cenários avançados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveScenario = async (scenario: AdvancedScenario) => {
    try {
      console.log('AdvancedScenariosPage: Salvando cenário:', scenario.name);
      
      // Validação básica
      if (!scenario.name || !scenario.id) {
        throw new Error('Cenário inválido: nome e ID são obrigatórios');
      }
      
      await db.advancedScenarios.put(scenario);
      console.log('AdvancedScenariosPage: Cenário salvo com sucesso');
      
      await loadScenarios();
      setIsBuilding(false);
      toast.success(`Cenário "${scenario.name}" salvo com sucesso!`);
    } catch (error) {
      console.error('Erro ao salvar cenário:', error);
      toast.error(`Erro ao salvar cenário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleRunScenario = async (scenario: AdvancedScenario) => {
    try {
      // Simular execução do cenário
      toast.success(`Cenário "${scenario.name}" executado com sucesso!`);
      setSelectedScenario(scenario);
      setShowSensitivity(true);
      setIsBuilding(false);
    } catch (error) {
      console.error('Erro ao executar cenário:', error);
      toast.error('Erro ao executar cenário');
    }
  };

  const handleDeleteScenario = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir este cenário?')) {
      return;
    }

    try {
      await db.advancedScenarios.delete(id);
      await loadScenarios();
      if (selectedScenario?.id === id) {
        setSelectedScenario(null);
      }
      toast.success('Cenário excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir cenário:', error);
      toast.error('Erro ao excluir cenário');
    }
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando cenários avançados...</p>
          {!dbReady && (
            <p className="text-yellow-600 text-sm mt-2">Inicializando banco de dados...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cenários Avançados</h1>
          <p className="text-gray-600 mt-1">
            Simulações multivariáveis com análise de sensibilidade e cenários omnichannel
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={() => navigate('/scenarios')}
          >
            Cenários Básicos
          </Button>
          <Button
            onClick={() => setIsBuilding(true)}
          >
            Novo Cenário Avançado
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      {scenarios.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{scenarios.length}</div>
              <div className="text-sm text-gray-600">Cenários Criados</div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {scenarios.filter(s => s.parameters.channels && s.parameters.channels.length > 0).length}
              </div>
              <div className="text-sm text-gray-600">Omnichannel</div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {scenarios.filter(s => s.isTemplate).length}
              </div>
              <div className="text-sm text-gray-600">Templates</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {scenarios.reduce((sum, s) => sum + (s.variations?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Variações</div>
            </div>
          </Card>
        </div>
      )}

      {/* Construtor de Cenários */}
      {isBuilding && (
        <ScenarioBuilder
          onSave={handleSaveScenario}
          onCancel={() => setIsBuilding(false)}
          onRun={handleRunScenario}
        />
      )}

      {/* Lista de Cenários */}
      {!isBuilding && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Cenários Existentes</h2>
            
            {scenarios.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Nenhum cenário avançado
                </h3>
                <p className="text-gray-600 mb-4">
                  Crie seu primeiro cenário avançado para começar a análise
                </p>
                <Button onClick={() => setIsBuilding(true)}>
                  Criar Primeiro Cenário
                </Button>
              </Card>
            ) : (
              scenarios.map((scenario) => (
                <Card 
                  key={scenario.id} 
                  className={`p-4 cursor-pointer transition-all duration-200 ${
                    selectedScenario?.id === scenario.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedScenario(scenario)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-800">{scenario.name}</h3>
                      {scenario.isTemplate && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          Template
                        </span>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Editar cenário
                          setIsBuilding(true);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteScenario(scenario.id);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>

                  {scenario.description && (
                    <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">SLA:</span>
                      <span className="font-medium ml-2">{scenario.parameters.sla}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">TMA:</span>
                      <span className="font-medium ml-2">{scenario.parameters.tma}s</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Canais:</span>
                      <span className="font-medium ml-2">
                        {scenario.parameters.channels?.length || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Versão:</span>
                      <span className="font-medium ml-2">v{scenario.version}</span>
                    </div>
                  </div>

                  {scenario.tags && scenario.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {scenario.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 text-xs text-gray-500">
                    Atualizado em {formatDate(scenario.updatedAt)}
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Painel de Análise */}
          <div className="space-y-4">
            {selectedScenario ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Análise: {selectedScenario.name}
                  </h2>
                  <Button
                    size="sm"
                    onClick={() => setShowSensitivity(!showSensitivity)}
                  >
                    {showSensitivity ? 'Ocultar' : 'Mostrar'} Análise
                  </Button>
                </div>

                {/* Métricas do Cenário */}
                <Card className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-4">Métricas Principais</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <GaugeChart
                      value={selectedScenario.parameters.sla}
                      title="SLA Target"
                      subtitle="Meta de atendimento"
                      min={0}
                      max={100}
                      unit="%"
                      size={120}
                      thresholds={{ critical: 50, warning: 75, good: 85 }}
                    />
                    
                    <GaugeChart
                      value={100 - (selectedScenario.parameters.shrinkage?.regularBreaks || 0 + 
                                   selectedScenario.parameters.shrinkage?.training || 0 +
                                   selectedScenario.parameters.shrinkage?.meetings || 0 +
                                   selectedScenario.parameters.shrinkage?.absenteeism || 0 +
                                   selectedScenario.parameters.shrinkage?.other || 0)}
                      title="Eficiência"
                      subtitle="Produtividade estimada"
                      min={0}
                      max={100}
                      unit="%"
                      size={120}
                      thresholds={{ critical: 60, warning: 75, good: 85 }}
                    />
                  </div>
                </Card>

                {/* Análise de Sensibilidade */}
                {showSensitivity && (
                  <SensitivityAnalysis
                    scenario={selectedScenario}
                    onResultsChange={(results: SensitivityResults) => {
                      console.log('Resultados da análise:', results);
                    }}
                  />
                )}
              </>
            ) : (
              <Card className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Selecione um Cenário
                </h3>
                <p className="text-gray-600">
                  Clique em um cenário à esquerda para ver a análise detalhada
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedScenariosPage;
