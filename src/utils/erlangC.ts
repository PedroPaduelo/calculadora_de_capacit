export interface CallCenterParams {
  callsPerHour: number;
  averageHandleTime: number; // em segundos
  serviceLevel: number; // porcentagem (ex: 80 para 80%)
  targetAnswerTime: number; // em segundos
  abandonmentRate?: number; // porcentagem opcional
}

export interface CallCenterResults {
  agentsRequired: number;
  traffic: number; // Erlangs
  probabilityOfWaiting: number;
  averageWaitTime: number;
  actualServiceLevel: number;
  utilizationRate: number;
  agentsSuggested: number[];
  serviceLevels: number[];
}

// Função para calcular o fatorial
function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

// Função para calcular Erlang B
function erlangB(traffic: number, agents: number): number {
  let numerator = Math.pow(traffic, agents) / factorial(agents);
  let denominator = 0;
  
  for (let i = 0; i <= agents; i++) {
    denominator += Math.pow(traffic, i) / factorial(i);
  }
  
  return numerator / denominator;
}

// Função principal para calcular Erlang C
function erlangC(traffic: number, agents: number): number {
  if (agents <= traffic) return 1; // Não é possível atender
  
  const erlangBValue = erlangB(traffic, agents);
  const numerator = erlangBValue;
  const denominator = 1 - (traffic / agents) * (1 - erlangBValue);
  
  return numerator / denominator;
}

// Função para calcular o tempo médio de espera
function averageWaitTime(traffic: number, agents: number, aht: number): number {
  const erlangCValue = erlangC(traffic, agents);
  return (erlangCValue * aht) / (agents - traffic);
}

// Função para calcular o nível de serviço
function serviceLevel(traffic: number, agents: number, aht: number, targetTime: number): number {
  const erlangCValue = erlangC(traffic, agents);
  const avgWaitTime = averageWaitTime(traffic, agents, aht);
  
  if (avgWaitTime <= 0) return 100;
  
  const serviceLevelValue = 1 - erlangCValue * Math.exp(-(agents - traffic) * targetTime / aht);
  return Math.max(0, Math.min(100, serviceLevelValue * 100));
}

// Função principal para calcular dimensionamento
export function calculateCallCenterStaffing(params: CallCenterParams): CallCenterResults {
  const { 
    callsPerHour, 
    averageHandleTime, 
    serviceLevel: targetServiceLevel, 
    targetAnswerTime,
    abandonmentRate = 0 
  } = params;

  // Converter para Erlangs (intensidade de tráfego)
  const traffic = (callsPerHour * averageHandleTime) / 3600;
  
  // Encontrar o número mínimo de agentes necessários
  let agentsRequired = Math.ceil(traffic);
  let currentServiceLevel = 0;
  
  // Buscar até encontrar o nível de serviço desejado
  while (currentServiceLevel < targetServiceLevel && agentsRequired < traffic + 50) {
    currentServiceLevel = serviceLevel(traffic, agentsRequired, averageHandleTime, targetAnswerTime);
    if (currentServiceLevel < targetServiceLevel) {
      agentsRequired++;
    }
  }

  // Calcular métricas finais
  const finalProbWaiting = erlangC(traffic, agentsRequired);
  const finalAvgWaitTime = averageWaitTime(traffic, agentsRequired, averageHandleTime);
  const finalServiceLevel = serviceLevel(traffic, agentsRequired, averageHandleTime, targetAnswerTime);
  const utilizationRate = (traffic / agentsRequired) * 100;

  // Gerar dados para o gráfico de sensibilidade
  const agentsSuggested: number[] = [];
  const serviceLevels: number[] = [];
  
  const startAgents = Math.max(1, agentsRequired - 5);
  const endAgents = agentsRequired + 10;
  
  for (let i = startAgents; i <= endAgents; i++) {
    if (i > traffic) {
      agentsSuggested.push(i);
      serviceLevels.push(serviceLevel(traffic, i, averageHandleTime, targetAnswerTime));
    }
  }

  return {
    agentsRequired,
    traffic: Math.round(traffic * 100) / 100,
    probabilityOfWaiting: Math.round(finalProbWaiting * 10000) / 100,
    averageWaitTime: Math.round(finalAvgWaitTime * 100) / 100,
    actualServiceLevel: Math.round(finalServiceLevel * 100) / 100,
    utilizationRate: Math.round(utilizationRate * 100) / 100,
    agentsSuggested,
    serviceLevels: serviceLevels.map(sl => Math.round(sl * 100) / 100)
  };
}

// Função para validar parâmetros de entrada
export function validateParams(params: CallCenterParams): string[] {
  const errors: string[] = [];
  
  if (params.callsPerHour <= 0) {
    errors.push('Volume de chamadas deve ser maior que zero');
  }
  
  if (params.averageHandleTime <= 0) {
    errors.push('Tempo médio de atendimento deve ser maior que zero');
  }
  
  if (params.serviceLevel <= 0 || params.serviceLevel > 100) {
    errors.push('Nível de serviço deve estar entre 1 e 100%');
  }
  
  if (params.targetAnswerTime < 0) {
    errors.push('Tempo de resposta alvo não pode ser negativo');
  }
  
  if (params.abandonmentRate && (params.abandonmentRate < 0 || params.abandonmentRate > 100)) {
    errors.push('Taxa de abandono deve estar entre 0 e 100%');
  }
  
  return errors;
}