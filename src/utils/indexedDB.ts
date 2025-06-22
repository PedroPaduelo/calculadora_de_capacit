import { Operation, Forecast, Scenario } from '../types';

const DB_NAME = 'WFMCalculatorDB';
const DB_VERSION = 2;
const OPERATIONS_STORE = 'operations';
const FORECASTS_STORE = 'forecasts';
const SCENARIOS_STORE = 'scenarios';

class IndexedDBManager {
  private db: IDBDatabase | null = null;

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create operations store
        if (!db.objectStoreNames.contains(OPERATIONS_STORE)) {
          const operationsStore = db.createObjectStore(OPERATIONS_STORE, { keyPath: 'id' });
          operationsStore.createIndex('operationId', 'id', { unique: true });
          operationsStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Create forecasts store
        if (!db.objectStoreNames.contains(FORECASTS_STORE)) {
          const forecastsStore = db.createObjectStore(FORECASTS_STORE, { keyPath: 'id' });
          forecastsStore.createIndex('operationId', 'operationId', { unique: false });
          forecastsStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Create scenarios store
        if (!db.objectStoreNames.contains(SCENARIOS_STORE)) {
          const scenariosStore = db.createObjectStore(SCENARIOS_STORE, { keyPath: 'id' });
          scenariosStore.createIndex('operationId', 'operationId', { unique: false });
          scenariosStore.createIndex('forecastId', 'forecastId', { unique: false });
          scenariosStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        console.log('IndexedDB stores created');
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    return this.db!;
  }

  // Operations CRUD
  async saveOperation(operation: Operation): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OPERATIONS_STORE], 'readwrite');
      const store = transaction.objectStore(OPERATIONS_STORE);
      
      // Convert dates to ISO strings for storage
      const operationToStore = {
        ...operation,
        createdAt: operation.createdAt.toISOString(),
        updatedAt: operation.updatedAt.toISOString()
      };

      const request = store.put(operationToStore);

      request.onsuccess = () => {
        console.log('Operation saved to IndexedDB:', operation.id);
        resolve();
      };

      request.onerror = () => {
        console.error('Error saving operation:', request.error);
        reject(request.error);
      };
    });
  }

  async getOperations(): Promise<Operation[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OPERATIONS_STORE], 'readonly');
      const store = transaction.objectStore(OPERATIONS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const operations = request.result.map((op: any) => ({
          ...op,
          createdAt: new Date(op.createdAt),
          updatedAt: new Date(op.updatedAt)
        }));
        resolve(operations);
      };

      request.onerror = () => {
        console.error('Error getting operations:', request.error);
        reject(request.error);
      };
    });
  }

  async deleteOperation(operationId: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OPERATIONS_STORE], 'readwrite');
      const store = transaction.objectStore(OPERATIONS_STORE);
      const request = store.delete(operationId);

      request.onsuccess = () => {
        console.log('Operation deleted from IndexedDB:', operationId);
        resolve();
      };

      request.onerror = () => {
        console.error('Error deleting operation:', request.error);
        reject(request.error);
      };
    });
  }

  // Forecasts CRUD
  async saveForecast(forecast: Forecast): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([FORECASTS_STORE], 'readwrite');
      const store = transaction.objectStore(FORECASTS_STORE);
      
      // Convert dates to ISO strings for storage
      const forecastToStore = {
        ...forecast,
        createdAt: forecast.createdAt.toISOString(),
        updatedAt: forecast.updatedAt.toISOString()
      };

      const request = store.put(forecastToStore);

      request.onsuccess = () => {
        console.log('Forecast saved to IndexedDB:', forecast.id);
        resolve();
      };

      request.onerror = () => {
        console.error('Error saving forecast:', request.error);
        reject(request.error);
      };
    });
  }

  async getForecasts(): Promise<Forecast[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([FORECASTS_STORE], 'readonly');
      const store = transaction.objectStore(FORECASTS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const forecasts = request.result.map((forecast: any) => ({
          ...forecast,
          createdAt: new Date(forecast.createdAt),
          updatedAt: new Date(forecast.updatedAt)
        }));
        resolve(forecasts);
      };

      request.onerror = () => {
        console.error('Error getting forecasts:', request.error);
        reject(request.error);
      };
    });
  }

  async getForecastsByOperation(operationId: string): Promise<Forecast[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([FORECASTS_STORE], 'readonly');
      const store = transaction.objectStore(FORECASTS_STORE);
      const index = store.index('operationId');
      const request = index.getAll(operationId);

      request.onsuccess = () => {
        const forecasts = request.result.map((forecast: any) => ({
          ...forecast,
          createdAt: new Date(forecast.createdAt),
          updatedAt: new Date(forecast.updatedAt)
        }));
        resolve(forecasts);
      };

      request.onerror = () => {
        console.error('Error getting forecasts by operation:', request.error);
        reject(request.error);
      };
    });
  }

  async deleteForecast(forecastId: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([FORECASTS_STORE], 'readwrite');
      const store = transaction.objectStore(FORECASTS_STORE);
      const request = store.delete(forecastId);

      request.onsuccess = () => {
        console.log('Forecast deleted from IndexedDB:', forecastId);
        resolve();
      };

      request.onerror = () => {
        console.error('Error deleting forecast:', request.error);
        reject(request.error);
      };
    });
  }

  async deleteForecastsByOperation(operationId: string): Promise<void> {
    const forecasts = await this.getForecastsByOperation(operationId);
    const deletePromises = forecasts.map(forecast => this.deleteForecast(forecast.id));
    await Promise.all(deletePromises);
  }

  // Scenarios CRUD
  async saveScenario(scenario: Scenario): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SCENARIOS_STORE], 'readwrite');
      const store = transaction.objectStore(SCENARIOS_STORE);
      
      // Convert dates to ISO strings for storage
      const scenarioToStore = {
        ...scenario,
        createdAt: scenario.createdAt.toISOString(),
        updatedAt: scenario.updatedAt.toISOString()
      };

      const request = store.put(scenarioToStore);

      request.onsuccess = () => {
        console.log('Scenario saved to IndexedDB:', scenario.id);
        resolve();
      };

      request.onerror = () => {
        console.error('Error saving scenario:', request.error);
        reject(request.error);
      };
    });
  }

  async getScenarios(): Promise<Scenario[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SCENARIOS_STORE], 'readonly');
      const store = transaction.objectStore(SCENARIOS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const scenarios = request.result.map((scenario: any) => ({
          ...scenario,
          createdAt: new Date(scenario.createdAt),
          updatedAt: new Date(scenario.updatedAt)
        }));
        resolve(scenarios);
      };

      request.onerror = () => {
        console.error('Error getting scenarios:', request.error);
        reject(request.error);
      };
    });
  }

  async getScenariosByOperation(operationId: string): Promise<Scenario[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SCENARIOS_STORE], 'readonly');
      const store = transaction.objectStore(SCENARIOS_STORE);
      const index = store.index('operationId');
      const request = index.getAll(operationId);

      request.onsuccess = () => {
        const scenarios = request.result.map((scenario: any) => ({
          ...scenario,
          createdAt: new Date(scenario.createdAt),
          updatedAt: new Date(scenario.updatedAt)
        }));
        resolve(scenarios);
      };

      request.onerror = () => {
        console.error('Error getting scenarios by operation:', request.error);
        reject(request.error);
      };
    });
  }

  async getScenariosByForecast(forecastId: string): Promise<Scenario[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SCENARIOS_STORE], 'readonly');
      const store = transaction.objectStore(SCENARIOS_STORE);
      const index = store.index('forecastId');
      const request = index.getAll(forecastId);

      request.onsuccess = () => {
        const scenarios = request.result.map((scenario: any) => ({
          ...scenario,
          createdAt: new Date(scenario.createdAt),
          updatedAt: new Date(scenario.updatedAt)
        }));
        resolve(scenarios);
      };

      request.onerror = () => {
        console.error('Error getting scenarios by forecast:', request.error);
        reject(request.error);
      };
    });
  }

  async deleteScenario(scenarioId: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SCENARIOS_STORE], 'readwrite');
      const store = transaction.objectStore(SCENARIOS_STORE);
      const request = store.delete(scenarioId);

      request.onsuccess = () => {
        console.log('Scenario deleted from IndexedDB:', scenarioId);
        resolve();
      };

      request.onerror = () => {
        console.error('Error deleting scenario:', request.error);
        reject(request.error);
      };
    });
  }

  async deleteScenariosByOperation(operationId: string): Promise<void> {
    const scenarios = await this.getScenariosByOperation(operationId);
    const deletePromises = scenarios.map(scenario => this.deleteScenario(scenario.id));
    await Promise.all(deletePromises);
  }

  async deleteScenariosByForecast(forecastId: string): Promise<void> {
    const scenarios = await this.getScenariosByForecast(forecastId);
    const deletePromises = scenarios.map(scenario => this.deleteScenario(scenario.id));
    await Promise.all(deletePromises);
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OPERATIONS_STORE, FORECASTS_STORE, SCENARIOS_STORE], 'readwrite');
      
      const operationsStore = transaction.objectStore(OPERATIONS_STORE);
      const forecastsStore = transaction.objectStore(FORECASTS_STORE);
      const scenariosStore = transaction.objectStore(SCENARIOS_STORE);
      
      const clearOperations = operationsStore.clear();
      const clearForecasts = forecastsStore.clear();
      const clearScenarios = scenariosStore.clear();

      let completed = 0;
      const checkComplete = () => {
        completed++;
        if (completed === 3) {
          console.log('All data cleared from IndexedDB');
          resolve();
        }
      };

      clearOperations.onsuccess = checkComplete;
      clearForecasts.onsuccess = checkComplete;
      clearScenarios.onsuccess = checkComplete;

      clearOperations.onerror = () => reject(clearOperations.error);
      clearForecasts.onerror = () => reject(clearForecasts.error);
      clearScenarios.onerror = () => reject(clearScenarios.error);
    });
  }

  async exportData(): Promise<{ operations: Operation[], forecasts: Forecast[], scenarios: Scenario[] }> {
    const [operations, forecasts, scenarios] = await Promise.all([
      this.getOperations(),
      this.getForecasts(),
      this.getScenarios()
    ]);

    return { operations, forecasts, scenarios };
  }

  async importData(data: { operations: Operation[], forecasts: Forecast[], scenarios: Scenario[] }): Promise<void> {
    await this.clearAllData();
    
    const savePromises = [
      ...data.operations.map(op => this.saveOperation(op)),
      ...data.forecasts.map(forecast => this.saveForecast(forecast)),
      ...data.scenarios.map(scenario => this.saveScenario(scenario))
    ];

    await Promise.all(savePromises);
    console.log('Data imported successfully');
  }
}

// Create singleton instance
export const dbManager = new IndexedDBManager();

// Initialize on module load
dbManager.initDB().catch(console.error);

export default dbManager;