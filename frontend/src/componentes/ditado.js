import { ditar } from '../voz/interface-voz.js';
import { terminarEscuta } from '../voz/reconhecimento.js';
import { digitosFalados, valorFalado, inteiroFalado, dataFalada } from '../voz/comandos.js';
import { esc } from '../app/utilidades.js';

const selo = (texto) => `<span class="selo-gravando"><span class="ponto-rec" aria-hidden="true"></span>${esc(texto)}</span>`;

// Converte o que foi falado de acordo com o tipo do campo. null = não deu para entender.
export function converterFala(texto, campo) {
  if (!campo) return texto;
  if (campo.type === 'date') return dataFalada(texto);
  if (campo.type === 'tel') return digitosFalados(texto);
  if (campo.inputMode === 'decimal') return valorFalado(texto);
  if (campo.inputMode === 'numeric') return inteiroFalado(texto);
  return texto;
}

const DICA = { date: 'Diga, por exemplo: hoje, ontem ou dia 20.' };

// Liga os botões de microfone que ficam ao lado dos campos. Enquanto grava, o botão fica
// vermelho e pulsando, o campo ganha borda vermelha e aparece o selo "Gravando".
// Tocar de novo no microfone termina a gravação. Cada botão é ligado uma vez só: o roteador
// chama esta função em toda tela, e as telas que precisam de outra conversão chamam antes.
export function ligarDitado(raiz, tratar = converterFala) {
  raiz.querySelectorAll('[data-ditar]:not([data-ditado-ligado])').forEach((b) => {
    b.dataset.ditadoLigado = '';
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
      const mostrar = (m, gravando) => { if (msg) msg.innerHTML = gravando ? selo(m) : esc(m); };
      marcar(true);
      ditar((texto) => {
        const valor = tratar === converterFala ? converterFala(texto, c) : tratar(texto, id, c);
        if (valor === null || valor === undefined) {
          mostrar(`Não entendi “${texto}”. ${DICA[c?.type] ?? 'Tente de novo ou digite.'}`, false);
          return;
        }
        c.value = valor;
        c.dispatchEvent(new Event('input', { bubbles: true })); // telas que recalculam na hora
        c.focus();
      }, mostrar, () => marcar(false));
    });
  });
}
