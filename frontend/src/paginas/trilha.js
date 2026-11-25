import { trilhaPorId } from '../dados/trilhas.js';
import { estado } from '../app/estado.js';
import { etiqueta, formaNivel, NIVEIS, blocoMateriais, verMais } from '../componentes/comuns.js';
import { materiaisDaTrilha, TIPOS } from '../dados/materiais.js';
import { icone } from '../componentes/icones.js';
import { esc, ir } from '../app/utilidades.js';
import { comandosDeOpcoes } from '../voz/comandos.js';

// Destaque no topo (trilha e progresso), uma ação principal (continuar a aula da vez),
// a lista de aulas e, recolhidos em "Ver mais", o filtro de nível, o aviso de uso sem internet
// e os materiais de gestão. (O app inteiro fica guardado no aparelho pelo sw.js.)
export function paginaTrilha(id, ctx) {
  const trilha = trilhaPorId(id);
  if (!trilha) { ir('/inicio'); return { view: () => '' }; }
  let filtro = 0;

  const visiveis = () => trilha.aulas.filter((a) => !filtro || a.nivel === filtro);
  const feita = (a) => estado.progresso.aulas[a.id];
  const aulaDaVez = () => trilha.aulas.find((a) => !feita(a));

  return {
    titulo: trilha.nome, voltar: '/inicio',
    view() {
      const atual = aulaDaVez();
      const feitas = trilha.aulas.filter(feita).length;
      const sugerido = estado.perfil.niveis?.[trilha.id];
      const secundario = `
        <fieldset class="filtro">
          <legend>Filtrar por nível</legend>
          <div class="filtro-lista">
            <button class="filtro-item" aria-pressed="${filtro === 0}" data-nivel="0">Todos</button>
            ${[1, 2, 3].map((n) => `<button class="filtro-item" aria-pressed="${filtro === n}" data-nivel="${n}">${formaNivel(n)}${NIVEIS[n].nome}</button>`).join('')}
          </div>
          ${sugerido ? `<p class="nota-baixa">Sugestão para você: ${NIVEIS[sugerido].nome}.</p>` : ''}
        </fieldset>
        <p class="nota-baixa">Depois do primeiro acesso, o app funciona sem internet.</p>
        ${blocoMateriais(materiaisDaTrilha(trilha.id).slice(0, 3), TIPOS, 'Materiais de gestão')}`;
      return `
      <section class="trilha-destaque">
        <span class="etiqueta-icone grande" style="--cor:var(--trilha-${trilha.cor});--cor-icone:var(--trilha-${trilha.cor}-icone)">${icone(trilha.icone, 36)}</span>
        <div><h1 tabindex="-1">${esc(trilha.nome)}</h1><p>${esc(trilha.resumo)}</p></div>
        <p class="trilha-progresso">${feitas} de ${trilha.aulas.length} aulas feitas</p>
      </section>
      ${atual ? `<button class="botao botao-principal" data-continuar>${feitas ? 'Continuar' : 'Começar'}: ${esc(atual.titulo)}</button>` : '<p class="retorno retorno-certo">Trilha completa. Pode rever qualquer aula.</p>'}
      ${filtro ? `<p class="nota-baixa">Mostrando só o nível ${NIVEIS[filtro].nome}.</p>` : ''}
      <ol class="costura">
        ${visiveis().map((a) => {
          const classe = feita(a) ? 'no-feito' : a.id === atual?.id ? 'no-atual' : '';
          return `<li class="costura-item ${classe}">
            <span class="botao-roupa" aria-hidden="true">${feita(a) ? icone('check', 22) : '<i></i><i></i><i></i><i></i>'}</span>
            ${etiqueta({ href: `#/aula/${a.id}`, cor: trilha.cor, icone: a.icone, titulo: a.titulo, tempo: a.tempo, nivel: a.nivel, feita: feita(a) })}
          </li>`;
        }).join('') || '<li class="nota-baixa">Nenhuma aula neste nível.</li>'}
      </ol>
      ${verMais(secundario, { id: 'trilha', rotulo: 'Ver mais' })}`;
    },
    montar(raiz) {
      raiz.querySelector('[data-continuar]')?.addEventListener('click', () => ir(`/aula/${aulaDaVez().id}`));
      raiz.querySelectorAll('[data-nivel]').forEach((b) => b.addEventListener('click', () => { filtro = Number(b.dataset.nivel); ctx.atualizar(); }));
    },
    voz() {
      const atual = aulaDaVez();
      return [
        ...comandosDeOpcoes(trilha.aulas.map((a) => a.titulo), (i) => ir(`/aula/${trilha.aulas[i].id}`)),
        { rotulo: 'Continuar', frases: ['continuar', 'comecar', 'proxima aula'], fazer: () => atual && ir(`/aula/${atual.id}`) },
        ...['facil', 'medio', 'avancado'].map((n, i) => ({ rotulo: n, frases: [n, `nivel ${n}`], fazer: () => { filtro = i + 1; ctx.atualizar(); } })),
      ];
    },
  };
}
