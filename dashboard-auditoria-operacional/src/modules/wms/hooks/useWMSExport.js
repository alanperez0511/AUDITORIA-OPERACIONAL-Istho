import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import { formatDate } from '../../../utils/date';
import { getBodegaFisica } from '../../../constants/bodegas';

export function useWMSExport(metrics) {
  return useCallback(() => {
    const exportData = metrics.antiguedadRecibo.map((d) => ({
      'Caja': d.caja,
      'Referencia': d.referencia,
      'Descripción': d.descripcion,
      'Saldo': d.saldo,
      'Unidad': d.unidad,
      'Proveedor': d.proveedor,
      'Bodega Sistema': d.bodega,
      'Zona/Piso': d.zonaPiso,
      'Bodega Física': getBodegaFisica(d.zonaPiso),
      'Ubicación': d.ubicacion,
      'Fecha Ingreso': formatDate(d.fechaIngreso),
      'Días en RECIBO': d.diasEnRecibo,
      'Estado Calidad': d.estadoCalidad,
      'Lote WMS': d.loteWms,
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(exportData), 'Pallets en RECIBO');

    const resumenAntiguedad = metrics.byAntiguedad.map((r) => ({
      'Rango': r.label,
      'Cantidad Pallets': r.cantidad,
      'Unidades': r.unidades,
      'Severidad': r.severity,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumenAntiguedad), 'Por Antigüedad');

    const resumenProveedor = metrics.proveedoresData
      .filter((p) => p.enRecibo > 0)
      .map((p) => ({
        'Proveedor': p.proveedor,
        'Total Pallets': p.total,
        'En RECIBO': p.enRecibo,
        'Unidades en RECIBO': p.unidadesRecibo,
        '% en RECIBO': `${p.porcentajeRecibo.toFixed(1)}%`,
      }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumenProveedor), 'Por Proveedor');

    const resumen = [
      { 'Métrica': 'Total Pallets en RECIBO', 'Valor': metrics.totalEnRecibo },
      { 'Métrica': 'Total Unidades en RECIBO', 'Valor': metrics.unidadesEnRecibo },
      { 'Métrica': '% del Inventario en RECIBO', 'Valor': `${metrics.porcentajeEnRecibo.toFixed(2)}%` },
      { 'Métrica': 'Pallets Críticos (>90 días)', 'Valor': metrics.palletsCriticos },
      { 'Métrica': 'Unidades Críticas', 'Valor': metrics.unidadesCriticas },
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumen), 'Resumen');

    XLSX.writeFile(wb, `Auditoria_WMS_RECIBO_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [metrics]);
}
