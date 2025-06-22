import React, { useState, useEffect } from 'react';
import { db } from '../services/database';
import { toast } from 'react-hot-toast';

const DatabaseTest: React.FC = () => {
  const [testStatus, setTestStatus] = useState<string>('Testando...');
  const [scenarios, setScenarios] = useState<any[]>([]);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    try {
      setTestStatus('Testando conexão com banco...');
      
      // Teste 1: Verificar se o banco está acessível
      await db.open();
      setTestStatus('✅ Banco conectado');

      // Teste 2: Contar cenários avançados
      const count = await db.advancedScenarios.count();
      setTestStatus(prev => prev + `\n✅ Cenários avançados: ${count}`);

      // Teste 3: Listar cenários
      const allScenarios = await db.advancedScenarios.toArray();
      setScenarios(allScenarios);
      setTestStatus(prev => prev + `\n✅ Cenários carregados: ${allScenarios.length}`);

      // Teste 4: Criar um cenário de teste
      const testScenario = {
        id: `test_${Date.now()}`,
        name: 'Teste de Cenário',
        description: 'Cenário de teste',
        baseScenarioId: '',
        version: 1,
        parameters: {
          sla: 80,
          tma: 300,
          shrinkage: {
            regularBreaks: 0.08,
            training: 0.02,
            meetings: 0.03,
            absenteeism: 0.02,
            other: 0.00,
            customFactors: []
          },
          customFactors: [],
          channels: []
        },
        variations: [],
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
        tags: ['teste'],
        isTemplate: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.advancedScenarios.put(testScenario);
      setTestStatus(prev => prev + `\n✅ Cenário de teste criado: ${testScenario.id}`);

      // Recarregar lista
      const updatedScenarios = await db.advancedScenarios.toArray();
      setScenarios(updatedScenarios);
      setTestStatus(prev => prev + `\n✅ Lista atualizada: ${updatedScenarios.length} cenários`);

    } catch (error) {
      console.error('Erro no teste:', error);
      setTestStatus(prev => prev + `\n❌ Erro: ${error}`);
    }
  };

  const deleteTestScenarios = async () => {
    try {
      await db.advancedScenarios.where('id').startsWith('test_').delete();
      const updatedScenarios = await db.advancedScenarios.toArray();
      setScenarios(updatedScenarios);
      toast.success('Cenários de teste removidos');
    } catch (error) {
      console.error('Erro ao remover cenários de teste:', error);
      toast.error('Erro ao remover cenários de teste');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Teste do Banco de Dados</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Status dos Testes:</h2>
        <pre className="whitespace-pre-wrap text-sm">{testStatus}</pre>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={runTests}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Executar Testes
        </button>
        <button
          onClick={deleteTestScenarios}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Limpar Testes
        </button>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Cenários no Banco ({scenarios.length}):</h2>
        <div className="space-y-2">
          {scenarios.map((scenario) => (
            <div key={scenario.id} className="p-3 bg-white border rounded">
              <div className="font-medium">{scenario.name}</div>
              <div className="text-sm text-gray-600">ID: {scenario.id}</div>
              <div className="text-sm text-gray-600">
                Criado: {new Date(scenario.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DatabaseTest;
