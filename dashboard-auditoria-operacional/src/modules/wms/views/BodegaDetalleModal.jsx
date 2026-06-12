import { memo, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  AlertOctagon, Boxes, Building2, Clock, Filter, MapPin, Package, Warehouse, X,
} from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { BODEGAS_ISTHO, getBodegaFisica } from '../../../constants/bodegas';
import { TOOLTIP_STYLE } from '../../../constants/colors';
import { formatNumber } from '../../../utils/format';
import { formatDate } from '../../../utils/date';

const Kpi = memo(function Kpi({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        {label}
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
});

const buildStats = (raw, codigo) => {
  const enBodega = raw.filter((d) => getBodegaFisica(d.zonaPiso) === codigo);
  if (enBodega.length === 0) return null;

  const totalUnidades = enBodega.reduce((s, d) => s + (d.saldo || 0), 0);
  const enRecibo = enBodega.filter((d) => d.enRecibo);
  const totalEnRecibo = enRecibo.length;
  const unidadesRecibo = enRecibo.reduce((s, d) => s + (d.saldo || 0), 0);
  const porcentajeRecibo = enBodega.length > 0 ? (totalEnRecibo / enBodega.length) * 100 : 0;

  // Top referencias
  const refMap = new Map();
  enBodega.forEach((d) => {
    const k = d.referencia || 'Sin ref.';
    const prev = refMap.get(k) || { key: k, pallets: 0, units: 0 };
    prev.pallets += 1;
    prev.units += d.saldo || 0;
    refMap.set(k, prev);
  });
  const topReferencias = [...refMap.values()].sort((a, b) => b.units - a.units).slice(0, 10);

  // Top proveedores
  const provMap = new Map();
  enBodega.forEach((d) => {
    const k = d.proveedor || 'Sin proveedor';
    const prev = provMap.get(k) || { key: k, pallets: 0, units: 0, enRecibo: 0 };
    prev.pallets += 1;
    prev.units += d.saldo || 0;
    if (d.enRecibo) prev.enRecibo += 1;
    provMap.set(k, prev);
  });
  const topProveedores = [...provMap.values()].sort((a, b) => b.pallets - a.pallets).slice(0, 10);

  // Zonas
  const zonaMap = new Map();
  enBodega.forEach((d) => {
    const k = d.zonaPiso || 'Sin zona';
    const prev = zonaMap.get(k) || { key: k, pallets: 0, units: 0, refs: new Set() };
    prev.pallets += 1;
    prev.units += d.saldo || 0;
    prev.refs.add(d.referencia);
    zonaMap.set(k, prev);
  });
  const zonas = [...zonaMap.values()]
    .map((z) => ({ ...z, refsUnicas: z.refs.size }))
    .sort((a, b) => b.pallets - a.pallets);

  // Estados de calidad
  const estadoMap = new Map();
  enBodega.forEach((d) => {
    const k = d.estadoCalidad || 'Sin estado';
    estadoMap.set(k, (estadoMap.get(k) || 0) + 1);
  });
  const estados = [...estadoMap.entries()]
    .map(([estado, count]) => ({ estado, count }))
    .sort((a, b) => b.count - a.count);

  // Antigüedad promedio de pallets en RECIBO (días desde fechaIngreso)
  const hoy = new Date();
  const diasEnRecibo = enRecibo
    .map((d) => d.fechaIngreso ? Math.floor((hoy - new Date(d.fechaIngreso)) / 86400000) : null)
    .filter((n) => n !== null && n >= 0);
  const antiguedadPromedio = diasEnRecibo.length > 0
    ? Math.round(diasEnRecibo.reduce((a, b) => a + b, 0) / diasEnRecibo.length)
    : 0;

  // Fecha más antigua en RECIBO
  const ingresosRecibo = enRecibo.map((d) => d.fechaIngreso).filter(Boolean).map((d) => new Date(d));
  const fechaMasAntigua = ingresosRecibo.length > 0
    ? new Date(Math.min(...ingresosRecibo.map((d) => d.getTime())))
    : null;

  return {
    totalPallets: enBodega.length,
    totalUnidades,
    totalEnRecibo,
    unidadesRecibo,
    porcentajeRecibo,
    topReferencias,
    topProveedores,
    zonas,
    estados,
    antiguedadPromedio,
    fechaMasAntigua,
  };
};

export const BodegaDetalleModal = memo(function BodegaDetalleModal({
  codigo, data, onClose, onAplicarFiltro,
}) {
  const info = BODEGAS_ISTHO[codigo];
  const stats = useMemo(() => buildStats(data, codigo), [data, codigo]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!stats) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-md p-8 text-center" onClick={(e) => e.stopPropagation()}>
          <Warehouse className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">Sin inventario en esta bodega</h3>
          <p className="text-sm text-slate-500 mb-4">{info?.nombre || codigo}</p>
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-700">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const color = info?.color || '#6B7280';
  const nombre = info?.nombre || codigo;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl" style={{ backgroundColor: `${color}20` }}>
              <Warehouse className="w-8 h-8" style={{ color }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: color }}>
                  {codigo}
                </span>
                <h2 className="text-2xl font-bold text-slate-800">{nombre}</h2>
              </div>
              <p className="text-sm text-slate-500">
                {formatNumber(stats.totalPallets)} pallets • {formatNumber(stats.totalUnidades)} unidades • {stats.zonas.length} zonas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Kpi icon={Boxes}        label="Pallets"          value={formatNumber(stats.totalPallets)}    sub={`${formatNumber(stats.totalUnidades)} unidades`} color={color} />
            <Kpi icon={AlertOctagon} label="En RECIBO"        value={formatNumber(stats.totalEnRecibo)}   sub={`${stats.porcentajeRecibo.toFixed(1)}% del total`} color="#DC2626" />
            <Kpi icon={MapPin}       label="Zonas distintas"  value={formatNumber(stats.zonas.length)}    sub={`${formatNumber(stats.topReferencias.length)} top refs.`} color={color} />
            <Kpi icon={Clock}        label="Antigüedad media" value={`${stats.antiguedadPromedio} días`}  sub={stats.fechaMasAntigua ? `Más antiguo: ${formatDate(stats.fechaMasAntigua)}` : 'Sin RECIBO'} color="#F59E0B" />
          </div>

          {/* Estado de calidad badges */}
          {stats.estados.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-6">
              <span className="text-xs font-medium text-slate-500 uppercase">Calidad:</span>
              {stats.estados.map((e) => (
                <Badge
                  key={e.estado}
                  variant={e.estado === 'APROBADO' ? 'success' : e.estado === 'CUARENTENA' ? 'warning' : 'danger'}
                  size="sm"
                >
                  {e.estado}: {formatNumber(e.count)}
                </Badge>
              ))}
            </div>
          )}

          {/* Top referencias + Top proveedores */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-50/60 rounded-2xl p-5 border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-600" />
                Top 10 referencias en {nombre}
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.topReferencias} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => formatNumber(v)} />
                    <YAxis
                      dataKey="key"
                      type="category"
                      width={110}
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      tickFormatter={(v) => v.length > 14 ? v.substring(0, 14) + '…' : v}
                    />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [formatNumber(v), 'Unidades']} />
                    <Bar dataKey="units" radius={[0, 4, 4, 0]}>
                      {stats.topReferencias.map((_, i) => (
                        <Cell key={i} fill={color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-50/60 rounded-2xl p-5 border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Top 10 proveedores en {nombre}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 uppercase">
                      <th className="text-left py-2">Proveedor</th>
                      <th className="text-right py-2">Pallets</th>
                      <th className="text-right py-2">Unidades</th>
                      <th className="text-right py-2 text-red-500">RECIBO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {stats.topProveedores.map((p) => (
                      <tr key={p.key} className="hover:bg-white/70 transition-colors">
                        <td className="py-1.5 text-slate-700 max-w-[180px] truncate" title={p.key}>{p.key}</td>
                        <td className="py-1.5 text-right text-slate-600">{formatNumber(p.pallets)}</td>
                        <td className="py-1.5 text-right text-slate-500">{formatNumber(p.units)}</td>
                        <td className="py-1.5 text-right">
                          {p.enRecibo > 0 ? (
                            <span className="text-red-600 font-medium">{p.enRecibo}</span>
                          ) : (
                            <span className="text-emerald-600">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Zonas */}
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                Zonas/pisos dentro de {nombre}
              </h3>
            </div>
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Zona/Piso</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Pallets</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Unidades</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Refs únicas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.zonas.map((z) => (
                    <tr key={z.key} className="hover:bg-indigo-50/40 transition-colors">
                      <td className="px-4 py-1.5 font-mono text-slate-800">{z.key}</td>
                      <td className="px-4 py-1.5 text-right text-slate-600">{formatNumber(z.pallets)}</td>
                      <td className="px-4 py-1.5 text-right text-slate-500">{formatNumber(z.units)}</td>
                      <td className="px-4 py-1.5 text-right text-slate-500">{formatNumber(z.refsUnicas)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-slate-50/50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            Cerrar
          </button>
          <button
            onClick={() => { onAplicarFiltro(codigo); onClose(); }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-xl text-white shadow-sm"
            style={{ backgroundColor: color }}
          >
            <Filter className="w-4 h-4" />
            Filtrar dashboard por esta bodega
          </button>
        </div>
      </div>
    </div>
  );
});
