import Dexie, { Table } from 'dexie';
import {
  Operation,
  Forecast,
  Scenario,
  AdvancedScenario,
  Channel,
  VersionHistory,
  UserPreferences,
  Notification,
  AgentSkillMatrix
} from '../types';

// Interface para o banco de dados
export interface WFMDatabase extends Dexie {
  // Tabelas básicas
  operations: Table<Operation, string>;
  forecasts: Table<Forecast, string>;
  scenarios: Table<Scenario, string>;
  
  // Tabelas avançadas
  advancedScenarios: Table<AdvancedScenario, string>;
  channels: Table<Channel, string>;
  versionHistory: Table<VersionHistory, string>;
  agentSkills: Table<AgentSkillMatrix, string>;
  
  // Tabelas de configuração
  userPreferences: Table<UserPreferences, string>;
  notifications: Table<Notification, string>;
  
  // Tabelas de cache
  calculationCache: Table<{ id: string; data: any; timestamp: Date }, string>;
}

// Classe do banco de dados
class WFMDatabaseManager extends Dexie implements WFMDatabase {
  operations!: Table<Operation, string>;
  forecasts!: Table<Forecast, string>;
  scenarios!: Table<Scenario, string>;
  advancedScenarios!: Table<AdvancedScenario, string>;
  channels!: Table<Channel, string>;
  versionHistory!: Table<VersionHistory, string>;
  agentSkills!: Table<AgentSkillMatrix, string>;
  userPreferences!: Table<UserPreferences, string>;
  notifications!: Table<Notification, string>;
  calculationCache!: Table<{ id: string; data: any; timestamp: Date }, string>;

  constructor() {
    super('WFMCalculatorDB');
    
    // Versão 1 - Schema básico (compatibilidade com versão anterior)
    this.version(1).stores({
      operations: 'id, name, type, createdAt, updatedAt',
      forecasts: 'id, name, operationId, createdAt, updatedAt',
      scenarios: 'id, name, operationId, forecastId, createdAt, updatedAt'
    });

    // Versão 2 - Adição de funcionalidades avançadas
    this.version(2).stores({
      operations: 'id, name, type, createdAt, updatedAt',
      forecasts: 'id, name, operationId, createdAt, updatedAt',
      scenarios: 'id, name, operationId, forecastId, createdAt, updatedAt',
      advancedScenarios: 'id, name, baseScenarioId, version, createdAt, updatedAt, createdBy',
      channels: 'id, name, type, isActive',
      versionHistory: 'id, entityId, entityType, version, createdAt, createdBy',
      agentSkills: 'id',
      userPreferences: 'id',
      notifications: 'id, timestamp, read',
      calculationCache: 'id, timestamp'
    });

    // Hooks para versionamento automático
    this.advancedScenarios.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
      if (!obj.version) obj.version = 1;
    });
  }

  // Método para criar histórico de versões
  private async createVersionHistory(
    entityId: string,
    entityType: 'scenario' | 'forecast' | 'operation',
    changes: any
  ) {
    try {
      const lastVersion = await this.versionHistory
        .where(['entityId', 'entityType'])
        .equals([entityId, entityType])
        .reverse()
        .sortBy('version');

      const newVersion = lastVersion.length > 0 ? lastVersion[0].version + 1 : 1;

      const versionEntry: VersionHistory = {
        id: `${entityId}_v${newVersion}_${Date.now()}`,
        entityId,
        entityType,
        version: newVersion,
        changes: Object.keys(changes).map(field => ({
          field,
          oldValue: null, // Seria necessário buscar valor anterior
          newValue: changes[field],
          changeType: 'modified'
        })),
        createdAt: new Date(),
        tags: []
      };

      await this.versionHistory.add(versionEntry);
    } catch (error) {
      console.error('Erro ao criar histórico de versão:', error);
    }
  }

  // Método para migração de dados da versão anterior (simplificado)
  async migrateFromLegacyIndexedDB() {
    try {
      // Verificação simples se já existem dados
      const existingScenarios = await this.scenarios.count();
      if (existingScenarios > 0) {
        console.log('Dados já existem, migração desnecessária');
        return;
      }
      
      console.log('Nenhum dado legado encontrado para migrar');
    } catch (error) {
      console.warn('Erro na migração, mas continuando:', error);
    }
  }

  // Métodos utilitários para cache
  async getCachedCalculation(cacheKey: string) {
    try {
      const cached = await this.calculationCache.get(cacheKey);
      if (cached && cached.timestamp > new Date(Date.now() - 15 * 60 * 1000)) {
        return cached.data;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar cache:', error);
      return null;
    }
  }

  async setCachedCalculation(cacheKey: string, data: any) {
    try {
      await this.calculationCache.put({
        id: cacheKey,
        data,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Erro ao salvar cache:', error);
    }
  }

  // Método para backup/export de dados
  async exportAllData() {
    try {
      const data = {
        operations: await this.operations.toArray(),
        forecasts: await this.forecasts.toArray(),
        scenarios: await this.scenarios.toArray(),
        advancedScenarios: await this.advancedScenarios.toArray(),
        channels: await this.channels.toArray(),
        agentSkills: await this.agentSkills.toArray(),
        exportedAt: new Date().toISOString(),
        version: '2.0'
      };
      
      return data;
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      throw error;
    }
  }

  // Método para import de dados
  async importData(data: any) {
    try {
      await this.transaction('rw', [
        this.operations,
        this.forecasts,
        this.scenarios,
        this.advancedScenarios,
        this.channels,
        this.agentSkills
      ], async () => {
        if (data.operations) await this.operations.bulkPut(data.operations);
        if (data.forecasts) await this.forecasts.bulkPut(data.forecasts);
        if (data.scenarios) await this.scenarios.bulkPut(data.scenarios);
        if (data.advancedScenarios) await this.advancedScenarios.bulkPut(data.advancedScenarios);
        if (data.channels) await this.channels.bulkPut(data.channels);
        if (data.agentSkills) await this.agentSkills.bulkPut(data.agentSkills);
      });

      console.log('Dados importados com sucesso');
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      throw error;
    }
  }

  // Método para limpeza de dados antigos
  async cleanupOldData(daysToKeep: number = 90) {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
      
      // Limpar versões antigas
      await this.versionHistory.where('createdAt').below(cutoffDate).delete();
      
      // Limpar notificações antigas
      await this.notifications.where('timestamp').below(cutoffDate).delete();
      
      // Limpar cache antigo
      await this.calculationCache.where('timestamp').below(cutoffDate).delete();
      
      console.log('Limpeza de dados antigos concluída');
    } catch (error) {
      console.error('Erro na limpeza de dados:', error);
    }
  }
}

// Instância singleton do banco de dados
export const db = new WFMDatabaseManager();

// Inicializar banco e migração se necessário
export const initializeDatabase = async () => {
  try {
    console.log('Inicializando banco de dados...');
    await db.open();
    console.log('Banco de dados aberto com sucesso');
    
    // Tentar migração apenas se necessário
    try {
      await db.migrateFromLegacyIndexedDB();
      console.log('Migração concluída');
    } catch (migrationError) {
      console.warn('Migração não necessária ou falhou:', migrationError);
    }
    
    console.log('Banco de dados inicializado com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    // Não bloquear a aplicação por erro no banco
    return false;
  }
};

export default db;
