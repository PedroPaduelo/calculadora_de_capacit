import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  hover = false,
  onClick
}) => {
  const baseClasses = 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm';
  const hoverClasses = hover ? 'hover:shadow-md transition-shadow duration-200' : '';
  
  const CardWrapper = hover ? motion.div : 'div';
  
  return (
    <CardWrapper
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
      {...(hover && {
        whileHover: { y: -2 },
        transition: { duration: 0.2 }
      })}
    >
      {(title || subtitle || action) && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
              )}
            </div>
            {action && (
              <div className="flex-shrink-0">
                {action}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
    </CardWrapper>
  );
};