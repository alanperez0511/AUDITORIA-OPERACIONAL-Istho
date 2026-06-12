import { esKardexBasura, CLIENTES_KARDEX_PERMITIDOS } from './kardex';

const fmt = (n) => (n ?? 0).toLocaleString('es-CO');
const pct = (v) => `${(v ?? 0).toFixed(1)}%`;
const today = () => new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });

const PERIODO_LABELS = {
  diario: 'Solo último día',
  semanal: 'Últimos 7 días',
};

const buildFiltersNote = (filters) => {
  const parts = [];
  if (filters.cliente) parts.push(`Cliente: ${filters.cliente}`);
  if (filters.estado) parts.push(`Estado: ${filters.estado}`);
  if (filters.tipoMovimiento) parts.push(`Tipo mov.: ${filters.tipoMovimiento}`);
  if (filters.tipoDocumento) parts.push(`Tipo doc.: ${filters.tipoDocumento}`);
  if (filters.periodo && PERIODO_LABELS[filters.periodo]) parts.push(PERIODO_LABELS[filters.periodo]);
  return parts;
};

export function buildCRMWhatsAppMessage({ metrics, filteredData, filters }) {
  const kardexBasura = filteredData.entradas.filter(esKardexBasura);
  const kardexBasuraPendientes = kardexBasura.filter((d) => d.estado !== 'Cerrada').length;
  const clientesBasura = [...new Set(kardexBasura.map((d) => d.cliente))].filter(Boolean);

  const clientesBajos = metrics.byCliente
    .filter((c) => c.cumplimiento < 50 && c.total >= 5)
    .slice(0, 5);

  const clientesPendientes = metrics.byCliente
    .filter((c) => c.cerradas < c.total)
    .sort((a, b) => (b.total - b.cerradas) - (a.total - a.cerradas))
    .slice(0, 5);

  const lines = [];
  lines.push(`📋 *AUDITORÍA CRM ISTHO* — ${today()}`);
  lines.push('');

  const filterParts = buildFiltersNote(filters);
  if (filterParts.length > 0) {
    lines.push(`🔎 _Filtros activos: ${filterParts.join(' · ')}_`);
    lines.push('');
  }

  lines.push('📊 *Resumen General*');
  lines.push(`• Total movimientos: *${fmt(metrics.global.total)}*`);
  lines.push(`• Cumplimiento global: *${pct(metrics.global.cumplimiento)}*`);
  lines.push(`• Pendientes: *${fmt(metrics.global.pendientes)}*`);
  lines.push(`• Clientes: ${fmt(metrics.global.clientesCount)}`);
  lines.push('');

  if (metrics.entradas.total > 0) {
    lines.push(`📥 *Entradas (CO/CR)*: ${fmt(metrics.entradas.total)}`);
    lines.push(`   ✓ Cerradas: ${fmt(metrics.entradas.cerradas)} (${pct(metrics.entradas.cumplimiento)})`);
    lines.push(`   ◷ Pendientes: ${fmt(metrics.entradas.pendientes)}`);
    lines.push('');
  }

  if (metrics.salidas.total > 0) {
    lines.push(`📤 *Salidas (SA)*: ${fmt(metrics.salidas.total)}`);
    lines.push(`   ✓ Cerradas: ${fmt(metrics.salidas.cerradas)} (${pct(metrics.salidas.cumplimiento)})`);
    lines.push(`   ◷ Pendientes: ${fmt(metrics.salidas.pendientes)}`);
    lines.push('');
  }

  if (kardexBasura.length > 0) {
    lines.push('⚠️ *ATENCIÓN — Kardex basura del CRM*');
    lines.push(`Hay *${fmt(kardexBasura.length)} movimientos CR* de clientes no autorizados.`);
    if (kardexBasuraPendientes > 0) {
      lines.push(`De estos, *${fmt(kardexBasuraPendientes)} están pendientes* de evidencia.`);
    }
    lines.push(`_Solo ${CLIENTES_KARDEX_PERMITIDOS.join(' y ')} pueden generar Kardex válidos._`);
    lines.push('_El líder debe validar y depurar el resto._');
    if (clientesBasura.length > 0 && clientesBasura.length <= 6) {
      lines.push(`Clientes involucrados: ${clientesBasura.join(', ')}`);
    } else if (clientesBasura.length > 6) {
      lines.push(`Clientes involucrados: ${clientesBasura.slice(0, 6).join(', ')} y ${clientesBasura.length - 6} más`);
    }
    lines.push('');
  }

  if (clientesBajos.length > 0) {
    lines.push('🔻 *Clientes con bajo cumplimiento (<50%)*');
    clientesBajos.forEach((c) => {
      lines.push(`• ${c.cliente} — ${pct(c.cumplimiento)} (${fmt(c.total)} mov.)`);
    });
    lines.push('');
  }

  if (clientesPendientes.length > 0 && clientesBajos.length === 0) {
    lines.push('📌 *Top clientes con pendientes*');
    clientesPendientes.forEach((c) => {
      const pend = c.total - c.cerradas;
      lines.push(`• ${c.cliente} — ${fmt(pend)} pend. de ${fmt(c.total)}`);
    });
    lines.push('');
  }

  lines.push('_Generado desde el área de Tecnología — ISTHO S.A.S._');

  return lines.join('\n');
}
