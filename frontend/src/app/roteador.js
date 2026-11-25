// Roteador por "#/caminho". Cada tela é uma função que devolve um objeto:
// { titulo, voltar, semAbas, semTopo, view(), montar(raiz), voz() }
import { estado } from './estado.js';
import { icone } from '../componentes/icones.js';
import { ligarVerMais } from '../componentes/comuns.js';
import { redirecionarAntiga } from './utilidades.js';
import { ouvirTela, pararFala, aoMudarFala, estadoLeitura, pausarOuContinuar, trechoAnterior, proximoTrecho } from '../voz/sintese.js';
import { blocosDeLeitura } from '../voz/leitura.js';
import { abrirEscuta, definirTelaAtual } from '../voz/interface-voz.js';

import { paginaEntrar, paginaCodigo } from '../paginas/entrar.js';
import { paginaDiagnostico } from '../paginas/diagnostico.js';
import { paginaInicio } from '../paginas/inicio.js';
import { paginaTrilha } from '../paginas/trilha.js';
import { paginaAula } from '../paginas/aula.js';
import { paginaGolpe } from '../paginas/golpe.js';
import { paginaAjuda, paginaGuia } from '../paginas/ajuda.js';
import { paginaFinancas, paginaPlanilha, paginaPreco } from '../paginas/planilhas.js';
import { paginaSimuladorMei, paginaSimuladorNota } from '../paginas/simuladores.js';
import { paginaAjustes } from '../paginas/ajustes.js';
import { paginaMateriais } from '../paginas/materiais.js';

const ROTAS = [
  [/^\/entrar$/, paginaEntrar],
  [/^\/codigo$/, paginaCodigo],
  [/^\/diagnostico$/, paginaDiagnostico],
  [/^\/inicio$/, paginaInicio],
  [/^\/trilha\/([\w-]+)$/, paginaTrilha],
  [/^\/aula\/([\w-]+)$/, paginaAula],
  [/^\/golpe$/, paginaGolpe],
  [/^\/ajuda$/, paginaAjuda],
  [/^\/ajuda\/([\w-]+)$/, paginaGuia],
  [/^\/planilhas$/, paginaFinancas],
  [/^\/planilhas\/preco$/, paginaPreco],
  [/^\/planilhas\/([\w-]+)$/, paginaPlanilha],
  [/^\/simulador\/mei$/, paginaSimuladorMei],
  [/^\/simulador\/nota$/, paginaSimuladorNota],
  [/^\/ajustes$/, paginaAjustes],
  [/^\/materiais$/, paginaMateriais],
];

const ABAS = [
  { rota: '/inicio', nome: 'Aprender', icone: 'inicio', ativa: /^\/(inicio|trilha|materiais)/ },
  { rota: '/planilhas', nome: 'Caixa', icone: 'dinheiro', ativa: /^\/planilhas/ },
  { rota: '/golpe', nome: 'É golpe?', icone: 'golpe', ativa: /^\/golpe/ },
  { rota: '/ajuda', nome: 'Ajuda', icone: 'ajuda', ativa: /^\/ajuda/ },
];

let raiz;
let paginaAtual;
let rotaAtual = '';
let ultimaTela = '';

function resolver() {
  const rota = redirecionarAntiga(location.hash.slice(1) || '/inicio');
  const publica = rota === '/entrar' || rota === '/codigo';
  if (!estado.sessao && !publica) return '/entrar';
  if (estado.sessao && !estado.perfil.diagnosticoFeito && rota !== '/diagnostico') return '/diagnostico';
  return rota;
}

function navegar() {
  const rota = resolver();
  if (`#${rota}` !== location.hash) { location.replace(`#${rota}`); return; }
  pararFala();
  rotaAtual = rota;
  const caminho = rota.split('?')[0]; // "?simular=..." (demonstração da IA) não faz parte da rota
  for (const [padrao, pagina] of ROTAS) {
    const achou = caminho.match(padrao);
    if (achou) {
      paginaAtual = pagina(...achou.slice(1), { atualizar: desenhar });
      desenhar({ focar: true });
      window.scrollTo(0, 0);
      return;
    }
  }
  location.replace('#/inicio');
}

function lerPagina() {
  return blocosDeLeitura(raiz.querySelector('#conteudo'));
}

function topo(p) {
  if (p.semTopo) return '';
  const voltar = p.voltar
    ? `<button class="topo-voltar" data-voltar aria-label="Voltar">${icone('voltar')}<span>Voltar</span></button>`
    : '<span class="topo-marca">Arremate</span>';
  const ajustes = p.semAjustes ? '' : `<a class="topo-ajustes" href="#/ajustes" aria-label="Ajustes">${icone('ajustes')}<span>Ajustes</span></a>`;
  return `<header class="topo">${voltar}${ajustes}</header>`;
}

function abas(p) {
  if (p.semAbas) return '';
  return `<nav class="abas" aria-label="Menu principal">${ABAS.map((a) => {
    const ativa = a.ativa.test(rotaAtual);
    return `<a href="#${a.rota}" class="aba ${ativa ? 'aba-ativa' : ''}" ${ativa ? 'aria-current="page"' : ''}>${icone(a.icone)}<span>${a.nome}</span></a>`;
  }).join('')}</nav>`;
}

// Fora da leitura: Ouvir e Falar. Durante a leitura: a barra de controle, como nos leitores de tela.
function doca() {
  const l = estadoLeitura();
  if (!l.ativo) {
    return `<div class="doca">
      <button class="botao botao-ouvir" data-ouvir>${icone('ouvir')}<span>Ouvir</span></button>
      <button class="botao botao-falar" data-falar>${icone('mic')}<span>Falar</span></button>
    </div>`;
  }
  const status = l.total
    ? `${l.pausado ? 'Leitura pausada' : 'Lendo'}: trecho ${l.atual} de ${l.total}`
    : 'Lendo em voz alta';
  return `<div class="doca doca-leitura" role="group" aria-label="Controle da leitura">
    <p class="leitura-status" aria-live="polite">
      <span class="leitura-ondas ${l.pausado ? 'leitura-ondas-paradas' : ''}" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
      <span>${status}</span>
    </p>
    <div class="leitura-botoes">
      ${l.total ? `<button class="botao-leitura" data-leitura="anterior" aria-label="Trecho anterior" ${l.atual <= 1 ? 'disabled' : ''}>${icone('anterior', 26)}</button>
      <button class="botao-leitura botao-leitura-principal" data-leitura="pausar">${icone(l.pausado ? 'continuar' : 'pausar', 26)}<span>${l.pausado ? 'Continuar' : 'Pausar'}</span></button>
      <button class="botao-leitura" data-leitura="proximo" aria-label="Próximo trecho">${icone('proximo', 26)}</button>` : ''}
      <button class="botao-leitura botao-leitura-parar" data-leitura="parar">${icone('parar', 22)}<span>Parar</span></button>
    </div>
  </div>`;
}

const ACOES_LEITURA = { anterior: trechoAnterior, pausar: pausarOuContinuar, proximo: proximoTrecho, parar: pararFala };

// A doca é redesenhada sozinha, sem mexer na página.
function ligarDoca() {
  const lugar = raiz.querySelector('[data-doca]');
  if (!lugar) return;
  const focado = document.activeElement?.dataset?.leitura;
  lugar.innerHTML = doca();
  lugar.querySelector('[data-ouvir]')?.addEventListener('click', () => ouvirTela(lerPagina()));
  lugar.querySelector('[data-falar]')?.addEventListener('click', abrirEscuta);
  lugar.querySelectorAll('[data-leitura]').forEach((b) => b.addEventListener('click', () => ACOES_LEITURA[b.dataset.leitura]()));
  // Mantém o foco no mesmo botão para quem navega por teclado ou leitor de tela.
  if (focado) lugar.querySelector(`[data-leitura="${focado}"]:not(:disabled)`)?.focus();
}

export function desenhar({ focar = false } = {}) {
  const p = paginaAtual;
  const y = window.scrollY;
  pararFala();
  raiz.innerHTML = `
    <div class="tela ${p.semAbas ? 'tela-sem-abas' : ''}">
      ${topo(p)}
      <main id="conteudo" tabindex="-1">${p.view()}</main>
      <div class="rodape"><div data-doca></div>${abas(p)}</div>
    </div>`;
  raiz.querySelector('[data-voltar]')?.addEventListener('click', () => {
    if (typeof p.voltar === 'function') p.voltar(); else location.hash = p.voltar;
  });
  ligarDoca();
  p.montar?.(raiz.querySelector('#conteudo'));
  ligarVerMais(raiz.querySelector('#conteudo'));
  definirTelaAtual({ comandos: () => p.voz?.() || [], ler: lerPagina });
  if (focar) raiz.querySelector('h1')?.focus({ preventScroll: true });
  else window.scrollTo(0, y);
  const marca = `${rotaAtual}|${raiz.querySelector('.passos-texto')?.textContent}|${raiz.querySelector('h1')?.textContent}`;
  if (estado.preferencias.lerSozinho && marca !== ultimaTela) setTimeout(() => ouvirTela(lerPagina()), 350);
  ultimaTela = marca;
  document.title = p.titulo ? `${p.titulo} | Arremate` : 'Arremate';
}

export function iniciarRoteador(elemento) {
  raiz = elemento;
  window.addEventListener('hashchange', navegar);
  let antes = '';
  aoMudarFala((l) => {
    const agora = JSON.stringify(l);
    if (agora !== antes) { antes = agora; ligarDoca(); }
  });
  navegar();
}

