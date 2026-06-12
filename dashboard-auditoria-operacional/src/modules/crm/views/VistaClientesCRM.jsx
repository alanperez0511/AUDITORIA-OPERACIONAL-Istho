import { memo } from 'react';
import { Download } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

const cumplimientoVariant = (val, threshold = 50) =>
  val >= 80 ? 'success' : val >= threshold ? 'warning' : 'danger';

export const VistaClientesCRM = memo(function VistaClientesCRM({ metrics, onExport }) {
  return (
    <Card className="overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Reporte Completo por Cliente</h3>
            <p className="text-sm text-slate-500">Análisis detallado de entradas y salidas por cada cliente</p>
          </div>
          <Button variant="primary" size="sm" icon={Download} onClick={onExport}>Exportar Excel</Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase" rowSpan={2}>Cliente</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-teal-600 uppercase border-b border-teal-200" colSpan={4}>Entradas</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-orange-600 uppercase border-b border-orange-200" colSpan={4}>Salidas</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase border-b border-slate-200" colSpan={2}>Global</th>
            </tr>
            <tr className="bg-slate-50">
              <th className="px-3 py-2 text-center text-[10px] text-teal-600">Total</th>
              <th className="px-3 py-2 text-center text-[10px] text-teal-600">✓</th>
              <th className="px-3 py-2 text-center text-[10px] text-teal-600">◷</th>
              <th className="px-3 py-2 text-center text-[10px] text-teal-600">%</th>
              <th className="px-3 py-2 text-center text-[10px] text-orange-600">Total</th>
              <th className="px-3 py-2 text-center text-[10px] text-orange-600">✓</th>
              <th className="px-3 py-2 text-center text-[10px] text-orange-600">◷</th>
              <th className="px-3 py-2 text-center text-[10px] text-orange-600">%</th>
              <th className="px-3 py-2 text-center text-[10px] text-slate-600">Total</th>
              <th className="px-3 py-2 text-center text-[10px] text-slate-600">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {metrics.byCliente.map((cliente, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs">
                      {cliente.cliente.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-700 text-sm">{cliente.cliente}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-center text-sm bg-teal-50/30">{cliente.entradasTotal || '-'}</td>
                <td className="px-3 py-3 text-center text-sm text-emerald-600 bg-teal-50/30">{cliente.entradasCerradas || '-'}</td>
                <td className="px-3 py-3 text-center text-sm text-amber-600 bg-teal-50/30">{cliente.entradasPendientes || '-'}</td>
                <td className="px-3 py-3 text-center bg-teal-50/30">
                  {cliente.entradasTotal > 0
                    ? <Badge variant={cumplimientoVariant(cliente.cumplimientoEntradas)} size="sm">{cliente.cumplimientoEntradas.toFixed(0)}%</Badge>
                    : '-'}
                </td>
                <td className="px-3 py-3 text-center text-sm bg-orange-50/30">{cliente.salidasTotal || '-'}</td>
                <td className="px-3 py-3 text-center text-sm text-emerald-600 bg-orange-50/30">{cliente.salidasCerradas || '-'}</td>
                <td className="px-3 py-3 text-center text-sm text-amber-600 bg-orange-50/30">{cliente.salidasPendientes || '-'}</td>
                <td className="px-3 py-3 text-center bg-orange-50/30">
                  {cliente.salidasTotal > 0
                    ? <Badge variant={cumplimientoVariant(cliente.cumplimientoSalidas)} size="sm">{cliente.cumplimientoSalidas.toFixed(0)}%</Badge>
                    : '-'}
                </td>
                <td className="px-3 py-3 text-center font-semibold text-slate-700">{cliente.total}</td>
                <td className="px-3 py-3 text-center">
                  <Badge variant={cumplimientoVariant(cliente.cumplimiento)}>{cliente.cumplimiento.toFixed(0)}%</Badge>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-100 font-semibold">
            <tr>
              <td className="px-4 py-3 text-slate-800">TOTALES</td>
              <td className="px-3 py-3 text-center text-teal-700">{metrics.entradas.total}</td>
              <td className="px-3 py-3 text-center text-emerald-600">{metrics.entradas.cerradas}</td>
              <td className="px-3 py-3 text-center text-amber-600">{metrics.entradas.pendientes}</td>
              <td className="px-3 py-3 text-center"><Badge variant="entrada">{metrics.entradas.cumplimiento.toFixed(1)}%</Badge></td>
              <td className="px-3 py-3 text-center text-orange-700">{metrics.salidas.total}</td>
              <td className="px-3 py-3 text-center text-emerald-600">{metrics.salidas.cerradas}</td>
              <td className="px-3 py-3 text-center text-amber-600">{metrics.salidas.pendientes}</td>
              <td className="px-3 py-3 text-center"><Badge variant="salida">{metrics.salidas.cumplimiento.toFixed(1)}%</Badge></td>
              <td className="px-3 py-3 text-center text-slate-800">{metrics.global.total}</td>
              <td className="px-3 py-3 text-center">
                <Badge variant={metrics.global.cumplimiento >= 80 ? 'success' : 'warning'}>{metrics.global.cumplimiento.toFixed(1)}%</Badge>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
});
