import { memo } from 'react';

export const Card = memo(function Card({ children, className = '', onClick, hover = false }) {
  return (
    <div
      className={`
        bg-white rounded-2xl border border-gray-100 shadow-sm
        ${hover ? 'hover:shadow-lg hover:border-orange-200 cursor-pointer transition-all duration-300' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
});
