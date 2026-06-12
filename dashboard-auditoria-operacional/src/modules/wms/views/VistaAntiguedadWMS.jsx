import { memo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  Building2, CheckCircle2, Clock, Download, Filter, X,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { RANGOS_ANTIGUEDAD } from '../../../constants/antiguedad';
import { TOOLTIP_STYLE } from '../../../constants/colors';
import { formatDate } from '../../../utils/date';
import { formatNumber } from '../../../utils/format';

const estadoVariant = (estado) =>
  estado === 'APROBADO' ? 'success' : estado === 'CUARENTENA' ? 'warning' : 'danger';

export const VistaAntiguedadWMS = memo(function VistaAntiguedadWMS({
  metrics, filters, setFilters, proveedoresList, onExport,
}) {
  return (
    <>
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filtrar por proveedor:</span>
          </div>

          <Select
            value={filters.proveedor}
            onChange={(v) => setFilters((prev) => ({ ...prev, proveedor: v }))}
            options={proveedoresList}
            placeholder="Todos los proveedores"
            icon={Building2}
            className="min-w-[250px]"
          />

          {filters.proveedor && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, proveedor: '' }))}
              className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Limpiar
            </button>
          )}

          <div className="ml-auto text-sm text-slate-500">
            <span className="font-medium text-indigo-600">{formatNumber(metrics.totalEnReciboGlobal)}</span> pallets en RECIBO
          </div>
        </div>
      </Card>

      {metrics.totalEnReciboGlobal === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="p-4 bg-emerald-100 rounded-full mb-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              {filters.proveedor ? `Sin pallets en RECIBO para ${filters.proveedor}` : 'Sin pallets en RECIBO'}
            </h3>
            <p className="text-slate-500 max-w-md">
              {filters.proveedor
                ? 'Este proveedor no tiene pallets pendientes de ubicación. Todos sus productos están correctamente almacenados.'
                : 'No hay pallets pendientes de ubicación en este momento. Todo el inventario está correctamente almacenado.'}
            </p>
            {filters.proveedor && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, proveedor: '' }))}
                className="mt-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition-colors font-medium"
              >
                Ver todos los proveedores
              </button>
            )}
          </div>
        </Card>
      ) : (
        <>
          {metrics.palletsCriticos > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-100 rounded-xl">
                <Clock className="w-8 h-8 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-700">
                  {formatNumber(metrics.palletsCriticos)} pallets con más de 90 días en RECIBO
                </h3>
                <p className="text-red-600/70 text-sm">
                  Estos pallets representan {formatNumber(metrics.unidadesCriticas)} unidades que requieren atención urgente.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {metrics.byAntiguedad.map((rango, i) => (
              <div
                key={i}
                className="rounded-2xl p-4 border-l-4"
                style={{ backgroundColor: `${rango.color}10`, borderLeftColor: rango.color }}
              >
                <p className="text-sm font-medium text-slate-600 mb-1">{rango.label}</p>
                <p className="text-2xl font-bold" style={{ color: rango.color }}>{formatNumber(rango.cantidad)}</p>
                <p className="text-xs text-slate-500">{formatNumber(rango.unidades)} uds.</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Distribución por Antigüedad</h3>
              <div className="h-64">
                {metrics.byAntiguedad.some((r) => r.cantidad > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.byAntiguedad.filter((r) => r.cantidad > 0)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        formatter={(value, name) => [formatNumber(value), name === 'cantidad' ? 'Pallets' : 'Unidades']}
                      />
                      <Bar dataKey="cantidad" name="Pallets" radius={[4, 4, 0, 0]}>
                        {metrics.byAntiguedad.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    <p>Sin datos para mostrar</p>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Composición por Severidad</h3>
              <div className="h-64">
                {metrics.byAntiguedad.some((r) => r.cantidad > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.byAntiguedad.filter((r) => r.cantidad > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="cantidad"
                        nameKey="label"
                      >
                        {metrics.byAntiguedad.filter((r) => r.cantidad > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => formatNumber(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    <p>Sin datos para mostrar</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Pallets con Mayor Tiempo en RECIBO</h3>
                  <p className="text-sm text-slate-500">Ordenados por días de permanencia (mayor a menor)</p>
                </div>
                <Button variant="wms" size="sm" icon={Download} onClick={onExport}>
                  Exportar
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Días</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Caja</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Referencia</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Saldo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Proveedor</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Fecha Ingreso</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {metrics.antiguedadRecibo.slice(0, 50).map((item, i) => {
                    const rango = RANGOS_ANTIGUEDAD.find((r) => item.diasEnRecibo >= r.min && item.diasEnRecibo < r.max);
                    return (
                      <tr key={i} className="hover:bg-indigo-50/50 transition-colors">
                        <td className="px-4 py-3 text-center">
                          <span
                            className="px-2 py-1 rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: rango?.color || '#6B7280' }}
                          >
                            {item.diasEnRecibo}d
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-indigo-600">{item.caja}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{item.referencia}</td>
                        <td className="px-4 py-3 text-sm text-slate-800 text-right font-medium">{formatNumber(item.saldo)}</td>
                        <td className="px-4 py-3 text-sm text-slate-500 max-w-[150px] truncate">{item.proveedor}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{formatDate(item.fechaIngreso)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={estadoVariant(item.estadoCalidad)} size="sm">
                            {item.estadoCalidad}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {metrics.antiguedadRecibo.length > 50 && (
              <div className="p-4 bg-slate-50 border-t border-gray-100 text-center">
                <p className="text-sm text-slate-500">
                  Mostrando 50 de {formatNumber(metrics.antiguedadRecibo.length)} registros
                </p>
              </div>
            )}
          </Card>
        </>
      )}
    </>
  );
});
