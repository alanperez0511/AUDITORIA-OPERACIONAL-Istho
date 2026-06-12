import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import { buildCRMWorkbook } from '../utils/buildCRMWorkbook';

const generateFilename = () => {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  return `Auditoria_CRM_ISTHO_${date}_${time}.xlsx`;
};

export function useCRMExport({ metrics, filteredData, filters, dateRange, modoVisualizacion }) {
  return useCallback(() => {
    const wb = buildCRMWorkbook({ metrics, filteredData, filters, dateRange, modoVisualizacion });
    XLSX.writeFile(wb, generateFilename());
  }, [metrics, filteredData, filters, dateRange, modoVisualizacion]);
}
