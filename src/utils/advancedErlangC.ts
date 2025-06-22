import { 
  ForecastPoint, 
  ServiceParameters, 
  ShrinkageConfig, 
  IntervalResult 
} from '../types';

// Função para calcular o fatorial de forma otimizada
function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// Função para calcular Erlang B
function erlangB(traffic: number, agents: number): number {
  if (agents === 0) return 1;
  
  let numerator = Math.pow(traffic, agents) / factorial(agents);
  let denominator = 0;
  
  for (let i = 0; i <= agents; i++) {
    denominator += Math.pow(traffic, i) / factorial(i);
  }
  
  return numerator / denominator;
}

// Função principal para calcular Erlang C
function erlangC(traffic: number, agents: number): number {
  if (agents <= traffic) return 1;
  
  const erlangBValue = erlangB(traffic, agents);
  const numerator = erlangBValue;
  const denominator = 1 - (traffic / agents) * (1 - erlangBValue);
  
  if (denominator <= 0) return 1;
  return numerator / denominator;
}

// Função para calcular o tempo médio de espera
function averageWaitTime(traffic: number, agents: number, aht: number): number {
  if (agents <= traffic) return Infinity;
  
  const erlangCValue = erlangC(traffic, agents);
  return (erlangCValue * aht) / (agents - traffic);
}

// Função para calcular o nível de serviço
function serviceLevel(traffic: number, agents: number, aht: number, targetTime: number): number {
  if (agents <= traffic) return 0;
  
  const erlangCValue = erlangC(traffic, agents);
  const serviceLevelValue = 1 - erlangCValue * Math.exp(-(agents - traffic) * targetTime / aht);
  return Math.max(0, Math.min(100, serviceLevelValue * 100));
}

// Função para calcular o shrinkage total
export function calculateTotalShrinkage(shrinkageConfig: ShrinkageConfig): number {
  const { regularBreaks, training, meetings, absenteeism, other, customFactors } = shrinkageConfig;
  
  let totalShrinkage = regularBreaks + training + meetings + absenteeism + other;
  
  // Adicionar fatores customizados
  customFactors.forEach(factor => {
    totalShrinkage += factor.percentage;
  });
  
  return Math.min(totalShrinkage, 80); // Limite máximo de 80% de shrinkage
}

// Função para calcular tráfego ajustado com taxa de abandono
function calculateAdjustedTraffic(calls: number, aht: number, abandonmentRate: number = 0): number {
  // Taxa de abandono reduz o número efetivo de chamadas que precisam ser atendidas
  const effectiveCalls = calls * (1 - abandonmentRate / 100);
  return (effectiveCalls * aht) / 3600; // Converter para Erlangs
}

// Função para encontrar o número mínimo de agentes para um intervalo
function findMinimumAgents(
  calls: number, 
  aht: number, 
  targetServiceLevel: number, 
  targetAnswerTime: number,
  abandonmentRate: number = 0
): number {
  const traffic = calculateAdjustedTraffic(calls, aht, abandonmentRate);
  
  if (traffic <= 0) return 0;
  
  let agents = Math.ceil(traffic);
  let currentServiceLevel = 0;
  
  // Buscar até encontrar o nível de serviço desejado ou limite máximo
  while (currentServiceLevel < targetServiceLevel && agents < traffic + 50) {
    currentServiceLevel = serviceLevel(traffic, agents, aht, targetAnswerTime);
    if (currentServiceLevel < targetServiceLevel) {
      agents++;
    }
  }
  
  return agents;
}

// Função principal para calcular dimensionamento por intervalos
export function calculateAdvancedErlangC(
  forecastPoints: ForecastPoint[],
  serviceParameters: ServiceParameters,
  shrinkageConfig: ShrinkageConfig
): IntervalResult[] {
  const totalShrinkagePercent = calculateTotalShrinkage(shrinkageConfig);
  const shrinkageMultiplier = 1 / (1 - totalShrinkagePercent / 100);
  
  return forecastPoints.map(point => {
    const calls = point.calls;
    const aht = point.aht || serviceParameters.defaultAht;
    const abandonmentRate = serviceParameters.abandonmentRate || 0;
    const traffic = calculateAdjustedTraffic(calls, aht, abandonmentRate);
    
    if (calls <= 0) {
      return {
        time: point.time,
        calls: 0,
        requiredAgents: 0,
        requiredAgentsWithShrinkage: 0,
        serviceLevel: 100,
        averageWaitTime: 0,
        probabilityOfWaiting: 0,
        occupancyRate: 0,
        traffic: 0
      };
    }
    
    const requiredAgents = findMinimumAgents(
      calls,
      aht,
      serviceParameters.serviceLevel,
      serviceParameters.targetAnswerTime,
      abandonmentRate
    );
    
    const requiredAgentsWithShrinkage = Math.ceil(requiredAgents * shrinkageMultiplier);
    
    // Calcular métricas finais baseadas nos agentes com shrinkage
    const finalServiceLevel = serviceLevel(
      traffic, 
      requiredAgentsWithShrinkage, 
      aht, 
      serviceParameters.targetAnswerTime
    );
    
    const finalWaitTime = averageWaitTime(traffic, requiredAgentsWithShrinkage, aht);
    const probabilityWaiting = erlangC(traffic, requiredAgentsWithShrinkage);
    const occupancy = traffic / requiredAgentsWithShrinkage;
    
    return {
      time: point.time,
      calls,
      requiredAgents,
      requiredAgentsWithShrinkage,
      serviceLevel: Math.round(finalServiceLevel * 100) / 100,
      averageWaitTime: Math.round(finalWaitTime * 100) / 100,
      probabilityOfWaiting: Math.round(probabilityWaiting * 10000) / 100,
      occupancyRate: Math.round(occupancy * 10000) / 100,
      traffic: Math.round(traffic * 100) / 100
    };
  });
}

// Função para calcular FTE total
export function calculateTotalFTE(results: IntervalResult[]): number {
  if (results.length === 0) return 0;
  
  // Assumir que cada resultado representa um intervalo e calcular a média ponderada
  const totalAgentHours = results.reduce((sum, result) => sum + result.requiredAgentsWithShrinkage, 0);
  return Math.round((totalAgentHours / results.length) * 100) / 100;
}

// Função para calcular nível de serviço médio
export function calculateAverageServiceLevel(results: IntervalResult[]): number {
  if (results.length === 0) return 0;
  
  const totalServiceLevel = results.reduce((sum, result) => sum + result.serviceLevel, 0);
  return Math.round((totalServiceLevel / results.length) * 100) / 100;
}

// Função para validar forecast
export function validateForecast(points: ForecastPoint[]): string[] {
  const errors: string[] = [];
  
  if (points.length === 0) {
    errors.push('Forecast não pode estar vazio');
    return errors;
  }
  
  // Verificar se há pontos com valores inválidos
  points.forEach((point, index) => {
    if (point.calls < 0) {
      errors.push(`Intervalo ${point.time}: Número de chamadas não pode ser negativo`);
    }
    
    if (point.aht && point.aht <= 0) {
      errors.push(`Intervalo ${point.time}: TMA deve ser maior que zero`);
    }
    
    // Verificar formato de tempo
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(point.time)) {
      errors.push(`Intervalo ${index + 1}: Formato de tempo inválido (use HH:mm)`);
    }
  });
  
  // Verificar continuidade dos intervalos
  const sortedPoints = [...points].sort((a, b) => a.time.localeCompare(b.time));
  for (let i = 1; i < sortedPoints.length; i++) {
    const current = sortedPoints[i];
    const previous = sortedPoints[i - 1];
    
    // Esta validação pode ser expandida baseada no intervalo configurado
    // Por simplicidade, apenas verificamos se não há horários duplicados
    if (current.time === previous.time) {
      errors.push(`Horário duplicado encontrado: ${current.time}`);
    }
  }
  
  return errors;
}

// Função para gerar forecast de exemplo
export function generateSampleForecast(interval: number = 60): ForecastPoint[] {
  const points: ForecastPoint[] = [];
  
  // Gerar uma curva típica de call center (picos manhã e tarde)
  for (let hour = 8; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Criar uma curva com picos às 10h e 15h
      let calls = 20; // Base
      
      if (hour >= 9 && hour <= 11) calls += 30; // Pico manhã
      if (hour >= 14 && hour <= 16) calls += 25; // Pico tarde
      if (hour === 10) calls += 20; // Super pico
      if (hour === 15) calls += 15; // Super pico tarde
      
      // Adicionar variação aleatória
      calls += Math.floor(Math.random() * 10 - 5);
      calls = Math.max(0, calls);
      
      points.push({
        time,
        calls
      });
    }
  }
  
  return points;
}

// Alias para manter compatibilidade
export const calculateIntervalStaffing = calculateAdvancedErlangC;