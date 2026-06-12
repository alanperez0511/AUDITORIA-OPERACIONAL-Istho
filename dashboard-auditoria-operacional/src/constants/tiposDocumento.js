export const TIPO_DOCUMENTO = {
  CO: {
    codigo: 'CO',
    nombre: 'Recepción',
    descripcion: 'Creación de cajas - Ingreso de mercancía',
    color: 'recepcion',
    categoria: 'entrada',
    bgColor: 'bg-blue-50',
    borderColor: 'border-l-blue-500',
    textColor: 'text-blue-600',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  CR: {
    codigo: 'CR',
    nombre: 'Kardex',
    descripcion: 'Movimiento interno de kardex',
    color: 'kardex',
    categoria: 'entrada',
    bgColor: 'bg-purple-50',
    borderColor: 'border-l-purple-500',
    textColor: 'text-purple-600',
    badgeColor: 'bg-purple-100 text-purple-700',
  },
  SA: {
    codigo: 'SA',
    nombre: 'Salida',
    descripcion: 'Picking / Despacho de mercancía',
    color: 'salidaDoc',
    categoria: 'salida',
    bgColor: 'bg-orange-50',
    borderColor: 'border-l-orange-500',
    textColor: 'text-orange-600',
    badgeColor: 'bg-orange-100 text-orange-700',
  },
};

const TIPO_DESCONOCIDO = {
  color: 'secondary',
  categoria: 'otro',
  bgColor: 'bg-slate-50',
  borderColor: 'border-l-slate-400',
  textColor: 'text-slate-600',
  badgeColor: 'bg-slate-100 text-slate-700',
};

export const getTipoDocumentoInfo = (codigo) =>
  TIPO_DOCUMENTO[codigo] || {
    codigo,
    nombre: codigo,
    descripcion: 'Tipo desconocido',
    ...TIPO_DESCONOCIDO,
  };
