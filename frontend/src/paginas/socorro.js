import { GUIAS } from '../dados/socorro.js';
import { alertaGolpe, blocoLinks, etiqueta } from '../componentes/comuns.js';
import { esc, ir } from '../app/utilidades.js';

export function paginaSocorro() {
  return {
    titulo: 'Socorro',
    view: () => `<h1 tabindex="-1">Socorro rápido</h1>
      <p class="texto-grande">O que aconteceu?</p>
      <div class="pilha">${GUIAS.map((g) => etiqueta({ href: `#/socorro/${g.id}`, cor: 'proteger', icone: g.icone, titulo: g.titulo })).join('')}</div>`,
    voz: () => GUIAS.map((g) => ({ rotulo: g.titulo, frases: [g.titulo, ...g.palavras], fazer: () => ir(`/socorro/${g.id}`) })),
  };
}

export function paginaGuia(id) {
  const g = GUIAS.find((x) => x.id === id);
  if (!g) { ir('/socorro'); return { view: () => '' }; }
  return {
    titulo: g.titulo, voltar: '/socorro',
    view: () => `<h1 tabindex="-1">${esc(g.titulo)}</h1>
      ${alertaGolpe(g.alerta[0], g.alerta[1])}
      <ol class="numerados">${g.passos.map((p) => `<li>${esc(p)}</li>`).join('')}</ol>
      ${blocoLinks(g.links, 'Onde buscar ajuda')}
      <a class="botao botao-principal" href="#/socorro">Ver outras situações</a>`,
  };
}
