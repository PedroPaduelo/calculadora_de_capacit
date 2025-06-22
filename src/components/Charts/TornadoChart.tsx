import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import { TornadoDataPoint } from '../../types';

interface TornadoChartProps {
  data: TornadoDataPoint[];
  title?: string;
  height?: number;
  className?: string;
}

interface TornadoDataFormatted {
  parameter: string;
  negativeImpact: number;
  positiveImpact: number;
  range: number;
  color: string;
}

const TornadoChart: React.FC<TornadoChartProps> = ({
  data,
  title = "Análise de Sensibilidade - Gráfico Tornado",
  height = 400,
  className = ""
}) => {
  // Transformar dados para o formato do gráfico tornado
  const transformedData: TornadoDataFormatted[] = data.map(item => ({
    parameter: item.parameter,
    negativeImpact: -Math.abs(item.negativeImpact), // Valores negativos à esquerda
    positiveImpact: Math.abs(item.positiveImpact),   // Valores positivos à direita
    range: item.range,
    color: item.color
  }));

  // Tooltip customizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-red-600">Impacto Negativo:</span>
              <span className="font-medium">{Math.abs(data.negativeImpact).toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-green-600">Impacto Positivo:</span>
              <span className="font-medium">{data.positiveImpact.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-1">
              <span className="text-gray-600">Range Total:</span>
              <span className="font-bold">{data.range.toFixed(1)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Função para formatar labels do eixo Y
  const formatYAxisLabel = (value: string) => {
    // Truncar labels muito longos
    return value.length > 15 ? value.substring(0, 15) + '...' : value;
  };

  // Calcular domínio do eixo X baseado nos dados
  const maxAbsValue = Math.max(
    ...transformedData.map(d => Math.max(Math.abs(d.negativeImpact), Math.abs(d.positiveImpact)))
  );
  const xDomain = [-maxAbsValue * 1.1, maxAbsValue * 1.1];

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {title && (
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            Impacto de cada parâmetro no resultado final (ordenado por sensibilidade)
          </p>
        </div>
      )}
      
      <div className="p-4">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={transformedData}
            layout="horizontal"
            margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            
            {/* Eixo X (valores) */}
            <XAxis 
              type="number"
              domain={xDomain}
              tickFormatter={(value) => `${value.toFixed(0)}`}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            
            {/* Eixo Y (parâmetros) */}
            <YAxis 
              type="category"
              dataKey="parameter"
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={formatYAxisLabel}
              width={75}
            />
            
            {/* Linha de referência central */}
            <ReferenceLine x={0} stroke="#9ca3af" strokeWidth={2} />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Barras negativas (à esquerda) */}
            <Bar 
              dataKey="negativeImpact" 
              stackId="tornado"
              fill="#dc2626"
              radius={[0, 0, 0, 0]}
            >
              {transformedData.map((entry, index) => (
                <Cell key={`negative-${index}`} fill="#dc2626" />
              ))}
            </Bar>
            
            {/* Barras positivas (à direita) */}
            <Bar 
              dataKey="positiveImpact" 
              stackId="tornado"
              fill="#16a34a"
              radius={[0, 0, 0, 0]}
            >
              {transformedData.map((entry, index) => (
                <Cell key={`positive-${index}`} fill="#16a34a" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legenda */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-600 rounded"></div>
            <span className="text-gray-600">Impacto Negativo</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span className="text-gray-600">Impacto Positivo</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          Quanto maior a barra, maior a sensibilidade do parâmetro
        </p>
      </div>
    </div>
  );
};

export default TornadoChart;
