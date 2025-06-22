import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  AppState, 
  Operation, 
  Forecast, 
  Scenario, 
  PageType
} from '../types';
import { dbManager } from '../utils/indexedDB';

// Ações do reducer
type AppAction = 
  | { type: 'SET_CURRENT_PAGE'; payload: PageType }
  | { type: 'SET_CURRENT_OPERATION'; payload: string }
  | { type: 'SET_CURRENT_SCENARIO'; payload: string }
  | { type: 'ADD_OPERATION'; payload: Operation }
  | { type: 'UPDATE_OPERATION'; payload: Operation }
  | { type: 'DELETE_OPERATION'; payload: string }
  | { type: 'ADD_FORECAST'; payload: Forecast }
  | { type: 'UPDATE_FORECAST'; payload: Forecast }
  | { type: 'DELETE_FORECAST'; payload: string }
  | { type: 'ADD_SCENARIO'; payload: Scenario }
  | { type: 'UPDATE_SCENARIO'; payload: Scenario }
  | { type: 'DELETE_SCENARIO'; payload: string }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };

// Estado inicial
const initialState: AppState = {
  operations: [],
  forecasts: [],
  scenarios: [],
  config: {
    theme: 'light',
    sidebarCollapsed: false
  }
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_OPERATION':
      return {
        ...state,
        config: {
          ...state.config,
          currentOperation: action.payload
        }
      };

    case 'SET_CURRENT_SCENARIO':
      return {
        ...state,
        config: {
          ...state.config,
          currentScenario: action.payload
        }
      };

    case 'ADD_OPERATION':
      return {
        ...state,
        operations: [...state.operations, action.payload]
      };

    case 'UPDATE_OPERATION':
      return {
        ...state,
        operations: state.operations.map(op => 
          op.id === action.payload.id ? action.payload : op
        )
      };

    case 'DELETE_OPERATION':
      return {
        ...state,
        operations: state.operations.filter(op => op.id !== action.payload),
        forecasts: state.forecasts.filter(f => f.operationId !== action.payload),
        scenarios: state.scenarios.filter(s => s.operationId !== action.payload)
      };

    case 'ADD_FORECAST':
      return {
        ...state,
        forecasts: [...state.forecasts, action.payload]
      };

    case 'UPDATE_FORECAST':
      return {
        ...state,
        forecasts: state.forecasts.map(f => 
          f.id === action.payload.id ? action.payload : f
        )
      };

    case 'DELETE_FORECAST':
      return {
        ...state,
        forecasts: state.forecasts.filter(f => f.id !== action.payload),
        scenarios: state.scenarios.filter(s => s.forecastId !== action.payload)
      };

    case 'ADD_SCENARIO':
      return {
        ...state,
        scenarios: [...state.scenarios, action.payload]
      };

    case 'UPDATE_SCENARIO':
      return {
        ...state,
        scenarios: state.scenarios.map(s => 
          s.id === action.payload.id ? action.payload : s
        )
      };

    case 'DELETE_SCENARIO':
      return {
        ...state,
        scenarios: state.scenarios.filter(s => s.id !== action.payload)
      };

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        config: {
          ...state.config,
          sidebarCollapsed: !state.config.sidebarCollapsed
        }
      };

    case 'SET_THEME':
      return {
        ...state,
        config: {
          ...state.config,
          theme: action.payload
        }
      };

    case 'LOAD_STATE':
      return {
        ...state,
        ...action.payload
      };

    default:
      return state;
  }
}

// Context type
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper functions
  getCurrentOperation: () => Operation | undefined;
  getCurrentScenario: () => Scenario | undefined;
  getOperationForecasts: (operationId: string) => Forecast[];
  getOperationScenarios: (operationId: string) => Scenario[];
  // Enhanced actions with IndexedDB persistence
  saveOperation: (operation: Operation) => Promise<void>;
  updateOperation: (operation: Operation) => Promise<void>;
  deleteOperation: (operationId: string) => Promise<void>;
  saveForecast: (forecast: Forecast) => Promise<void>;
  updateForecast: (forecast: Forecast) => Promise<void>;
  deleteForecast: (forecastId: string) => Promise<void>;
  saveScenario: (scenario: Scenario) => Promise<void>;
  updateScenario: (scenario: Scenario) => Promise<void>;
  deleteScenario: (scenarioId: string) => Promise<void>;
  duplicateScenario: (scenarioId: string) => Promise<Scenario>;
}

// Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Hook para usar o context
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Provider props
interface AppProviderProps {
  children: React.ReactNode;
}

// Provider component
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Carregar dados do IndexedDB na inicialização
  useEffect(() => {
    const loadDataFromDB = async () => {
      try {
        await dbManager.initDB(); // Garantir que o DB está inicializado
        
        const [operations, forecasts, scenarios] = await Promise.all([
          dbManager.getOperations(),
          dbManager.getForecasts(),
          dbManager.getScenarios()
        ]);

        // Carregar configurações do localStorage (mais leves)
        const savedConfig = localStorage.getItem('calculadora-call-center-config');
        let config = initialState.config;
        
        if (savedConfig) {
          try {
            config = { ...config, ...JSON.parse(savedConfig) };
          } catch (error) {
            console.error('Error loading config from localStorage:', error);
          }
        }

        dispatch({ 
          type: 'LOAD_STATE', 
          payload: { 
            operations, 
            forecasts, 
            scenarios,
            config 
          } 
        });

        console.log(`Loaded ${operations.length} operations, ${forecasts.length} forecasts, and ${scenarios.length} scenarios from IndexedDB`);
      } catch (error) {
        console.error('Error loading data from IndexedDB:', error);
      }
    };

    loadDataFromDB();
  }, []);

  // Salvar apenas configurações no localStorage (mais leve)
  useEffect(() => {
    localStorage.setItem('calculadora-call-center-config', JSON.stringify(state.config));
  }, [state.config]);

  // Helper functions
  const getCurrentOperation = () => {
    if (!state.config.currentOperation) return undefined;
    return state.operations.find(op => op.id === state.config.currentOperation);
  };

  const getCurrentScenario = () => {
    if (!state.config.currentScenario) return undefined;
    return state.scenarios.find(s => s.id === state.config.currentScenario);
  };

  const getOperationForecasts = (operationId: string) => {
    return state.forecasts.filter(f => f.operationId === operationId);
  };

  const getOperationScenarios = (operationId: string) => {
    return state.scenarios.filter(s => s.operationId === operationId);
  };

  // Enhanced actions with IndexedDB persistence
  const saveOperation = async (operation: Operation) => {
    try {
      await dbManager.saveOperation(operation);
      dispatch({ type: 'ADD_OPERATION', payload: operation });
      console.log('Operation saved successfully:', operation.name);
    } catch (error) {
      console.error('Error saving operation:', error);
      throw error;
    }
  };

  const updateOperation = async (operation: Operation) => {
    try {
      await dbManager.saveOperation(operation); // IndexedDB put() update or create
      dispatch({ type: 'UPDATE_OPERATION', payload: operation });
      console.log('Operation updated successfully:', operation.name);
    } catch (error) {
      console.error('Error updating operation:', error);
      throw error;
    }
  };

  const deleteOperation = async (operationId: string) => {
    try {
      await dbManager.deleteOperation(operationId);
      await dbManager.deleteForecastsByOperation(operationId); // Delete related forecasts
      dispatch({ type: 'DELETE_OPERATION', payload: operationId });
      console.log('Operation deleted successfully:', operationId);
    } catch (error) {
      console.error('Error deleting operation:', error);
      throw error;
    }
  };

  const saveForecast = async (forecast: Forecast) => {
    try {
      await dbManager.saveForecast(forecast);
      dispatch({ type: 'ADD_FORECAST', payload: forecast });
      console.log('Forecast saved successfully:', forecast.name);
    } catch (error) {
      console.error('Error saving forecast:', error);
      throw error;
    }
  };

  const updateForecast = async (forecast: Forecast) => {
    try {
      await dbManager.saveForecast(forecast); // IndexedDB put() update or create
      dispatch({ type: 'UPDATE_FORECAST', payload: forecast });
      console.log('Forecast updated successfully:', forecast.name);
    } catch (error) {
      console.error('Error updating forecast:', error);
      throw error;
    }
  };

  const deleteForecast = async (forecastId: string) => {
    try {
      await dbManager.deleteForecast(forecastId);
      dispatch({ type: 'DELETE_FORECAST', payload: forecastId });
      console.log('Forecast deleted successfully:', forecastId);
    } catch (error) {
      console.error('Error deleting forecast:', error);
      throw error;
    }
  };

  const saveScenario = async (scenario: Scenario) => {
    try {
      await dbManager.saveScenario(scenario);
      dispatch({ type: 'ADD_SCENARIO', payload: scenario });
      console.log('Scenario saved successfully:', scenario.name);
    } catch (error) {
      console.error('Error saving scenario:', error);
      throw error;
    }
  };

  const updateScenario = async (scenario: Scenario) => {
    try {
      await dbManager.saveScenario(scenario);
      dispatch({ type: 'UPDATE_SCENARIO', payload: scenario });
      console.log('Scenario updated successfully:', scenario.name);
    } catch (error) {
      console.error('Error updating scenario:', error);
      throw error;
    }
  };

  const deleteScenario = async (scenarioId: string) => {
    try {
      await dbManager.deleteScenario(scenarioId);
      dispatch({ type: 'DELETE_SCENARIO', payload: scenarioId });
      console.log('Scenario deleted successfully:', scenarioId);
    } catch (error) {
      console.error('Error deleting scenario:', error);
      throw error;
    }
  };

  const duplicateScenario = async (scenarioId: string): Promise<Scenario> => {
    try {
      const originalScenario = state.scenarios.find(s => s.id === scenarioId);
      if (!originalScenario) {
        throw new Error('Scenario not found');
      }

      const duplicatedScenario: Scenario = {
        ...originalScenario,
        id: `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${originalScenario.name} (Cópia)`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await saveScenario(duplicatedScenario);
      return duplicatedScenario;
    } catch (error) {
      console.error('Error duplicating scenario:', error);
      throw error;
    }
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    getCurrentOperation,
    getCurrentScenario,
    getOperationForecasts,
    getOperationScenarios,
    saveOperation,
    updateOperation,
    deleteOperation,
    saveForecast,
    updateForecast,
    deleteForecast,
    saveScenario,
    updateScenario,
    deleteScenario,
    duplicateScenario
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};