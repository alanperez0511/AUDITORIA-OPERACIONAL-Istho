import * as XLSX from 'xlsx';
import { parseDate } from '../../../utils/date';
import { esKardexBasura, CLIENTES_KARDEX_PERMITIDOS } from './kardex';

const DATE_FMT = 'dd/mm/yyyy';
const PCT_FMT = '0.0%';
const MS_PER_DAY = 86400000;
const MAX_COL_WIDTH = 50;

const PERIODO_LABELS = {
  diario: 'Solo último día',
  semanal: 'Últimos 7 días',
  mensual: 'Todo el periodo',
};

const MODO_LABELS = {
  completo: 'Entradas + Salidas',
  soloEntradas: 'Solo Entradas',
  soloSalidas: 'Solo Salidas',
};

const generationStamp = () => {
  const now = new Date();
  return now.toLocaleString('es-CO', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const daysSince = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / MS_PER_DAY));
};

const filterDescription = (filters) => {
  const parts = [];
  if (filters.cliente)        parts.push(`Cliente: ${filters.cliente}`);
  if (filters.estado)         parts.push(`Estado: ${filters.estado}`);
  if (filters.tipoMovimiento) parts.push(`Tipo mov.: ${filters.tipoMovimiento}`);
  if (filters.tipoDocumento)  parts.push(`Tipo doc.: ${filters.tipoDocumento}`);
  if (filters.periodo && filters.periodo !== 'mensual') {
    parts.push(`Periodo: ${PERIODO_LABELS[filters.periodo] || filters.periodo}`);
  }
  return parts.length ? parts.join(' · ') : 'Sin filtros (todo el periodo)';
};

// Ancho automático: cabecera + contenido (capped) + padding.
const autoWidths = (rows, headers) =>
  headers.map((h) => {
    const max = rows.reduce((acc, row) => {
      const v = row[h];
      const len = v instanceof Date ? 10 : String(v ?? '').length;
      return Math.max(acc, len);
    }, h.length);
    return { wch: Math.min(MAX_COL_WIDTH, max + 2) };
  });

const applyColumnFormat = (ws, columnIdx, format) => {
  if (!ws['!ref']) return;
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let r = range.s.r + 1; r <= range.e.r; r++) {
    const addr = XLSX.utils.encode_cell({ r, c: columnIdx });
    if (ws[addr]) ws[addr].z = format;
  }
};

const appendJsonSheet = (wb, name, rows, formats = {}) => {
  if (!rows || rows.length === 0) {
    const ws = XLSX.utils.aoa_to_sheet([['Sin registros para este reporte']]);
    ws['!cols'] = [{ wch: 45 }];
    XLSX.utils.book_append_sheet(wb, ws, name);
    return;
  }
  const ws = XLSX.utils.json_to_sheet(rows);
  const headers = Object.keys(rows[0]);
  ws['!cols'] = autoWidths(rows, headers);
  Object.entries(formats).forEach(([colName, fmt]) => {
    const idx = headers.indexOf(colName);
    if (idx >= 0) applyColumnFormat(ws, idx, fmt);
  });
  XLSX.utils.book_append_sheet(wb, ws, name);
};

// --- Hoja: Resumen ---
const buildResumen = (wb, { metrics, filters, dateRange, modoVisualizacion, kardexBasura }) => {
  const aoa = [];
  const pctCells = [];

  aoa.push(['CENTRO DE AUDITORÍA OPERACIONAL — CRM']);
  aoa.push(['ISTHO S.A.S.']);
  aoa.push([]);
  aoa.push(['Generado:', generationStamp()]);
  aoa.push(['Rango de datos:', `${dateRange.minFormatted} al ${dateRange.maxFormatted}`]);
  aoa.push(['Modo:', MODO_LABELS[modoVisualizacion] || modoVisualizacion]);
  aoa.push(['Filtros aplicados:', filterDescription(filters)]);
  aoa.push([]);
  aoa.push(['KPIs PRINCIPALES']);
  aoa.push(['', 'Total', 'Cerradas', 'Pendientes', '% Cumplimiento']);

  ['entradas', 'salidas', 'global'].forEach((key) => {
    const m = metrics[key];
    const label = key === 'entradas' ? 'Entradas (CO/CR)' : key === 'salidas' ? 'Salidas (SA)' : 'GLOBAL';
    aoa.push([label, m.total, m.cerradas, m.pendientes, m.cumplimiento / 100]);
    pctCells.push({ r: aoa.length - 1, c: 4 });
  });

  if (metrics.byTipoDcto.length > 0) {
    aoa.push([]);
    aoa.push(['POR TIPO DE DOCUMENTO']);
    aoa.push(['Código', 'Nombre', 'Descripción', 'Total', 'Cerradas', 'Pendientes', '% Cumplimiento']);
    metrics.byTipoDcto.forEach((t) => {
      aoa.push([t.codigo, t.nombre, t.descripcion, t.total, t.cerradas, t.pendientes, t.cumplimiento / 100]);
      pctCells.push({ r: aoa.length - 1, c: 6 });
    });
  }

  aoa.push([]);
  aoa.push(['⚠ AUDITORÍA DE KARDEX']);
  aoa.push(['Clientes autorizados a generar Kardex (CR):', CLIENTES_KARDEX_PERMITIDOS.join(', ')]);
  aoa.push(['Kardex de clientes no autorizados (basura):', kardexBasura.length]);
  if (kardexBasura.length > 0) {
    const pendientes = kardexBasura.filter((d) => d.estado !== 'Cerrada').length;
    aoa.push(['   de los cuales pendientes:', pendientes]);
    aoa.push(['Ver detalle en la hoja "Kardex Auditar".']);
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [
    { wch: 38 }, { wch: 22 }, { wch: 30 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 18 },
  ];
  pctCells.forEach(({ r, c }) => {
    const addr = XLSX.utils.encode_cell({ r, c });
    if (ws[addr]) ws[addr].z = PCT_FMT;
  });

  XLSX.utils.book_append_sheet(wb, ws, 'Resumen');
};

// --- Hoja: Pendientes (acción inmediata) ---
const buildPendientes = (wb, filteredData) => {
  const pendientes = [...filteredData.entradas, ...filteredData.salidas]
    .filter((d) => d.estado !== 'Cerrada')
    .map((d) => {
      const isEntrada = d.tipo === 'entrada';
      const basura = isEntrada && esKardexBasura(d);
      return {
        'Tipo movimiento': isEntrada ? 'Entrada' : 'Salida',
        'Tipo Dcto': d.tipoDcto || '',
        'Doc / Picking': isEntrada ? (d.documentoOrigen || '') : (d.picking || ''),
        'Cliente': d.cliente,
        'NIT': d.nit || '',
        'Fecha movimiento': d.fechaMovimiento || '',
        'Días pendiente': daysSince(d.fechaMovimiento) ?? '',
        'Estado': d.estado,
        'Conductor': d.conductor || '',
        'Placa': d.placa || '',
        'Kardex basura': basura ? 'Sí' : '',
      };
    })
    .sort((a, b) => {
      const da = a['Fecha movimiento'] instanceof Date ? a['Fecha movimiento'].getTime() : Infinity;
      const db = b['Fecha movimiento'] instanceof Date ? b['Fecha movimiento'].getTime() : Infinity;
      return da - db; // más antiguo primero
    });

  appendJsonSheet(wb, 'Pendientes', pendientes, { 'Fecha movimiento': DATE_FMT });
};

// --- Hoja: Kardex a Auditar ---
const buildKardexAuditar = (wb, filteredData) => {
  const kardex = filteredData.entradas
    .filter(esKardexBasura)
    .map((d) => ({
      'Doc Origen': d.documentoOrigen || '',
      'Cliente': d.cliente,
      'NIT': d.nit || '',
      'Fecha ingreso': d.fechaMovimiento || '',
      'Fecha cierre': d.fechaCierre || '',
      'Días desde ingreso': daysSince(d.fechaMovimiento) ?? '',
      'Estado': d.estado,
      'Origen': d.origen || '',
      'Destino': d.destino || '',
      'Conductor': d.conductor || '',
      'Placa': d.placa || '',
    }))
    .sort((a, b) => {
      const da = a['Fecha ingreso'] instanceof Date ? a['Fecha ingreso'].getTime() : 0;
      const db = b['Fecha ingreso'] instanceof Date ? b['Fecha ingreso'].getTime() : 0;
      return db - da; // más reciente primero
    });

  appendJsonSheet(wb, 'Kardex Auditar', kardex, {
    'Fecha ingreso': DATE_FMT,
    'Fecha cierre': DATE_FMT,
  });
};

// --- Hoja: Por Cliente ---
const buildPorCliente = (wb, metrics) => {
  const rows = metrics.byCliente.map((c) => ({
    'Cliente': c.cliente,
    'Total Entradas': c.entradasTotal,
    'Entradas Cerradas': c.entradasCerradas,
    'Entradas Pendientes': c.entradasPendientes,
    '% Cumpl. Entradas': c.cumplimientoEntradas / 100,
    'Total Salidas': c.salidasTotal,
    'Salidas Cerradas': c.salidasCerradas,
    'Salidas Pendientes': c.salidasPendientes,
    '% Cumpl. Salidas': c.cumplimientoSalidas / 100,
    'Total General': c.total,
    'Cerradas Global': c.cerradas,
    'Pendientes Global': c.total - c.cerradas,
    '% Cumpl. Global': c.cumplimiento / 100,
  }));

  appendJsonSheet(wb, 'Por Cliente', rows, {
    '% Cumpl. Entradas': PCT_FMT,
    '% Cumpl. Salidas': PCT_FMT,
    '% Cumpl. Global': PCT_FMT,
  });
};

// --- Hoja: Evolución diaria ---
const buildEvolucionDiaria = (wb, metrics) => {
  if (metrics.byFecha.length === 0) {
    appendJsonSheet(wb, 'Evolución diaria', []);
    return;
  }

  const rows = metrics.byFecha.map((f) => {
    const total = f.entradas + f.salidas;
    const cerradas = f.entradasCerradas + f.salidasCerradas;
    return {
      'Fecha': parseDate(f.fecha) || '',
      'Entradas': f.entradas,
      'Entradas Cerradas': f.entradasCerradas,
      'Salidas': f.salidas,
      'Salidas Cerradas': f.salidasCerradas,
      'Total': total,
      'Cerradas': cerradas,
      '% Cumplimiento': total > 0 ? cerradas / total : 0,
    };
  });

  appendJsonSheet(wb, 'Evolución diaria', rows, {
    'Fecha': DATE_FMT,
    '% Cumplimiento': PCT_FMT,
  });
};

// --- Hoja: Detalle completo ---
const buildDetalleCompleto = (wb, filteredData) => {
  const all = [...filteredData.entradas, ...filteredData.salidas].sort((a, b) => {
    const da = a.fechaMovimiento ? new Date(a.fechaMovimiento).getTime() : 0;
    const db = b.fechaMovimiento ? new Date(b.fechaMovimiento).getTime() : 0;
    return db - da;
  });

  const rows = all.map((d) => {
    const isEntrada = d.tipo === 'entrada';
    const basura = isEntrada && esKardexBasura(d);
    return {
      'Tipo': isEntrada ? 'Entrada' : 'Salida',
      'Tipo Dcto': d.tipoDcto || '',
      'Doc / Picking': isEntrada ? (d.documentoOrigen || '') : (d.picking || ''),
      'Cliente': d.cliente,
      'NIT': d.nit || '',
      'Detalle': isEntrada
        ? [d.origen, d.destino].filter(Boolean).join(' → ')
        : [d.sucursalEntrega, d.ciudadDespacho].filter(Boolean).join(' / '),
      'Fecha Movimiento': d.fechaMovimiento || '',
      'Fecha Cierre': d.fechaCierre || '',
      'Estado': d.estado,
      'Conductor': d.conductor || '',
      'Placa': d.placa || '',
      'Teléfono': d.telefono || '',
      'Kardex basura': basura ? 'Sí' : '',
    };
  });

  appendJsonSheet(wb, 'Detalle completo', rows, {
    'Fecha Movimiento': DATE_FMT,
    'Fecha Cierre': DATE_FMT,
  });
};

export function buildCRMWorkbook(args) {
  const { filteredData } = args;
  const kardexBasura = filteredData.entradas.filter(esKardexBasura);
  const enriched = { ...args, kardexBasura };

  const wb = XLSX.utils.book_new();
  buildResumen(wb, enriched);
  buildPendientes(wb, filteredData);
  buildKardexAuditar(wb, filteredData);
  buildPorCliente(wb, args.metrics);
  buildEvolucionDiaria(wb, args.metrics);
  buildDetalleCompleto(wb, filteredData);
  return wb;
}
