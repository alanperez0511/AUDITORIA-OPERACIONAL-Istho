import { memo } from 'react';
import { Card } from './Card';

const COLOR_STYLES = {
  primary:   { bg: 'bg-orange-50',   icon: 'text-orange-500',  border: 'border-l-orange-500' },
  success:   { bg: 'bg-emerald-50',  icon: 'text-emerald-500', border: 'border-l-emerald-500' },
  warning:   { bg: 'bg-amber-50',    icon: 'text-amber-500',   border: 'border-l-amber-500' },
  danger:    { bg: 'bg-red-50',      icon: 'text-red-500',     border: 'border-l-red-500' },
  secondary: { bg: 'bg-slate-50',    icon: 'text-slate-500',   border: 'border-l-slate-500' },
  info:      { bg: 'bg-blue-50',     icon: 'text-blue-500',    border: 'border-l-blue-500' },
  entrada:   { bg: 'bg-teal-50',     icon: 'text-teal-600',    border: 'border-l-teal-500' },
  salida:    { bg: 'bg-orange-50',   icon: 'text-orange-500',  border: 'border-l-orange-500' },
  wms:       { bg: 'bg-indigo-50',   icon: 'text-indigo-600',  border: 'border-l-indigo-500' },
  recibo:    { bg: 'bg-red-50',      icon: 'text-red-600',     border: 'border-l-red-500' },
};

export const StatCard = memo(function StatCard({ icon: Icon, label, value, subvalue, color = 'primary', small = false }) {
  const styles = COLOR_STYLES[color] || COLOR_STYLES.primary;
  return (
    <Card className={`${small ? 'p-4' : 'p-5'} border-l-4 ${styles.border}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`font-medium text-slate-500 uppercase tracking-wider mb-1 ${small ? 'text-[10px]' : 'text-xs'}`}>{label}</p>
          <p className={`font-bold text-slate-800 ${small ? 'text-xl' : 'text-2xl'}`}>{value}</p>
          {subvalue && <p className={`text-slate-500 mt-1 ${small ? 'text-xs' : 'text-sm'}`}>{subvalue}</p>}
        </div>
        <div className={`${small ? 'p-2' : 'p-3'} rounded-xl ${styles.bg}`}>
          <Icon className={`${small ? 'w-5 h-5' : 'w-6 h-6'} ${styles.icon}`} />
        </div>
      </div>
    </Card>
  );
});
