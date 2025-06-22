# 📊 WFM Calculator Pro - Documentação Completa

**Sistema Avançado de Gestão de Força de Trabalho e Cálculos Erlang C para Call Centers**

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Arquitetura e Tecnologias](#-arquitetura-e-tecnologias)
3. [Estrutura do Projeto](#-estrutura-do-projeto)
4. [Funcionalidades Implementadas](#-funcionalidades-implementadas)
5. [Módulos Avançados](#-módulos-avançados)
6. [Instalação e Configuração](#-instalação-e-configuração)
7. [Guia de Uso](#-guia-de-uso)
8. [API e Tipos](#-api-e-tipos)
9. [Extensibilidade](#-extensibilidade)
10. [Troubleshooting](#-troubleshooting)

---

## 🌟 Visão Geral

O **WFM Calculator Pro** é uma plataforma completa de gestão de força de trabalho desenvolvida para call centers que precisam de cálculos precisos de dimensionamento usando algoritmos Erlang C avançados.

### 🎯 Objetivos

- **Precisão**: Cálculos matemáticos rigorosos baseados em Erlang C
- **Usabilidade**: Interface intuitiva para profissionais de WFM
- **Flexibilidade**: Suporte a cenários simples e complexos
- **Performance**: Otimizado para cálculos em tempo real
- **Escalabilidade**: Arquitetura preparada para crescimento

### 🏆 Diferenciais

- ✅ **Dashboard Analítico**: Visão consolidada com métricas em tempo real
- ✅ **Análise de Sensibilidade**: Gráficos Tornado e mapas de calor
- ✅ **Omnichannel**: Suporte a múltiplos canais de atendimento
- ✅ **Offline-First**: Funciona sem conexão à internet
- ✅ **Exportação Avançada**: PDF, CSV e PowerPoint
- ✅ **Simulação Monte Carlo**: Análise estatística de cenários

---

## 🏗️ Arquitetura e Tecnologias

### 🛠️ Stack Tecnológico

#### **Frontend Core**
- **React 19**: Framework principal com hooks modernos
- **TypeScript**: Tipagem estática para robustez
- **React Router DOM v7**: Roteamento com nested layouts
- **Tailwind CSS**: Estilização utilitária responsiva

#### **Estado e Dados**
- **Context API + useReducer**: Gerenciamento de estado global
- **Dexie.js**: Wrapper moderno para IndexedDB
- **Formik + Yup**: Formulários com validação robusta

#### **Visualização e UX**
- **Recharts**: Gráficos interativos e responsivos
- **Framer Motion**: Animações fluidas e performáticas
- **Lucide React**: Iconografia consistente
- **React Hot Toast**: Sistema de notificações

#### **Utilitários Especializados**
- **Papa Parse**: Processamento de arquivos CSV
- **html2canvas + jsPDF**: Exportação para PDF
- **PptxGenJS**: Geração de apresentações PowerPoint

### 🏛️ Padrões Arquiteturais

#### **Component-Driven Architecture**
```
Atomic Design Pattern:
├── Atoms: Button, Input, Card
├── Molecules: InputForm, MetricCard
├── Organisms: Sidebar, Analytics
└── Templates: DashboardLayout
```

#### **Service Layer Pattern**
```
Business Logic Separation:
├── database.ts: Persistência e cache
├── calculations.ts: Lógica de cálculo
├── exportUtils.ts: Processamento de arquivos
└── formatters.ts: Formatação de dados
```

#### **Context + Reducer Pattern**
```
State Management:
├── AppContext: Estado global da aplicação
├── ThemeContext: Gerenciamento de temas
└── Database Integration: Persistência automática
```

---

## 📁 Estrutura do Projeto

### 🗂️ Organização de Pastas

```
calculadora-call-center/
├── 📁 public/                     # Arquivos estáticos
│   ├── index.html                 # Template HTML
│   └── manifest.json              # PWA manifest
├── 📁 src/
│   ├── 📁 components/             # Componentes React
│   │   ├── 📁 Advanced/           # Módulos avançados
│   │   │   ├── 📁 ScenarioBuilder/      # Construtor de cenários
│   │   │   │   ├── ScenarioBuilder.tsx
│   │   │   │   ├── ChannelManager.tsx
│   │   │   │   └── ParameterAdjuster.tsx
│   │   │   └── 📁 SensitivityAnalysis/  # Análise de sensibilidade
│   │   │       └── SensitivityAnalysis.tsx
│   │   ├── 📁 Analytics/          # Componentes de análise
│   │   │   └── Analytics.tsx
│   │   ├── 📁 Charts/             # Gráficos especializados
│   │   │   ├── GaugeChart.tsx     # Gráfico medidor
│   │   │   ├── HeatmapChart.tsx   # Mapa de calor
│   │   │   └── TornadoChart.tsx   # Gráfico tornado
│   │   ├── 📁 Layout/             # Layout da aplicação
│   │   │   └── DashboardLayout.tsx
│   │   └── 📁 ui/                 # Componentes UI base
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── ConfirmDialog.tsx
│   │       └── LoadingSpinner.tsx
│   ├── 📁 contexts/               # Contextos React
│   │   ├── AppContext.tsx         # Estado global
│   │   └── ThemeContext.tsx       # Gerenciamento de tema
│   ├── 📁 pages/                  # Páginas da aplicação
│   │   ├── Dashboard.tsx          # Dashboard principal
│   │   ├── OperationsList.tsx     # Lista de operações
│   │   ├── OperationsPage.tsx     # CRUD de operações
│   │   ├── ForecastPage.tsx       # Configuração de forecast
│   │   ├── ResultsPage.tsx        # Visualização de resultados
│   │   ├── ScenariosPage.tsx      # Gerenciamento de cenários
│   │   └── AdvancedScenariosPage.tsx # Cenários avançados
│   ├── 📁 services/               # Serviços e lógica de negócio
│   │   ├── database.ts            # Gerenciamento IndexedDB
│   │   └── calculations.ts        # Cálculos avançados
│   ├── 📁 types/                  # Definições TypeScript
│   │   └── index.ts               # Tipos centralizados
│   ├── 📁 utils/                  # Utilitários
│   │   ├── erlangC.ts             # Cálculos Erlang C
│   │   ├── advancedErlangC.ts     # Extensões avançadas
│   │   ├── formatters.ts          # Formatação
│   │   ├── exportUtils.ts         # Exportação
│   │   ├── intervalUtils.ts       # Manipulação de intervalos
│   │   └── indexedDB.ts           # Utilitários IndexedDB
│   ├── App.tsx                    # Componente principal
│   ├── index.tsx                  # Entry point
│   └── index.css                  # Estilos globais
├── 📄 CLAUDE.md                   # Guia para desenvolvimento
├── 📄 README.md                   # Documentação principal
├── 📄 package.json                # Dependências
├── 📄 tailwind.config.js          # Configuração Tailwind
└── 📄 tsconfig.json               # Configuração TypeScript
```

### 📊 Arquivos de Documentação

- **📄 README.md**: Documentação principal e guia de início
- **📄 CLAUDE.md**: Guia técnico para desenvolvimento com Claude
- **📄 DASHBOARD_IMPLEMENTATION.md**: Implementação do dashboard
- **📄 ADVANCED_MODULE_PLAN.md**: Planejamento dos módulos avançados
- **📄 ADVANCED_MODULE_IMPLEMENTATION.md**: Implementação completa
- **📄 IMPLEMENTATION_COMPLETE.md**: Status final da implementação
- **📄 PROBLEMAS_RESOLVIDOS.md**: Histórico de correções

---

## 🚀 Funcionalidades Implementadas

### 🏠 Dashboard Interativo

#### **Métricas em Tempo Real**
- **Total de Operações**: Contador dinâmico com histórico
- **Resultados Gerados**: Análises concluídas com sucesso
- **FTE Médio**: Cálculo automático de Full Time Equivalent
- **SLA Médio**: Nível de serviço consolidado

#### **Análises Visuais**
- **Gráfico de Tendência**: Atividade dos últimos 7 dias
- **Análise por Operação**: Comparação de forecasts e cenários
- **Distribuição de Tipos**: Operações 24h vs. horário específico
- **Status Overview**: Estados e alertas do sistema

#### **Ações Rápidas**
- Navegação direta para funcionalidades principais
- Criação rápida de operações e cenários
- Acesso a resultados recentes
- Shortcuts contextuais baseados na operação ativa

### 🏢 Gestão de Operações

#### **CRUD Completo**
```typescript
interface Operation {
  id: string;
  name: string;
  type: '24h' | 'specific';
  startTime?: string;
  endTime?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### **Funcionalidades**
- ✅ **Criação**: Interface guiada com validação
- ✅ **Edição**: Atualização com preservação de relacionamentos
- ✅ **Duplicação**: Clone completo com forecasts e cenários
- ✅ **Exclusão**: Soft delete com confirmação
- ✅ **Seleção Ativa**: Sistema de operação ativa global

#### **Tipos de Operação**
- **24 Horas**: Operação contínua sem limitação de horário
- **Horário Específico**: Operação com janela de atendimento definida

### 📈 Forecasting Avançado

#### **Configuração de Intervalos**
- **15 minutos**: Precisão máxima para análises detalhadas
- **30 minutos**: Balanceamento entre precisão e performance
- **60 minutos**: Visão macro para planejamento estratégico

#### **Parâmetros de Serviço**
```typescript
interface ServiceParameters {
  sla: number;                    // Service Level Agreement (%)
  targetAnswerTime: number;       // Tempo alvo de resposta (seg)
  averageHandlingTime: number;    // Tempo médio de atendimento (seg)
  abandonmentRate: number;        // Taxa de abandono (%)
  occupancyRate: number;          // Taxa de ocupação alvo (%)
}
```

#### **Configuração de Shrinkage**
```typescript
interface ShrinkageConfig {
  absenteeism: number;           // Absenteísmo (%)
  training: number;              // Treinamento (%)
  meetings: number;              // Reuniões (%)
  breaks: number;                // Pausas (%)
  systemTime: number;            // Tempo de sistema (%)
  other: number;                 // Outros (%)
  total: number;                 // Total calculado (%)
}
```

### 🎯 Cálculos de Dimensionamento

#### **Algoritmo Erlang C Otimizado**
```typescript
function calculateErlangC(
  volume: number,
  aht: number,
  sla: number,
  targetTime: number
): ErlangCResult {
  // Implementação otimizada do algoritmo Erlang C
  // com cálculos de precisão para workforce management
}
```

#### **Métricas Calculadas**
- **Agentes Necessários**: Dimensionamento otimizado
- **Nível de Serviço**: Percentual de atendimento no tempo alvo
- **Tempo Médio de Espera**: Cálculo estatístico de fila
- **Taxa de Ocupação**: Utilização dos recursos humanos
- **Produtividade**: Eficiência operacional

#### **Resultados por Intervalo**
```typescript
interface IntervalResult {
  interval: string;              // "HH:MM-HH:MM"
  volume: number;                // Volume de chamadas
  agentsNeeded: number;          // Agentes calculados
  serviceLevel: number;          // SLA calculado (%)
  averageWaitTime: number;       // Tempo médio de espera
  occupancy: number;             // Taxa de ocupação (%)
  productivity: number;          // Produtividade (%)
}
```

### 🔄 Gestão de Cenários

#### **Tipos de Cenário**
- **Cenário Base**: Configuração padrão da operação
- **Cenário de Teste**: Variações para análise
- **Cenário Otimizado**: Ajustes baseados em análises

#### **Funcionalidades de Comparação**
- **Visualização Side-by-Side**: Comparação visual direta
- **Métricas Consolidadas**: Resumo comparativo
- **Análise de Impacto**: Diferenças percentuais
- **Recomendações**: Sugestões baseadas em resultados

#### **Exportação de Resultados**
- **PDF Detalhado**: Relatório completo com gráficos
- **CSV de Dados**: Dados tabulares para análise externa
- **Sumário Executivo**: Apresentação de alto nível

---

## 🔬 Módulos Avançados

### 🧮 Análise de Sensibilidade

#### **Gráfico Tornado**
```typescript
interface TornadoDataPoint {
  parameter: string;              // Nome do parâmetro
  baseValue: number;              // Valor base
  negativeImpact: number;         // Impacto da variação negativa
  positiveImpact: number;         // Impacto da variação positiva
  sensitivity: number;            // Índice de sensibilidade
}
```

**Funcionalidades:**
- Análise automática de +/-10%, +/-20%
- Ranking de parâmetros por impacto
- Visualização interativa com tooltips
- Recomendações de ajuste baseadas em sensibilidade

#### **Mapa de Calor (Heatmap)**
```typescript
interface HeatmapDataPoint {
  xParameter: string;             // Parâmetro do eixo X
  yParameter: string;             // Parâmetro do eixo Y
  xValue: number;                 // Valor X
  yValue: number;                 // Valor Y
  resultValue: number;            // Valor resultante
  intensity: number;              // Intensidade da cor (0-1)
}
```

**Aplicações:**
- Análise de correlação entre parâmetros
- Identificação de pontos ótimos
- Visualização de riscos operacionais
- Mapeamento de cenários complexos

### 🌐 Suporte Omnichannel

#### **Configuração de Canais**
```typescript
interface Channel {
  id: string;
  name: string;
  type: 'voice' | 'chat' | 'email' | 'whatsapp' | 'social';
  sla: number;                    // SLA específico do canal
  targetAnswerTime: number;       // Tempo alvo específico
  averageHandlingTime: number;    // TMA específico do canal
  concurrentCapacity: number;     // Capacidade concorrente (chat/digital)
  isActive: boolean;
  priority: number;               // Prioridade de atendimento
}
```

#### **Cálculos Especializados**
- **Canal Voz**: Erlang C tradicional
- **Canal Chat**: Cálculo com capacidade concorrente
- **Canal Email**: Modelo de backlog e batch processing
- **Canais Sociais**: Híbrido entre chat e email

#### **Resultados Consolidados**
```typescript
interface OmnichannelResults {
  totalAgentsNeeded: number;      // Total geral
  channelResults: ChannelResult[]; // Resultados por canal
  sharedResources: number;        // Recursos compartilhados
  specializedResources: number;   // Recursos especializados
  efficiency: number;             // Eficiência omnichannel
}
```

### 🎲 Simulação Monte Carlo

#### **Configuração da Simulação**
```typescript
interface SimulationConfig {
  iterations: number;             // Número de iterações
  confidenceLevel: number;        // Nível de confiança (%)
  variables: VariableConfig[];    // Variáveis da simulação
  seed?: number;                  // Seed para reprodutibilidade
}

interface VariableConfig {
  parameter: string;              // Nome do parâmetro
  distribution: 'normal' | 'uniform' | 'triangular';
  mean: number;                   // Média
  stdDev?: number;               // Desvio padrão (normal)
  min?: number;                  // Valor mínimo
  max?: number;                  // Valor máximo
}
```

#### **Resultados Estatísticos**
```typescript
interface MonteCarloResults {
  iterations: number;
  statistics: {
    mean: number;                 // Média dos resultados
    median: number;               // Mediana
    stdDev: number;              // Desvio padrão
    min: number;                 // Valor mínimo
    max: number;                 // Valor máximo
    percentiles: {               // Percentis
      p5: number;
      p25: number;
      p75: number;
      p95: number;
    };
  };
  riskAnalysis: RiskAnalysis;
  recommendations: string[];
}
```

### 📊 Análise de Risco

#### **Matriz de Risco**
```typescript
interface RiskAnalysis {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  mitigationStrategies: MitigationStrategy[];
  alerts: RiskAlert[];
}

interface RiskFactor {
  factor: string;                 // Nome do fator de risco
  probability: number;            // Probabilidade (0-1)
  impact: number;                 // Impacto (0-1)
  riskScore: number;             // Score calculado
  category: 'operational' | 'financial' | 'strategic';
}
```

#### **Alertas Inteligentes**
- **Subdimensionamento**: Risco de não atender SLA
- **Superdimensionamento**: Risco de desperdício de recursos
- **Variabilidade Excessiva**: Parâmetros instáveis
- **Outliers**: Valores atípicos que requerem atenção

---

## 🛠️ Instalação e Configuração

### 📋 Pré-requisitos

#### **Sistema**
- **Node.js**: Versão 16.0 ou superior
- **npm**: Versão 7.0 ou superior
- **Navegador Moderno**: Chrome 90+, Firefox 88+, Safari 14+

#### **Conhecimentos Recomendados**
- **React**: Conceitos básicos de componentes e hooks
- **TypeScript**: Tipagem básica
- **Workforce Management**: Conceitos de Erlang C (opcional)

### 🚀 Instalação

#### **1. Clone do Repositório**
```bash
git clone <repository-url>
cd calculadora-call-center
```

#### **2. Instalação de Dependências**
```bash
npm install
```

#### **3. Verificação de Dependências**
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "typescript": "^5.0.0",
    "react-router-dom": "^7.6.0",
    "tailwindcss": "^3.0.0",
    "recharts": "^2.8.0",
    "framer-motion": "^10.0.0",
    "dexie": "^3.2.0",
    "formik": "^2.4.0",
    "yup": "^1.3.0",
    "react-hot-toast": "^2.4.0",
    "lucide-react": "^0.263.0",
    "papaparse": "^5.4.0",
    "html2canvas": "^1.4.0",
    "jspdf": "^2.5.0",
    "pptxgenjs": "^3.12.0"
  }
}
```

### ⚙️ Configuração

#### **1. Configuração do Ambiente**
```bash
# Criar arquivo .env (opcional)
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development
```

#### **2. Configuração do Tailwind CSS**
```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          // Cores personalizadas
        }
      }
    }
  },
  plugins: []
}
```

#### **3. Configuração do TypeScript**
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

### 🏃‍♂️ Execução

#### **Modo Desenvolvimento**
```bash
npm start
# Aplicação disponível em http://localhost:3000
```

#### **Build para Produção**
```bash
npm run build
# Gera pasta build/ otimizada
```

#### **Testes**
```bash
npm test
# Executa suíte de testes
```

#### **Análise do Bundle**
```bash
npm run build
npx serve -s build
# Análise de tamanho e otimizações
```

---

## 📖 Guia de Uso

### 🎯 Fluxo de Trabalho Típico

#### **1. Criação de Operação**
1. **Navegue** para "Lista Operações" ou "Gerenciar"
2. **Clique** em "Nova Operação"
3. **Preencha** os dados básicos:
   - Nome da operação
   - Tipo (24h ou horário específico)
   - Horários (se específico)
   - Descrição
4. **Salve** e defina como operação ativa

#### **2. Configuração de Forecast**
1. **Acesse** a página "Forecast"
2. **Configure** intervalos (15, 30 ou 60 min)
3. **Insira** volumes por intervalo:
   - Digitação manual
   - Upload de arquivo CSV
   - Template automático
4. **Defina** parâmetros de serviço:
   - SLA alvo
   - Tempo médio de atendimento
   - Taxa de abandono
5. **Configure** shrinkage detalhado
6. **Salve** a configuração

#### **3. Criação de Cenários**
1. **Vá** para "Cenários"
2. **Crie** novo cenário baseado no forecast
3. **Ajuste** parâmetros específicos:
   - SLA diferente
   - TMA alternativo
   - Shrinkage customizado
4. **Execute** cálculos
5. **Compare** com outros cenários

#### **4. Análise de Resultados**
1. **Acesse** "Resultados"
2. **Visualize** métricas por intervalo:
   - Agentes necessários
   - Nível de serviço
   - Tempo de espera
   - Taxa de ocupação
3. **Analise** gráficos interativos
4. **Exporte** resultados (PDF/CSV)

#### **5. Análise Avançada** (Opcional)
1. **Navegue** para "Cenários Avançados"
2. **Crie** cenário multivariável
3. **Configure** múltiplos canais
4. **Execute** análise de sensibilidade
5. **Visualize** gráficos tornado e heatmap
6. **Analise** riscos e recomendações

### 🔧 Funcionalidades Específicas

#### **Import/Export de Dados**

**Import de CSV:**
```csv
Interval,Volume,AHT,Abandonment
00:00-00:15,120,300,0.05
00:15-00:30,115,305,0.04
...
```

**Export de Resultados:**
- **PDF**: Relatório completo com gráficos
- **CSV**: Dados tabulares para análise
- **PowerPoint**: Apresentação executiva

#### **Configuração de Alertas**
1. **Acesse** configurações do dashboard
2. **Defina** thresholds:
   - SLA mínimo aceitável
   - Ocupação máxima
   - Tempo de espera limite
3. **Configure** notificações visuais
4. **Ative** alertas por email (futuro)

#### **Backup e Restore**
```typescript
// Export completo
const backup = await exportAllData();
// JSON com todas as operações, forecasts e cenários

// Import de backup
await importData(backupData);
// Restaura estado completo
```

### 🎨 Personalização

#### **Temas**
- **Modo Claro**: Interface padrão otimizada para uso diurno
- **Modo Escuro**: Interface com contraste reduzido para uso noturno
- **Auto**: Detecção automática da preferência do sistema

#### **Configurações de Usuário**
```typescript
interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  defaultInterval: 15 | 30 | 60;
  autoSave: boolean;
  notifications: boolean;
  language: 'pt-BR' | 'en-US';
  precision: number;              // Casas decimais
}
```

---

## 🔌 API e Tipos

### 📊 Tipos Principais

#### **Operação**
```typescript
interface Operation {
  id: string;                     // UUID único
  name: string;                   // Nome da operação
  type: '24h' | 'specific';       // Tipo de operação
  startTime?: string;             // Horário início (HH:MM)
  endTime?: string;               // Horário fim (HH:MM)
  description?: string;           // Descrição
  isActive: boolean;              // Se é a operação ativa
  createdAt: Date;                // Data de criação
  updatedAt: Date;                // Última atualização
}
```

#### **Forecast**
```typescript
interface Forecast {
  id: string;
  operationId: string;            // Referência à operação
  name: string;
  intervalDuration: 15 | 30 | 60; // Duração dos intervalos
  intervals: ForecastInterval[];   // Dados por intervalo
  serviceParameters: ServiceParameters;
  shrinkage: ShrinkageConfig;
  createdAt: Date;
  updatedAt: Date;
}

interface ForecastInterval {
  startTime: string;              // "HH:MM"
  endTime: string;                // "HH:MM"
  volume: number;                 // Volume de chamadas
  aht?: number;                   // TMA específico (opcional)
  abandonment?: number;           // Taxa abandono específica
}

interface ServiceParameters {
  sla: number;                    // Service Level Agreement (0-100)
  targetAnswerTime: number;       // Tempo alvo em segundos
  averageHandlingTime: number;    // TMA padrão em segundos
  abandonmentRate: number;        // Taxa de abandono (0-1)
  occupancyRate: number;          // Taxa de ocupação alvo (0-1)
}

interface ShrinkageConfig {
  absenteeism: number;            // Absenteísmo (0-1)
  training: number;               // Treinamento (0-1)
  meetings: number;               // Reuniões (0-1)
  breaks: number;                 // Pausas (0-1)
  systemTime: number;             // Tempo de sistema (0-1)
  other: number;                  // Outros (0-1)
  total: number;                  // Total calculado (0-1)
}
```

#### **Cenário**
```typescript
interface Scenario {
  id: string;
  operationId: string;
  forecastId: string;
  name: string;
  description?: string;
  parameters: ScenarioParameters;
  results?: ScenarioResults;
  createdAt: Date;
  updatedAt: Date;
}

interface ScenarioParameters {
  sla?: number;                   // Override do SLA
  targetAnswerTime?: number;      // Override do tempo alvo
  averageHandlingTime?: number;   // Override do TMA
  shrinkage?: Partial<ShrinkageConfig>;
  customFactors?: CustomFactor[]; // Fatores personalizados
}

interface ScenarioResults {
  totalAgents: number;            // Total de agentes
  intervalResults: IntervalResult[];
  summary: {
    averageServiceLevel: number;
    averageWaitTime: number;
    averageOccupancy: number;
    totalCost?: number;
  };
  calculatedAt: Date;
}

interface IntervalResult {
  interval: string;               // "HH:MM-HH:MM"
  volume: number;
  agentsNeeded: number;
  serviceLevel: number;           // Percentual (0-100)
  averageWaitTime: number;        // Segundos
  occupancy: number;              // Percentual (0-100)
  productivity: number;           // Percentual (0-100)
  cost?: number;                  // Custo opcional
}
```

### 🔬 Tipos Avançados

#### **Cenário Avançado**
```typescript
interface AdvancedScenario {
  id: string;
  name: string;
  description?: string;
  baseScenarioId: string;         // Cenário base de referência
  parameters: AdvancedParameters;
  channels: Channel[];            // Configuração omnichannel
  variations: ParameterVariation[]; // Variações para análise
  results?: AdvancedResults;
  version: number;                // Controle de versão
  createdAt: Date;
  updatedAt: Date;
}

interface AdvancedParameters {
  scenario: ScenarioParameters;   // Parâmetros base
  simulation: SimulationConfig;   // Configuração de simulação
  riskTolerances: RiskTolerances; // Tolerâncias de risco
  customLogic?: CustomLogic[];    // Lógicas personalizadas
}

interface Channel {
  id: string;
  name: string;
  type: 'voice' | 'chat' | 'email' | 'whatsapp' | 'social';
  sla: number;
  targetAnswerTime: number;
  averageHandlingTime: number;
  concurrentCapacity: number;     // Para canais digitais
  skillRequirements: string[];    // Habilidades necessárias
  priority: number;               // Prioridade de atendimento
  isActive: boolean;
}

interface ParameterVariation {
  parameter: string;              // Nome do parâmetro
  baseValue: number;              // Valor base
  variationType: 'percentage' | 'absolute' | 'range';
  variations: number[];           // Valores de variação
  weights?: number[];             // Pesos para Monte Carlo
}
```

#### **Resultados de Análise**
```typescript
interface SensitivityResults {
  parameter: string;
  baseValue: number;
  variations: SensitivityVariation[];
  ranking: number;                // Posição no ranking de sensibilidade
  impactScore: number;            // Score de impacto (0-100)
  recommendation: string;         // Recomendação textual
}

interface SensitivityVariation {
  variation: number;              // Variação aplicada
  result: number;                 // Resultado obtido
  impact: number;                 // Impacto percentual
  direction: 'positive' | 'negative';
}

interface RiskAnalysis {
  overallRisk: RiskLevel;
  riskFactors: RiskFactor[];
  mitigationStrategies: MitigationStrategy[];
  alerts: RiskAlert[];
  riskMatrix: RiskMatrixCell[][];
}

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

interface RiskFactor {
  factor: string;
  probability: number;            // 0-1
  impact: number;                 // 0-1
  riskScore: number;             // Calculado
  category: 'operational' | 'financial' | 'strategic';
  mitigation: string;
}
```

### 🛠️ API de Serviços

#### **Database Service**
```typescript
class DatabaseService {
  // Operações CRUD
  async save<T>(table: string, data: T): Promise<string>;
  async getById<T>(table: string, id: string): Promise<T | null>;
  async getAll<T>(table: string): Promise<T[]>;
  async update<T>(table: string, id: string, data: Partial<T>): Promise<void>;
  async delete(table: string, id: string): Promise<void>;
  
  // Operações especializadas
  async getActiveOperation(): Promise<Operation | null>;
  async getForecastsByOperation(operationId: string): Promise<Forecast[]>;
  async getScenariosByForecast(forecastId: string): Promise<Scenario[]>;
  
  // Backup e migração
  async exportData(): Promise<ExportData>;
  async importData(data: ExportData): Promise<void>;
  async migrate(): Promise<void>;
}
```

#### **Calculation Service**
```typescript
class CalculationService {
  // Cálculos básicos
  calculateErlangC(volume: number, aht: number, sla: number, targetTime: number): ErlangCResult;
  calculateShrinkage(config: ShrinkageConfig): number;
  calculateOccupancy(agentsNeeded: number, volume: number, aht: number): number;
  
  // Cálculos avançados
  calculateSensitivityAnalysis(scenario: Scenario, variations: ParameterVariation[]): SensitivityResults[];
  runMonteCarloSimulation(config: SimulationConfig): MonteCarloResults;
  calculateOmnichannelRequirements(channels: Channel[], volumes: ChannelVolume[]): OmnichannelResults;
  
  // Análise de risco
  assessRisk(scenario: Scenario, constraints: RiskConstraints): RiskAnalysis;
  generateRecommendations(results: AdvancedResults): Recommendation[];
}
```

---

## 🔧 Extensibilidade

### 🔌 Arquitetura de Plugins

#### **Sistema de Hooks**
```typescript
// Custom hooks para extensibilidade
export const useAdvancedCalculations = () => {
  const calculations = useContext(CalculationsContext);
  
  const runCustomAnalysis = useCallback(async (
    scenario: Scenario,
    customLogic: CustomLogic[]
  ) => {
    // Implementação extensível
  }, []);
  
  return { runCustomAnalysis, ...calculations };
};

// Hook para novos tipos de gráfico
export const useCustomCharts = () => {
  const registerChart = useCallback((
    chartType: string,
    component: React.ComponentType
  ) => {
    // Registro dinâmico de componentes
  }, []);
  
  return { registerChart };
};
```

#### **Sistema de Providers**
```typescript
// Provider para funcionalidades customizadas
export const CustomFeaturesProvider: React.FC<{
  features: CustomFeature[];
  children: React.ReactNode;
}> = ({ features, children }) => {
  const [registeredFeatures, setRegisteredFeatures] = useState(features);
  
  const registerFeature = useCallback((feature: CustomFeature) => {
    setRegisteredFeatures(prev => [...prev, feature]);
  }, []);
  
  return (
    <CustomFeaturesContext.Provider value={{
      features: registeredFeatures,
      registerFeature
    }}>
      {children}
    </CustomFeaturesContext.Provider>
  );
};
```

### 📊 Adição de Novos Tipos de Gráfico

#### **Interface de Gráfico**
```typescript
interface CustomChartProps {
  data: any[];
  config: ChartConfig;
  theme: 'light' | 'dark';
  responsive?: boolean;
  onDataPoint?: (point: any) => void;
}

interface ChartConfig {
  width?: number;
  height?: number;
  colors?: string[];
  legend?: boolean;
  tooltip?: boolean;
  animation?: boolean;
}

// Exemplo de implementação
export const CustomWaterfallChart: React.FC<CustomChartProps> = ({
  data,
  config,
  theme
}) => {
  // Implementação do gráfico waterfall
  return (
    <ResponsiveContainer width="100%" height={config.height || 400}>
      {/* Implementação com Recharts ou D3 */}
    </ResponsiveContainer>
  );
};
```

#### **Registro de Gráfico**
```typescript
// No componente principal
const App = () => {
  const { registerChart } = useCustomCharts();
  
  useEffect(() => {
    registerChart('waterfall', CustomWaterfallChart);
    registerChart('sunburst', CustomSunburstChart);
    registerChart('sankey', CustomSankeyChart);
  }, [registerChart]);
  
  return <Router>...</Router>;
};
```

### 🧮 Extensão de Cálculos

#### **Interface para Cálculos Customizados**
```typescript
interface CustomCalculation {
  id: string;
  name: string;
  description: string;
  category: 'basic' | 'advanced' | 'experimental';
  parameters: ParameterDefinition[];
  calculate: (inputs: CalculationInputs) => CalculationResult;
  validate?: (inputs: CalculationInputs) => ValidationResult;
}

interface ParameterDefinition {
  name: string;
  type: 'number' | 'percentage' | 'time' | 'enum';
  required: boolean;
  min?: number;
  max?: number;
  options?: string[]; // Para tipo enum
  description: string;
}

// Exemplo de cálculo customizado
const customOccupancyCalculation: CustomCalculation = {
  id: 'custom-occupancy',
  name: 'Occupancy com Fatores Sazonais',
  description: 'Cálculo de ocupação considerando variações sazonais',
  category: 'advanced',
  parameters: [
    {
      name: 'baseOccupancy',
      type: 'percentage',
      required: true,
      min: 0,
      max: 1,
      description: 'Taxa de ocupação base'
    },
    {
      name: 'seasonalFactor',
      type: 'number',
      required: true,
      min: 0.5,
      max: 2.0,
      description: 'Fator sazonal (multiplicador)'
    }
  ],
  calculate: (inputs) => {
    const { baseOccupancy, seasonalFactor } = inputs;
    const adjustedOccupancy = baseOccupancy * seasonalFactor;
    
    return {
      result: Math.min(adjustedOccupancy, 0.95), // Máximo 95%
      metadata: {
        adjustment: seasonalFactor,
        original: baseOccupancy
      }
    };
  }
};
```

### 🔗 Integração com APIs Externas

#### **Sistema de Conectores**
```typescript
interface ExternalConnector {
  id: string;
  name: string;
  type: 'rest' | 'graphql' | 'websocket';
  baseUrl: string;
  authentication: AuthConfig;
  endpoints: ConnectorEndpoint[];
}

interface ConnectorEndpoint {
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  parameters: EndpointParameter[];
  responseMapping: ResponseMapping;
}

// Exemplo de conector para sistema WFM
const wfmSystemConnector: ExternalConnector = {
  id: 'wfm-system',
  name: 'Sistema WFM Corporativo',
  type: 'rest',
  baseUrl: 'https://api.wfm.company.com',
  authentication: {
    type: 'bearer',
    tokenUrl: '/auth/token'
  },
  endpoints: [
    {
      name: 'getForecastData',
      path: '/forecasts/{operationId}',
      method: 'GET',
      parameters: [
        { name: 'operationId', type: 'path', required: true },
        { name: 'startDate', type: 'query', required: true },
        { name: 'endDate', type: 'query', required: true }
      ],
      responseMapping: {
        volume: 'data.intervals[].volume',
        aht: 'data.intervals[].averageHandlingTime'
      }
    }
  ]
};
```

### 📱 PWA e Mobile

#### **Service Worker**
```typescript
// public/sw.js - Service Worker básico
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('wfm-calculator-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/static/js/bundle.js',
        '/static/css/main.css',
        '/manifest.json'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

#### **Manifest PWA**
```json
{
  "name": "WFM Calculator Pro",
  "short_name": "WFM Calc",
  "description": "Advanced Workforce Management Calculator",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🔍 Troubleshooting

### ❗ Problemas Comuns

#### **1. Erro de Inicialização do Banco**
```
Erro: Cannot open database - version mismatch
```

**Solução:**
```typescript
// Limpar dados locais e reinicializar
localStorage.clear();
await db.delete();
window.location.reload();
```

**Prevenção:**
- Implementar migração automática robusta
- Versionamento adequado do schema
- Backup automático antes de migrações

#### **2. Performance Lenta em Cálculos**
```
Sintoma: Interface trava durante cálculos complexos
```

**Solução:**
```typescript
// Usar Web Workers para cálculos pesados
const worker = new Worker('/calculation-worker.js');
worker.postMessage({ scenario, parameters });
worker.onmessage = (event) => {
  const results = event.data;
  updateUI(results);
};
```

**Otimizações:**
- Cache de resultados intermediários
- Debounce em inputs de parâmetros
- Lazy loading de componentes pesados

#### **3. Problemas de Import CSV**
```
Erro: Invalid CSV format or encoding
```

**Soluções:**
```typescript
// Validação robusta de CSV
const validateCSV = (file: File): Promise<ValidationResult> => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      encoding: 'UTF-8',
      complete: (results) => {
        const validation = {
          isValid: true,
          errors: [],
          warnings: []
        };
        
        // Validações específicas
        if (!results.data.length) {
          validation.isValid = false;
          validation.errors.push('Arquivo vazio');
        }
        
        resolve(validation);
      }
    });
  });
};
```

#### **4. Problemas de Sincronização**
```
Erro: Data inconsistency between contexts
```

**Solução:**
```typescript
// Implementar reconciliação de estado
const reconcileState = async () => {
  const dbData = await db.operations.toArray();
  const contextData = state.operations;
  
  const inconsistencies = findInconsistencies(dbData, contextData);
  
  if (inconsistencies.length > 0) {
    await resyncFromDatabase();
    toast.warning('Dados sincronizados automaticamente');
  }
};
```

### 🛠️ Ferramentas de Debug

#### **1. Debug Console**
```typescript
// Ativar no localStorage
localStorage.setItem('DEBUG_MODE', 'true');

// Console de debug personalizado
const debugConsole = {
  log: (module: string, message: string, data?: any) => {
    if (localStorage.getItem('DEBUG_MODE') === 'true') {
      console.log(`[${module}] ${message}`, data);
    }
  },
  
  error: (module: string, error: Error, context?: any) => {
    console.error(`[${module}] Error:`, error, context);
    // Enviar para sistema de logging
  }
};
```

#### **2. Página de Diagnóstico**
```typescript
// Rota /debug para diagnósticos
const DebugPage: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo[]>([]);
  
  const runDiagnostics = async () => {
    const results = await Promise.all([
      checkDatabaseHealth(),
      checkMemoryUsage(),
      checkCalculationPerformance(),
      checkDataIntegrity()
    ]);
    
    setDiagnostics(results);
  };
  
  return (
    <div className="debug-page">
      <h1>Diagnósticos do Sistema</h1>
      <button onClick={runDiagnostics}>Executar Diagnósticos</button>
      <DiagnosticResults results={diagnostics} />
    </div>
  );
};
```

#### **3. Performance Monitor**
```typescript
const PerformanceMonitor = {
  startTimer: (operation: string) => {
    performance.mark(`${operation}-start`);
  },
  
  endTimer: (operation: string) => {
    performance.mark(`${operation}-end`);
    performance.measure(operation, `${operation}-start`, `${operation}-end`);
    
    const measure = performance.getEntriesByName(operation)[0];
    if (measure.duration > 1000) { // > 1 segundo
      console.warn(`Slow operation: ${operation} took ${measure.duration}ms`);
    }
  }
};
```

### 📊 Monitoramento

#### **1. Métricas de Performance**
```typescript
interface PerformanceMetrics {
  calculationTime: number;       // Tempo médio de cálculo
  renderTime: number;            // Tempo de renderização
  memoryUsage: number;           // Uso de memória
  databaseOperations: number;    // Operações de DB por minuto
  errorRate: number;             // Taxa de erro
}

const collectMetrics = (): PerformanceMetrics => {
  return {
    calculationTime: getAverageCalculationTime(),
    renderTime: getAverageRenderTime(),
    memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
    databaseOperations: getDatabaseOperationsCount(),
    errorRate: getErrorRate()
  };
};
```

#### **2. Health Checks**
```typescript
const healthChecks = {
  database: async (): Promise<HealthStatus> => {
    try {
      await db.operations.limit(1).toArray();
      return { status: 'healthy', message: 'Database accessible' };
    } catch (error) {
      return { status: 'unhealthy', message: error.message };
    }
  },
  
  calculations: (): HealthStatus => {
    try {
      const result = calculateErlangC(100, 300, 80, 20);
      return result ? 
        { status: 'healthy', message: 'Calculations working' } :
        { status: 'degraded', message: 'Calculation issues' };
    } catch (error) {
      return { status: 'unhealthy', message: error.message };
    }
  }
};
```

### 🔧 Recuperação de Dados

#### **1. Backup Automático**
```typescript
const AutoBackup = {
  schedule: () => {
    // Backup a cada 24 horas
    setInterval(async () => {
      try {
        const backup = await db.export();
        localStorage.setItem('auto-backup', JSON.stringify({
          data: backup,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        console.error('Auto backup failed:', error);
      }
    }, 24 * 60 * 60 * 1000);
  },
  
  restore: async () => {
    const backupData = localStorage.getItem('auto-backup');
    if (backupData) {
      const { data } = JSON.parse(backupData);
      await db.import(data);
      return true;
    }
    return false;
  }
};
```

#### **2. Recuperação de Crash**
```typescript
const CrashRecovery = {
  detectCrash: () => {
    const wasCleanShutdown = localStorage.getItem('clean-shutdown');
    if (!wasCleanShutdown) {
      // App crasheou na última execução
      return true;
    }
    return false;
  },
  
  recover: async () => {
    if (CrashRecovery.detectCrash()) {
      const recovered = await AutoBackup.restore();
      if (recovered) {
        toast.info('Dados recuperados de backup automático');
      }
    }
    
    // Marcar como iniciado limpo
    localStorage.removeItem('clean-shutdown');
    
    // Marcar shutdown limpo quando necessário
    window.addEventListener('beforeunload', () => {
      localStorage.setItem('clean-shutdown', 'true');
    });
  }
};
```

---

## 🎯 Conclusão

O **WFM Calculator Pro** representa uma solução completa e moderna para gestão de força de trabalho em call centers, combinando a precisão dos cálculos Erlang C com uma interface intuitiva e funcionalidades avançadas de análise.

### 🏆 Principais Conquistas

- ✅ **Arquitetura Sólida**: React 19 + TypeScript com padrões modernos
- ✅ **Funcionalidades Completas**: Do básico ao avançado em uma única plataforma
- ✅ **Performance Otimizada**: Cálculos rápidos com cache inteligente
- ✅ **UX Excepcional**: Interface profissional e responsiva
- ✅ **Extensibilidade**: Preparado para crescimento e customizações

### 🚀 Valor Agregado

A plataforma transforma a rotina de profissionais de WFM, oferecendo:
- **Decisões Data-Driven** baseadas em análises rigorosas
- **Economia de Tempo** com automação de cálculos complexos
- **Maior Precisão** através de algoritmos otimizados
- **Flexibilidade** para cenários simples e complexos
- **Insights Avançados** com análise de sensibilidade e risco

### 📈 Próximos Passos

O projeto está preparado para evoluções futuras:
- Integração com sistemas corporativos
- Módulos de machine learning
- Colaboração multi-usuário
- APIs para integrações externas
- Análises preditivas avançadas

**A documentação será atualizada conforme novas funcionalidades sejam implementadas.**

---

*Esta documentação foi gerada automaticamente baseada na análise completa do código-fonte e arquivos de documentação existentes. Para atualizações ou correções, consulte os arquivos fonte no repositório.*

**Versão da Documentação**: 1.0.0  
**Última Atualização**: Dezembro 2024  
**Compatibilidade**: React 19, TypeScript 5+, Navegadores Modernos