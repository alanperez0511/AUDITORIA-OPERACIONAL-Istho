import { useMemo } from 'react';
import { getDateString, formatDate } from '../../../utils/date';
import { getTipoDocumentoInfo } from '../../../constants/tiposDocumento';

const collectValidDates = (arr) =>
  arr.map((d) => d.fechaMovimiento).filter(Boolean).map((d) => new Date(d)).filter((d) => !isNaN(d.getTime()));

export function useCRMDerivedData(data, filters) {
  const modoVisualizacion = useMemo(() => {
    const tieneEntradas = data.entradas.length > 0;
    const tieneSalidas = data.salidas.length > 0;
    if (tieneEntradas && tieneSalidas) return 'completo';
    if (tieneEntradas && !tieneSalidas) return 'soloEntradas';
    if (!tieneEntradas && tieneSalidas) return 'soloSalidas';
    return 'vacio';
  }, [data]);

  const allData = useMemo(() => [...data.entradas, ...data.salidas], [data]);

  const movimientoCounts = useMemo(
    () => ({ total: allData.length, entradas: data.entradas.length, salidas: data.salidas.length }),
    [allData, data]
  );

  const documentoCounts = useMemo(() => {
    const counts = { CO: 0, CR: 0, SA: 0 };
    allData.forEach((d) => {
      if (d.tipoDcto && counts[d.tipoDcto] !== undefined) counts[d.tipoDcto]++;
    });
    return counts;
  }, [allData]);

  const clientesList = useMemo(
    () => [...new Set(allData.map((d) => d.cliente))].filter(Boolean).sort().map((c) => ({ value: c, label: c })),
    [allData]
  );

  const filteredData = useMemo(() => {
    let entradas = [...data.entradas];
    let salidas = [...data.salidas];

    if (filters.tipoMovimiento === 'entrada') salidas = [];
    else if (filters.tipoMovimiento === 'salida') entradas = [];

    if (filters.cliente) {
      entradas = entradas.filter((d) => d.cliente === filters.cliente);
      salidas = salidas.filter((d) => d.cliente === filters.cliente);
    }

    if (filters.tipoDocumento) {
      entradas = entradas.filter((d) => d.tipoDcto === filters.tipoDocumento);
      salidas = salidas.filter((d) => d.tipoDcto === filters.tipoDocumento);
    }

    if (filters.estado) {
      entradas = entradas.filter((d) => d.estado === filters.estado);
      salidas = salidas.filter((d) => d.estado === filters.estado);
    }

    const allDates = [...collectValidDates(entradas), ...collectValidDates(salidas)];
    if (allDates.length === 0) return { entradas, salidas };

    const maxDataDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
    const referenceDate = new Date(maxDataDate.getFullYear(), maxDataDate.getMonth(), maxDataDate.getDate());
    const referenceDateString = getDateString(referenceDate);

    const filterByPeriod = (arr) => {
      if (!filters.periodo || filters.periodo === 'mensual') return arr;
      return arr.filter((d) => {
        if (!d.fechaMovimiento) return false;
        const fecha = new Date(d.fechaMovimiento);
        if (isNaN(fecha.getTime())) return false;
        const fechaString = getDateString(fecha);
        if (!fechaString) return false;

        switch (filters.periodo) {
          case 'diario':
            return fechaString === referenceDateString;
          case 'semanal': {
            const weekAgo = new Date(referenceDate);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return fechaString >= getDateString(weekAgo) && fechaString <= referenceDateString;
          }
          default:
            return true;
        }
      });
    };

    return { entradas: filterByPeriod(entradas), salidas: filterByPeriod(salidas) };
  }, [data, filters]);

  return { modoVisualizacion, allData, movimientoCounts, documentoCounts, clientesList, filteredData };
}

export function useCRMMetrics(filteredData) {
  return useMemo(() => {
    const ent = filteredData.entradas;
    const sal = filteredData.salidas;

    const totalEntradas = ent.length;
    const entradasCerradas = ent.filter((d) => d.estado === 'Cerrada').length;
    const entradasPendientes = totalEntradas - entradasCerradas;
    const cumplimientoEntradas = totalEntradas > 0 ? (entradasCerradas / totalEntradas * 100) : 0;

    const totalSalidas = sal.length;
    const salidasCerradas = sal.filter((d) => d.estado === 'Cerrada').length;
    const salidasPendientes = totalSalidas - salidasCerradas;
    const cumplimientoSalidas = totalSalidas > 0 ? (salidasCerradas / totalSalidas * 100) : 0;

    const totalGlobal = totalEntradas + totalSalidas;
    const cerradasGlobal = entradasCerradas + salidasCerradas;
    const cumplimientoGlobal = totalGlobal > 0 ? (cerradasGlobal / totalGlobal * 100) : 0;

    const byCliente = {};
    [...ent, ...sal].forEach((d) => {
      if (!byCliente[d.cliente]) {
        byCliente[d.cliente] = { cliente: d.cliente, entradasTotal: 0, entradasCerradas: 0, salidasTotal: 0, salidasCerradas: 0 };
      }
      if (d.tipo === 'entrada') {
        byCliente[d.cliente].entradasTotal++;
        if (d.estado === 'Cerrada') byCliente[d.cliente].entradasCerradas++;
      } else {
        byCliente[d.cliente].salidasTotal++;
        if (d.estado === 'Cerrada') byCliente[d.cliente].salidasCerradas++;
      }
    });

    const clientesData = Object.values(byCliente).map((c) => ({
      ...c,
      entradasPendientes: c.entradasTotal - c.entradasCerradas,
      salidasPendientes: c.salidasTotal - c.salidasCerradas,
      total: c.entradasTotal + c.salidasTotal,
      cerradas: c.entradasCerradas + c.salidasCerradas,
      cumplimientoEntradas: c.entradasTotal > 0 ? (c.entradasCerradas / c.entradasTotal * 100) : 0,
      cumplimientoSalidas: c.salidasTotal > 0 ? (c.salidasCerradas / c.salidasTotal * 100) : 0,
      cumplimiento: (c.entradasTotal + c.salidasTotal) > 0
        ? ((c.entradasCerradas + c.salidasCerradas) / (c.entradasTotal + c.salidasTotal) * 100)
        : 0,
    })).sort((a, b) => b.total - a.total);

    const byFecha = {};
    [...ent, ...sal].forEach((d) => {
      if (!d.fechaMovimiento) return;
      const fecha = getDateString(new Date(d.fechaMovimiento));
      if (!fecha) return;
      if (!byFecha[fecha]) byFecha[fecha] = { fecha, entradas: 0, salidas: 0, entradasCerradas: 0, salidasCerradas: 0 };
      if (d.tipo === 'entrada') {
        byFecha[fecha].entradas++;
        if (d.estado === 'Cerrada') byFecha[fecha].entradasCerradas++;
      } else {
        byFecha[fecha].salidas++;
        if (d.estado === 'Cerrada') byFecha[fecha].salidasCerradas++;
      }
    });

    const byTipoDcto = {};
    [...ent, ...sal].forEach((d) => {
      const tipo = d.tipoDcto || 'SIN_TIPO';
      if (!byTipoDcto[tipo]) byTipoDcto[tipo] = { total: 0, cerradas: 0 };
      byTipoDcto[tipo].total++;
      if (d.estado === 'Cerrada') byTipoDcto[tipo].cerradas++;
    });

    return {
      entradas: { total: totalEntradas, cerradas: entradasCerradas, pendientes: entradasPendientes, cumplimiento: cumplimientoEntradas },
      salidas:  { total: totalSalidas,  cerradas: salidasCerradas,  pendientes: salidasPendientes,  cumplimiento: cumplimientoSalidas },
      global:   {
        total: totalGlobal,
        cerradas: cerradasGlobal,
        pendientes: totalGlobal - cerradasGlobal,
        cumplimiento: cumplimientoGlobal,
        clientesCount: Object.keys(byCliente).length,
      },
      byCliente: clientesData,
      byFecha: Object.values(byFecha).sort((a, b) => a.fecha.localeCompare(b.fecha)),
      byTipoDcto: Object.entries(byTipoDcto).map(([codigo, stats]) => {
        const tipoInfo = getTipoDocumentoInfo(codigo);
        return {
          codigo,
          nombre: tipoInfo.nombre,
          descripcion: tipoInfo.descripcion,
          ...tipoInfo,
          ...stats,
          cumplimiento: stats.total > 0 ? (stats.cerradas / stats.total * 100) : 0,
          pendientes: stats.total - stats.cerradas,
        };
      }),
    };
  }, [filteredData]);
}

export function useCRMDateRange(data) {
  return useMemo(() => {
    const allDates = collectValidDates([...data.entradas, ...data.salidas]);
    if (allDates.length === 0) return { minFormatted: '-', maxFormatted: '-' };

    const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
    return { min: minDate, max: maxDate, minFormatted: formatDate(minDate), maxFormatted: formatDate(maxDate) };
  }, [data]);
}
