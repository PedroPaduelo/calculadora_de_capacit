/**
 * Utilitários para formatação consistente de números
 */

/**
 * Formata um número decimal com um número específico de casas decimais
 */
export const formatDecimal = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals);
};

/**
 * Formata um número como porcentagem com casas decimais específicas
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Formata um número como porcentagem quando o valor já está em formato percentual (0-100)
 */
export const formatPercentageValue = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Formata um número inteiro sem casas decimais
 */
export const formatInteger = (value: number): string => {
  return Math.round(value).toString();
};

/**
 * Formata um número com separadores de milhares e casas decimais específicas
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Converte e formata um valor decimal para porcentagem
 * Ex: 0.8543 -> "85.43%"
 */
export const toPercentage = (value: number, decimals: number = 2): string => {
  return formatPercentage(value, decimals);
};

/**
 * Arredonda um número para um número específico de casas decimais (retorna número)
 */
export const roundToDecimals = (value: number, decimals: number = 2): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

/**
 * Formata tempo em segundos para formato legível
 */
export const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${formatDecimal(seconds, 0)}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${formatDecimal(remainingSeconds, 0)}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
};

/**
 * Formata um valor de FTE (Full Time Equivalent)
 */
export const formatFTE = (value: number): string => {
  return formatDecimal(value, 2);
};