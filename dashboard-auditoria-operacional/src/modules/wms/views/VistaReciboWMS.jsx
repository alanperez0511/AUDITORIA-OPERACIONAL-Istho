import { memo } from 'react';
import { Download } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { formatDate } from '../../../utils/date';
import { formatNumber } from '../../../utils/format';

const estadoVariant = (estado) =>
  estado === 'APROBADO' ? 'success' : estado === 'CUARENTENA' ? 'warning' : 'danger';

export const VistaReciboWMS = memo(function VistaReciboWMS({ metrics, onExport }) {
  return (
    <Card className="overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Detalle de Pallets en RECIBO</h3>
            <p className="text-sm text-slate-500">
              {formatNumber(metrics.totalEnRecibo)} cajas sin ubicación física definida
            </p>
          </div>
          <Button variant="wms" size="sm" icon={Download} onClick={onExport}>
            Exportar Listado
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Caja</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Referencia</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Descripción</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Saldo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Proveedor</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Fecha Ingreso</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {metrics.datosRecibo.slice(0, 100).map((item, i) => (
              <tr key={i} className="hover:bg-indigo-50/50 transition-colors">
                <td className="px-4 py-3 font-mono text-sm text-indigo-600">{item.caja}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{item.referencia}</td>
                <td className="px-4 py-3 text-sm text-slate-600 max-w-[200px] truncate">{item.descripcion}</td>
                <td className="px-4 py-3 text-sm text-slate-800 text-right font-medium">{formatNumber(item.saldo)}</td>
                <td className="px-4 py-3 text-sm text-slate-500 max-w-[150px] truncate">{item.proveedor}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{formatDate(item.fechaIngreso)}</td>
                <td className="px-4 py-3">
                  <Badge variant={estadoVariant(item.estadoCalidad)} size="sm">
                    {item.estadoCalidad}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {metrics.datosRecibo.length > 100 && (
        <div className="p-4 bg-slate-50 border-t border-gray-100 text-center">
          <p className="text-sm text-slate-500">
            Mostrando 100 de {formatNumber(metrics.datosRecibo.length)} registros.
            Exporte el reporte para ver todos.
          </p>
        </div>
      )}
    </Card>
  );
});
