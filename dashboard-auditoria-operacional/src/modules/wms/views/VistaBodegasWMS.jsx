import { memo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { MapPin, Warehouse } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { BODEGAS_ISTHO } from '../../../constants/bodegas';
import { ISTHO_COLORS, TOOLTIP_STYLE } from '../../../constants/colors';
import { formatNumber } from '../../../utils/format';

export const VistaBodegasWMS = memo(function VistaBodegasWMS({ metrics, onBodegaClick }) {
  return (
    <>
      <Card className="p-6 mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <MapPin className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">Estructura de Bodegas ISTHO</h3>
            <p className="text-sm text-slate-600 mb-3">
              El WMS utiliza la bodega central <strong>130</strong> como contenedor principal. Dentro de ella están definidos los layouts
              de las bodegas físicas: <strong>106, 107, 130, 170</strong> (CLIN), carpas <strong>CG, CP, CA</strong>, y clientes especiales
              como <strong>EPIROC (IO)</strong> y <strong>CELTA 149A (BC)</strong>.
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(BODEGAS_ISTHO).map(([codigo, info]) => (
                <span key={codigo} className="px-3 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: info.color }}>
                  {info.nombre}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.byBodegaFisica.slice(0, 4).map((bodega, i) => (
          <button
            key={i}
            onClick={() => onBodegaClick?.(bodega.codigo)}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-left hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer"
            title="Clic para ver detalle de esta bodega"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: `${bodega.color}20` }}>
                <Warehouse className="w-5 h-5" style={{ color: bodega.color }} />
              </div>
              <span className="font-semibold text-slate-800">{bodega.nombre}</span>
            </div>
            <p className="text-3xl font-bold" style={{ color: bodega.color }}>{formatNumber(bodega.total)}</p>
            <p className="text-sm text-slate-500 mt-1">{formatNumber(bodega.unidades)} unidades</p>
            {bodega.enRecibo > 0 && (
              <p className="text-sm text-red-600 mt-2 font-medium">
                ⚠ {bodega.enRecibo} en RECIBO ({(bodega.enRecibo / bodega.total * 100).toFixed(1)}%)
              </p>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Distribución por Bodega Física</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.byBodegaFisica} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis dataKey="nombre" type="category" width={100} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value, name) => [
                    formatNumber(value),
                    name === 'total' ? 'Total Pallets' : name === 'enRecibo' ? 'En RECIBO' : name,
                  ]}
                />
                <Legend />
                <Bar dataKey="total" name="Total Pallets" fill={ISTHO_COLORS.wms} radius={[0, 4, 4, 0]} />
                <Bar dataKey="enRecibo" name="En RECIBO" fill={ISTHO_COLORS.danger} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Proporción del Inventario</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.byBodegaFisica}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="total"
                  nameKey="nombre"
                  label={({ nombre, percent }) => `${nombre} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {metrics.byBodegaFisica.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => formatNumber(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-slate-800">Detalle por Zona/Piso</h3>
          <p className="text-sm text-slate-500">Distribución del inventario por zona dentro de cada bodega física</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Zona/Piso</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Bodega Física</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Pallets</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Unidades</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-red-500 uppercase">En RECIBO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {metrics.byZona.slice(0, 30).map((zona, i) => {
                const bodegaInfo = BODEGAS_ISTHO[zona.bodegaFisica];
                return (
                  <tr key={i} className="hover:bg-indigo-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-sm font-medium text-slate-800">{zona.zona}</td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: bodegaInfo?.color || '#6B7280' }}
                      >
                        {bodegaInfo?.nombre || zona.bodegaFisica}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600">{formatNumber(zona.total)}</td>
                    <td className="px-4 py-3 text-right text-sm text-slate-500">{formatNumber(zona.unidades)}</td>
                    <td className="px-4 py-3 text-right">
                      {zona.enRecibo > 0 ? (
                        <span className="text-sm font-medium text-red-600">{formatNumber(zona.enRecibo)}</span>
                      ) : (
                        <span className="text-sm text-emerald-600">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {metrics.byZona.length > 30 && (
          <div className="p-4 bg-slate-50 border-t border-gray-100 text-center">
            <p className="text-sm text-slate-500">
              Mostrando 30 de {metrics.byZona.length} zonas
            </p>
          </div>
        )}
      </Card>
    </>
  );
});
