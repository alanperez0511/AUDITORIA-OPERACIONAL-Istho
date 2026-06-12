import { memo, useState } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';
import { TrendingUp, Layers, Activity, Target } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { StatCard } from '../../../components/ui/StatCard';
import { TOOLTIP_STYLE } from '../../../constants/colors';
import { formatNumber } from '../../../utils/format';
import { useABCAnalysis } from '../hooks/useABCAnalysis';

const GROUP_OPTIONS = [
  { value: 'referencia', label: 'Referencia (SKU)' },
  { value: 'proveedor',  label: 'Proveedor' },
];

const METRIC_OPTIONS = [
  { value: 'units',   label: 'Unidades (saldo)' },
  { value: 'pallets', label: 'Pallets / cajas' },
];

const CLASE_STYLES = {
  A: { color: '#DC2626', bg: 'bg-red-50',    border: 'border-l-red-500',    text: 'text-red-700',    label: 'A · Crítico (~80%)' },
  B: { color: '#F59E0B', bg: 'bg-amber-50',  border: 'border-l-amber-500',  text: 'text-amber-700',  label: 'B · Importante (~15%)' },
  C: { color: '#10B981', bg: 'bg-emerald-50',border: 'border-l-emerald-500',text: 'text-emerald-700',label: 'C · Bajo impacto (~5%)' },
};

const ClassKPI = memo(function ClassKPI({ clase, count, share }) {
  const s = CLASE_STYLES[clase];
  return (
    <div className={`rounded-2xl p-5 border-l-4 ${s.bg} ${s.border}`}>
      <div className="flex items-start justify-between mb-2">
        <span className={`text-xs font-bold uppercase tracking-wider ${s.text}`}>Clase {clase}</span>
        <Badge variant="default" size="sm">{share.toFixed(1)}% del volumen</Badge>
      </div>
      <p className="text-3xl font-bold text-slate-800">{formatNumber(count)}</p>
      <p className="text-xs text-slate-500 mt-1">{s.label}</p>
    </div>
  );
});

export const VistaParetoWMS = memo(function VistaParetoWMS({ data }) {
  const [groupBy, setGroupBy] = useState('referencia');
  const [metric, setMetric] = useState('units');

  const { items, abc, abcShare, total } = useABCAnalysis(data, { groupBy, metric });

  const chartData = items.slice(0, 25).map((it) => ({
    name: it.key.length > 18 ? it.key.substring(0, 18) + '…' : it.key,
    fullName: it.key,
    value: it.value,
    cumPct: it.cumPct,
    clase: it.clase,
  }));

  const metricLabel = metric === 'units' ? 'unidades' : 'pallets';

  if (total === 0) {
    return (
      <Card className="p-12">
        <div className="text-center text-slate-500">
          <Activity className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-medium">Sin datos suficientes para el análisis Pareto</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6 mb-6 bg-gradient-to-r from-slate-50 to-indigo-50/50 border-indigo-100">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-800 mb-1">Análisis Pareto / Curva ABC</h3>
            <p className="text-sm text-slate-600">
              Identifica el <strong>20% de elementos que concentra el 80% del inventario</strong>.
              Úsalo para enfocar conteos físicos, controles y auditorías donde más impacta.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600 uppercase">Agrupar por:</span>
            <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200">
              {GROUP_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setGroupBy(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    groupBy === opt.value ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600 uppercase">Métrica:</span>
            <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200">
              {METRIC_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMetric(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    metric === opt.value ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Layers}
          label={groupBy === 'referencia' ? 'Total SKUs' : 'Total proveedores'}
          value={formatNumber(items.length)}
          subvalue={`${formatNumber(total)} ${metricLabel}`}
          color="wms"
        />
        <ClassKPI clase="A" count={abc.A} share={abcShare.A} />
        <ClassKPI clase="B" count={abc.B} share={abcShare.B} />
        <ClassKPI clase="C" count={abc.C} share={abcShare.C} />
      </div>

      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Curva de Pareto</h3>
            <p className="text-sm text-slate-500">
              Top 25 {groupBy === 'referencia' ? 'referencias' : 'proveedores'} y % acumulado del total
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500" /> Clase A</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500" /> Clase B</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500" /> Clase C</span>
          </div>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => formatNumber(v)} />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
                formatter={(value, name) => {
                  if (name === 'cumPct') return [`${value.toFixed(1)}%`, '% Acumulado'];
                  return [formatNumber(value), metric === 'units' ? 'Unidades' : 'Pallets'];
                }}
              />
              <Legend
                payload={[
                  { value: metric === 'units' ? 'Unidades' : 'Pallets', type: 'square', color: '#6366F1' },
                  { value: '% Acumulado', type: 'line', color: '#E65100' },
                ]}
              />
              <Bar yAxisId="left" dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={CLASE_STYLES[entry.clase].color} />
                ))}
              </Bar>
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cumPct"
                stroke="#E65100"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              Detalle ABC — {groupBy === 'referencia' ? 'Referencias' : 'Proveedores'}
            </h3>
            <p className="text-sm text-slate-500">Ordenado por {metricLabel}, mayor a menor</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Target className="w-4 h-4" />
            <span>{formatNumber(items.length)} elementos</span>
          </div>
        </div>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">#</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Clase</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  {groupBy === 'referencia' ? 'Referencia' : 'Proveedor'}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Pallets</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Unidades</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">%</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">% Acum.</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-red-600 uppercase">En RECIBO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.slice(0, 200).map((it) => {
                const s = CLASE_STYLES[it.clase];
                return (
                  <tr key={it.key} className="hover:bg-indigo-50/40 transition-colors">
                    <td className="px-4 py-3 text-center text-sm text-slate-500">{it.rank}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: s.color }}
                      >
                        {it.clase}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 max-w-[300px] truncate" title={it.key}>{it.key}</td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600">{formatNumber(it.pallets)}</td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600">{formatNumber(it.units)}</td>
                    <td className="px-4 py-3 text-right text-sm text-slate-500">{it.pct.toFixed(2)}%</td>
                    <td className={`px-4 py-3 text-right text-sm font-medium ${s.text}`}>{it.cumPct.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-center">
                      {it.enRecibo > 0 ? (
                        <Badge variant="danger" size="sm">{formatNumber(it.enRecibo)}</Badge>
                      ) : (
                        <span className="text-xs text-emerald-600">0</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {items.length > 200 && (
          <div className="p-4 bg-slate-50 border-t border-gray-100 text-center">
            <p className="text-sm text-slate-500">
              Mostrando 200 de {formatNumber(items.length)} elementos
            </p>
          </div>
        )}
      </Card>
    </>
  );
});
