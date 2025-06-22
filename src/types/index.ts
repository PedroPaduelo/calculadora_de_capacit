// === ESTADO GLOBAL DA APLICAÇÃO ===

// Interface para estado da aplicação
export interface AppState {
  operations: Operation[];
  forecasts: Forecast[];
  scenarios: Scenario[];
  config: {
    theme: 'light' | 'dark';
    sidebarCollapsed: boolean;
    currentOperation?: string;
    currentScenario?: string;
  };
}

// Tipos de páginas da aplicação
export type PageType = 'operations' | 'forecast' | 'results' | 'scenarios' | 'dashboard' | 'operations-list' | 'advanced-scenarios';

// === TIPOS BÁSICOS ===

// Tipos de operação
export type OperationType = '24h' | 'specific-hours';

// Intervalo de forecast
export type ForecastInterval = 15 | 30 | 60;

// Interface para configuração de operação
export interface Operation {
  id: string;
  name: string;
  type: OperationType;
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface para ponto de forecast
export interface ForecastPoint {
  time: string; // HH:mm format
  calls: number;
  aht?: number; // TMA específico para este intervalo (opcional)
}

// Interface para forecast completo
export interface Forecast {
  id: string;
  name: string;
  operationId: string;
  interval: ForecastInterval; // minutos
  points: ForecastPoint[];
  totalCalls: number;
  averageAht: number;
  serviceParameters: ServiceParameters;
  shrinkageConfig: ShrinkageConfig;
  results?: IntervalResult[];
  totalFTE?: number;
  averageServiceLevel?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Interface para parâmetros de atendimento
export interface ServiceParameters {
  defaultAht: number; // Tempo médio em segundos
  serviceLevel: number; // Porcentagem (ex: 80)
  targetAnswerTime: number; // em segundos
  abandonmentRate?: number; // Porcentagem opcional
}

// Interface para configuração de shrinkage
export interface ShrinkageConfig {
  regularBreaks: number; // Porcentagem
  training: number; // Porcentagem
  meetings: number; // Porcentagem
  absenteeism: number; // Porcentagem
  other: number; // Outros fatores
  customFactors: Array<{
    name: string;
    percentage: number;
  }>;
}

// Interface para resultado por intervalo
export interface IntervalResult {
  time: string;
  calls: number;
  requiredAgents: number;
  requiredAgentsWithShrinkage: number;
  serviceLevel: number;
  averageWaitTime: number;
  probabilityOfWaiting: number;
  occupancyRate: number;
  traffic: number; // Erlangs
}

// Interface para cenário completo
export interface Scenario {
  id: string;
  name: string;
  operationId: string;
  forecastId: string;
  serviceParameters: ServiceParameters;
  shrinkageConfig: ShrinkageConfig;
  results?: IntervalResult[];
  totalFTE: number;
  averageServiceLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

// Interface para comparação de cenários
export interface ScenarioComparison {
  scenarios: Scenario[];
  comparisonMetrics: {
    totalFTEDifference: number;
    serviceLevelDifference: number;
    costImpact?: number;
  };
}

// === TIPOS AVANÇADOS ===

// Canal de atendimento (omnichannel)
export type ChannelType = 'voice' | 'chat' | 'email' | 'whatsapp' | 'social' | 'video';

// Interface para canal de atendimento
export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  sla: number; // Porcentagem
  targetAnswerTime: number; // em segundos
  averageHandlingTime: number; // em segundos
  concurrentCapacity: number; // Para chat/digital (quantos atendimentos simultâneos)
  skillsRequired: string[]; // Skills necessárias
  priorityWeight: number; // Peso de prioridade 1-10
  isActive: boolean;
  color?: string; // Cor para visualização
}

// Interface para cenário avançado multivariável
export interface AdvancedScenario {
  id: string;
  name: string;
  description?: string;
  baseScenarioId: string;
  version: number;
  parameters: {
    sla: number;
    tma: number;
    shrinkage: ShrinkageConfig;
    customFactors: ParameterVariation[];
    channels?: Channel[];
  };
  variations: ScenarioVariation[];
  results: AdvancedResults;
  tags: string[];
  isTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

// Interface para variação de parâmetros
export interface ParameterVariation {
  parameter: string;
  baseValue: number;
  variations: number[]; // Ex: [-20, -10, 0, 10, 20]
  unit: 'percentage' | 'absolute' | 'seconds';
  label: string;
}

// Interface para variação de cenário
export interface ScenarioVariation {
  id: string;
  name: string;
  parameterChanges: Record<string, number>;
  results: IntervalResult[];
  totalFTE: number;
  averageServiceLevel: number;
  impact: VariationImpact;
}

// Interface para impacto da variação
export interface VariationImpact {
  fteChange: number;
  fteChangePercentage: number;
  slChange: number;
  slChangePercentage: number;
  costImpact?: number;
  riskLevel: 'low' | 'medium' | 'high';
}

// Interface para resultados avançados
export interface AdvancedResults {
  intervals: IntervalResult[];
  summary: {
    totalFTE: number;
    averageServiceLevel: number;
    peakAgents: number;
    peakTime: string;
    totalCost?: number;
    efficiency: number;
  };
  channelBreakdown?: ChannelResults[];
  sensitivityAnalysis?: SensitivityResults;
  riskAnalysis?: RiskAnalysis;
}

// Interface para resultados por canal
export interface ChannelResults {
  channelId: string;
  channelName: string;
  totalCalls: number;
  requiredAgents: number;
  serviceLevel: number;
  averageWaitTime: number;
  costPerCall?: number;
  efficiency: number;
}

// Interface para análise de sensibilidade
export interface SensitivityResults {
  parameters: SensitivityParameter[];
  tornadoData: TornadoDataPoint[];
  heatmapData: HeatmapDataPoint[];
  summary: {
    mostSensitiveParameter: string;
    sensitivityRange: number;
    robustness: 'low' | 'medium' | 'high';
  };
}

// Interface para parâmetro de sensibilidade
export interface SensitivityParameter {
  name: string;
  label: string;
  baseValue: number;
  variations: number[];
  impacts: number[];
  sensitivity: number; // Índice de sensibilidade 0-100
}

// Interface para dados do gráfico tornado
export interface TornadoDataPoint {
  parameter: string;
  negativeImpact: number;
  positiveImpact: number;
  range: number;
  color: string;
}

// Interface para dados do heatmap
export interface HeatmapDataPoint {
  xParameter: string;
  yParameter: string;
  xValue: number;
  yValue: number;
  impact: number;
  color: string;
}

// Interface para análise de risco
export interface RiskAnalysis {
  scenarios: RiskScenario[];
  riskMatrix: RiskMatrixPoint[];
  mitigation: RiskMitigation[];
  overall: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    recommendation: string;
  };
}

// Interface para cenário de risco
export interface RiskScenario {
  id: string;
  name: string;
  probability: number; // 0-100
  impact: number; // 0-100
  description: string;
  category: 'operational' | 'demand' | 'resource' | 'external';
}

// Interface para ponto da matriz de risco
export interface RiskMatrixPoint {
  scenario: string;
  probability: number;
  impact: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  color: string;
}

// Interface para mitigação de risco
export interface RiskMitigation {
  riskId: string;
  action: string;
  timeline: string;
  responsible?: string;
  status: 'planned' | 'in-progress' | 'completed';
  effectiveness: number; // 0-100
}

// Interface para matrix de habilidades de agentes
export interface AgentSkillMatrix {
  agents: AgentSkill[];
  skills: Skill[];
  coverage: SkillCoverage[];
}

// Interface para habilidade de agente
export interface AgentSkill {
  agentId: string;
  agentName: string;
  skills: {
    skillId: string;
    proficiency: number; // 1-10
    certified: boolean;
  }[];
  shiftPattern: string;
  cost: number;
}

// Interface para habilidade
export interface Skill {
  id: string;
  name: string;
  category: string;
  required: boolean;
  weight: number; // Peso da habilidade
}

// Interface para cobertura de habilidades
export interface SkillCoverage {
  skillId: string;
  requiredAgents: number;
  availableAgents: number;
  coverage: number; // Porcentagem
  gap: number; // Déficit/superávit
}

// Interface para versionamento
export interface VersionHistory {
  id: string;
  entityId: string;
  entityType: 'scenario' | 'forecast' | 'operation';
  version: number;
  changes: VersionChange[];
  createdAt: Date;
  createdBy?: string;
  description?: string;
  tags: string[];
}

// Interface para mudança de versão
export interface VersionChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'added' | 'modified' | 'removed';
}

// Interface para exportação
export interface ExportConfig {
  format: 'excel' | 'pdf' | 'powerpoint' | 'csv';
  sections: ExportSection[];
  template?: string;
  branding?: {
    logo?: string;
    companyName?: string;
    colors?: string[];
  };
}

// Interface para seção de exportação
export interface ExportSection {
  type: 'summary' | 'charts' | 'tables' | 'scenarios' | 'analysis';
  title: string;
  include: boolean;
  options?: Record<string, any>;
}

// Interface para configuração de simulação
export interface SimulationConfig {
  monteCarlo: {
    iterations: number;
    confidenceLevel: number; // 90, 95, 99
    variableDistributions: VariableDistribution[];
  };
  sensitivity: {
    variationRange: number; // Porcentagem
    steps: number;
    parameters: string[];
  };
  scenarios: {
    pessimistic: number; // Multiplicador
    realistic: number;
    optimistic: number;
  };
}

// Interface para distribuição de variável
export interface VariableDistribution {
  variable: string;
  distribution: 'normal' | 'uniform' | 'triangular' | 'beta';
  parameters: Record<string, number>;
}

// === TIPOS DE EVENTOS E NOTIFICAÇÕES ===

// Interface para notificação
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: NotificationAction[];
}

// Interface para ação de notificação
export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

// === TIPOS DE FORMULÁRIO ===

// Interface para validação de formulário
export interface FormValidation {
  field: string;
  rules: ValidationRule[];
  message?: string;
}

// Interface para regra de validação
export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  validator?: (value: any) => boolean | string;
}

// === TIPOS DE FILTRO E BUSCA ===

// Interface para filtro
export interface Filter {
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between';
  value: any;
  label: string;
}

// Interface para ordenação
export interface Sort {
  field: string;
  direction: 'asc' | 'desc';
  label: string;
}

// Interface para paginação
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// === TIPOS DE CONFIGURAÇÃO ===

// Interface para configuração do usuário
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'pt' | 'en' | 'es';
  timezone: string;
  currency: string;
  dateFormat: string;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  dashboard: {
    defaultView: string;
    widgets: string[];
  };
}

// Interface para configuração da aplicação
export interface AppConfig {
  version: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    advancedModule: boolean;
    exportModule: boolean;
    multiUser: boolean;
    realTimeUpdates: boolean;
  };
  limits: {
    maxScenarios: number;
    maxForecasts: number;
    maxOperations: number;
    maxVersionHistory: number;
  };
  integrations: {
    enabled: string[];
    config: Record<string, any>;
  };
}