import { memo } from 'react';

const VARIANTS = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger:  'bg-red-100 text-red-700',
  primary: 'bg-orange-100 text-orange-700',
  info:    'bg-blue-100 text-blue-700',
  entrada: 'bg-teal-100 text-teal-700',
  salida:  'bg-orange-100 text-orange-700',
  purple:  'bg-purple-100 text-purple-700',
  wms:     'bg-indigo-100 text-indigo-700',
  recibo:  'bg-red-100 text-red-700',
};

const SIZES = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

export const Badge = memo(function Badge({ children, variant = 'default', size = 'md' }) {
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${VARIANTS[variant]} ${SIZES[size]}`}>
      {children}
    </span>
  );
});
