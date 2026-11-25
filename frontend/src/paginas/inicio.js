import { TRILHAS, trilhaPorId } from '../dados/trilhas.js';
import { MODELOS } from '../dados/modelos.js';
import { estado } from '../app/estado.js';
import { etiqueta } from '../componentes/comuns.js';
import { icone } from '../componentes/icones.js';
import { esc, ir } from '../app/utilidades.js';
import { tipoAtual, pecaAtual } from '../personalizacao/perfil.js';

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
        <p>${esc(tipoAtual().curto)} de ${esc(pecaAtual().nome.toLowerCase())}${estado.perfil.negocio ? `, ${esc(estado.perfil.negocio)}` : ''}</p>
        <div class="pesponto" role="img" aria-label="${feitas} de ${total} aulas feitas">
          ${TRILHAS.flatMap((x) => x.aulas).map((_, n) => `<i class="${n < feitas ? 'feito' : n === feitas ? 'atual' : ''}"></i>`).join('')}
        </div>
        <p class="painel-contagem">${feitas} de ${total} aulas feitas</p>
      </div></section>

      ${prox ? `<section class="pilha">
        <h2>Continue daqui</h2>
        ${etiqueta({ href: `#/aula/${prox.aula.id}`, cor: prox.trilha.cor, icone: prox.aula.icone, titulo: prox.aula.titulo, tempo: prox.aula.tempo, nivel: prox.aula.nivel })}
        <button class="botao botao-principal" data-continuar>Começar aula</button>
      </section>` : '<section class="pilha"><h2>Você fez todas as aulas</h2><p class="texto-grande">Volte às planilhas ou treine no É golpe?</p></section>'}

      <section class="pilha">
        <h2>Suas trilhas</h2>
        ${lista.map((x, i) => etiqueta({ href: `#/trilha/${x.id}`, cor: x.cor, icone: x.icone, titulo: x.nome, destaque: `${feitasDe(x)} de ${x.aulas.length} aulas${i === 0 ? ', comece por aqui' : ''}` })).join('')}
      </section>

      <a class="linha-atalho" href="#/materiais">${icone('nota', 32)}<span><strong>Materiais de gestão</strong><br>Cursos e cartilhas grátis do Sebrae, Banco Central e gov.br</span></a>

      <section class="pilha">
        <h2>Minhas planilhas</h2>
        <div class="atalhos">${Object.values(MODELOS).map((m) => `<a class="atalho" href="#/planilhas/${m.id}">${icone(m.icone, 32)}<span>${m.nome}</span></a>`).join('')}</div>
      </section>`;
    },
    montar(raiz) {
      raiz.querySelector('[data-continuar]')?.addEventListener('click', () => ir(`/aula/${prox.aula.id}`));
    },
    voz: () => (prox ? [{ rotulo: 'Continuar', frases: ['continuar', 'comecar aula', 'proxima aula'], fazer: () => ir(`/aula/${prox.aula.id}`) }] : []),
  };
}
