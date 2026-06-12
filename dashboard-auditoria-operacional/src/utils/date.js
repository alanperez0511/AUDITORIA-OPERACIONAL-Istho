const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}/;
const LOCALE = 'es-CO';
const FMT_LONG = { day: '2-digit', month: 'short', year: 'numeric' };
const FMT_SHORT = { day: '2-digit', month: 'short' };

const fromIsoDate = (value) => {
  const [datePart] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
};

export const parseDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;

  if (typeof value === 'number') {
    // Excel epoch (30-Dic-1899) interpretado en hora local + mediodía para evitar saltos por TZ.
    const excelEpoch = new Date(1899, 11, 30);
    const msPerDay = 86400000;
    const resultDate = new Date(excelEpoch.getTime() + value * msPerDay);
    return new Date(resultDate.getFullYear(), resultDate.getMonth(), resultDate.getDate(), 12, 0, 0);
  }

  if (typeof value === 'string') {
    const partsSlash = value.split('/');
    if (partsSlash.length === 3) {
      const [day, month, year] = partsSlash.map(Number);
      if (day && month && year) {
        return new Date(year, month - 1, day, 12, 0, 0);
      }
    }

    if (ISO_DATE_RE.test(value)) return fromIsoDate(value);

    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
    }
  }

  return null;
};

export const getDateString = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatWith = (date, options) => {
  if (!date) return '-';
  if (typeof date === 'string' && ISO_DATE_RE.test(date)) {
    return fromIsoDate(date).toLocaleDateString(LOCALE, options);
  }
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString(LOCALE, options);
};

export const formatDate = (date) => formatWith(date, FMT_LONG);
export const formatDateShort = (date) => formatWith(date, FMT_SHORT);
