import { memo, useMemo } from 'react';
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { formatDate } from '../../../utils/date';
import { esKardexBasura, CLIENTES_KARDEX_PERMITIDOS } from '../utils/kardex';

const tipoLabel = (filters) => {
  if (filters.tipoMovimiento === 'entrada') return 'Entradas';
  if (filters.tipoMovimiento === 'salida') return 'Salidas';
  if (filters.tipoDocumento === 'CO') return 'Recepciones (CO)';
  if (filters.tipoDocumento === 'CR') return 'Kardex (CR)';
  return 'Movimientos';
};

const KARDEX_TOOLTIP = `Kardex de cliente no autorizado. Solo ${CLIENTES_KARDEX_PERMITIDOS.join(' y ')} pueden generar CR válidos.`;

export const TablaDetalleCRM = memo(function TablaDetalleCRM({ filteredData, filters }) {
  const allFiltered = useMemo(
    () => [...filteredData.entradas, ...filteredData.salidas],
    [filteredData]
  );

  const sortedTop100 = useMemo(() => {
    return [...allFiltered]
      .sort((a, b) => {
        const aBasura = esKardexBasura(a);
        const bBasura = esKardexBasura(b);
        if (aBasura && !bBasura) return -1;
        if (!aBasura && bBasura) return 1;
        return new Date(b.fechaMovimiento || 0) - new Date(a.fechaMovimiento || 0);
      })
      .slice(0, 100);
  }, [allFiltered]);

  const kardexBasuraCount = useMemo(
    () => allFiltered.filter(esKardexBasura).length,
    [allFiltered]
  );

  const headerSubtitle = kardexBasuraCount > 0
    ? `${allFiltered.length} registros • ⚠️ ${kardexBasuraCount} kardex basura para auditar`
    : `${allFiltered.length} registros`;

  const isEntrada = filters.tipoMovimiento === 'entrada' || filters.tipoDocumento === 'CO' || filters.tipoDocumento === 'CR';

  return (
    <Card className="overflow-hidden mt-6">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isEntrada ? (
              <div className="p-2 bg-teal-100 rounded-xl"><ArrowDownToLine className="w-5 h-5 text-teal-600" /></div>
            ) : (
              <div className="p-2 bg-orange-100 rounded-xl"><ArrowUpFromLine className="w-5 h-5 text-orange-500" /></div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Detalle de {tipoLabel(filters)}</h3>
              <p className="text-sm text-slate-500">{headerSubtitle}</p>
            </div>
          </div>

          {kardexBasuraCount > 0 && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 border border-amber-200 rounded-xl"
              title={KARDEX_TOOLTIP}
            >
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">{kardexBasuraCount} kardex a auditar</span>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full">
          <thead className="bg-slate-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                {filters.tipoMovimiento === 'salida' ? 'Picking' : 'Doc. Origen'}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Cliente</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Conductor</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Placa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedTop100.map((item, i) => {
              const basura = esKardexBasura(item);
              return (
                <tr
                  key={i}
                  className={`transition-colors ${
                    basura ? 'bg-amber-50 hover:bg-amber-100'
                      : item.tipo === 'entrada' ? 'hover:bg-teal-50/50'
                        : 'hover:bg-orange-50/50'
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={item.tipoDcto === 'CO' ? 'info' : item.tipoDcto === 'CR' ? 'purple' : 'primary'}
                        size="sm"
                      >
                        {item.tipoDcto}
                      </Badge>
                      {basura && (
                        <span className="text-amber-500" title={KARDEX_TOOLTIP}>⚠️</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {item.tipo === 'salida' ? (
                      <span className="font-mono text-sm text-orange-600">{item.picking || '-'}</span>
                    ) : (
                      <span className={`font-mono text-sm ${basura ? 'text-amber-600' : 'text-teal-600'}`}>
                        {item.documentoOrigen || '-'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm max-w-[200px] truncate">
                    <span className={basura ? 'text-amber-700 font-medium' : 'text-slate-700'}>{item.cliente}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{formatDate(item.fechaMovimiento)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={item.estado === 'Cerrada' ? 'success' : 'warning'} size="sm">
                      {item.estado === 'Cerrada' ? '✓ Cerrada' : '◷ Pendiente'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 max-w-[120px] truncate">{item.conductor || '-'}</td>
                  <td className="px-4 py-3 text-sm text-slate-500 font-mono">{item.placa || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {allFiltered.length > 100 && (
        <div className="p-4 bg-slate-50 border-t border-gray-100 text-center">
          <p className="text-sm text-slate-500">
            Mostrando 100 de {allFiltered.length} registros
          </p>
        </div>
      )}
    </Card>
  );
});
