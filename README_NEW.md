# WFM Calculator Pro - Advanced Workforce Management

Sistema avançado de gestão de força de trabalho e cálculos Erlang C para call centers, desenvolvido com React + TypeScript.

## 🌟 Funcionalidades Principais

### 📊 Dashboard Interativo
- **Visão geral completa** do ambiente WFM
- **Métricas em tempo real** com gráficos dinâmicos
- **Analytics avançados** com tendências e distribuições
- **Cards de resumo** com estatísticas principais

### 🏢 Gestão de Operações
- **Lista de operações** com navegação intuitiva
- **Criação e edição** de operações de call center
- **Suporte para operações 24h** ou horários específicos
- **Seleção de operação ativa** para análises

### 📈 Forecasting Avançado
- **Curvas de chamadas** por intervalos personalizáveis (15, 30, 60 min)
- **Import/Export CSV** para facilitar a integração
- **Parâmetros de serviço** configuráveis (SLA, TMA, etc.)
- **Configuração de shrinkage** detalhada

### 🎯 Cálculos de Dimensionamento
- **Algoritmo Erlang C** otimizado para precisão
- **Resultados por intervalo** com métricas detalhadas
- **Análise de sensibilidade** para ajustes finos
- **Visualizações interativas** com gráficos Recharts

### 🔄 Gestão de Cenários
- **Criação de múltiplos cenários** para comparação
- **Análise comparativa** visual entre cenários
- **Exportação de resultados** em PDF e CSV
- **Métricas consolidadas** e relatórios

## 🚀 Tecnologias Utilizadas

- **React 19** + **TypeScript** para desenvolvimento robusto
- **React Router DOM 7.6** para navegação entre páginas
- **Framer Motion** para animações fluidas
- **Recharts** para visualizações de dados interativas
- **Tailwind CSS** para estilização moderna e responsiva
- **Lucide React** para iconografia consistente
- **IndexedDB** para persistência local de dados

## 📱 Navegação e Rotas

### Estrutura de Rotas
```
/ (Dashboard)
├── /operations-list (Lista de Operações)
├── /operations (Gerenciar Operações)
├── /forecast (Forecasting)
├── /results (Resultados)
└── /scenarios (Cenários)
```

### Sidebar Responsiva
- **Dashboard**: Visão geral e analytics
- **Lista Operações**: Navegação e seleção de operações
- **Gerenciar**: Criação e edição de operações
- **Forecast**: Configuração de curvas e parâmetros
- **Resultados**: Análise de dimensionamento
- **Cenários**: Comparação e gestão de cenários

## 🎨 Interface e UX

### Design Responsivo
- Layout adaptável para desktop, tablet e mobile
- Sidebar colapsável para otimizar espaço
- Cards interativos com hover effects
- Tema dark/light com toggle automático

### Componentes Principais
- **DashboardLayout**: Layout base com header, sidebar e footer
- **Analytics**: Componente de analytics com múltiplos gráficos
- **OperationsList**: Lista interativa de operações
- **ResultsDisplay**: Visualização avançada de resultados

## 📊 Analytics e Métricas

### Métricas do Dashboard
- Total de operações criadas
- Resultados gerados com sucesso
- FTE médio calculado
- SLA médio das operações

### Gráficos Disponíveis
- **Tendência temporal**: Atividade dos últimos 7 dias
- **Análise por operação**: Forecasts, cenários e resultados
- **Distribuição por tipo**: Operações 24h vs. horário específico
- **Sensibilidade**: Análise de agentes vs. nível de serviço

## ⚡ Funcionalidades Avançadas

### Cálculos Erlang C
- Implementação otimizada do algoritmo Erlang C
- Suporte a múltiplos intervalos simultâneos
- Cálculo automático de shrinkage
- Análise de ocupação e tempo de espera

### Persistência de Dados
- Armazenamento local com IndexedDB
- Backup automático de configurações
- Import/Export de dados
- Sincronização entre sessões

### Exportação de Relatórios
- Exportação em PDF com gráficos
- Export CSV para análises externas
- Relatórios de comparação de cenários
- Sumários executivos automáticos

## 🛠️ Scripts Disponíveis

No diretório do projeto, você pode executar:

### `npm start`
Executa a aplicação em modo de desenvolvimento.\
Abra [http://localhost:3000](http://localhost:3000) para visualizar no navegador.

### `npm test`
Executa os testes em modo interativo.

### `npm run build`
Gera a build de produção na pasta `build`.\
Otimizada para melhor performance com arquivos minificados.

### `npm run eject`
**Nota: esta é uma operação irreversível!**

## 📦 Estrutura do Projeto

```
src/
├── components/
│   ├── Analytics/          # Componentes de análise
│   ├── Layout/            # Layouts principais
│   ├── ui/                # Componentes base
│   └── ...                # Outros componentes
├── contexts/              # Contextos React
├── pages/                 # Páginas da aplicação
├── types/                 # Definições TypeScript
├── utils/                 # Utilitários e helpers
└── App.tsx               # Componente principal
```

## 🔧 Configuração de Desenvolvimento

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn
- TypeScript conhecimento básico

### Instalação
```bash
npm install
npm start
```

### Variáveis de Ambiente
Nenhuma configuração especial necessária para desenvolvimento local.

## 📚 Documentação Adicional

Para aprender mais sobre as tecnologias utilizadas:

- [React Documentation](https://reactjs.org/)
- [React Router DOM](https://reactrouter.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Recharts](https://recharts.org/)

## 🎯 Próximas Funcionalidades

- [ ] Integração com APIs externas
- [ ] Autenticação e usuários
- [ ] Templates de operação
- [ ] Notificações e alertas
- [ ] Relatórios agendados
- [ ] Comparação histórica

---

**WFM Calculator Pro** - Desenvolvido para profissionais de Workforce Management que buscam precisão e eficiência em seus cálculos de dimensionamento.
