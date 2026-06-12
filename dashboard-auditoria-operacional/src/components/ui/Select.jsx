import { memo } from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = memo(function Select({
  value,
  onChange,
  options,
  placeholder,
  icon: Icon,
  className = '',
}) {
  return (
    <div className={`relative ${className}`}>
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full appearance-none bg-white border border-gray-200 rounded-xl
          py-2.5 pr-10 text-sm text-slate-700 focus:outline-none focus:ring-2
          focus:ring-orange-500 focus:border-orange-500 transition-all
          ${Icon ? 'pl-10' : 'pl-4'}
        `}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  );
});
