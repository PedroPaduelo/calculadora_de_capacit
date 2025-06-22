import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
  required?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Selecione uma opção',
  error,
  className = '',
  required = false
}) => {
  const selectClasses = `
    w-full px-3 py-2 text-sm border rounded-2xl appearance-none cursor-pointer
    transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
    ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}
    ${className}
  `;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={selectClasses}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};