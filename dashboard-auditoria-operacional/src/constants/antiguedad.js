export const RANGOS_ANTIGUEDAD = [
  { min: 0, max: 7, label: '< 7 días', color: '#10B981', severity: 'low' },
  { min: 7, max: 30, label: '7-30 días', color: '#84CC16', severity: 'low' },
  { min: 30, max: 90, label: '30-90 días', color: '#F59E0B', severity: 'medium' },
  { min: 90, max: 180, label: '90-180 días', color: '#F97316', severity: 'high' },
  { min: 180, max: 365, label: '180-365 días', color: '#EF4444', severity: 'critical' },
  { min: 365, max: Infinity, label: '> 1 año', color: '#991B1B', severity: 'critical' },
];
