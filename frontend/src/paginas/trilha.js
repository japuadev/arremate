import { trilhaPorId } from '../dados/trilhas.js';
import { estado, alternarBaixada } from '../app/estado.js';
import { etiqueta, formaNivel, NIVEIS } from '../componentes/comuns.js';
import { icone } from '../componentes/icones.js';
import { aviso, esc, ir } from '../app/utilidades.js';
import { comandosDeOpcoes } from '../voz/comandos.js';

export function paginaTrilha(id, ctx) {
  const trilha = trilhaPorId(id);
  if (!trilha) { ir('/inicio'); return { view: () => '' }; }
  let filtro = 0;

  const visiveis = () => trilha.aulas.filter((a) => !filtro || a.nivel === filtro);

  return {
    titulo: trilha.nome, voltar: '/inicio',
    view() {
      const feitas = (a) => estado.progresso.aulas[a.id];
      const atual = trilha.aulas.find((a) => !feitas(a))?.id;
      const baixada = estado.progresso.baixadas[trilha.id];
      const sugerido = estado.perfil.niveis?.[trilha.id];
      return `
      <div class="trilha-cabeca">
        <span class="etiqueta-icone grande" style="--cor:var(--trilha-${trilha.cor});--cor-icone:var(--trilha-${trilha.cor}-icone)">${icone(trilha.icone, 36)}</span>
        <div><h1 tabindex="-1">${esc(trilha.nome)}</h1><p>${esc(trilha.resumo)}</p></div>
      </div>
      <fieldset class="filtro">
        <legend>Escolha o nível</legend>
        <div class="filtro-lista">
          <button class="filtro-item" aria-pressed="${filtro === 0}" data-nivel="0">Todos</button>
          ${[1, 2, 3].map((n) => `<button class="filtro-item" aria-pressed="${filtro === n}" data-nivel="${n}">${formaNivel(n)}${NIVEIS[n].nome}</button>`).join('')}
        </div>
        ${sugerido ? `<p class="nota-baixa">Para você, sugerimos começar no nível ${NIVEIS[sugerido].nome}.</p>` : ''}
      </fieldset>
      <ol class="costura">
        ${visiveis().map((a) => {
          const classe = feitas(a) ? 'no-feito' : a.id === atual ? 'no-atual' : '';
          return `<li class="costura-item ${classe}">
            <span class="botao-roupa" aria-hidden="true">${feitas(a) ? icone('check', 22) : '<i></i><i></i><i></i><i></i>'}</span>
            ${etiqueta({ href: `#/aula/${a.id}`, cor: trilha.cor, icone: a.icone, titulo: a.titulo, tempo: a.tempo, nivel: a.nivel, feita: feitas(a) })}
          </li>`;
        }).join('') || '<li class="nota-baixa">Nenhuma aula neste nível. Escolha outro.</li>'}
      </ol>
      <button class="botao botao-contorno" data-baixar>${icone(baixada ? 'check' : 'baixar')}<span>${baixada ? 'Trilha guardada no celular' : 'Guardar para usar sem internet'}</span></button>`;
    },
    montar(raiz) {
      raiz.querySelectorAll('[data-nivel]').forEach((b) => b.addEventListener('click', () => { filtro = Number(b.dataset.nivel); ctx.atualizar(); }));
      raiz.querySelector('[data-baixar]').addEventListener('click', () => {
        aviso(alternarBaixada(trilha.id) ? 'Trilha guardada. Funciona sem internet.' : 'Trilha removida do celular.');
        ctx.atualizar();
      });
    },
    voz() {
      const atual = trilha.aulas.find((a) => !estado.progresso.aulas[a.id]);
      return [
        ...comandosDeOpcoes(trilha.aulas.map((a) => a.titulo), (i) => ir(`/aula/${trilha.aulas[i].id}`)),
        { rotulo: 'Continuar', frases: ['continuar', 'comecar', 'proxima aula'], fazer: () => atual && ir(`/aula/${atual.id}`) },
        ...['facil', 'medio', 'avancado'].map((n, i) => ({ rotulo: n, frases: [n, `nivel ${n}`], fazer: () => { filtro = i + 1; ctx.atualizar(); } })),
      ];
    },
  };
}
