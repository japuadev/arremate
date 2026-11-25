import { aulaPorId } from '../dados/trilhas.js';
import { MODELOS } from '../dados/modelos.js';
import { concluirAula } from '../app/estado.js';
import { blocoLinks, passos, cartaoMaterial, verMais } from '../componentes/comuns.js';
import { materiaisDaTrilha, TIPOS } from '../dados/materiais.js';
import { telaDoPasso } from '../dados/telas.js';
import { icone } from '../componentes/icones.js';
import { esc, ir } from '../app/utilidades.js';
import { t } from '../personalizacao/perfil.js';
import { comandosDeOpcoes } from '../voz/comandos.js';

export function paginaAula(id, ctx) {
  const achada = aulaPorId(id);
  if (!achada) { ir('/inicio'); return { view: () => '' }; }
  const { aula, trilha } = achada;
  let n = 0;
  let resposta = null;
  const voltarTrilha = `/trilha/${trilha.id}`;
  const total = aula.passos.length;
  const fim = () => n >= total;

  function avancar() {
    n += 1;
    resposta = null;
    if (fim()) concluirAula(aula.id);
    ctx.atualizar();
    document.querySelector('h1')?.focus();
    window.scrollTo(0, 0);
  }

  function tabela(e) {
    return `<table class="mini-tabela"><thead><tr>${e.cabecalho.map((c) => `<th scope="col">${esc(t(c))}</th>`).join('')}</tr></thead>
      <tbody>${e.linhas.map((l) => `<tr class="${/^(total|sobrou)$/i.test(l[0]) ? 'linha-total' : ''}">${l.map((c) => `<td>${esc(t(c))}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }

  // Cada passo mostra a tela do celular; sem tela, a tabela de exemplo ou o ícone da aula.
  function figura(p) {
    const tela = telaDoPasso(aula.id, n + 1);
    if (tela) return tela;
    if (p.exemplo) return tabela(p.exemplo);
    return `<div class="desenho" style="--cor:var(--trilha-${trilha.cor});--cor-icone:var(--trilha-${trilha.cor}-icone)">${icone(aula.icone, 72)}</div>`;
  }

  function entrega() {
    const e = aula.entrega;
    let corpo = '';
    let acao = '';
    if (e.tipo === 'modelo') {
      corpo = `<p>${esc(t(e.texto))}</p>`;
      acao = `<a class="botao botao-principal" href="#/planilhas/${e.id}">${icone('planilha')}<span>Abrir planilha de ${MODELOS[e.id].nome.toLowerCase()}</span></a>`;
    } else if (e.tipo === 'simulador') {
      corpo = `<p>${esc(t(e.texto))}</p>`;
      acao = `<a class="botao botao-principal" href="#${e.rota}">${esc(e.botao)}</a>`;
    } else {
      corpo = `<h2>${esc(e.titulo)}</h2><ul class="confira">${e.itens.map((x, i) => `<li><input type="checkbox" id="c${i}" /><label for="c${i}">${esc(x)}</label></li>`).join('')}</ul>`;
      acao = `<a class="botao botao-principal" href="#${voltarTrilha}">Voltar para a trilha</a>`;
    }
    return `<div class="arremate-fim">
        <span class="selo-ouro">${icone('tesoura', 44)}</span>
        <h1 tabindex="-1">Aula arrematada</h1>
      </div>
      <div class="pilha">${corpo}${acao}
      ${e.tipo !== 'guia' ? `<a class="botao botao-contorno" href="#${voltarTrilha}">Voltar para a trilha</a>` : ''}
      ${verMais(`${blocoLinks(aula.saibaMais, 'Para saber mais')}
        ${materiaisDaTrilha(trilha.id).slice(0, 1).map((m) => `<h2>Curso ou cartilha indicada</h2>${cartaoMaterial(m, TIPOS)}`).join('')}`, { id: 'aula-fim', rotulo: 'Ver mais' })}</div>`;
  }

  return {
    titulo: aula.titulo, semAbas: true,
    voltar: () => { if (n > 0 && !fim()) { n -= 1; resposta = null; ctx.atualizar(); } else ir(voltarTrilha); },
    view() {
      if (fim()) return entrega();
      const p = aula.passos[n];
      if (p.pergunta) {
        const o = resposta !== null ? p.opcoes[resposta] : null;
        return `${passos(n + 1, total, 'Agora é com você')}
          <p class="texto-grande forte">${esc(t(p.pergunta))}</p>
          <div class="opcoes">${p.opcoes.map((x, i) => {
            let c = '';
            if (resposta !== null && x.certa) c = 'opcao-certa';
            else if (resposta === i) c = 'opcao-errada';
            return `<button class="opcao ${c}" data-resp="${i}" ${resposta !== null ? 'disabled' : ''}><span class="opcao-num" aria-hidden="true">${i + 1}</span><span>${esc(t(x.t))}</span></button>`;
          }).join('')}</div>
          ${o ? `<p class="retorno ${o.certa ? 'retorno-certo' : 'retorno-errado'}" role="status">${icone(o.certa ? 'check' : 'alerta', 26)}<span>${esc(t(o.retorno))}</span></p>
          <button class="botao botao-principal" data-prox>Continuar</button>` : ''}`;
      }
      return `${passos(n + 1, total, t(p.titulo))}
        <div class="passo" data-passo>
          <figure class="passo-figura">${figura(p)}</figure>
          <p class="passo-texto texto-grande">${esc(t(p.texto))}</p>
        </div>
        ${blocoLinks(p.links)}
        <button class="botao botao-principal passo-avancar" data-prox><span>Próximo</span>${icone('avancar')}</button>`;
    },
    montar(raiz) {
      raiz.querySelector('[data-prox]')?.addEventListener('click', avancar);
      raiz.querySelectorAll('[data-resp]').forEach((b) => b.addEventListener('click', () => { resposta = Number(b.dataset.resp); ctx.atualizar(); }));
    },
    voz() {
      if (fim()) return [];
      const p = aula.passos[n];
      const seguir = { rotulo: 'Próximo', frases: ['proximo', 'proximo passo', 'continuar', 'avancar', 'seguir'], fazer: () => document.querySelector('[data-prox]')?.click() };
      if (p.pergunta && resposta === null) return comandosDeOpcoes(p.opcoes.map((o) => t(o.t)), (i) => { resposta = i; ctx.atualizar(); });
      return [seguir];
    },
  };
}
