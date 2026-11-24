// Leitura em voz alta (botão "Ouvir"), feita pelo próprio navegador.
// Lê um trecho por vez e escurece o resto da tela.
import { estado } from '../app/estado.js';

const disponivel = () => 'speechSynthesis' in window;
let ouvinte = () => {};
let ativo = false;
let vez = 0; // cada leitura nova invalida a anterior

function marcar(v) { ativo = v; ouvinte(v); }

export const falando = () => ativo;
export const aoMudarFala = (fn) => { ouvinte = fn; };

function criarFala(texto) {
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = 'pt-BR';
  fala.rate = estado.preferencias.velocidade;
  const vozes = window.speechSynthesis.getVoices();
  const voz = vozes.find((v) => v.lang === 'pt-BR') || vozes.find((v) => v.lang?.startsWith('pt'));
  if (voz) fala.voice = voz;
  return fala;
}

function limparDestaque() {
  document.querySelectorAll('.em-leitura').forEach((el) => el.classList.remove('em-leitura'));
}

function destacar(el) {
  limparDestaque();
  document.body.classList.add('lendo');
  el.classList.add('em-leitura');
  const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ block: 'center', behavior: suave ? 'smooth' : 'auto' });
}

export function pararFala() {
  vez += 1;
  if (disponivel()) window.speechSynthesis.cancel();
  limparDestaque();
  document.body.classList.remove('lendo');
  marcar(false);
}

export function falar(texto) {
  if (!disponivel() || !texto) return;
  pararFala();
  const minha = vez;
  const fala = criarFala(texto);
  fala.onend = () => { if (minha === vez) marcar(false); };
  fala.onerror = fala.onend;
  marcar(true);
  window.speechSynthesis.speak(fala);
}

export function ouvirTela(blocos) {
  if (!disponivel() || !blocos?.length) return;
  pararFala();
  const minha = vez;
  let i = 0;
  marcar(true);

  const proximo = () => {
    if (minha !== vez) return;
    if (i >= blocos.length) { pararFala(); return; }
    const bloco = blocos[i];
    i += 1;
    if (!bloco.el.isConnected) { proximo(); return; }
    destacar(bloco.el);
    const fala = criarFala(bloco.texto);
    fala.onend = proximo;
    fala.onerror = proximo;
    window.speechSynthesis.speak(fala);
  };
  setTimeout(proximo, 80); // o Chrome ignora falas iniciadas logo após cancelar outra
}
