import { memo } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, CheckCircle2, Clock, Target } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { StatCard } from '../../../components/ui/StatCard';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { formatNumber } from '../../../utils/format';

const CONFIGS = {
  entradas: {
    icon: ArrowDownToLine,
    color: 'entrada',
    label: 'Total Entradas',
    title: 'Entradas por Cliente',
    rowClass: 'hover:bg-teal-50/50 transition-colors',
    statsKey: 'entradas',
    totalKey: 'entradasTotal',
    cerradasKey: 'entradasCerradas',
    pendientesKey: 'entradasPendientes',
    cumplimientoKey: 'cumplimientoEntradas',
  },
  salidas: {
    icon: ArrowUpFromLine,
    color: 'salida',
    label: 'Total Salidas',
    title: 'Salidas por Cliente',
    rowClass: 'hover:bg-orange-50/50 transition-colors',
    statsKey: 'salidas',
    totalKey: 'salidasTotal',
    cerradasKey: 'salidasCerradas',
    pendientesKey: 'salidasPendientes',
    cumplimientoKey: 'cumplimientoSalidas',
  },
};

export const VistaEntradasSalidasCRM = memo(function VistaEntradasSalidasCRM({ metrics, tipo }) {
  const cfg = CONFIGS[tipo];
  const Icon = cfg.icon;
  const stats = metrics[cfg.statsKey];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Icon} label={cfg.label} value={formatNumber(stats.total)} color={cfg.color} />
        <StatCard icon={CheckCircle2} label="Cerradas" value={formatNumber(stats.cerradas)} subvalue={`${stats.cumplimiento.toFixed(1)}%`} color="success" />
        <StatCard icon={Clock} label="Pendientes" value={formatNumber(stats.pendientes)} color="warning" />
        <StatCard icon={Target} label="Cumplimiento" value={`${stats.cumplimiento.toFixed(1)}%`} color={stats.cumplimiento >= 80 ? 'success' : 'warning'} />
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-slate-800">{cfg.title}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Cliente</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Total</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Cerradas</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Pendientes</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Cumplimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {metrics.byCliente.filter((c) => c[cfg.totalKey] > 0).map((cliente, i) => (
                <tr key={i} className={cfg.rowClass}>
                  <td className="px-6 py-4 font-medium text-slate-700">{cliente.cliente}</td>
                  <td className="px-6 py-4 text-center font-medium">{cliente[cfg.totalKey]}</td>
                  <td className="px-6 py-4 text-center text-emerald-600 font-medium">{cliente[cfg.cerradasKey]}</td>
                  <td className="px-6 py-4 text-center text-amber-600 font-medium">{cliente[cfg.pendientesKey]}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <ProgressBar value={cliente[cfg.cumplimientoKey]} color="auto" size="sm" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
});
