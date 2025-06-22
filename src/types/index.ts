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

// Interface para configuração da aplicação
export interface AppConfig {
  currentOperation?: string;
  currentScenario?: string;
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
}

// Interface para estado global da aplicação
export interface AppState {
  operations: Operation[];
  forecasts: Forecast[];
  scenarios: Scenario[];
  config: AppConfig;
}

// Enums para melhor tipagem
export enum PageType {
  OPERATIONS = 'operations',
  FORECAST = 'forecast',
  RESULTS = 'results',
  SCENARIOS = 'scenarios'
}

// Interface para navegação
export interface NavigationItem {
  id: PageType;
  label: string;
  icon: string;
  description?: string;
  disabled?: boolean;
}