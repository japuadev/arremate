// Materiais gratuitos de gestão (Sebrae, Banco Central, gov.br, NTCPE), separados por tema.
import { MATERIAIS, TEMAS, TIPOS, materiaisDoTema } from '../dados/materiais.js';
import { cartaoMaterial } from '../componentes/comuns.js';
import { icone } from '../componentes/icones.js';
import { esc } from '../app/utilidades.js';

export function paginaMateriais(ctx) {
  let tema = '';
  return {
    titulo: 'Materiais de gestão', voltar: '/inicio',
    view() {
      const lista = tema ? materiaisDoTema(tema) : MATERIAIS;
      return `<h1 tabindex="-1">Materiais de gestão</h1>
        <p>Cursos e cartilhas grátis. Abrem fora do app.</p>
        <fieldset class="filtro">
          <legend>Escolha o assunto</legend>
          <div class="filtro-lista">
            <button class="filtro-item" aria-pressed="${!tema}" data-tema="">Todos</button>
            ${TEMAS.map((t) => `<button class="filtro-item" aria-pressed="${tema === t.id}" data-tema="${t.id}">${icone(t.icone, 20)}${esc(t.nome)}</button>`).join('')}
          </div>
        </fieldset>
        <div class="pilha">${lista.map((m) => cartaoMaterial(m, TIPOS)).join('')}</div>
        <p class="nota-baixa">Os cursos do Sebrae pedem um cadastro grátis, que pode ser feito com a conta gov.br. Dúvidas: 0800 570 0800.</p>`;
    },
    montar(raiz) {
      raiz.querySelectorAll('[data-tema]').forEach((b) => b.addEventListener('click', () => { tema = b.dataset.tema; ctx.atualizar(); }));
    },
    voz: () => [
      { rotulo: 'Todos', frases: ['todos', 'todos os materiais'], fazer: () => { tema = ''; ctx.atualizar(); } },
      ...TEMAS.map((t) => ({ rotulo: t.nome, frases: [t.nome], fazer: () => { tema = t.id; ctx.atualizar(); } })),
    ],
  };
}
