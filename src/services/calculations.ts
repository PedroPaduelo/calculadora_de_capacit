import {
  AdvancedScenario,
  Channel,
  ChannelResults,
  SensitivityResults,
  TornadoDataPoint,
  HeatmapDataPoint,
  RiskAnalysis,
  IntervalResult,
  AdvancedResults,
  ParameterVariation,
  ScenarioVariation,
  SimulationConfig,
  VariableDistribution
} from '../types';

export class AdvancedCalculationService {
  
  /**
   * Calcula cenário avançado com múltiplas variáveis
   */
  static async calculateAdvancedScenario(scenario: AdvancedScenario): Promise<AdvancedResults> {
    try {
      // Calcular resultados base
      const baseResults = await this.calculateBaseScenario(scenario);
      
      // Calcular variações se existirem
      const variationResults = await this.calculateVariations(scenario);
      
      // Calcular resultados por canal se for omnichannel
      const channelResults = scenario.parameters.channels 
        ? await this.calculateChannelResults(scenario.parameters.channels, scenario)
        : undefined;

      // Calcular análise de sensibilidade
      const sensitivityAnalysis = await this.calculateSensitivityAnalysis(scenario);

      // Calcular análise de risco
      const riskAnalysis = await this.calculateRiskAnalysis(scenario, variationResults);

      const results: AdvancedResults = {
        intervals: baseResults,
        summary: this.calculateSummary(baseResults, channelResults),
        channelBreakdown: channelResults,
        sensitivityAnalysis,
        riskAnalysis
      };

      return results;
    } catch (error) {
      console.error('Erro no cálculo avançado:', error);
      throw error;
    }
  }

  /**
   * Calcula cenário base
   */
  private static async calculateBaseScenario(scenario: AdvancedScenario): Promise<IntervalResult[]> {
    // Por enquanto, usar o cálculo básico como base
    // TODO: Implementar cálculos mais avançados baseados nos parâmetros do cenário
    
    const results: IntervalResult[] = [];
    
    // Simular dados para demonstração (substituir por cálculo real)
    for (let hour = 0; hour < 24; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      const calls = Math.floor(Math.random() * 100) + 50;
      
      const result: IntervalResult = {
        time,
        calls,
        requiredAgents: Math.ceil(calls * scenario.parameters.tma / 3600),
        requiredAgentsWithShrinkage: 0,
        serviceLevel: scenario.parameters.sla,
        averageWaitTime: Math.random() * 30,
        probabilityOfWaiting: Math.random() * 0.3,
        occupancyRate: 0.8 + Math.random() * 0.15,
        traffic: calls * scenario.parameters.tma / 3600
      };
      
      result.requiredAgentsWithShrinkage = Math.ceil(
        result.requiredAgents / (1 - this.calculateTotalShrinkage(scenario.parameters.shrinkage) / 100)
      );
      
      results.push(result);
    }
    
    return results;
  }

  /**
   * Calcula todas as variações de cenário
   */
  private static async calculateVariations(scenario: AdvancedScenario): Promise<ScenarioVariation[]> {
    const variations: ScenarioVariation[] = [];
    
    for (const variation of scenario.variations || []) {
      const modifiedScenario = this.applyVariationToScenario(scenario, variation);
      const results = await this.calculateBaseScenario(modifiedScenario);
      
      const variationResult: ScenarioVariation = {
        ...variation,
        results,
        totalFTE: results.reduce((sum, r) => Math.max(sum, r.requiredAgentsWithShrinkage), 0),
        averageServiceLevel: results.reduce((sum, r) => sum + r.serviceLevel, 0) / results.length,
        impact: this.calculateVariationImpact(scenario, results)
      };
      
      variations.push(variationResult);
    }
    
    return variations;
  }

  /**
   * Calcula resultados por canal (omnichannel)
   */
  private static async calculateChannelResults(
    channels: Channel[], 
    scenario: AdvancedScenario
  ): Promise<ChannelResults[]> {
    const results: ChannelResults[] = [];
    
    for (const channel of channels) {
      // Calcular métricas específicas do canal
      const totalCalls = Math.floor(Math.random() * 500) + 100;
      const requiredAgents = Math.ceil(totalCalls * channel.averageHandlingTime / 3600 / channel.concurrentCapacity);
      
      const channelResult: ChannelResults = {
        channelId: channel.id,
        channelName: channel.name,
        totalCalls,
        requiredAgents,
        serviceLevel: channel.sla,
        averageWaitTime: Math.random() * channel.targetAnswerTime,
        costPerCall: this.calculateCostPerCall(channel),
        efficiency: this.calculateChannelEfficiency(channel, requiredAgents, totalCalls)
      };
      
      results.push(channelResult);
    }
    
    return results;
  }

  /**
   * Calcula análise de sensibilidade
   */
  private static async calculateSensitivityAnalysis(scenario: AdvancedScenario): Promise<SensitivityResults> {
    const parameters = [
      { name: 'sla', label: 'SLA (%)', baseValue: scenario.parameters.sla },
      { name: 'tma', label: 'TMA (segundos)', baseValue: scenario.parameters.tma },
      { name: 'shrinkage', label: 'Shrinkage (%)', baseValue: this.calculateTotalShrinkage(scenario.parameters.shrinkage) }
    ];

    const tornadoData: TornadoDataPoint[] = [];
    const heatmapData: HeatmapDataPoint[] = [];

    // Calcular impacto para cada parâmetro
    for (const param of parameters) {
      const variations = [-20, -10, -5, 5, 10, 20]; // Variações percentuais
      const impacts: number[] = [];

      for (const variation of variations) {
        const modifiedScenario = this.createParameterVariation(scenario, param.name, variation);
        const results = await this.calculateBaseScenario(modifiedScenario);
        const impact = this.calculateImpactMetric(results);
        impacts.push(impact);
      }

      // Dados para gráfico tornado
      const negativeImpact = Math.min(...impacts.slice(0, 3));
      const positiveImpact = Math.max(...impacts.slice(3));
      
      tornadoData.push({
        parameter: param.label,
        negativeImpact,
        positiveImpact,
        range: positiveImpact - negativeImpact,
        color: this.getParameterColor(param.name)
      });

      // Dados para heatmap (combinações de parâmetros)
      for (const otherParam of parameters) {
        if (param.name !== otherParam.name) {
          const combinedImpact = this.calculateCombinedImpact(scenario, param.name, otherParam.name);
          heatmapData.push({
            xParameter: param.name,
            yParameter: otherParam.name,
            xValue: param.baseValue,
            yValue: otherParam.baseValue,
            impact: combinedImpact,
            color: this.getHeatmapColor(combinedImpact)
          });
        }
      }
    }

    // Ordenar tornado por range (impacto)
    tornadoData.sort((a, b) => b.range - a.range);

    return {
      parameters: parameters.map(p => ({
        ...p,
        variations: [-20, -10, -5, 5, 10, 20],
        impacts: [], // Seria preenchido com os impactos calculados
        sensitivity: Math.random() * 100 // Simplificado - calcular índice real
      })),
      tornadoData,
      heatmapData,
      summary: {
        mostSensitiveParameter: tornadoData[0]?.parameter || '',
        sensitivityRange: tornadoData[0]?.range || 0,
        robustness: tornadoData[0]?.range > 50 ? 'low' : tornadoData[0]?.range > 25 ? 'medium' : 'high'
      }
    };
  }

  /**
   * Calcula análise de risco
   */
  private static async calculateRiskAnalysis(
    scenario: AdvancedScenario, 
    variations: ScenarioVariation[]
  ): Promise<RiskAnalysis> {
    // Implementação simplificada - seria expandida com algoritmos mais complexos
    const riskScenarios = [
      {
        id: 'demand-spike',
        name: 'Pico de Demanda',
        probability: 25,
        impact: 80,
        description: 'Aumento súbito no volume de chamadas',
        category: 'demand' as const
      },
      {
        id: 'agent-shortage',
        name: 'Falta de Agentes',
        probability: 40,
        impact: 60,
        description: 'Absenteísmo acima do esperado',
        category: 'resource' as const
      }
    ];

    const riskMatrix = riskScenarios.map(risk => ({
      scenario: risk.name,
      probability: risk.probability,
      impact: risk.impact,
      riskLevel: this.calculateRiskLevel(risk.probability, risk.impact),
      color: this.getRiskColor(risk.probability, risk.impact)
    }));

    const overallRisk = this.calculateOverallRisk(riskMatrix);

    return {
      scenarios: riskScenarios,
      riskMatrix,
      mitigation: [], // Seria preenchido com ações de mitigação
      overall: {
        riskLevel: overallRisk,
        confidence: 85,
        recommendation: this.generateRiskRecommendation(overallRisk)
      }
    };
  }

  /**
   * Métodos auxiliares
   */
  private static calculateTotalShrinkage(shrinkage: any): number {
    return shrinkage.regularBreaks + shrinkage.training + shrinkage.meetings + 
           shrinkage.absenteeism + shrinkage.other;
  }

  private static calculateSummary(intervals: IntervalResult[], channels?: ChannelResults[]) {
    const peakAgents = Math.max(...intervals.map(i => i.requiredAgentsWithShrinkage));
    const peakInterval = intervals.find(i => i.requiredAgentsWithShrinkage === peakAgents);
    
    return {
      totalFTE: peakAgents,
      averageServiceLevel: intervals.reduce((sum, i) => sum + i.serviceLevel, 0) / intervals.length,
      peakAgents,
      peakTime: peakInterval?.time || '12:00',
      totalCost: channels?.reduce((sum, c) => sum + (c.costPerCall || 0) * c.totalCalls, 0),
      efficiency: intervals.reduce((sum, i) => sum + i.occupancyRate, 0) / intervals.length
    };
  }

  private static applyVariationToScenario(scenario: AdvancedScenario, variation: ScenarioVariation): AdvancedScenario {
    // Criar cópia do cenário com as modificações da variação
    const modified = JSON.parse(JSON.stringify(scenario));
    
    Object.entries(variation.parameterChanges).forEach(([param, value]) => {
      // Aplicar mudanças aos parâmetros
      if (param === 'sla') modified.parameters.sla = value;
      if (param === 'tma') modified.parameters.tma = value;
      // ... outras mudanças
    });
    
    return modified;
  }

  private static calculateVariationImpact(baseScenario: AdvancedScenario, results: IntervalResult[]) {
    // Calcular impacto comparado ao cenário base
    return {
      fteChange: 0, // Calcular diferença real
      fteChangePercentage: 0,
      slChange: 0,
      slChangePercentage: 0,
      riskLevel: 'medium' as const
    };
  }

  private static calculateCostPerCall(channel: Channel): number {
    // Cálculo simplificado do custo por chamada
    const baseCost = 5.0; // Custo base em reais
    const multiplier = channel.type === 'voice' ? 1.0 : 
                      channel.type === 'chat' ? 0.6 : 
                      channel.type === 'email' ? 0.3 : 0.5;
    return baseCost * multiplier;
  }

  private static calculateChannelEfficiency(channel: Channel, agents: number, calls: number): number {
    // Cálculo de eficiência do canal
    const theoreticalCapacity = agents * channel.concurrentCapacity * 8; // 8 horas
    const actualUtilization = calls / theoreticalCapacity;
    return Math.min(actualUtilization, 1.0);
  }

  private static createParameterVariation(scenario: AdvancedScenario, param: string, variation: number): AdvancedScenario {
    const modified = JSON.parse(JSON.stringify(scenario));
    
    if (param === 'sla') {
      modified.parameters.sla = scenario.parameters.sla * (1 + variation / 100);
    } else if (param === 'tma') {
      modified.parameters.tma = scenario.parameters.tma * (1 + variation / 100);
    }
    // ... outros parâmetros
    
    return modified;
  }

  private static calculateImpactMetric(results: IntervalResult[]): number {
    // Métrica de impacto baseada em FTE
    return Math.max(...results.map(r => r.requiredAgentsWithShrinkage));
  }

  private static calculateCombinedImpact(scenario: AdvancedScenario, param1: string, param2: string): number {
    // Calcular impacto da combinação de dois parâmetros
    return Math.random() * 100; // Simplificado
  }

  private static getParameterColor(param: string): string {
    const colors: Record<string, string> = {
      'sla': '#3B82F6',
      'tma': '#10B981',
      'shrinkage': '#F59E0B'
    };
    return colors[param] || '#6B7280';
  }

  private static getHeatmapColor(impact: number): string {
    if (impact > 75) return '#EF4444';
    if (impact > 50) return '#F59E0B';
    if (impact > 25) return '#10B981';
    return '#3B82F6';
  }

  private static calculateRiskLevel(probability: number, impact: number): 'low' | 'medium' | 'high' | 'critical' {
    const riskScore = probability * impact / 100;
    if (riskScore > 60) return 'critical';
    if (riskScore > 40) return 'high';
    if (riskScore > 20) return 'medium';
    return 'low';
  }

  private static getRiskColor(probability: number, impact: number): string {
    const level = this.calculateRiskLevel(probability, impact);
    const colors = {
      'low': '#10B981',
      'medium': '#F59E0B',
      'high': '#F97316',
      'critical': '#EF4444'
    };
    return colors[level];
  }

  private static calculateOverallRisk(riskMatrix: any[]): 'low' | 'medium' | 'high' | 'critical' {
    const avgRisk = riskMatrix.reduce((sum, risk) => {
      const score = risk.probability * risk.impact / 100;
      return sum + score;
    }, 0) / riskMatrix.length;

    if (avgRisk > 60) return 'critical';
    if (avgRisk > 40) return 'high';
    if (avgRisk > 20) return 'medium';
    return 'low';
  }

  private static generateRiskRecommendation(riskLevel: string): string {
    const recommendations = {
      'low': 'Cenário estável. Monitorar indicadores regularmente.',
      'medium': 'Implementar ações preventivas e aumentar monitoramento.',
      'high': 'Ações corretivas necessárias. Revisar dimensionamento.',
      'critical': 'Intervenção imediata necessária. Reavaliação completa do modelo.'
    };
    return recommendations[riskLevel as keyof typeof recommendations] || '';
  }

  /**
   * Simulação Monte Carlo
   */
  static async runMonteCarloSimulation(
    scenario: AdvancedScenario, 
    config: SimulationConfig
  ): Promise<any> {
    const iterations = config.monteCarlo.iterations;
    const results: any[] = [];

    for (let i = 0; i < iterations; i++) {
      // Gerar valores aleatórios baseados nas distribuições
      const randomScenario = this.generateRandomScenario(scenario, config.monteCarlo.variableDistributions);
      const result = await this.calculateBaseScenario(randomScenario);
      results.push(result);
    }

    // Calcular estatísticas
    return this.calculateMonteCarloStatistics(results, config.monteCarlo.confidenceLevel);
  }

  private static generateRandomScenario(
    baseScenario: AdvancedScenario, 
    distributions: VariableDistribution[]
  ): AdvancedScenario {
    const randomScenario = JSON.parse(JSON.stringify(baseScenario));

    distributions.forEach(dist => {
      const randomValue = this.generateRandomValue(dist);
      // Aplicar valor aleatório ao cenário
      if (dist.variable === 'sla') {
        randomScenario.parameters.sla = randomValue;
      }
      // ... outras variáveis
    });

    return randomScenario;
  }

  private static generateRandomValue(distribution: VariableDistribution): number {
    switch (distribution.distribution) {
      case 'normal':
        return this.randomNormal(distribution.parameters.mean, distribution.parameters.std);
      case 'uniform':
        return Math.random() * (distribution.parameters.max - distribution.parameters.min) + distribution.parameters.min;
      default:
        return distribution.parameters.mean || 0;
    }
  }

  private static randomNormal(mean: number, std: number): number {
    // Box-Muller transform para distribuição normal
    const u = Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return z * std + mean;
  }

  private static calculateMonteCarloStatistics(results: any[], confidenceLevel: number) {
    // Calcular percentis e estatísticas
    const values = results.map(r => Math.max(...r.map((i: any) => i.requiredAgentsWithShrinkage)));
    values.sort((a, b) => a - b);

    const percentile = (p: number) => {
      const index = Math.ceil(values.length * p / 100) - 1;
      return values[index];
    };

    return {
      mean: values.reduce((sum, v) => sum + v, 0) / values.length,
      median: percentile(50),
      p95: percentile(95),
      p99: percentile(99),
      confidenceInterval: {
        lower: percentile((100 - confidenceLevel) / 2),
        upper: percentile(50 + confidenceLevel / 2)
      }
    };
  }
}
