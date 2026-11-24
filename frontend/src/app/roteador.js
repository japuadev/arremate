// Roteador por "#/caminho". Cada tela é uma função que devolve um objeto:
// { titulo, voltar, semAbas, semTopo, view(), montar(raiz), voz() }
import { estado } from './estado.js';
import { icone } from '../componentes/icones.js';
import { ouvirTela, pararFala, falando, aoMudarFala } from '../voz/sintese.js';
import { blocosDeLeitura } from '../voz/leitura.js';
import { abrirEscuta, definirTelaAtual } from '../voz/interface-voz.js';

import { paginaEntrar, paginaCodigo } from '../paginas/entrar.js';
import { paginaDiagnostico } from '../paginas/diagnostico.js';
import { paginaInicio } from '../paginas/inicio.js';
import { paginaTrilha } from '../paginas/trilha.js';
import { paginaAula } from '../paginas/aula.js';
import { paginaGolpe } from '../paginas/golpe.js';
import { paginaSocorro, paginaGuia } from '../paginas/socorro.js';
import { paginaModelos, paginaPlanilha } from '../paginas/planilhas.js';
import { paginaSimuladorMei, paginaSimuladorNota } from '../paginas/simuladores.js';
import { paginaAjustes } from '../paginas/ajustes.js';

const ROTAS = [
  [/^\/entrar$/, paginaEntrar],
  [/^\/codigo$/, paginaCodigo],
  [/^\/diagnostico$/, paginaDiagnostico],
  [/^\/inicio$/, paginaInicio],
  [/^\/trilha\/([\w-]+)$/, paginaTrilha],
  [/^\/aula\/([\w-]+)$/, paginaAula],
  [/^\/golpe$/, paginaGolpe],
  [/^\/socorro$/, paginaSocorro],
  [/^\/socorro\/([\w-]+)$/, paginaGuia],
  [/^\/planilhas$/, paginaModelos],
  [/^\/planilhas\/([\w-]+)$/, paginaPlanilha],
  [/^\/simulador\/mei$/, paginaSimuladorMei],
  [/^\/simulador\/nota$/, paginaSimuladorNota],
  [/^\/ajustes$/, paginaAjustes],
];

const ABAS = [
  { rota: '/inicio', nome: 'Aprender', icone: 'inicio', ativa: /^\/(inicio|trilha|planilhas)/ },
  { rota: '/golpe', nome: 'É golpe?', icone: 'golpe', ativa: /^\/golpe/ },
  { rota: '/socorro', nome: 'Socorro', icone: 'socorro', ativa: /^\/socorro/ },
];

let raiz;
let paginaAtual;
let rotaAtual = '';
let ultimaTela = '';

function resolver() {
  const rota = location.hash.slice(1) || '/inicio';
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
  for (const [padrao, pagina] of ROTAS) {
    const achou = rota.match(padrao);
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

function doca() {
  return `<div class="doca">
    <button class="botao botao-ouvir" data-ouvir>${icone(falando() ? 'parar' : 'ouvir')}<span>${falando() ? 'Parar' : 'Ouvir'}</span></button>
    <button class="botao botao-falar" data-falar>${icone('mic')}<span>Falar</span></button>
  </div>`;
}

export function desenhar({ focar = false } = {}) {
  const p = paginaAtual;
  const y = window.scrollY;
  pararFala();
  raiz.innerHTML = `
    <div class="tela ${p.semAbas ? 'tela-sem-abas' : ''}">
      ${topo(p)}
      <main id="conteudo" tabindex="-1">${p.view()}</main>
      <div class="rodape">${doca()}${abas(p)}</div>
    </div>`;
  raiz.querySelector('[data-voltar]')?.addEventListener('click', () => {
    if (typeof p.voltar === 'function') p.voltar(); else location.hash = p.voltar;
  });
  raiz.querySelector('[data-ouvir]').addEventListener('click', () => {
    if (falando()) pararFala(); else ouvirTela(lerPagina());
  });
  raiz.querySelector('[data-falar]').addEventListener('click', abrirEscuta);
  p.montar?.(raiz.querySelector('#conteudo'));
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
  aoMudarFala((ativo) => {
    const b = raiz.querySelector('[data-ouvir]');
    if (b) b.innerHTML = `${icone(ativo ? 'parar' : 'ouvir')}<span>${ativo ? 'Parar' : 'Ouvir'}</span>`;
  });
  navegar();
}

