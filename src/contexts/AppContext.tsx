import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  AppState, 
  Operation, 
  Forecast, 
  Scenario, 
  PageType
} from '../types';

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

  // Carregar estado do localStorage na inicialização
  useEffect(() => {
    const savedState = localStorage.getItem('calculadora-call-center-state');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        // Converter strings de data de volta para Date objects
        const processedState = {
          ...parsedState,
          operations: parsedState.operations?.map((op: any) => ({
            ...op,
            createdAt: new Date(op.createdAt),
            updatedAt: new Date(op.updatedAt)
          })) || [],
          forecasts: parsedState.forecasts?.map((f: any) => ({
            ...f,
            createdAt: new Date(f.createdAt),
            updatedAt: new Date(f.updatedAt)
          })) || [],
          scenarios: parsedState.scenarios?.map((s: any) => ({
            ...s,
            createdAt: new Date(s.createdAt),
            updatedAt: new Date(s.updatedAt)
          })) || []
        };
        dispatch({ type: 'LOAD_STATE', payload: processedState });
      } catch (error) {
        console.error('Error loading state from localStorage:', error);
      }
    }
  }, []);

  // Salvar estado no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('calculadora-call-center-state', JSON.stringify(state));
  }, [state]);

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

  const contextValue: AppContextType = {
    state,
    dispatch,
    getCurrentOperation,
    getCurrentScenario,
    getOperationForecasts,
    getOperationScenarios
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};