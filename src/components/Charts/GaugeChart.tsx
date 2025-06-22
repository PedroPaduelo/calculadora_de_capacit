import React from 'react';

interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  title: string;
  subtitle?: string;
  unit?: string;
  size?: number;
  thickness?: number;
  color?: string;
  backgroundColor?: string;
  showValue?: boolean;
  className?: string;
  thresholds?: {
    good: number;
    warning: number;
    critical: number;
  };
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  min = 0,
  max = 100,
  title,
  subtitle,
  unit = '%',
  size = 200,
  thickness = 20,
  color,
  backgroundColor = '#e5e7eb',
  showValue = true,
  className = "",
  thresholds
}) => {
  // Calcular ângulo baseado no valor
  const normalizedValue = Math.max(min, Math.min(max, value));
  const percentage = (normalizedValue - min) / (max - min);
  const angle = percentage * 180; // Semicírculo (180 graus)

  // Calcular cor baseada em thresholds se não especificada
  const getColor = (): string => {
    if (color) return color;
    
    if (thresholds) {
      if (value >= thresholds.good) return '#10b981'; // Verde
      if (value >= thresholds.warning) return '#f59e0b'; // Amarelo
      if (value >= thresholds.critical) return '#ef4444'; // Vermelho
      return '#6b7280'; // Cinza
    }
    
    // Cor padrão baseada no valor
    if (value >= 80) return '#10b981';
    if (value >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const gaugeColor = getColor();

  // Parâmetros do SVG
  const radius = (size - thickness) / 2;
  const circumference = Math.PI * radius; // Semicírculo
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (circumference * percentage);

  // Centro do círculo
  const center = size / 2;

  // Posição da agulha
  const needleLength = radius - 10;
  const needleAngle = (angle - 90) * (Math.PI / 180); // Converter para radianos e ajustar rotação
  const needleX = center + needleLength * Math.cos(needleAngle);
  const needleY = center + needleLength * Math.sin(needleAngle);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <svg width={size} height={size / 2 + 40} className="transform rotate-0">
          {/* Arco de fundo */}
          <path
            d={`M ${thickness / 2} ${center} A ${radius} ${radius} 0 0 1 ${size - thickness / 2} ${center}`}
            fill="none"
            stroke={backgroundColor}
            strokeWidth={thickness}
            strokeLinecap="round"
          />
          
          {/* Arco de progresso */}
          <path
            d={`M ${thickness / 2} ${center} A ${radius} ${radius} 0 0 1 ${size - thickness / 2} ${center}`}
            fill="none"
            stroke={gaugeColor}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
          
          {/* Agulha */}
          <line
            x1={center}
            y1={center}
            x2={needleX}
            y2={needleY}
            stroke="#374151"
            strokeWidth="3"
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          
          {/* Centro da agulha */}
          <circle
            cx={center}
            cy={center}
            r="6"
            fill="#374151"
          />
          
          {/* Marcações */}
          {[0, 25, 50, 75, 100].map((mark) => {
            const markAngle = ((mark / 100) * 180 - 90) * (Math.PI / 180);
            const innerRadius = radius - thickness / 2 - 5;
            const outerRadius = radius - thickness / 2 + 5;
            
            const x1 = center + innerRadius * Math.cos(markAngle);
            const y1 = center + innerRadius * Math.sin(markAngle);
            const x2 = center + outerRadius * Math.cos(markAngle);
            const y2 = center + outerRadius * Math.sin(markAngle);
            
            return (
              <line
                key={mark}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#9ca3af"
                strokeWidth="2"
              />
            );
          })}
          
          {/* Labels das marcações */}
          {[0, 25, 50, 75, 100].map((mark) => {
            const markAngle = ((mark / 100) * 180 - 90) * (Math.PI / 180);
            const labelRadius = radius - thickness / 2 - 15;
            
            const x = center + labelRadius * Math.cos(markAngle);
            const y = center + labelRadius * Math.sin(markAngle);
            
            return (
              <text
                key={`label-${mark}`}
                x={x}
                y={y + 4}
                textAnchor="middle"
                className="text-xs fill-gray-500"
                fontSize="10"
              >
                {mark}
              </text>
            );
          })}
        </svg>
        
        {/* Valor central */}
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
            <div className="text-2xl font-bold text-gray-800">
              {normalizedValue.toFixed(1)}{unit}
            </div>
            {subtitle && (
              <div className="text-sm text-gray-500 mt-1">
                {subtitle}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Título */}
      <div className="text-center mt-2">
        <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
        
        {/* Indicadores de threshold */}
        {thresholds && (
          <div className="flex items-center justify-center space-x-4 mt-2 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">{'<'}{thresholds.critical}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600">{thresholds.critical}-{thresholds.warning}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">{'>'}{thresholds.good}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GaugeChart;
