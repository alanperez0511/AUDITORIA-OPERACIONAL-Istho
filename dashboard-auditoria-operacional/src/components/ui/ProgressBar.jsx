import { memo } from 'react';

const COLORS = {
  primary: 'bg-orange-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger:  'bg-red-500',
  info:    'bg-blue-500',
  wms:     'bg-indigo-500',
};

const HEIGHTS = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' };

const autoColor = (value) => {
  if (value >= 80) return COLORS.success;
  if (value >= 50) return COLORS.warning;
  return COLORS.danger;
};

export const ProgressBar = memo(function ProgressBar({
  value,
  color = 'primary',
  showLabel = true,
  size = 'md',
}) {
  const fill = color === 'auto' ? autoColor(value) : COLORS[color];
  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 bg-gray-200 rounded-full overflow-hidden ${HEIGHTS[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${fill}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-slate-600 w-12 text-right">{value.toFixed(1)}%</span>
      )}
    </div>
  );
});
