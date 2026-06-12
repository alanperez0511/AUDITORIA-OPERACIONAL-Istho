import * as XLSX from 'xlsx';
import { parseDate } from './date';

const readWorkbook = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        resolve(XLSX.read(data, { type: 'array' }));
      } catch (error) {
        reject(new Error(`Error al procesar archivo: ${error.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsArrayBuffer(file);
  });

const firstSheetJson = (workbook, options) => {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet, options);
};

const normalizeEntrada = (row, index) => ({
  id: `E-${index + 1}`,
  tipo: 'entrada',
  numero: index + 1,
  documentoOrigen: row['Documento Origen'] || '',
  tipoDcto: row['Tipo Dcto'] || 'CO',
  cliente: row['Cliente'] || 'Sin Cliente',
  nit: String(row['NIT'] || ''),
  origen: row['Origen'] || '',
  destino: row['Destino'] || '',
  fechaMovimiento: parseDate(row['Fecha de Ingreso']),
  fechaCierre: parseDate(row['Fecha de Cierre']),
  estado: row['Estado'] || 'Pendiente',
  conductor: row['Conductor'] || '',
  cedula: row['Cédula'] || '',
  placa: row['Placa'] || '',
  telefono: row['Teléfono'] || '',
});

const normalizeSalida = (row, index) => ({
  id: `S-${index + 1}`,
  tipo: 'salida',
  numero: index + 1,
  tipoDcto: 'SA',
  picking: row['Picking'] || '',
  pedidoRemision: row['Pedido/Remision'] || '',
  cliente: row['Cliente'] || 'Sin Cliente',
  nit: String(row['NIT'] || ''),
  sucursalEntrega: row['Sucursal de Entrega'] || '',
  ciudadDespacho: row['Ciudad de Despacho'] || '',
  ciudad: row['Ciudad'] || '',
  fechaMovimiento: parseDate(row['Fecha de Movimiento']),
  fechaCierre: parseDate(row['Fecha de Cierre']),
  estado: row['Estado'] || 'Pendiente',
  conductor: row['Conductor'] || '',
  documentoIdentidad: row['Documento de Identidad'] || '',
  placa: row['Placa'] || '',
  telefono: row['Telefono'] || '',
  modificadoPor: row['Modificado por'] || '',
});

export const parseExcelFileCRM = async (file, tipo) => {
  const workbook = await readWorkbook(file);
  const jsonData = firstSheetJson(workbook);
  const normalize = tipo === 'entrada' ? normalizeEntrada : normalizeSalida;
  return jsonData.map(normalize);
};

export const parseExcelFileWMS = async (file) => {
  const workbook = await readWorkbook(file).catch((error) => {
    throw new Error(`Error al procesar archivo WMS: ${error.message}`);
  });
  const jsonData = firstSheetJson(workbook);
  return jsonData.map((row, index) => ({
    id: `WMS-${index + 1}`,
    ean: String(row['EAN'] || ''),
    referencia: String(row['Referencia'] || ''),
    caja: row['Caja'] || '',
    saldo: Number(row['Saldo']) || 0,
    descripcion: row['Descripcion'] || '',
    unidad: row['Unidad'] || '',
    loteWms: row['LoteWms'] || '',
    lote: row['Lote'] || '',
    fechaIngreso: parseDate(row['FechaDeIngreso']),
    fechaVencimiento: parseDate(row['FechaDeVencimiento']),
    nit: String(row['Nit'] || ''),
    proveedor: row['Proveedor'] || 'Sin Proveedor',
    diasPorVencer: Number(row['DiasxVencer']) || 0,
    ubicacion: row['ubicacion'] || '',
    bodega: row['bodegac'] || '',
    zonaPiso: row['zonapiso'] || '',
    co: row['CO'] || '',
    zonaAlmacen: row['zonaalmacen'] || '',
    estadoCalidad: row['EstadoCalidad'] || '',
    enRecibo: String(row['ubicacion'] || '').toUpperCase().includes('RECIBO'),
  }));
};

const COLUMNAS_ENTRADAS = ['documento origen', 'tipo dcto', 'fecha de ingreso', 'origen', 'destino'];
const COLUMNAS_SALIDAS = ['picking', 'pedido/remision', 'fecha de movimiento', 'sucursal de entrega', 'ciudad de despacho'];

export const detectarTipoArchivoCRM = async (file) => {
  const workbook = await readWorkbook(file).catch((error) => {
    throw new Error(`Error al leer archivo: ${error.message}`);
  });
  const jsonData = firstSheetJson(workbook, { header: 1 });

  if (jsonData.length === 0) return { tipo: null, error: 'El archivo está vacío' };

  const headers = jsonData[0].map((h) => String(h || '').toLowerCase().trim());
  const tieneEntradas = COLUMNAS_ENTRADAS.some((col) => headers.some((h) => h.includes(col)));
  const tieneSalidas = COLUMNAS_SALIDAS.some((col) => headers.some((h) => h.includes(col)));

  if (tieneEntradas && !tieneSalidas) return { tipo: 'entrada', headers };
  if (tieneSalidas && !tieneEntradas) return { tipo: 'salida', headers };
  if (tieneEntradas && tieneSalidas) return { tipo: null, error: 'El archivo contiene columnas de ambos tipos' };
  return { tipo: null, error: 'No se pudo identificar el tipo de archivo. Verifique las columnas.' };
};
