import React from 'react';
import { HeatmapDataPoint } from '../../types';

interface HeatmapChartProps {
  data: HeatmapDataPoint[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  className?: string;
  cellSize?: number;
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({
  data,
  title = "Mapa de Calor - Análise Combinada",
  xAxisLabel = "Parâmetro X",
  yAxisLabel = "Parâmetro Y",
  className = "",
  cellSize = 60
}) => {
  // Obter valores únicos para os eixos
  const xParameters = Array.from(new Set(data.map(d => d.xParameter)));
  const yParameters = Array.from(new Set(data.map(d => d.yParameter)));

  // Criar matriz de dados
  const matrix: (HeatmapDataPoint | null)[][] = yParameters.map(yParam => 
    xParameters.map(xParam => 
      data.find(d => d.xParameter === xParam && d.yParameter === yParam) || null
    )
  );

  // Função para obter cor baseada no impacto
  const getColor = (impact: number): string => {
    const intensity = impact / 100; // Normalizar para 0-1
    
    if (intensity <= 0.25) {
      // Azul (baixo impacto)
      const alpha = intensity * 4; // 0-1
      return `rgba(59, 130, 246, ${alpha * 0.8 + 0.2})`;
    } else if (intensity <= 0.5) {
      // Verde (impacto moderado)
      const alpha = (intensity - 0.25) * 4; // 0-1
      return `rgba(16, 185, 129, ${alpha * 0.8 + 0.2})`;
    } else if (intensity <= 0.75) {
      // Amarelo/Laranja (alto impacto)
      const alpha = (intensity - 0.5) * 4; // 0-1
      return `rgba(245, 158, 11, ${alpha * 0.8 + 0.2})`;
    } else {
      // Vermelho (impacto crítico)
      const alpha = (intensity - 0.75) * 4; // 0-1
      return `rgba(239, 68, 68, ${alpha * 0.8 + 0.2})`;
    }
  };

  // Função para obter cor do texto baseada no fundo
  const getTextColor = (impact: number): string => {
    return impact > 50 ? '#ffffff' : '#374151';
  };

  // Tooltip personalizado
  const [hoveredCell, setHoveredCell] = React.useState<HeatmapDataPoint | null>(null);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  const handleMouseEnter = (cell: HeatmapDataPoint | null, event: React.MouseEvent) => {
    if (cell) {
      setHoveredCell(cell);
      setMousePosition({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {title && (
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            Impacto da combinação de parâmetros no resultado
          </p>
        </div>
      )}

      <div className="p-4">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Tabela do heatmap */}
            <div className="flex flex-col">
              {/* Cabeçalho com rótulos X */}
              <div className="flex">
                <div 
                  className="flex items-center justify-center text-xs font-medium text-gray-600"
                  style={{ width: cellSize * 1.5, height: cellSize }}
                >
                  {yAxisLabel}
                </div>
                {xParameters.map(xParam => (
                  <div
                    key={xParam}
                    className="flex items-center justify-center text-xs font-medium text-gray-600 border-l border-gray-200"
                    style={{ width: cellSize, height: cellSize }}
                  >
                    <span className="transform -rotate-45 whitespace-nowrap">
                      {xParam}
                    </span>
                  </div>
                ))}
              </div>

              {/* Linhas da matriz */}
              {matrix.map((row, yIndex) => (
                <div key={yParameters[yIndex]} className="flex">
                  {/* Rótulo Y */}
                  <div 
                    className="flex items-center justify-end pr-2 text-xs font-medium text-gray-600 border-t border-gray-200"
                    style={{ width: cellSize * 1.5, height: cellSize }}
                  >
                    {yParameters[yIndex]}
                  </div>

                  {/* Células da linha */}
                  {row.map((cell, xIndex) => (
                    <div
                      key={`${yIndex}-${xIndex}`}
                      className="border border-gray-200 flex items-center justify-center text-xs font-medium cursor-pointer transition-all duration-200 hover:border-gray-400"
                      style={{
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: cell ? getColor(cell.impact) : '#f9fafb',
                        color: cell ? getTextColor(cell.impact) : '#9ca3af'
                      }}
                      onMouseEnter={(e) => handleMouseEnter(cell, e)}
                      onMouseLeave={handleMouseLeave}
                      onMouseMove={handleMouseMove}
                    >
                      {cell ? `${cell.impact.toFixed(0)}%` : 'N/A'}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legenda de cores */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>Baixo Impacto</span>
            <span>Alto Impacto</span>
          </div>
          <div className="flex h-4 rounded">
            <div className="flex-1 bg-blue-200"></div>
            <div className="flex-1 bg-blue-400"></div>
            <div className="flex-1 bg-green-300"></div>
            <div className="flex-1 bg-green-500"></div>
            <div className="flex-1 bg-yellow-400"></div>
            <div className="flex-1 bg-orange-500"></div>
            <div className="flex-1 bg-red-500"></div>
            <div className="flex-1 bg-red-700"></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Rótulo do eixo X */}
        <div className="text-center mt-4">
          <span className="text-sm text-gray-600 font-medium">{xAxisLabel}</span>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 bg-gray-800 text-white p-3 rounded-lg shadow-lg pointer-events-none"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 60,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="text-sm font-medium mb-1">
            {hoveredCell.xParameter} × {hoveredCell.yParameter}
          </div>
          <div className="text-xs">
            <div>X: {hoveredCell.xValue.toFixed(2)}</div>
            <div>Y: {hoveredCell.yValue.toFixed(2)}</div>
            <div className="font-medium mt-1">
              Impacto: {hoveredCell.impact.toFixed(1)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeatmapChart;
