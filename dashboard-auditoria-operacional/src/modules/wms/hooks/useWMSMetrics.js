import { useMemo } from 'react';
import { BODEGAS_ISTHO, getBodegaFisica } from '../../../constants/bodegas';
import { RANGOS_ANTIGUEDAD } from '../../../constants/antiguedad';

export function useWMSMetrics(data, filters) {
  return useMemo(() => {
    let filtered = [...data];
    let filteredSinBodegaFisica = [...data];

    if (filters.proveedor) {
      filtered = filtered.filter((d) => d.proveedor === filters.proveedor);
      filteredSinBodegaFisica = filteredSinBodegaFisica.filter((d) => d.proveedor === filters.proveedor);
    }
    if (filters.bodega) {
      filtered = filtered.filter((d) => d.bodega === filters.bodega);
      filteredSinBodegaFisica = filteredSinBodegaFisica.filter((d) => d.bodega === filters.bodega);
    }
    if (filters.estadoCalidad) {
      filtered = filtered.filter((d) => d.estadoCalidad === filters.estadoCalidad);
      filteredSinBodegaFisica = filteredSinBodegaFisica.filter((d) => d.estadoCalidad === filters.estadoCalidad);
    }
    if (filters.bodegaFisica) {
      filtered = filtered.filter((d) => getBodegaFisica(d.zonaPiso) === filters.bodegaFisica);
    }
    if (filters.soloRecibo) {
      filtered = filtered.filter((d) => d.enRecibo);
      filteredSinBodegaFisica = filteredSinBodegaFisica.filter((d) => d.enRecibo);
    }

    const total = filtered.length;
    const totalUnidades = filtered.reduce((sum, d) => sum + d.saldo, 0);

    const enReciboAll = filteredSinBodegaFisica.filter((d) => d.enRecibo);
    const enRecibo = filtered.filter((d) => d.enRecibo);
    const totalEnRecibo = enRecibo.length;
    const unidadesEnRecibo = enRecibo.reduce((sum, d) => sum + d.saldo, 0);
    const porcentajeEnRecibo = total > 0 ? (totalEnRecibo / total * 100) : 0;

    const totalUbicados = total - totalEnRecibo;
    const porcentajeUbicados = total > 0 ? (totalUbicados / total * 100) : 0;

    const byProveedor = {};
    filtered.forEach((d) => {
      if (!byProveedor[d.proveedor]) {
        byProveedor[d.proveedor] = { total: 0, unidades: 0, enRecibo: 0, unidadesRecibo: 0 };
      }
      byProveedor[d.proveedor].total++;
      byProveedor[d.proveedor].unidades += d.saldo;
      if (d.enRecibo) {
        byProveedor[d.proveedor].enRecibo++;
        byProveedor[d.proveedor].unidadesRecibo += d.saldo;
      }
    });

    const proveedoresData = Object.entries(byProveedor)
      .map(([proveedor, stats]) => ({
        proveedor,
        ...stats,
        porcentajeRecibo: stats.total > 0 ? (stats.enRecibo / stats.total * 100) : 0,
      }))
      .sort((a, b) => b.enRecibo - a.enRecibo);

    const byBodega = {};
    filtered.forEach((d) => {
      if (!byBodega[d.bodega]) byBodega[d.bodega] = { total: 0, unidades: 0, enRecibo: 0 };
      byBodega[d.bodega].total++;
      byBodega[d.bodega].unidades += d.saldo;
      if (d.enRecibo) byBodega[d.bodega].enRecibo++;
    });

    const byBodegaFisica = {};
    filtered.forEach((d) => {
      const bodegaFisica = getBodegaFisica(d.zonaPiso);
      if (!byBodegaFisica[bodegaFisica]) {
        byBodegaFisica[bodegaFisica] = { total: 0, unidades: 0, enRecibo: 0, unidadesRecibo: 0 };
      }
      byBodegaFisica[bodegaFisica].total++;
      byBodegaFisica[bodegaFisica].unidades += d.saldo;
      if (d.enRecibo) {
        byBodegaFisica[bodegaFisica].enRecibo++;
        byBodegaFisica[bodegaFisica].unidadesRecibo += d.saldo;
      }
    });

    const byEstado = {};
    filtered.forEach((d) => {
      const estado = d.estadoCalidad || 'Sin Estado';
      if (!byEstado[estado]) byEstado[estado] = { total: 0, enRecibo: 0, unidades: 0 };
      byEstado[estado].total++;
      byEstado[estado].unidades += d.saldo;
      if (d.enRecibo) byEstado[estado].enRecibo++;
    });

    const byZona = {};
    filtered.forEach((d) => {
      const zona = d.zonaPiso || 'Sin Zona';
      if (!byZona[zona]) byZona[zona] = { total: 0, unidades: 0, enRecibo: 0 };
      byZona[zona].total++;
      byZona[zona].unidades += d.saldo;
      if (d.enRecibo) byZona[zona].enRecibo++;
    });

    const hoy = new Date();
    const antiguedadRecibo = enReciboAll.map((d) => {
      if (!d.fechaIngreso) return { ...d, diasEnRecibo: 0 };
      const diff = Math.floor((hoy - new Date(d.fechaIngreso)) / (1000 * 60 * 60 * 24));
      return { ...d, diasEnRecibo: Math.max(0, diff) };
    }).sort((a, b) => b.diasEnRecibo - a.diasEnRecibo);

    const byAntiguedad = RANGOS_ANTIGUEDAD.map((rango) => {
      const items = antiguedadRecibo.filter((d) => d.diasEnRecibo >= rango.min && d.diasEnRecibo < rango.max);
      return {
        ...rango,
        cantidad: items.length,
        unidades: items.reduce((sum, d) => sum + d.saldo, 0),
        items: items.slice(0, 10),
      };
    });

    const palletsCriticos = antiguedadRecibo.filter((d) => d.diasEnRecibo >= 90);
    const unidadesCriticas = palletsCriticos.reduce((sum, d) => sum + d.saldo, 0);

    const totalEnReciboGlobal = enReciboAll.length;
    const unidadesEnReciboGlobal = enReciboAll.reduce((sum, d) => sum + d.saldo, 0);

    return {
      total,
      totalUnidades,
      totalEnRecibo,
      unidadesEnRecibo,
      porcentajeEnRecibo,
      totalUbicados,
      porcentajeUbicados,
      proveedoresData,
      byBodega: Object.entries(byBodega).map(([bodega, stats]) => ({ bodega, ...stats })),
      byBodegaFisica: Object.entries(byBodegaFisica)
        .map(([codigo, stats]) => ({
          codigo,
          nombre: BODEGAS_ISTHO[codigo]?.nombre || codigo,
          color: BODEGAS_ISTHO[codigo]?.color || '#6B7280',
          ...stats,
        }))
        .sort((a, b) => b.total - a.total),
      byEstado: Object.entries(byEstado).map(([estado, stats]) => ({ estado, ...stats })),
      byZona: Object.entries(byZona)
        .map(([zona, stats]) => ({ zona, bodegaFisica: getBodegaFisica(zona), ...stats }))
        .sort((a, b) => b.total - a.total),
      byAntiguedad,
      antiguedadRecibo,
      palletsCriticos: palletsCriticos.length,
      unidadesCriticas,
      totalEnReciboGlobal,
      unidadesEnReciboGlobal,
      datosRecibo: enReciboAll,
      datosFiltrados: filtered,
    };
  }, [data, filters]);
}

export function useWMSFilterLists(data) {
  const proveedoresList = useMemo(
    () => [...new Set(data.map((d) => d.proveedor))].filter(Boolean).sort().map((p) => ({ value: p, label: p })),
    [data]
  );

  const bodegasList = useMemo(
    () => [...new Set(data.map((d) => d.bodega))].filter(Boolean).sort().map((b) => ({ value: b, label: b })),
    [data]
  );

  const bodegasFisicasList = useMemo(() => {
    const bodegas = [...new Set(data.map((d) => getBodegaFisica(d.zonaPiso)))].filter((b) => b !== 'OTROS');
    return bodegas.map((b) => ({ value: b, label: BODEGAS_ISTHO[b]?.nombre || b }));
  }, [data]);

  const estadosList = useMemo(
    () => [...new Set(data.map((d) => d.estadoCalidad))].filter(Boolean).sort().map((e) => ({ value: e, label: e })),
    [data]
  );

  return { proveedoresList, bodegasList, bodegasFisicasList, estadosList };
}
