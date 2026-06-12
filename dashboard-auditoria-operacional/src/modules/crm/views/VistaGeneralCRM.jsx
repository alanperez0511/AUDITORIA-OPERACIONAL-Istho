import { memo, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar,
} from 'recharts';
import {
  Activity, AlertTriangle, ArrowDownToLine, ArrowUpFromLine,
  CheckCircle2, Clock, Layers, Package, PackageMinus, Target,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { StatCard } from '../../../components/ui/StatCard';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { ISTHO_COLORS, TOOLTIP_STYLE_BORDERLESS } from '../../../constants/colors';
import { formatDate, formatDateShort } from '../../../utils/date';
import { formatNumber } from '../../../utils/format';
import { TablaDetalleCRM } from './TablaDetalleCRM';

const cumplimientoColor = (val) =>
  val >= 80 ? 'success' : val >= 50 ? 'warning' : 'danger';

const cumplimientoTextColor = (val) =>
  val >= 80 ? 'text-emerald-600' : val >= 50 ? 'text-amber-600' : 'text-red-600';

const ResumenSoloModo = memo(function ResumenSoloModo({ modoVisualizacion, metrics }) {
  const isEntradas = modoVisualizacion === 'soloEntradas';
  const stats = isEntradas ? metrics.entradas : metrics.salidas;

  return (
    <Card className={`p-6 mb-6 border-l-4 ${isEntradas ? 'border-l-teal-500' : 'border-l-orange-500'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isEntradas ? 'bg-teal-100' : 'bg-orange-100'}`}>
            {isEntradas
              ? <ArrowDownToLine className="w-6 h-6 text-teal-600" />
              : <ArrowUpFromLine className="w-6 h-6 text-orange-500" />}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-lg">
              {isEntradas ? 'Resumen de Entradas' : 'Resumen de Salidas'}
            </h3>
            <p className="text-sm text-slate-500">
              {isEntradas ? `${stats.total} recepciones en el periodo` : `${stats.total} despachos en el periodo`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-slate-800">{stats.cumplimiento.toFixed(1)}%</p>
          <p className="text-sm text-slate-500">Cumplimiento</p>
        </div>
      </div>
      <ProgressBar value={stats.cumplimiento} color="auto" size="lg" showLabel={false} />
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="p-3 bg-emerald-50 rounded-xl text-center">
          <p className="text-2xl font-bold text-emerald-600">{stats.cerradas}</p>
          <p className="text-sm text-emerald-700">Cerradas ✓</p>
        </div>
        <div className="p-3 bg-amber-50 rounded-xl text-center">
          <p className="text-2xl font-bold text-amber-600">{stats.pendientes}</p>
          <p className="text-sm text-amber-700">Pendientes ◷</p>
        </div>
      </div>
    </Card>
  );
});

export const VistaGeneralCRM = memo(function VistaGeneralCRM({
  metrics, filters, filteredData, modoVisualizacion, dateRange,
}) {
  const radialData = useMemo(() => [
    { name: 'Entradas', value: metrics.entradas.cumplimiento, fill: ISTHO_COLORS.entrada },
    { name: 'Salidas',  value: metrics.salidas.cumplimiento,  fill: ISTHO_COLORS.salida  },
  ], [metrics]);

  const clientesCriticos = useMemo(
    () => metrics.byCliente.filter((c) => c.cumplimiento < 50 && c.total > 0).slice(0, 6),
    [metrics.byCliente]
  );
  const hayCriticos = clientesCriticos.length > 0;

  return (
    <>
      {/* Indicador de modo */}
      {modoVisualizacion !== 'completo' && (
        <div className={`mb-6 p-4 rounded-2xl border ${modoVisualizacion === 'soloEntradas' ? 'bg-teal-50 border-teal-200' : 'bg-orange-50 border-orange-200'}`}>
          <div className="flex items-center gap-3">
            {modoVisualizacion === 'soloEntradas'
              ? <ArrowDownToLine className="w-5 h-5 text-teal-600" />
              : <ArrowUpFromLine className="w-5 h-5 text-orange-500" />}
            <div>
              <p className={`font-medium ${modoVisualizacion === 'soloEntradas' ? 'text-teal-700' : 'text-orange-700'}`}>
                Modo: Solo {modoVisualizacion === 'soloEntradas' ? 'Entradas' : 'Salidas'}
              </p>
              <p className={`text-sm ${modoVisualizacion === 'soloEntradas' ? 'text-teal-600' : 'text-orange-600'}`}>
                Se cargó únicamente el archivo de {modoVisualizacion === 'soloEntradas' ? 'entradas' : 'salidas'}. Los KPIs muestran solo esa información.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      {modoVisualizacion === 'completo' ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Layers} label="Total Movimientos" value={formatNumber(metrics.global.total)} subvalue={`${metrics.entradas.total} ent. / ${metrics.salidas.total} sal.`} color="secondary" />
          <StatCard icon={CheckCircle2} label="Evidencias Cerradas" value={formatNumber(metrics.global.cerradas)} subvalue={`${metrics.global.cumplimiento.toFixed(1)}% cumplimiento`} color="success" />
          <StatCard icon={Clock} label="Pendientes" value={formatNumber(metrics.global.pendientes)} subvalue="Requieren evidencias" color="warning" />
          <StatCard icon={Target} label="% Cumplimiento Global" value={`${metrics.global.cumplimiento.toFixed(1)}%`} subvalue={metrics.global.cumplimiento >= 80 ? 'Meta alcanzada' : 'Por debajo de meta'} color={cumplimientoColor(metrics.global.cumplimiento)} />
        </div>
      ) : modoVisualizacion === 'soloEntradas' ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={ArrowDownToLine} label="Total Entradas" value={formatNumber(metrics.entradas.total)} subvalue="Recepciones y Kardex" color="entrada" />
          <StatCard icon={CheckCircle2} label="Cerradas" value={formatNumber(metrics.entradas.cerradas)} subvalue={`${metrics.entradas.cumplimiento.toFixed(1)}% cumplimiento`} color="success" />
          <StatCard icon={Clock} label="Pendientes" value={formatNumber(metrics.entradas.pendientes)} subvalue="Requieren evidencias" color="warning" />
          <StatCard icon={Target} label="% Cumplimiento" value={`${metrics.entradas.cumplimiento.toFixed(1)}%`} subvalue={metrics.entradas.cumplimiento >= 80 ? 'Meta alcanzada' : 'Por debajo de meta'} color={cumplimientoColor(metrics.entradas.cumplimiento)} />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={ArrowUpFromLine} label="Total Salidas" value={formatNumber(metrics.salidas.total)} subvalue="Pickings y Despachos" color="salida" />
          <StatCard icon={CheckCircle2} label="Cerradas" value={formatNumber(metrics.salidas.cerradas)} subvalue={`${metrics.salidas.cumplimiento.toFixed(1)}% cumplimiento`} color="success" />
          <StatCard icon={Clock} label="Pendientes" value={formatNumber(metrics.salidas.pendientes)} subvalue="Requieren evidencias" color="warning" />
          <StatCard icon={Target} label="% Cumplimiento" value={`${metrics.salidas.cumplimiento.toFixed(1)}%`} subvalue={metrics.salidas.cumplimiento >= 80 ? 'Meta alcanzada' : 'Por debajo de meta'} color={cumplimientoColor(metrics.salidas.cumplimiento)} />
        </div>
      )}

      {/* Comparativo (solo modo completo) */}
      {modoVisualizacion === 'completo' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-5 border-l-4 border-l-teal-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-xl"><ArrowDownToLine className="w-5 h-5 text-teal-600" /></div>
                <div>
                  <h3 className="font-semibold text-slate-800">Entradas / Recepciones</h3>
                  <p className="text-xs text-slate-500">{metrics.entradas.total} registros</p>
                </div>
              </div>
              <Badge variant="entrada" size="lg">{metrics.entradas.cumplimiento.toFixed(1)}%</Badge>
            </div>
            <ProgressBar value={metrics.entradas.cumplimiento} color="auto" size="lg" showLabel={false} />
            <div className="flex justify-between mt-3 text-sm">
              <span className="text-emerald-600 font-medium">✓ {metrics.entradas.cerradas} cerradas</span>
              <span className="text-amber-600 font-medium">◷ {metrics.entradas.pendientes} pendientes</span>
            </div>
          </Card>

          <Card className="p-5 border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-xl"><ArrowUpFromLine className="w-5 h-5 text-orange-500" /></div>
                <div>
                  <h3 className="font-semibold text-slate-800">Salidas / Pickings</h3>
                  <p className="text-xs text-slate-500">{metrics.salidas.total} registros</p>
                </div>
              </div>
              <Badge variant="salida" size="lg">{metrics.salidas.cumplimiento.toFixed(1)}%</Badge>
            </div>
            <ProgressBar value={metrics.salidas.cumplimiento} color="auto" size="lg" showLabel={false} />
            <div className="flex justify-between mt-3 text-sm">
              <span className="text-emerald-600 font-medium">✓ {metrics.salidas.cerradas} cerradas</span>
              <span className="text-amber-600 font-medium">◷ {metrics.salidas.pendientes} pendientes</span>
            </div>
          </Card>
        </div>
      )}

      {modoVisualizacion !== 'completo' && (
        <ResumenSoloModo modoVisualizacion={modoVisualizacion} metrics={metrics} />
      )}

      {/* Por Tipo de Documento */}
      {metrics.byTipoDcto.length > 0 && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Por Tipo de Documento</h3>
          <p className="text-sm text-slate-500 mb-4">Clasificación según origen del movimiento</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.byTipoDcto.map((tipo, i) => {
              const IconComp = tipo.categoria === 'entrada' ? (tipo.codigo === 'CO' ? Package : Activity) : PackageMinus;
              return (
                <div key={i} className={`p-4 rounded-xl border-l-4 ${tipo.bgColor} ${tipo.borderColor}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${tipo.codigo === 'CO' ? 'bg-blue-100' : tipo.codigo === 'CR' ? 'bg-purple-100' : 'bg-orange-100'}`}>
                        <IconComp className={`w-5 h-5 ${tipo.textColor}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">{tipo.nombre}</span>
                          <Badge variant={tipo.codigo === 'CO' ? 'info' : tipo.codigo === 'CR' ? 'purple' : 'primary'} size="sm">{tipo.codigo}</Badge>
                        </div>
                        <p className="text-xs text-slate-500">{tipo.descripcion}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-600">Total: <strong>{tipo.total}</strong></span>
                    <span className={`font-bold ${cumplimientoTextColor(tipo.cumplimiento)}`}>{tipo.cumplimiento.toFixed(1)}%</span>
                  </div>
                  <ProgressBar value={tipo.cumplimiento} color="auto" size="sm" showLabel={false} />
                  <div className="flex justify-between mt-2 text-xs">
                    <span className="text-emerald-600">✓ {tipo.cerradas}</span>
                    <span className="text-amber-600">◷ {tipo.pendientes}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Distribución por Estado + Cumplimiento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Distribución por Estado</h3>
            <p className="text-sm text-slate-500">
              {modoVisualizacion === 'completo' ? 'Entradas vs Salidas' : modoVisualizacion === 'soloEntradas' ? 'Solo Entradas' : 'Solo Salidas'}
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {modoVisualizacion === 'completo' ? (
                  <Pie data={[
                    { name: 'Entradas Cerradas',  value: metrics.entradas.cerradas,    fill: '#00897B' },
                    { name: 'Entradas Pendientes', value: metrics.entradas.pendientes, fill: '#B2DFDB' },
                    { name: 'Salidas Cerradas',    value: metrics.salidas.cerradas,    fill: '#E65100' },
                    { name: 'Salidas Pendientes',  value: metrics.salidas.pendientes,  fill: '#FFCC80' },
                  ]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    <Cell fill="#00897B" /><Cell fill="#B2DFDB" /><Cell fill="#E65100" /><Cell fill="#FFCC80" />
                  </Pie>
                ) : modoVisualizacion === 'soloEntradas' ? (
                  <Pie data={[
                    { name: 'Cerradas',    value: metrics.entradas.cerradas,    fill: '#00897B' },
                    { name: 'Pendientes',  value: metrics.entradas.pendientes,  fill: '#B2DFDB' },
                  ]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    <Cell fill="#00897B" /><Cell fill="#B2DFDB" />
                  </Pie>
                ) : (
                  <Pie data={[
                    { name: 'Cerradas',    value: metrics.salidas.cerradas,    fill: '#E65100' },
                    { name: 'Pendientes',  value: metrics.salidas.pendientes,  fill: '#FFCC80' },
                  ]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    <Cell fill="#E65100" /><Cell fill="#FFCC80" />
                  </Pie>
                )}
                <Tooltip contentStyle={TOOLTIP_STYLE_BORDERLESS} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          {modoVisualizacion === 'completo' ? (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Cumplimiento por Tipo</h3>
                <p className="text-sm text-slate-500">% Cumplimiento por tipo</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={radialData} startAngle={180} endAngle={0}>
                    <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={10} />
                    <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Cumplimiento']} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-teal-500" /><span className="text-sm text-slate-600">Entradas: {metrics.entradas.cumplimiento.toFixed(1)}%</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500" /><span className="text-sm text-slate-600">Salidas: {metrics.salidas.cumplimiento.toFixed(1)}%</span></div>
              </div>
            </>
          ) : (() => {
            const stats = modoVisualizacion === 'soloEntradas' ? metrics.entradas : metrics.salidas;
            const ringColor = stats.cumplimiento >= 80 ? 'border-emerald-500 bg-emerald-50'
              : stats.cumplimiento >= 50 ? 'border-amber-500 bg-amber-50' : 'border-red-500 bg-red-50';
            const textColor = stats.cumplimiento >= 80 ? 'text-emerald-600'
              : stats.cumplimiento >= 50 ? 'text-amber-600' : 'text-red-600';
            return (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Resumen de Cumplimiento</h3>
                  <p className="text-sm text-slate-500">{modoVisualizacion === 'soloEntradas' ? 'Entradas' : 'Salidas'}</p>
                </div>
                <div className="h-64 flex flex-col items-center justify-center">
                  <div className={`w-36 h-36 rounded-full border-8 flex items-center justify-center mb-4 ${ringColor}`}>
                    <div className="text-center">
                      <p className={`text-3xl font-bold ${textColor}`}>{stats.cumplimiento.toFixed(1)}%</p>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-slate-700">{stats.cerradas} de {stats.total} cerradas</p>
                  <p className="text-sm text-slate-500 mt-1">{stats.pendientes} pendientes</p>
                </div>
              </>
            );
          })()}
        </Card>
      </div>

      {/* Evolución temporal */}
      <Card className="p-6 mb-6">
        {filters.periodo === 'diario' || metrics.byFecha.length <= 1 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {filters.periodo === 'diario' ? 'Resumen del Día' : 'Resumen del Periodo'}
                </h3>
                <p className="text-sm text-slate-500">
                  {filters.periodo === 'diario'
                    ? `${modoVisualizacion === 'soloEntradas' ? 'Entradas' : modoVisualizacion === 'soloSalidas' ? 'Salidas' : 'Comparativo'} - ${dateRange.maxFormatted}`
                    : metrics.byFecha.length === 1
                      ? `Movimientos en: ${formatDate(metrics.byFecha[0]?.fecha)}`
                      : `Período: ${dateRange.minFormatted} - ${dateRange.maxFormatted}`}
                </p>
              </div>
              <Badge variant="info" size="lg">{metrics.global.total} movimientos</Badge>
            </div>
            <div className={`grid grid-cols-1 ${modoVisualizacion === 'completo' ? 'lg:grid-cols-2' : ''} gap-6`}>
              <div className="h-72">
                <p className="text-sm font-medium text-slate-600 mb-3 text-center">
                  {modoVisualizacion === 'completo' ? 'Total por Tipo' : 'Estado de Registros'}
                </p>
                <ResponsiveContainer width="100%" height="90%">
                  {modoVisualizacion === 'completo' ? (
                    <BarChart data={[
                      { name: 'Entradas', cerradas: metrics.entradas.cerradas, pendientes: metrics.entradas.pendientes },
                      { name: 'Salidas',  cerradas: metrics.salidas.cerradas,  pendientes: metrics.salidas.pendientes },
                    ]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 500 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={TOOLTIP_STYLE_BORDERLESS} />
                      <Legend />
                      <Bar dataKey="cerradas" name="Cerradas ✓" fill="#2E7D32" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="pendientes" name="Pendientes ◷" fill="#F9A825" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (() => {
                    const stats = modoVisualizacion === 'soloEntradas' ? metrics.entradas : metrics.salidas;
                    return (
                      <BarChart data={[
                        { name: 'Cerradas',   value: stats.cerradas },
                        { name: 'Pendientes', value: stats.pendientes },
                      ]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 500 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={TOOLTIP_STYLE_BORDERLESS} />
                        <Bar dataKey="value" name="Cantidad" radius={[4, 4, 0, 0]}>
                          <Cell fill="#2E7D32" />
                          <Cell fill="#F9A825" />
                        </Bar>
                      </BarChart>
                    );
                  })()}
                </ResponsiveContainer>
              </div>
              {modoVisualizacion === 'completo' && (
                <div className="h-72">
                  <p className="text-sm font-medium text-slate-600 mb-3 text-center">% Cumplimiento</p>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={[
                      { name: 'Entradas', cumplimiento: metrics.entradas.cumplimiento },
                      { name: 'Salidas',  cumplimiento: metrics.salidas.cumplimiento },
                      { name: 'Global',   cumplimiento: metrics.global.cumplimiento },
                    ]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 500 }} />
                      <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                      <Tooltip contentStyle={TOOLTIP_STYLE_BORDERLESS} formatter={(value) => [`${value.toFixed(1)}%`, 'Cumplimiento']} />
                      <Bar dataKey="cumplimiento" name="% Cumplimiento" radius={[4, 4, 0, 0]}>
                        <Cell fill="#00897B" /><Cell fill="#E65100" /><Cell fill="#455A64" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Evolución Diaria</h3>
                <p className="text-sm text-slate-500">
                  {modoVisualizacion === 'completo'
                    ? `Entradas vs Salidas (${metrics.byFecha.length} días)`
                    : `${modoVisualizacion === 'soloEntradas' ? 'Entradas' : 'Salidas'} por fecha (${metrics.byFecha.length} días)`}
                </p>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.byFecha}>
                  <defs>
                    <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00897B" stopOpacity={0.3} /><stop offset="95%" stopColor="#00897B" stopOpacity={0} /></linearGradient>
                    <linearGradient id="colorSalidas"  x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#E65100" stopOpacity={0.3} /><stop offset="95%" stopColor="#E65100" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 10 }} tickFormatter={(value) => formatDateShort(value)} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE_BORDERLESS} labelFormatter={(value) => formatDate(value)} />
                  <Legend />
                  {(modoVisualizacion === 'completo' || modoVisualizacion === 'soloEntradas') && (
                    <Area type="monotone" dataKey="entradas" name="Entradas" stroke="#00897B" strokeWidth={2} fillOpacity={1} fill="url(#colorEntradas)" />
                  )}
                  {(modoVisualizacion === 'completo' || modoVisualizacion === 'soloSalidas') && (
                    <Area type="monotone" dataKey="salidas"  name="Salidas"  stroke="#E65100" strokeWidth={2} fillOpacity={1} fill="url(#colorSalidas)" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </Card>

      {/* Clientes críticos */}
      {hayCriticos && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-slate-800">Clientes con Bajo Cumplimiento</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientesCriticos.map((cliente, i) => (
              <div key={i} className="p-4 bg-red-50 border border-red-100 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-700 text-sm truncate">{cliente.cliente}</span>
                  <Badge variant="danger" size="sm">{cliente.cumplimiento.toFixed(0)}%</Badge>
                </div>
                <ProgressBar value={cliente.cumplimiento} color="danger" size="sm" showLabel={false} />
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                  <span>{cliente.total} movimientos</span>
                  <span>{cliente.cerradas} cerradas</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tabla de detalle (cuando hay filtro de tipo) */}
      {(filters.tipoMovimiento || filters.tipoDocumento) && (
        <TablaDetalleCRM filteredData={filteredData} filters={filters} />
      )}
    </>
  );
});
