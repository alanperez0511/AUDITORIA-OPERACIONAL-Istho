import { memo, useCallback, useMemo, useState } from 'react';
import {
  AlertOctagon, AlertTriangle, Building2, Clock, Download, Filter, Home,
  LayoutDashboard, MapPin, MessageCircle, RefreshCw, TrendingUp, Warehouse, X,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { TabButton } from '../../components/ui/TabButton';
import { WhatsAppShareModal } from '../../components/ui/WhatsAppShareModal';
import { formatNumber } from '../../utils/format';
import { useWMSMetrics, useWMSFilterLists } from './hooks/useWMSMetrics';
import { useWMSExport } from './hooks/useWMSExport';
import { buildWMSWhatsAppMessage } from './utils/buildWMSWhatsAppMessage';
import { VistaGeneralWMS } from './views/VistaGeneralWMS';
import { VistaBodegasWMS } from './views/VistaBodegasWMS';
import { VistaReciboWMS } from './views/VistaReciboWMS';
import { VistaAntiguedadWMS } from './views/VistaAntiguedadWMS';
import { VistaProveedoresWMS } from './views/VistaProveedoresWMS';
import { VistaParetoWMS } from './views/VistaParetoWMS';
import { BodegaDetalleModal } from './views/BodegaDetalleModal';

const INITIAL_FILTERS = {
  proveedor: '',
  bodega: '',
  bodegaFisica: '',
  estadoCalidad: '',
  soloRecibo: false,
};

export default memo(function WMSDashboard({ data, onBack, onReset }) {
  const [activeView, setActiveView] = useState('general');
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [waOpen, setWaOpen] = useState(false);
  const [bodegaDetalle, setBodegaDetalle] = useState(null); // código de bodega física

  const metrics = useWMSMetrics(data, filters);
  const { proveedoresList, bodegasList, bodegasFisicasList } = useWMSFilterLists(data);
  const exportReport = useWMSExport(metrics);

  const waMessage = useMemo(
    () => (waOpen ? buildWMSWhatsAppMessage({ metrics, filters }) : ''),
    [waOpen, metrics, filters]
  );

  const toggleReciboFilter = useCallback(
    () => setFilters((prev) => ({ ...prev, soloRecibo: !prev.soloRecibo })),
    []
  );

  const clearFilters = useCallback(
    () => setFilters({ proveedor: '', bodega: '', bodegaFisica: '', estadoCalidad: '', soloRecibo: false }),
    []
  );

  const handleBodegaClick = useCallback((codigo) => setBodegaDetalle(codigo), []);
  const handleAplicarFiltroBodega = useCallback(
    (codigo) => setFilters((prev) => ({ ...prev, bodegaFisica: codigo })),
    []
  );

  const hasActiveFilters = filters.proveedor || filters.bodega || filters.bodegaFisica || filters.soloRecibo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <Home className="w-5 h-5 text-slate-400" />
              </button>
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
                <Warehouse className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Auditoría de Inventario <span className="text-indigo-600">WMS</span>
                </h1>
                <p className="text-sm text-slate-500">
                  {formatNumber(data.length)} registros • WMS Copérnico
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onReset} icon={RefreshCw}>
                Nuevo análisis
              </Button>
              <Button variant="success" size="sm" onClick={() => setWaOpen(true)} icon={MessageCircle}>
                WhatsApp
              </Button>
              <Button variant="wms" size="sm" onClick={exportReport} icon={Download}>
                Exportar RECIBO
              </Button>
            </div>
          </div>
        </div>
      </header>

      {metrics.totalEnRecibo > 0 && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertOctagon className="w-8 h-8 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-700">
                ¡Atención! {formatNumber(metrics.totalEnRecibo)} pallets en ubicación "RECIBO"
              </h3>
              <p className="text-red-600/70 text-sm">
                Estas cajas están en un estado de "limbo" y no tienen ubicación física definida en bodega.
                Representan {formatNumber(metrics.unidadesEnRecibo)} unidades ({metrics.porcentajeEnRecibo.toFixed(1)}% del inventario).
              </p>
            </div>
            <button
              onClick={toggleReciboFilter}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filters.soloRecibo ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600 hover:bg-red-200'
              }`}
            >
              {filters.soloRecibo ? 'Ver Todo' : 'Ver Solo RECIBO'}
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm w-fit flex-wrap">
          <TabButton active={activeView === 'general'} onClick={() => setActiveView('general')} icon={LayoutDashboard} label="Vista General" color="indigo" />
          <TabButton active={activeView === 'bodegas'} onClick={() => setActiveView('bodegas')} icon={Warehouse} label="Bodegas Físicas" color="indigo" />
          <TabButton active={activeView === 'recibo'} onClick={() => setActiveView('recibo')} icon={AlertTriangle} label="Pallets en RECIBO" badge={metrics.totalEnRecibo} color="indigo" />
          <TabButton active={activeView === 'antiguedad'} onClick={() => setActiveView('antiguedad')} icon={Clock} label="Antigüedad" badge={metrics.palletsCriticos > 0 ? metrics.palletsCriticos : null} color="indigo" />
          <TabButton active={activeView === 'proveedores'} onClick={() => setActiveView('proveedores')} icon={Building2} label="Por Proveedor" color="indigo" />
          <TabButton active={activeView === 'pareto'} onClick={() => setActiveView('pareto')} icon={TrendingUp} label="Pareto / ABC" color="indigo" />
        </div>
      </div>

      {activeView !== 'antiguedad' && activeView !== 'pareto' && (
        <div className="max-w-7xl mx-auto px-6 pb-4">
          <Card className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Filter className="w-4 h-4" />
                <span className="font-medium">Filtros:</span>
              </div>
              <Select
                value={filters.bodegaFisica}
                onChange={(v) => setFilters((prev) => ({ ...prev, bodegaFisica: v }))}
                options={bodegasFisicasList}
                placeholder="Todas las bodegas físicas"
                icon={MapPin}
                className="min-w-[180px]"
              />
              <Select
                value={filters.proveedor}
                onChange={(v) => setFilters((prev) => ({ ...prev, proveedor: v }))}
                options={proveedoresList}
                placeholder="Todos los proveedores"
                icon={Building2}
                className="min-w-[200px]"
              />
              <Select
                value={filters.bodega}
                onChange={(v) => setFilters((prev) => ({ ...prev, bodega: v }))}
                options={bodegasList}
                placeholder="Bodega sistema"
                icon={Warehouse}
              />
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1">
                  <X className="w-4 h-4" />
                  Limpiar
                </button>
              )}
            </div>
          </Card>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 pb-8">
        {activeView === 'general' && (
          <VistaGeneralWMS
            metrics={metrics}
            filters={filters}
            onBodegaClick={handleBodegaClick}
            onGoToBodegas={() => setActiveView('bodegas')}
          />
        )}
        {activeView === 'bodegas' && <VistaBodegasWMS metrics={metrics} onBodegaClick={handleBodegaClick} />}
        {activeView === 'recibo' && <VistaReciboWMS metrics={metrics} onExport={exportReport} />}
        {activeView === 'antiguedad' && (
          <VistaAntiguedadWMS
            metrics={metrics}
            filters={filters}
            setFilters={setFilters}
            proveedoresList={proveedoresList}
            onExport={exportReport}
          />
        )}
        {activeView === 'proveedores' && <VistaProveedoresWMS metrics={metrics} />}
        {activeView === 'pareto' && <VistaParetoWMS data={metrics.datosFiltrados} />}

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Centro de Auditoría Operacional • <strong>ISTHO S.A.S.</strong> • {new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
      </main>

      <WhatsAppShareModal
        open={waOpen}
        onClose={() => setWaOpen(false)}
        title="Resumen WMS para WhatsApp"
        subtitle="Mensaje listo para compartir en el grupo del líder de operaciones"
        message={waMessage}
      />

      {bodegaDetalle && (
        <BodegaDetalleModal
          codigo={bodegaDetalle}
          data={data}
          onClose={() => setBodegaDetalle(null)}
          onAplicarFiltro={handleAplicarFiltroBodega}
        />
      )}
    </div>
  );
});
