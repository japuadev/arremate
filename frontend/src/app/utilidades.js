export function esc(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}

export const ir = (rota) => { location.hash = rota; };

export function reais(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function aviso(texto, tipo = 'ok') {
  document.querySelector('.aviso')?.remove();
  const el = document.createElement('div');
  el.className = `aviso aviso-${tipo}`;
  el.setAttribute('role', 'status');
  el.textContent = texto;
  document.body.append(el);
  setTimeout(() => el.remove(), 4200);
}

export function soDigitos(texto) {
  return String(texto ?? '').replace(/\D/g, '');
}
