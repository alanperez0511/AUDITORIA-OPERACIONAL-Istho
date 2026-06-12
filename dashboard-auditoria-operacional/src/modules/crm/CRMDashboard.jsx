import { memo, useCallback, useMemo, useState } from 'react';
import {
  ArrowDownToLine, ArrowUpFromLine, Building2, Calendar, CheckCircle2,
  ClipboardList, Download, Filter, Home, Layers, LayoutDashboard,
  MessageCircle, PackageMinus, PackagePlus, RefreshCw,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { TabButton } from '../../components/ui/TabButton';
import { WhatsAppShareModal } from '../../components/ui/WhatsAppShareModal';
import { getTipoDocumentoInfo } from '../../constants/tiposDocumento';
import { formatNumber } from '../../utils/format';
import { useCRMDerivedData, useCRMMetrics, useCRMDateRange } from './hooks/useCRMMetrics';
import { useCRMExport } from './hooks/useCRMExport';
import { buildCRMWhatsAppMessage } from './utils/buildCRMWhatsAppMessage';
import { VistaGeneralCRM } from './views/VistaGeneralCRM';
import { VistaEntradasSalidasCRM } from './views/VistaEntradasSalidasCRM';
import { VistaClientesCRM } from './views/VistaClientesCRM';

const INITIAL_FILTERS = {
  periodo: 'mensual',
  cliente: '',
  estado: '',
  tipoMovimiento: '',
  tipoDocumento: '',
};

const PERIODO_OPTIONS = [
  { value: 'diario',   label: 'Hoy (último día)' },
  { value: 'semanal',  label: 'Últimos 7 días' },
  { value: 'mensual',  label: 'Todo el periodo' },
];

const ESTADO_OPTIONS = [
  { value: 'Cerrada',   label: 'Cerradas' },
  { value: 'Pendiente', label: 'Pendientes' },
];

export default memo(function CRMDashboard({ data, onBack, onReset }) {
  const [activeView, setActiveView] = useState('general');
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [waOpen, setWaOpen] = useState(false);

  const {
    modoVisualizacion, movimientoCounts, documentoCounts, clientesList, filteredData,
  } = useCRMDerivedData(data, filters);

  const metrics = useCRMMetrics(filteredData);
  const dateRange = useCRMDateRange(data);
  const exportReport = useCRMExport({ metrics, filteredData, filters, dateRange, modoVisualizacion });

  const waMessage = useMemo(
    () => (waOpen ? buildCRMWhatsAppMessage({ metrics, filteredData, filters }) : ''),
    [waOpen, metrics, filteredData, filters]
  );

  const resetFilters = useCallback(() => setFilters(INITIAL_FILTERS), []);

  const setTipoMovimiento = useCallback(
    (value) => setFilters((prev) => ({ ...prev, tipoMovimiento: value })),
    []
  );

  const toggleTipoDocumento = useCallback(
    (tipo) => setFilters((prev) => ({ ...prev, tipoDocumento: prev.tipoDocumento === tipo ? '' : tipo })),
    []
  );

  const movimientoTabs = [
    { value: '',        label: 'Todos',    icon: Layers,        count: movimientoCounts.total,    activeClass: 'bg-slate-700 text-white' },
    { value: 'entrada', label: 'Entradas', icon: PackagePlus,   count: movimientoCounts.entradas, activeClass: 'bg-teal-500 text-white' },
    { value: 'salida',  label: 'Salidas',  icon: PackageMinus,  count: movimientoCounts.salidas,  activeClass: 'bg-orange-500 text-white' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-100">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <Home className="w-5 h-5 text-slate-400" />
              </button>
              <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/20">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Auditoría de Cumplidos <span className="text-orange-500">CRM</span>
                </h1>
                <p className="text-sm text-slate-500">
                  {formatNumber(metrics.global.total)} registros • {metrics.global.clientesCount} clientes • {dateRange.minFormatted} al {dateRange.maxFormatted}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost"     size="sm" onClick={onReset}            icon={RefreshCw}>Nuevo</Button>
              <Button variant="secondary" size="sm" onClick={resetFilters}      icon={Filter}>Limpiar filtros</Button>
              <Button variant="success"   size="sm" onClick={() => setWaOpen(true)} icon={MessageCircle}>WhatsApp</Button>
              <Button variant="primary"   size="sm" onClick={exportReport}      icon={Download}>Exportar</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-4">
        <Card className="p-4 mb-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium text-slate-600">Ver:</span>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              {movimientoTabs.map((opt) => {
                const isActive = filters.tipoMovimiento === opt.value;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTipoMovimiento(opt.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      isActive ? opt.activeClass : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {opt.label}
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white/20' : 'bg-slate-200'}`}>
                      {opt.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {filters.tipoMovimiento !== 'salida' && documentoCounts.CO + documentoCounts.CR > 0 && (
              <div className="flex items-center gap-1 ml-2">
                <span className="text-xs text-slate-500 mr-1">Tipo Doc:</span>
                {['CO', 'CR'].map((tipo) => {
                  const info = getTipoDocumentoInfo(tipo);
                  const count = documentoCounts[tipo];
                  if (count === 0) return null;
                  return (
                    <button
                      key={tipo}
                      onClick={() => toggleTipoDocumento(tipo)}
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                        filters.tipoDocumento === tipo ? info.badgeColor : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tipo} ({count})
                    </button>
                  );
                })}
              </div>
            )}

            {filters.tipoMovimiento !== 'entrada' && documentoCounts.SA > 0 && (
              <div className="flex items-center gap-1 ml-2">
                <span className="text-xs text-slate-500 mr-1">Tipo Doc:</span>
                <button
                  onClick={() => toggleTipoDocumento('SA')}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                    filters.tipoDocumento === 'SA' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  SA ({documentoCounts.SA})
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-2">
        <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm w-fit">
          {modoVisualizacion === 'completo' ? (
            <>
              <TabButton active={activeView === 'general'}  onClick={() => setActiveView('general')}  icon={LayoutDashboard} label="Vista General" />
              <TabButton active={activeView === 'entradas'} onClick={() => setActiveView('entradas')} icon={ArrowDownToLine} label="Entradas" badge={metrics.entradas.total} />
              <TabButton active={activeView === 'salidas'}  onClick={() => setActiveView('salidas')}  icon={ArrowUpFromLine} label="Salidas"  badge={metrics.salidas.total} />
              <TabButton active={activeView === 'clientes'} onClick={() => setActiveView('clientes')} icon={Building2}       label="Por Cliente" />
            </>
          ) : modoVisualizacion === 'soloEntradas' ? (
            <>
              <TabButton active={activeView === 'general'}  onClick={() => setActiveView('general')}  icon={LayoutDashboard} label="Vista General" />
              <TabButton active={activeView === 'entradas'} onClick={() => setActiveView('entradas')} icon={ArrowDownToLine} label="Detalle Entradas" badge={metrics.entradas.total} />
              <TabButton active={activeView === 'clientes'} onClick={() => setActiveView('clientes')} icon={Building2}       label="Por Cliente" />
            </>
          ) : (
            <>
              <TabButton active={activeView === 'general'}  onClick={() => setActiveView('general')}  icon={LayoutDashboard} label="Vista General" />
              <TabButton active={activeView === 'salidas'}  onClick={() => setActiveView('salidas')}  icon={ArrowUpFromLine} label="Detalle Salidas" badge={metrics.salidas.total} />
              <TabButton active={activeView === 'clientes'} onClick={() => setActiveView('clientes')} icon={Building2}       label="Por Cliente" />
            </>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-4">
        <Card className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filtros:</span>
            </div>
            <Select value={filters.periodo} onChange={(v) => setFilters((prev) => ({ ...prev, periodo: v }))} options={PERIODO_OPTIONS} placeholder="Periodo" icon={Calendar} />
            <Select value={filters.cliente} onChange={(v) => setFilters((prev) => ({ ...prev, cliente: v }))} options={clientesList} placeholder="Todos los clientes" icon={Building2} />
            <Select value={filters.estado}  onChange={(v) => setFilters((prev) => ({ ...prev, estado: v }))}  options={ESTADO_OPTIONS} placeholder="Todos los estados" icon={CheckCircle2} />
          </div>
        </Card>
      </div>

      <main className="max-w-7xl mx-auto px-6 pb-8">
        {activeView === 'general' && (
          <VistaGeneralCRM
            metrics={metrics}
            filters={filters}
            filteredData={filteredData}
            modoVisualizacion={modoVisualizacion}
            dateRange={dateRange}
          />
        )}
        {activeView === 'entradas' && <VistaEntradasSalidasCRM metrics={metrics} tipo="entradas" />}
        {activeView === 'salidas'  && <VistaEntradasSalidasCRM metrics={metrics} tipo="salidas" />}
        {activeView === 'clientes' && <VistaClientesCRM metrics={metrics} onExport={exportReport} />}

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Centro de Auditoría Operacional • <strong>ISTHO S.A.S.</strong> • {new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
      </main>

      <WhatsAppShareModal
        open={waOpen}
        onClose={() => setWaOpen(false)}
        title="Resumen CRM para WhatsApp"
        subtitle="Mensaje listo para compartir en el grupo del líder de operaciones"
        message={waMessage}
      />
    </div>
  );
});
