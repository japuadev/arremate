// Leitura em voz alta (botão "Ouvir"), feita pelo próprio navegador.
//
// Segue o padrão de leitores como o "Selecionar para ouvir" do Android e o Leitor Imersivo:
// a tela continua visível, o trecho lido ganha um fundo de marca-texto e a palavra falada
// fica destacada, para a pessoa acompanhar com os olhos. Uma barra permite pausar,
// voltar ou pular trechos.
import { estado } from '../app/estado.js';

const disponivel = () => 'speechSynthesis' in window;
const temDestaqueDePalavra = () => typeof Highlight === 'function' && 'highlights' in CSS;

// Fundos escuros pedem a palavra destacada em ouro, não em índigo.
const FUNDO_ESCURO = '.jeans, .alerta-golpe, .confirmacao, .botao-principal, .mini-tabela th';

let ouvinte = () => {};
let vez = 0; // cada leitura nova invalida a anterior
const leitura = { ativo: false, pausado: false, blocos: [], i: 0 };

export const falando = () => leitura.ativo;
export const estadoLeitura = () => ({
  ativo: leitura.ativo,
  pausado: leitura.pausado,
  atual: Math.min(leitura.i + 1, leitura.blocos.length),
  total: leitura.blocos.length,
});
export const aoMudarFala = (fn) => { ouvinte = fn; };
const avisar = () => ouvinte(estadoLeitura());

function criarFala(texto) {
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = 'pt-BR';
  fala.rate = estado.preferencias.velocidade;
  const vozes = window.speechSynthesis.getVoices();
  const voz = vozes.find((v) => v.lang === 'pt-BR') || vozes.find((v) => v.lang?.startsWith('pt'));
  if (voz) fala.voice = voz;
  return fala;
}

// ---------- Destaque do trecho e da palavra ----------

const PALAVRA = /[\p{L}\p{N}]+/gu;

// Palavras do trecho na tela, cada uma com o pedaço de texto onde está.
// Os nós são lidos um a um para que células de tabela não se juntem numa palavra só.
function palavrasDoElemento(el) {
  const lista = [];
  const passeio = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.parentElement?.closest('[hidden], [aria-hidden="true"], script, style')
      ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  for (let no = passeio.nextNode(); no; no = passeio.nextNode()) {
    for (const m of no.data.matchAll(PALAVRA)) lista.push({ no, inicio: m.index, fim: m.index + m[0].length });
  }
  return lista;
}

function limparPalavra() {
  if (!temDestaqueDePalavra()) return;
  CSS.highlights.delete('palavra-lida');
  CSS.highlights.delete('palavra-lida-escuro');
}

function limparDestaque() {
  document.querySelectorAll('.em-leitura').forEach((el) => el.classList.remove('em-leitura'));
  limparPalavra();
}

function destacarBloco(bloco) {
  limparDestaque();
  bloco.el.classList.add('em-leitura');
  const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // "nearest" só rola quando o trecho sai da tela: a página não fica pulando.
  bloco.el.scrollIntoView({ block: 'nearest', behavior: suave ? 'smooth' : 'auto' });
}

// O navegador avisa a posição (charIndex) da palavra que começa a ser falada.
// Conta quantas palavras vêm antes no texto falado e destaca a mesma palavra na tela.
function destacarPalavra(bloco, posicao) {
  if (!temDestaqueDePalavra()) return;
  bloco.palavras ??= palavrasDoElemento(bloco.el);
  let n = -1;
  for (const m of bloco.texto.matchAll(PALAVRA)) { if (m.index > posicao) break; n += 1; }
  const alvo = bloco.palavras[n];
  if (!alvo || !alvo.no.isConnected) return;
  const intervalo = new Range();
  intervalo.setStart(alvo.no, alvo.inicio);
  intervalo.setEnd(alvo.no, alvo.fim);
  limparPalavra();
  const nome = bloco.el.closest(FUNDO_ESCURO) || bloco.el.matches(FUNDO_ESCURO) ? 'palavra-lida-escuro' : 'palavra-lida';
  CSS.highlights.set(nome, new Highlight(intervalo));
}

// ---------- Controle da leitura ----------

function encerrar() {
  leitura.ativo = false;
  leitura.pausado = false;
  leitura.blocos = [];
  leitura.i = 0;
  limparDestaque();
  avisar();
}

export function pararFala() {
  vez += 1;
  if (disponivel()) window.speechSynthesis.cancel();
  encerrar();
}

// Fala solta, sem destaque (avisos e confirmações).
export function falar(texto) {
  if (!disponivel() || !texto) return;
  pararFala();
  const minha = vez;
  const fala = criarFala(texto);
  fala.onend = () => { if (minha === vez) encerrar(); };
  fala.onerror = fala.onend;
  leitura.ativo = true;
  avisar();
  window.speechSynthesis.speak(fala);
}

function lerAPartirDe(i) {
  vez += 1;
  window.speechSynthesis.cancel();
  const minha = vez;
  leitura.i = i;
  leitura.pausado = false;
  avisar();

  const lerAtual = () => {
    if (minha !== vez) return;
    // Pula trechos que sumiram da tela (a página foi redesenhada).
    while (leitura.i < leitura.blocos.length && !leitura.blocos[leitura.i].el.isConnected) leitura.i += 1;
    if (leitura.i >= leitura.blocos.length) { encerrar(); return; }
    const bloco = leitura.blocos[leitura.i];
    destacarBloco(bloco);
    avisar();
    const fala = criarFala(bloco.texto);
    fala.onboundary = (e) => { if (minha === vez && e.name === 'word') destacarPalavra(bloco, e.charIndex); };
    fala.onend = () => { if (minha !== vez) return; leitura.i += 1; lerAtual(); };
    fala.onerror = fala.onend;
    window.speechSynthesis.speak(fala);
  };
  setTimeout(lerAtual, 80); // o Chrome ignora falas iniciadas logo após cancelar outra
}

export function ouvirTela(blocos) {
  if (!disponivel() || !blocos?.length) return;
  pararFala();
  leitura.ativo = true;
  leitura.blocos = blocos;
  lerAPartirDe(0);
}

// Pausar cancela a fala e guarda o trecho; continuar recomeça esse trecho do início.
// (O pause() nativo falha em vários celulares Android.)
export function pausarOuContinuar() {
  if (!leitura.ativo || !leitura.blocos.length) return;
  if (leitura.pausado) { lerAPartirDe(leitura.i); return; }
  vez += 1;
  window.speechSynthesis.cancel();
  leitura.pausado = true;
  limparPalavra();
  avisar();
}

export function trechoAnterior() {
  if (leitura.blocos.length) lerAPartirDe(Math.max(0, leitura.i - 1));
}

export function proximoTrecho() {
  if (!leitura.blocos.length) return;
  if (leitura.i + 1 >= leitura.blocos.length) pararFala(); else lerAPartirDe(leitura.i + 1);
}
