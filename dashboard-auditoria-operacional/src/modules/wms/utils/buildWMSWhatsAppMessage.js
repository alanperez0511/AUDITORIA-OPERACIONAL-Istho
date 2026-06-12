const fmt = (n) => (n ?? 0).toLocaleString('es-CO');
const pct = (v) => `${(v ?? 0).toFixed(1)}%`;
const today = () => new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });

const buildFiltersNote = (filters) => {
  const parts = [];
  if (filters.proveedor) parts.push(`Proveedor: ${filters.proveedor}`);
  if (filters.bodegaFisica) parts.push(`Bodega física: ${filters.bodegaFisica}`);
  if (filters.bodega) parts.push(`Bodega sistema: ${filters.bodega}`);
  if (filters.estadoCalidad) parts.push(`Estado: ${filters.estadoCalidad}`);
  if (filters.soloRecibo) parts.push('Solo RECIBO');
  return parts;
};

export function buildWMSWhatsAppMessage({ metrics, filters }) {
  const topProveedores = metrics.proveedoresData
    .filter((p) => p.enRecibo > 0)
    .slice(0, 5);

  const topBodegas = metrics.byBodegaFisica
    .filter((b) => b.enRecibo > 0)
    .sort((a, b) => b.enRecibo - a.enRecibo)
    .slice(0, 5);

  const rangosConCritico = metrics.byAntiguedad.filter((r) => r.cantidad > 0);

  const lines = [];
  lines.push(`🏭 *AUDITORÍA WMS ISTHO* — ${today()}`);
  lines.push('');

  const filterParts = buildFiltersNote(filters);
  if (filterParts.length > 0) {
    lines.push(`🔎 _Filtros activos: ${filterParts.join(' · ')}_`);
    lines.push('');
  }

  lines.push('📦 *Inventario*');
  lines.push(`• Total pallets: *${fmt(metrics.total)}*`);
  lines.push(`• Unidades totales: ${fmt(metrics.totalUnidades)}`);
  lines.push(`• Ubicados correctamente: *${fmt(metrics.totalUbicados)}* (${pct(metrics.porcentajeUbicados)})`);
  lines.push(`• En RECIBO (limbo): *${fmt(metrics.totalEnRecibo)}* (${pct(metrics.porcentajeEnRecibo)})`);
  lines.push('');

  if (metrics.totalEnRecibo === 0) {
    lines.push('✅ *Sin pallets en RECIBO*');
    lines.push('Todo el inventario está correctamente ubicado.');
    lines.push('');
  } else {
    lines.push('⚠️ *Pallets en RECIBO*');
    lines.push(`*${fmt(metrics.totalEnRecibo)} cajas* sin ubicación física definida.`);
    lines.push(`Equivalen a *${fmt(metrics.unidadesEnRecibo)} unidades* en limbo.`);
    lines.push('');

    if (metrics.palletsCriticos > 0) {
      lines.push('🚨 *Críticos (>90 días en RECIBO)*');
      lines.push(`*${fmt(metrics.palletsCriticos)} pallets* requieren atención urgente.`);
      lines.push(`Suman *${fmt(metrics.unidadesCriticas)} unidades* en limbo prolongado.`);
      lines.push('');
    }

    if (rangosConCritico.length > 0) {
      lines.push('⏱ *Distribución por antigüedad*');
      rangosConCritico.forEach((r) => {
        lines.push(`• ${r.label}: ${fmt(r.cantidad)} pallets`);
      });
      lines.push('');
    }

    if (topProveedores.length > 0) {
      lines.push('🏪 *Top proveedores con pallets en RECIBO*');
      topProveedores.forEach((p) => {
        lines.push(`• ${p.proveedor} — ${fmt(p.enRecibo)} pallets (${pct(p.porcentajeRecibo)} del total)`);
      });
      lines.push('');
    }

    if (topBodegas.length > 0) {
      lines.push('📍 *RECIBO por bodega física*');
      topBodegas.forEach((b) => {
        lines.push(`• ${b.nombre}: ${fmt(b.enRecibo)} pallets`);
      });
      lines.push('');
    }
  }

  lines.push('_Generado desde el área de Tecnología — ISTHO S.A.S._');

  return lines.join('\n');
}
