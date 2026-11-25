import { ditar } from '../voz/interface-voz.js';
import { terminarEscuta } from '../voz/reconhecimento.js';
import { esc } from '../app/utilidades.js';

const selo = (texto) => `<span class="selo-gravando"><span class="ponto-rec" aria-hidden="true"></span>${esc(texto)}</span>`;

// Liga os botões de microfone que ficam ao lado dos campos. Enquanto grava, o botão fica
// vermelho e pulsando, o campo ganha borda vermelha e aparece o selo "Gravando".
// Tocar de novo no microfone termina a gravação.
export function ligarDitado(raiz, tratar = (t) => t) {
  raiz.querySelectorAll('[data-ditar]').forEach((b) => {
    const rotulo = b.getAttribute('aria-label') ?? 'Falar';
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => {
      if (b.classList.contains('gravando')) { terminarEscuta(); return; }
      const id = b.dataset.ditar;
      const msg = raiz.querySelector(`[data-msg="${id}"]`);
      const c = raiz.querySelector(`#${id}`);
      const marcar = (ligado) => {
        b.classList.toggle('gravando', ligado);
        b.setAttribute('aria-pressed', String(ligado));
        b.setAttribute('aria-label', ligado ? 'Terminar de gravar' : rotulo);
        c?.classList.toggle('campo-gravando', ligado);
      };
      marcar(true);
      ditar((texto) => {
        c.value = tratar(texto, id);
        c.focus();
      }, (m, gravando) => {
        if (msg) msg.innerHTML = gravando ? selo(m) : esc(m);
      }, () => marcar(false));
    });
  });
}
