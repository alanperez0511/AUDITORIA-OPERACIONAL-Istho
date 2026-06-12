import { memo } from 'react';

export const TabButton = memo(function TabButton({ active, onClick, icon: Icon, label, badge, color = 'orange' }) {
  const activeBg = color === 'indigo' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-orange-500 text-white shadow-sm';
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all
        ${active ? activeBg : 'text-slate-600 hover:bg-slate-100'}
      `}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
      {badge !== undefined && (
        <span className={`
          ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold
          ${active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}
        `}>
          {badge}
        </span>
      )}
    </button>
  );
});
