import { memo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  AlertCircle, AlertTriangle, Boxes, CheckCircle2, ChevronRight,
  MapPin, Package, AlertOctagon, Warehouse,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { StatCard } from '../../../components/ui/StatCard';
import { ISTHO_COLORS, TOOLTIP_STYLE } from '../../../constants/colors';
import { formatNumber } from '../../../utils/format';

export const VistaGeneralWMS = memo(function VistaGeneralWMS({ metrics, filters, onBodegaClick, onGoToBodegas }) {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Boxes}
          label="Total Pallets"
          value={formatNumber(metrics.total)}
          subvalue={`${formatNumber(metrics.totalUnidades)} unidades`}
          color="wms"
        />
        <StatCard
          icon={CheckCircle2}
          label="Ubicados Correctamente"
          value={formatNumber(metrics.totalUbicados)}
          subvalue={`${metrics.porcentajeUbicados.toFixed(1)}% del total`}
          color="success"
        />
        <StatCard
          icon={AlertOctagon}
          label="En RECIBO (Limbo)"
          value={formatNumber(metrics.totalEnRecibo)}
          subvalue={`${metrics.porcentajeEnRecibo.toFixed(1)}% del total`}
          color="danger"
        />
        <StatCard
          icon={Package}
          label="Unidades en RECIBO"
          value={formatNumber(metrics.unidadesEnRecibo)}
          subvalue="Sin ubicación física"
          color="recibo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Estado de Ubicación</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Ubicados', value: metrics.totalUbicados, color: ISTHO_COLORS.success },
                    { name: 'En RECIBO', value: metrics.totalEnRecibo, color: ISTHO_COLORS.danger },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill={ISTHO_COLORS.success} />
                  <Cell fill={ISTHO_COLORS.danger} />
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => formatNumber(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Pallets en RECIBO por Proveedor</h3>
          <div className="h-64">
            {metrics.proveedoresData.filter((p) => p.enRecibo > 0).length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.proveedoresData.filter((p) => p.enRecibo > 0).slice(0, 6)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis
                    dataKey="proveedor"
                    type="category"
                    width={120}
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    tickFormatter={(v) => v.length > 15 ? v.substring(0, 15) + '...' : v}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value) => [formatNumber(value), 'Pallets en RECIBO']}
                  />
                  <Bar dataKey="enRecibo" name="Pallets en RECIBO" fill={ISTHO_COLORS.danger} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : filters.bodegaFisica ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <AlertCircle className="w-10 h-10 text-blue-400 mb-3" />
                <p className="font-medium text-blue-600 text-center">Filtro de bodega activo</p>
                <p className="text-sm text-slate-500 text-center max-w-[200px]">
                  Los pallets en RECIBO no tienen bodega física asignada.
                  Ver pestaña "Pallets en RECIBO" para el detalle completo.
                </p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3" />
                <p className="font-medium text-emerald-600">Sin pallets en RECIBO</p>
                <p className="text-sm text-slate-500">Todos los pallets están ubicados correctamente</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <MapPin className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Distribución por Bodega Física</h3>
              <p className="text-sm text-slate-500">Inventario real por ubicación física dentro de CLIN</p>
            </div>
          </div>
          <button onClick={onGoToBodegas} className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            Ver detalle <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {metrics.byBodegaFisica.map((bodega, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border-2 transition-all hover:shadow-md cursor-pointer"
              style={{ borderColor: `${bodega.color}40`, backgroundColor: `${bodega.color}08` }}
              onClick={() => onBodegaClick(bodega.codigo)}
              title="Clic para ver detalle de esta bodega"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: bodega.color }} />
                <span className="font-semibold text-slate-700 text-sm truncate">{bodega.nombre}</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: bodega.color }}>{formatNumber(bodega.total)}</p>
              <p className="text-xs text-slate-500">{formatNumber(bodega.unidades)} uds.</p>
              {bodega.enRecibo > 0 && (
                <div className="mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                  <span className="text-xs text-red-600 font-medium">{bodega.enRecibo} RECIBO</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Comparativo por Bodega Física</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.byBodegaFisica}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="nombre"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                  tickFormatter={(v) => v.length > 10 ? v.substring(0, 10) + '...' : v}
                />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [formatNumber(value), 'Total Pallets']} />
                <Legend />
                <Bar dataKey="total" name="Total Pallets" radius={[4, 4, 0, 0]}>
                  {metrics.byBodegaFisica.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">RECIBO por Bodega Física</h3>
          <div className="h-64">
            {metrics.byBodegaFisica.filter((b) => b.enRecibo > 0).length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.byBodegaFisica.filter((b) => b.enRecibo > 0)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis dataKey="nombre" type="category" width={100} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [formatNumber(value), 'Pallets en RECIBO']} />
                  <Bar dataKey="enRecibo" name="En RECIBO" fill={ISTHO_COLORS.danger} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : filters.bodegaFisica ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <AlertCircle className="w-10 h-10 text-blue-400 mb-3" />
                <p className="font-medium text-blue-600 text-center">Filtro de bodega activo</p>
                <p className="text-sm text-slate-500 text-center max-w-[200px]">
                  Los pallets en RECIBO no tienen bodega física asignada.
                </p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3" />
                <p className="font-medium text-emerald-600">Sin pallets en RECIBO</p>
                <p className="text-sm text-slate-500">Todos los pallets están ubicados correctamente</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Distribución por Bodega Sistema (WMS)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.byBodega.map((bodega, i) => (
            <div key={i} className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <Warehouse className="w-4 h-4 text-indigo-600" />
                <span className="font-medium text-slate-800">{bodega.bodega}</span>
              </div>
              <p className="text-2xl font-bold text-indigo-600">{formatNumber(bodega.total)}</p>
              <p className="text-xs text-slate-500">{formatNumber(bodega.unidades)} unidades</p>
              {bodega.enRecibo > 0 && (
                <p className="text-xs text-red-600 mt-1">{bodega.enRecibo} en RECIBO</p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </>
  );
});
