export const BODEGAS_ISTHO = {
  '106': { nombre: 'Bodega 106', zonas: ['106A', '106B', '106C', '106D', '106E', '106F', '106ANA', '106ANB', '106MC', '106NC', '106P3', '106P4', '106ZP'], color: '#3B82F6' },
  '107': { nombre: 'Bodega 107', zonas: ['107A', '107B', '107C', '107D', '107ANA', '107ANB', '107ANC', '107AND', '107ANE', '107MC', '107NC', '107P3', '107P4', '107PA', '107ZP'], color: '#8B5CF6' },
  '130': { nombre: 'Bodega 130', zonas: ['130A', '130B', '130C', '130D', '130E', '130MC', '130NC', '130ZP'], color: '#10B981' },
  '170': { nombre: 'Bodega 170', zonas: ['170A', '170MC', '170NC', '170P3', '170PA', '170ZP'], color: '#F59E0B' },
  'IO': { nombre: 'EPIROC', zonas: ['IOA', 'IOB', 'IOC', 'IOD', 'IOF', 'IOG', 'IONC', 'PISO106', 'PISO107', 'PISO130', 'PISO170', 'PISOCG', 'PISOCP'], color: '#EC4899' },
  'BC': { nombre: 'CELTA 149A', zonas: ['BCA', 'BCB', 'BCNC', 'BCP3', 'BCP4', 'BCZP'], color: '#06B6D4' },
  'ESPECIAL': { nombre: 'Zonas Especiales', zonas: ['CANC', 'CAPT', 'CAZP', 'CGM', 'CGNC', 'CGZP', 'CPNC', 'CPZP', 'DOT', 'TEC'], color: '#6B7280' },
};

const ZONAS_ESPECIALES = new Set(['CANC', 'CAPT', 'CAZP', 'CGM', 'CGNC', 'CGZP', 'CPNC', 'CPZP', 'DOT', 'TEC']);

export const getBodegaFisica = (zonaPiso) => {
  if (!zonaPiso) return 'OTROS';
  const zona = zonaPiso.toUpperCase();

  if (zona.startsWith('106')) return '106';
  if (zona.startsWith('107')) return '107';
  if (zona.startsWith('130')) return '130';
  if (zona.startsWith('170')) return '170';
  if (zona.startsWith('IO') || zona.startsWith('PISO')) return 'IO';
  if (zona.startsWith('BC')) return 'BC';
  if (ZONAS_ESPECIALES.has(zona)) return 'ESPECIAL';

  return 'OTROS';
};
