import { TRILHAS, trilhaPorId } from '../dados/trilhas.js';
import { estado } from '../app/estado.js';
import { etiqueta } from '../componentes/comuns.js';
import { esc, ir } from '../app/utilidades.js';

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  return h < 18 ? 'Boa tarde' : 'Boa noite';
}

const ordemTrilhas = () => (estado.perfil.trilhas || TRILHAS.map((x) => x.id)).map(trilhaPorId);

export function proximaAula() {
  for (const trilha of ordemTrilhas()) {
    const aula = trilha.aulas.find((a) => !estado.progresso.aulas[a.id]);
    if (aula) return { aula, trilha };
  }
  return null;
}

const feitasDe = (trilha) => trilha.aulas.filter((a) => estado.progresso.aulas[a.id]).length;

// Mesmo modelo da aba Caixa: um destaque no topo (saudação e progresso), uma ação
// principal (Começar aula) e o resto em cartões curtos (as trilhas). Planilhas ficam
// na aba Caixa; materiais de gestão, no fim de cada trilha.
export function paginaInicio() {
  const lista = ordemTrilhas();
  const prox = proximaAula();
  return {
    titulo: 'Início',
    view() {
      const total = TRILHAS.reduce((s, x) => s + x.aulas.length, 0);
      const feitas = Object.keys(estado.progresso.aulas).length;
      return `
      <section class="painel jeans"><div class="jeans-costura">
        <h1 tabindex="-1">${saudacao()}${estado.perfil.nome ? `, ${esc(estado.perfil.nome)}` : ''}</h1>
        <div class="pesponto" role="img" aria-label="${feitas} de ${total} aulas feitas">
          ${TRILHAS.flatMap((x) => x.aulas).map((_, n) => `<i class="${n < feitas ? 'feito' : n === feitas ? 'atual' : ''}"></i>`).join('')}
        </div>
        <p class="painel-contagem">${feitas} de ${total} aulas feitas</p>
      </div></section>

      ${prox ? `<section class="pilha">
        <h2>Continue daqui</h2>
        ${etiqueta({ href: `#/aula/${prox.aula.id}`, cor: prox.trilha.cor, icone: prox.aula.icone, titulo: prox.aula.titulo, tempo: prox.aula.tempo, nivel: prox.aula.nivel })}
        <button class="botao botao-principal" data-continuar>Começar aula</button>
      </section>` : '<section class="pilha"><h2>Você fez todas as aulas</h2><p>Treine no É golpe? ou abra o Caixa.</p></section>'}

      <section class="pilha">
        <h2>Suas trilhas</h2>
        <div class="grade-cartoes">${lista.map((x, i) => etiqueta({ href: `#/trilha/${x.id}`, cor: x.cor, icone: x.icone, titulo: x.nome, destaque: `${feitasDe(x)} de ${x.aulas.length} aulas${i === 0 && !feitasDe(x) ? ', comece aqui' : ''}` })).join('')}</div>
      </section>`;
    },
    montar(raiz) {
      raiz.querySelector('[data-continuar]')?.addEventListener('click', () => ir(`/aula/${prox.aula.id}`));
    },
    voz: () => (prox ? [{ rotulo: 'Continuar', frases: ['continuar', 'comecar aula', 'proxima aula'], fazer: () => ir(`/aula/${prox.aula.id}`) }] : []),
  };
}
