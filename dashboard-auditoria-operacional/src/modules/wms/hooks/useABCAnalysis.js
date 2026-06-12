import { useMemo } from 'react';

// Clasificación Pareto/ABC estándar:
// A: artículos cuya % acumulado-antes-de-incluirlo es < 80 (representan ~80% del volumen)
// B: % acumulado entre [80, 95)
// C: % acumulado >= 95
const THRESHOLD_A = 80;
const THRESHOLD_B = 95;

const classify = (cumPctBefore) => {
  if (cumPctBefore < THRESHOLD_A) return 'A';
  if (cumPctBefore < THRESHOLD_B) return 'B';
  return 'C';
};

const EMPTY_RESULT = {
  items: [],
  abc: { A: 0, B: 0, C: 0 },
  abcShare: { A: 0, B: 0, C: 0 },
  total: 0,
};

export function useABCAnalysis(data, { groupBy = 'referencia', metric = 'units' } = {}) {
  return useMemo(() => {
    if (!data?.length) return EMPTY_RESULT;

    const groups = new Map();
    data.forEach((d) => {
      const key = d[groupBy] || 'Sin dato';
      const prev = groups.get(key) || { key, pallets: 0, units: 0, enRecibo: 0 };
      prev.pallets += 1;
      prev.units += d.saldo || 0;
      if (d.enRecibo) prev.enRecibo += 1;
      groups.set(key, prev);
    });

    const sortKey = metric === 'units' ? 'units' : 'pallets';
    const sorted = [...groups.values()].sort((a, b) => b[sortKey] - a[sortKey]);
    const total = sorted.reduce((s, g) => s + g[sortKey], 0);

    if (total === 0) return EMPTY_RESULT;

    let cumBefore = 0;
    const items = sorted.map((g, idx) => {
      const value = g[sortKey];
      const pct = (value / total) * 100;
      const cumPctBefore = (cumBefore / total) * 100;
      const cumAfter = cumBefore + value;
      const cumPct = (cumAfter / total) * 100;
      const clase = classify(cumPctBefore);
      cumBefore = cumAfter;
      return { ...g, rank: idx + 1, value, pct, cumPct, clase };
    });

    const abc = { A: 0, B: 0, C: 0 };
    const valueByClass = { A: 0, B: 0, C: 0 };
    items.forEach((it) => {
      abc[it.clase] += 1;
      valueByClass[it.clase] += it.value;
    });

    const abcShare = {
      A: total > 0 ? (valueByClass.A / total) * 100 : 0,
      B: total > 0 ? (valueByClass.B / total) * 100 : 0,
      C: total > 0 ? (valueByClass.C / total) * 100 : 0,
    };

    return { items, abc, abcShare, total };
  }, [data, groupBy, metric]);
}
