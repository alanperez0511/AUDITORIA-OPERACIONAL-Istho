import { memo } from 'react';

const VARIANTS = {
  primary:   'bg-orange-500 hover:bg-orange-600 text-white shadow-sm',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
  outline:   'border-2 border-orange-500 text-orange-500 hover:bg-orange-50',
  ghost:     'text-slate-600 hover:bg-slate-100',
  success:   'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm',
  danger:    'bg-red-500 hover:bg-red-600 text-white shadow-sm',
  wms:       'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = memo(function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled,
  icon: Icon,
  className = '',
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-xl
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${SIZES[size]} ${className}
      `}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
      {children}
    </button>
  );
});
