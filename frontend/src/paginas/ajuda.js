import { GUIAS } from '../dados/ajuda.js';
import { alertaGolpe, blocoLinks, etiqueta } from '../componentes/comuns.js';
import { esc, ir } from '../app/utilidades.js';

export function paginaAjuda() {
  return {
    titulo: 'Ajuda',
    view: () => `<h1 tabindex="-1">Ajuda</h1>
      <p class="texto-grande">O que aconteceu?</p>
      <div class="pilha">${GUIAS.map((g) => etiqueta({ href: `#/ajuda/${g.id}`, cor: 'proteger', icone: g.icone, titulo: g.titulo })).join('')}</div>`,
    voz: () => GUIAS.map((g) => ({ rotulo: g.titulo, frases: [g.titulo, ...g.palavras], fazer: () => ir(`/ajuda/${g.id}`) })),
  };
}

export function paginaGuia(id) {
  const g = GUIAS.find((x) => x.id === id);
  if (!g) { ir('/ajuda'); return { view: () => '' }; }
  return {
    titulo: g.titulo, voltar: '/ajuda',
    view: () => `<h1 tabindex="-1">${esc(g.titulo)}</h1>
      ${alertaGolpe(g.alerta[0], g.alerta[1])}
      <ol class="numerados">${g.passos.map((p) => `<li>${esc(p)}</li>`).join('')}</ol>
      ${blocoLinks(g.links, 'Onde buscar ajuda')}
      <a class="botao botao-principal" href="#/ajuda">Ver outras situações</a>`,
  };
}
