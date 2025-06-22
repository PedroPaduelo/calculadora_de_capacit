# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm start` (opens on http://localhost:3000)
- **Run tests**: `npm test` (interactive test runner)
- **Build for production**: `npm run build` (creates optimized build in `/build`)
- **Type checking**: TypeScript checking is handled by react-scripts during development

## Architecture Overview

This is a **React TypeScript workforce management application** for call center capacity planning using Erlang C calculations.

### Core Architecture
- **Client-side SPA** with React Router v7 for navigation
- **Context-based state management** using React useReducer pattern
- **Local-first data storage** via IndexedDB (Dexie library)
- **No external APIs** - fully self-contained application

### Data Model Hierarchy
```
Operations (call center configs) → Forecasts (volume predictions) → Scenarios (what-if analysis) → Results (Erlang C calculations)
```

### State Management
- **AppContext** (`src/contexts/AppContext.tsx`) - Main application state with useReducer
- **ThemeContext** (`src/contexts/ThemeContext.tsx`) - UI theme management
- **Database service** (`src/services/database.ts`) - IndexedDB operations via Dexie
- **Calculation engine** (`src/services/calculations.ts`) - Advanced Erlang C and Monte Carlo algorithms

### Key Technologies
- **React 19** + **TypeScript** with strict mode enabled
- **Tailwind CSS** for styling with responsive design
- **Framer Motion** for animations
- **Recharts** for data visualization
- **Formik + Yup** for form handling and validation
- **Export capabilities**: jsPDF, html2canvas, PptxGenJS

## Application Structure

### Pages (`src/pages/`)
- **Dashboard**: Overview with analytics and recent activity
- **OperationsList**: Navigate and select operations
- **OperationsPage**: Create/edit call center operations
- **ForecastPage**: Configure volume curves and service parameters
- **ResultsPage**: View Erlang C calculation results
- **ScenariosPage**: Manage and compare what-if scenarios
- **AdvancedScenariosPage**: Advanced features (sensitivity analysis, omnichannel)

### Component Architecture
- **Layout**: `DashboardLayout` provides main shell with responsive sidebar
- **UI Components**: Reusable components in `src/components/ui/`
- **Feature Components**: Domain-specific components (Analytics, Charts, Advanced modules)
- **Advanced Modules**: ScenarioBuilder, SensitivityAnalysis with plugin-like structure

### Data Flow
1. **Operations** define call center parameters (24h vs specific hours, service levels)
2. **Forecasts** attach volume curves and operational parameters to operations
3. **Scenarios** create what-if variations of forecasts for comparison
4. **Results** are calculated using advanced Erlang C algorithms with shrinkage, occupancy, and service level analysis

## Working with the Codebase

### TypeScript Configuration
- Strict mode enabled in `tsconfig.json`
- All components use TypeScript interfaces defined in `src/types/index.ts`
- React 19 with new JSX transform

### Adding New Features
- Follow existing Context patterns for state management
- Use IndexedDB via the database service for persistence  
- Implement responsive design with Tailwind classes
- Add proper TypeScript interfaces for new data structures

### Business Logic
- **Workforce calculations** are in `src/utils/erlangC.ts` and `src/utils/advancedErlangC.ts`
- **Database operations** go through `src/services/database.ts`
- **Export utilities** are in `src/utils/exportUtils.ts`

### Testing
- Uses Jest and React Testing Library
- Test files should follow `*.test.tsx` naming convention
- Testing utilities configured in `src/setupTests.ts`

## Advanced Features

The application includes sophisticated workforce management capabilities:
- **Monte Carlo simulations** for risk analysis
- **Sensitivity analysis** with tornado charts and heatmaps  
- **Omnichannel planning** with multi-channel support
- **Agent skill matrix** considerations
- **Advanced export capabilities** (PDF reports, PowerPoint presentations)

When working with advanced calculations, refer to the mathematical models in the calculation services and ensure accuracy of Erlang C implementations.