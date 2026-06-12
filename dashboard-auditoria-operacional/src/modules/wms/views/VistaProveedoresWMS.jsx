import { memo } from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { formatNumber } from '../../../utils/format';

export const VistaProveedoresWMS = memo(function VistaProveedoresWMS({ metrics }) {
  return (
    <Card className="overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-slate-800">Análisis por Proveedor</h3>
        <p className="text-sm text-slate-500">Pallets en RECIBO agrupados por cliente/proveedor</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Proveedor</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Total Pallets</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Unidades</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-red-600 uppercase">En RECIBO</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-red-600 uppercase">Uds. RECIBO</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase">% en RECIBO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {metrics.proveedoresData.map((prov, i) => (
              <tr key={i} className="hover:bg-indigo-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{prov.proveedor}</td>
                <td className="px-6 py-4 text-center text-slate-600">{formatNumber(prov.total)}</td>
                <td className="px-6 py-4 text-center text-slate-500">{formatNumber(prov.unidades)}</td>
                <td className="px-6 py-4 text-center">
                  {prov.enRecibo > 0 ? (
                    <span className="text-red-600 font-bold">{formatNumber(prov.enRecibo)}</span>
                  ) : (
                    <span className="text-emerald-600">0</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center text-red-600">
                  {formatNumber(prov.unidadesRecibo)}
                </td>
                <td className="px-6 py-4 text-center">
                  {prov.enRecibo > 0 ? (
                    <Badge variant="danger" size="sm">{prov.porcentajeRecibo.toFixed(1)}%</Badge>
                  ) : (
                    <Badge variant="success" size="sm">0%</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
});
