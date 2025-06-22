# Plano de Implementação - Módulo Avançado WFM Calculator Pro

## 📋 Análise do PRD e Estrutura Atual

### 🔍 Análise da Base Existente
O projeto já possui uma excelente base:
- ✅ React 19 + TypeScript
- ✅ React Router DOM com dashboard
- ✅ Tailwind CSS para estilização
- ✅ Context API para estado global
- ✅ IndexedDB para persistência
- ✅ Recharts para gráficos
- ✅ Framer Motion para animações
- ✅ Estrutura de operações, forecasts e cenários

### 🎯 Gaps Identificados para o PRD
Precisamos adicionar:
- [ ] Yup + Formik para validação
- [ ] react-hot-toast para notificações
- [ ] pptxgenjs para exportação PowerPoint
- [ ] Dexie.js para melhor gestão do IndexedDB

## 🏗️ Plano de Implementação - Fase por Fase

### 📦 **FASE PREPARATÓRIA** (1-2 dias)

#### 1. Instalação de Dependências
```bash
npm install yup formik react-hot-toast pptxgenjs dexie
```

#### 2. Estrutura de Pastas Expandida
```
src/
├── components/
│   ├── Advanced/           # 🆕 Componentes avançados
│   │   ├── ScenarioBuilder/
│   │   ├── SensitivityAnalysis/
│   │   ├── ChannelManager/
│   │   └── RiskVisualization/
│   ├── Charts/             # 🆕 Gráficos especializados
│   │   ├── TornadoChart/
│   │   ├── HeatmapChart/
│   │   └── GaugeChart/
│   └── Forms/              # 🆕 Formulários com validação
├── hooks/                  # 🆕 Hooks customizados
├── services/              # 🆕 Serviços de cálculo avançado
│   ├── calculations/
│   └── export/
├── stores/                # 🆕 Stores específicos
└── types/                 # Expandir tipos existentes
```

#### 3. Migração para Dexie.js
- Substituir implementação atual do IndexedDB
- Manter compatibilidade com dados existentes
- Adicionar versionamento de schemas

---

### 🟢 **FASE 1 - MVP AVANÇADO** (5-7 dias)

#### **ADV-001: Simulação de Cenários Multivariáveis**

**Componentes a criar:**
```typescript
// src/pages/AdvancedScenarios.tsx
// src/components/Advanced/ScenarioBuilder/
//   ├── ScenarioEditor.tsx
//   ├── ParameterAdjuster.tsx
//   └── ScenarioComparison.tsx
```

**Funcionalidades:**
- Interface para criar/editar múltiplos cenários
- Sliders para ajustar SLA, TMA, Shrinkage em tempo real
- Grid de comparação lado a lado
- Salvamento automático no IndexedDB

**Dados expandidos:**
```typescript
interface AdvancedScenario {
  id: string;
  name: string;
  baseScenarioId: string;
  parameters: {
    sla: number;
    tma: number;
    shrinkage: ShrinkageConfig;
    customFactors: ParameterVariation[];
  };
  variations: ScenarioVariation[];
  results: AdvancedResults;
  createdAt: Date;
  version: number;
}
```

#### **ADV-002: Análise de Sensibilidade**

**Componentes a criar:**
```typescript
// src/components/Advanced/SensitivityAnalysis/
//   ├── SensitivityRunner.tsx
//   ├── TornadoChart.tsx
//   └── ParameterImpactTable.tsx
```

**Funcionalidades:**
- Executar variações automáticas (+/-10%, +/-20%)
- Gráfico Tornado mostrando impacto de cada variável
- Tabela de sensibilidade com cores de impacto
- Cache de resultados para performance

#### **ADV-003: Cálculo por Canal (Omnichannel)**

**Componentes a criar:**
```typescript
// src/components/Advanced/ChannelManager/
//   ├── ChannelConfigurator.tsx
//   ├── ChannelMetrics.tsx
//   └── ConsolidatedView.tsx
```

**Novos tipos:**
```typescript
interface Channel {
  id: string;
  name: string;
  type: 'voice' | 'chat' | 'email' | 'whatsapp' | 'social';
  sla: number;
  targetAnswerTime: number;
  averageHandlingTime: number;
  concurrentCapacity: number; // Para chat/digital
}

interface OmnichannelScenario {
  channels: Channel[];
  agentSkills: AgentSkillMatrix;
  sharedResources: boolean;
}
```

#### **ADV-004: Controle de Versão de Cenários**

**Componentes a criar:**
```typescript
// src/components/Advanced/VersionControl/
//   ├── VersionHistory.tsx
//   ├── VersionComparison.tsx
//   └── VersionRestore.tsx
```

**Funcionalidades:**
- Snapshot automático a cada alteração significativa
- Interface de histórico com timeline
- Comparação visual entre versões
- Restauração de versões anteriores

---

### 🟡 **FASE 2 - FUNCIONALIDADES MÉDIAS** (4-5 dias)

#### **ADV-005: Simulação de Absenteísmo Aleatório**
- Campo de % de absenteísmo por período
- Simulação Monte Carlo para variações
- Impacto em tempo real no SLA

#### **ADV-006: Visualização de Riscos Operacionais**
- Heatmap de risco por período
- Alertas configuráveis por threshold
- Dashboard de monitoramento de riscos

#### **ADV-007: Simulação de Realocação de Agentes**
- Interface drag-and-drop para mover agentes
- Recalculo instantâneo por fila
- Otimização automática de alocação

#### **ADV-008: Cálculo de Occupancy Rate**
- Gauge charts para visualização
- Alertas quando exceder limites
- Histórico de occupancy

---

### 🟣 **FASE 3 - FUNCIONALIDADES AVANÇADAS** (3-4 dias)

#### **ADV-009: Simulação de Sazonalidade**
- Multiplicadores por período/dia/mês
- Templates de sazonalidade (Black Friday, Natal, etc.)
- Projeções anuais

#### **ADV-010: Exportação PowerPoint**
- Templates de apresentação
- Gráficos como imagens base64
- Relatórios executivos automáticos

#### **ADV-011: Análise de Backlog**
- Simulação de crescimento de fila
- Métricas de SLA para atendimento diferido
- Projeções de tempo de resolução

#### **ADV-012: Ajuste de Tempo de Wrap-up**
- Toggle para incluir/excluir wrap-up
- Cálculos separados de produtividade
- Impacto no dimensionamento

---

## 🛠️ Detalhamento Técnico por Componente

### 1. **Migração para Dexie.js**

```typescript
// src/services/database/schema.ts
import Dexie, { Table } from 'dexie';

interface AdvancedDB extends Dexie {
  operations: Table<Operation>;
  forecasts: Table<Forecast>;
  scenarios: Table<Scenario>;
  advancedScenarios: Table<AdvancedScenario>;
  scenarioVersions: Table<ScenarioVersion>;
  channels: Table<Channel>;
  calculations: Table<CalculationCache>;
}

const db = new AdvancedDB('WFMCalculatorAdvanced');

db.version(1).stores({
  operations: '++id, name, type, createdAt',
  forecasts: '++id, operationId, name, createdAt',
  scenarios: '++id, operationId, forecastId, name, createdAt',
  advancedScenarios: '++id, baseScenarioId, name, version, createdAt',
  scenarioVersions: '++id, scenarioId, version, snapshot, createdAt',
  channels: '++id, type, name, operationId',
  calculations: '++id, scenarioId, parameters, results, createdAt'
});
```

### 2. **Componente de Análise de Sensibilidade**

```typescript
// src/components/Advanced/SensitivityAnalysis/SensitivityRunner.tsx
interface SensitivityParams {
  baseScenario: Scenario;
  variations: {
    parameter: string;
    min: number;
    max: number;
    steps: number;
  }[];
}

const SensitivityRunner: React.FC<SensitivityParams> = ({ baseScenario, variations }) => {
  const [results, setResults] = useState<SensitivityResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runSensitivityAnalysis = useCallback(async () => {
    setIsRunning(true);
    const sensitivityResults = [];
    
    for (const variation of variations) {
      const paramResults = await calculateParameterSensitivity(
        baseScenario,
        variation
      );
      sensitivityResults.push(paramResults);
    }
    
    setResults(sensitivityResults);
    setIsRunning(false);
  }, [baseScenario, variations]);

  return (
    <div className="space-y-6">
      {/* Interface de configuração */}
      <ParameterConfiguration 
        onParametersChange={setVariations}
      />
      
      {/* Botão de execução */}
      <Button 
        onClick={runSensitivityAnalysis}
        loading={isRunning}
        className="btn-primary"
      >
        Executar Análise de Sensibilidade
      </Button>
      
      {/* Resultados */}
      {results.length > 0 && (
        <>
          <TornadoChart data={results} />
          <SensitivityTable data={results} />
        </>
      )}
    </div>
  );
};
```

### 3. **Gráfico Tornado**

```typescript
// src/components/Charts/TornadoChart.tsx
const TornadoChart: React.FC<{ data: SensitivityResult[] }> = ({ data }) => {
  const chartData = data.map(item => ({
    parameter: item.parameter,
    negativeImpact: -item.negativeImpact,
    positiveImpact: item.positiveImpact,
    baseline: 0
  }));

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Análise de Sensibilidade</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          layout="horizontal"
          margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="parameter" type="category" width={100} />
          <Tooltip />
          <ReferenceLine x={0} stroke="#666" />
          <Bar dataKey="negativeImpact" fill="#ef4444" />
          <Bar dataKey="positiveImpact" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
```

### 4. **Gerenciador de Canais**

```typescript
// src/components/Advanced/ChannelManager/ChannelConfigurator.tsx
const ChannelConfigurator: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [sharedAgents, setSharedAgents] = useState(false);

  const addChannel = () => {
    const newChannel: Channel = {
      id: generateId(),
      name: `Canal ${channels.length + 1}`,
      type: 'voice',
      sla: 80,
      targetAnswerTime: 20,
      averageHandlingTime: 300,
      concurrentCapacity: 1
    };
    setChannels([...channels, newChannel]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Configuração de Canais</h3>
        <Button onClick={addChannel} className="btn-primary">
          Adicionar Canal
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map(channel => (
          <ChannelCard 
            key={channel.id}
            channel={channel}
            onUpdate={(updated) => updateChannel(channel.id, updated)}
            onDelete={() => deleteChannel(channel.id)}
          />
        ))}
      </div>
      
      <div className="card">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={sharedAgents}
            onChange={(e) => setSharedAgents(e.target.checked)}
          />
          <span>Agentes compartilhados entre canais</span>
        </label>
      </div>
    </div>
  );
};
```

---

## 🎯 Cronograma Detalhado

### **Semana 1: Preparação e Fundações**
- **Dias 1-2**: Setup de dependências e migração Dexie.js
- **Dias 3-5**: Estrutura de componentes avançados e tipos

### **Semana 2: MVP Avançado (Parte 1)**
- **Dias 6-8**: ADV-001 - Simulação de Cenários Multivariáveis
- **Dias 9-10**: ADV-002 - Análise de Sensibilidade

### **Semana 3: MVP Avançado (Parte 2)**
- **Dias 11-13**: ADV-003 - Cálculo por Canal
- **Dias 14-15**: ADV-004 - Controle de Versão

### **Semana 4: Funcionalidades Médias**
- **Dias 16-17**: ADV-005 e ADV-006
- **Dias 18-19**: ADV-007 e ADV-008
- **Dia 20**: Testes e refinamentos

### **Semana 5: Funcionalidades Avançadas**
- **Dias 21-22**: ADV-009 e ADV-010
- **Dias 23-24**: ADV-011 e ADV-012
- **Dia 25**: Polimento final e documentação

---

## 🚀 Próximos Passos Imediatos

1. **Instalação de dependências** - Execute o comando npm install
2. **Criação da estrutura de pastas** avançada
3. **Migração para Dexie.js** mantendo compatibilidade
4. **Implementação do primeiro componente** (ScenarioBuilder)

## 🎯 Resultado Esperado

Ao final da implementação, teremos uma **plataforma WFM de nível enterprise** com:

- ✅ Análises de sensibilidade avançadas
- ✅ Gestão omnichannel completa
- ✅ Simulações de cenários complexos
- ✅ Visualizações de risco operacional
- ✅ Exportação para PowerPoint
- ✅ Controle de versão robusto

**Tempo total estimado: 20-25 dias de desenvolvimento**
