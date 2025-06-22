import { ForecastInterval, ForecastPoint, Operation } from '../types';

export interface TimeInterval {
  start: string;
  end: string;
  duration: number; // em minutos
}

export function generateTimeIntervals(
  operation: Operation,
  intervalMinutes: ForecastInterval
): TimeInterval[] {
  const intervals: TimeInterval[] = [];
  
  if (operation.type === '24h') {
    // Para operações 24h, gerar intervalos de 00:00 até 23:59
    let currentTime = 0; // minutos desde 00:00
    
    while (currentTime < 24 * 60) {
      const startHour = Math.floor(currentTime / 60);
      const startMinute = currentTime % 60;
      const endTime = currentTime + intervalMinutes;
      const endHour = Math.floor(endTime / 60);
      const endMinute = endTime % 60;
      
      const start = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
      const end = endHour >= 24 
        ? '00:00' 
        : `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
      
      intervals.push({
        start,
        end,
        duration: intervalMinutes
      });
      
      currentTime += intervalMinutes;
    }
  } else {
    // Para operações com horário específico
    if (!operation.startTime || !operation.endTime) {
      throw new Error('Operação com horário específico deve ter startTime e endTime definidos');
    }
    
    const startMinutes = timeToMinutes(operation.startTime);
    const endMinutes = timeToMinutes(operation.endTime);
    
    let currentTime = startMinutes;
    
    while (currentTime < endMinutes) {
      const nextTime = Math.min(currentTime + intervalMinutes, endMinutes);
      
      intervals.push({
        start: minutesToTime(currentTime),
        end: minutesToTime(nextTime),
        duration: nextTime - currentTime
      });
      
      currentTime = nextTime;
    }
  }
  
  return intervals;
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function createEmptyForecastPoints(intervals: TimeInterval[]): ForecastPoint[] {
  return intervals.map(interval => ({
    time: interval.start,
    calls: 0,
    aht: undefined
  }));
}

export function validateForecastPoints(
  points: ForecastPoint[],
  operation: Operation,
  intervalMinutes: ForecastInterval
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const expectedIntervals = generateTimeIntervals(operation, intervalMinutes);
  
  // Verificar se todos os intervalos esperados estão presentes
  for (const interval of expectedIntervals) {
    const point = points.find(p => p.time === interval.start);
    if (!point) {
      errors.push(`Intervalo ${interval.start} não encontrado no forecast`);
    } else {
      // Validar valores
      if (point.calls < 0) {
        errors.push(`Número de chamadas não pode ser negativo para o intervalo ${point.time}`);
      }
      if (point.aht !== undefined && point.aht <= 0) {
        errors.push(`TMA deve ser maior que zero para o intervalo ${point.time}`);
      }
    }
  }
  
  // Verificar se não há intervalos extras
  for (const point of points) {
    const expectedInterval = expectedIntervals.find(i => i.start === point.time);
    if (!expectedInterval) {
      errors.push(`Intervalo ${point.time} não é esperado para esta operação`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function fillMissingIntervals(
  points: ForecastPoint[],
  operation: Operation,
  intervalMinutes: ForecastInterval
): ForecastPoint[] {
  const expectedIntervals = generateTimeIntervals(operation, intervalMinutes);
  const filledPoints: ForecastPoint[] = [];
  
  for (const interval of expectedIntervals) {
    const existingPoint = points.find(p => p.time === interval.start);
    if (existingPoint) {
      filledPoints.push(existingPoint);
    } else {
      // Criar ponto vazio para intervalos faltantes
      filledPoints.push({
        time: interval.start,
        calls: 0,
        aht: undefined
      });
    }
  }
  
  return filledPoints;
}

export function interpolateMissingCalls(points: ForecastPoint[]): ForecastPoint[] {
  const result = [...points];
  
  for (let i = 0; i < result.length; i++) {
    if (result[i].calls === 0 || result[i].calls === undefined) {
      // Encontrar o ponto anterior e próximo com dados
      let prevIndex = i - 1;
      let nextIndex = i + 1;
      
      while (prevIndex >= 0 && (result[prevIndex].calls === 0 || result[prevIndex].calls === undefined)) {
        prevIndex--;
      }
      
      while (nextIndex < result.length && (result[nextIndex].calls === 0 || result[nextIndex].calls === undefined)) {
        nextIndex++;
      }
      
      if (prevIndex >= 0 && nextIndex < result.length) {
        // Interpolação linear
        const prevCalls = result[prevIndex].calls;
        const nextCalls = result[nextIndex].calls;
        const distance = nextIndex - prevIndex;
        const position = i - prevIndex;
        
        const interpolatedCalls = Math.round(
          prevCalls + (nextCalls - prevCalls) * (position / distance)
        );
        
        result[i] = {
          ...result[i],
          calls: interpolatedCalls
        };
      }
    }
  }
  
  return result;
}

export function getIntervalLabel(interval: TimeInterval): string {
  if (interval.duration < 60) {
    return `${interval.start} - ${interval.end}`;
  } else {
    return `${interval.start}h`;
  }
}

export function calculateTotalOperationHours(operation: Operation): number {
  if (operation.type === '24h') {
    return 24;
  } else if (operation.startTime && operation.endTime) {
    const startMinutes = timeToMinutes(operation.startTime);
    const endMinutes = timeToMinutes(operation.endTime);
    return (endMinutes - startMinutes) / 60;
  }
  return 0;
}