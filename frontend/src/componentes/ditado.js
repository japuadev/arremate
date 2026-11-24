import { ditar } from '../voz/interface-voz.js';

// Liga os botões de microfone que ficam ao lado dos campos.
export function ligarDitado(raiz, tratar = (t) => t) {
  raiz.querySelectorAll('[data-ditar]').forEach((b) => {
    b.addEventListener('click', () => {
      const id = b.dataset.ditar;
      const msg = raiz.querySelector(`[data-msg="${id}"]`);
      ditar((texto) => {
        const c = raiz.querySelector(`#${id}`);
        c.value = tratar(texto, id);
        c.focus();
      }, (m) => { if (msg) msg.textContent = m; });
    });
  });
}
