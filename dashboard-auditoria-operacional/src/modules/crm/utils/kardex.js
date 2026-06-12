// Clientes autorizados a generar movimientos de Kardex (CR).
// Cualquier CR de un cliente fuera de esta lista se considera "basura" y debe
// ser auditado/depurado por el líder de operaciones.
export const CLIENTES_KARDEX_PERMITIDOS = ['KLAR', 'ETERNIT'];

const clienteAutorizado = (clienteRaw) => {
  const cliente = (clienteRaw || '').toUpperCase();
  return CLIENTES_KARDEX_PERMITIDOS.some((c) => cliente.includes(c));
};

export const esKardexBasura = (item) => {
  if (item.tipo !== 'entrada' || item.tipoDcto !== 'CR') return false;
  return !clienteAutorizado(item.cliente);
};
