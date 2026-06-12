export const formatNumber = (num) => {
  if (num === null || num === undefined) return '-';
  return num.toLocaleString('es-CO');
};
