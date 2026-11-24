import { MENSAGENS } from '../dados/golpes.js';
import { estado, registrarGolpe } from '../app/estado.js';
import { alertaGolpe } from '../componentes/comuns.js';
import { icone } from '../componentes/icones.js';
import { esc } from '../app/utilidades.js';

export function paginaGolpe(ctx) {
  let fase = 'inicio';
  let n = 0;
  let acertos = 0;
  let resposta = null;

  function comecar() { fase = 'jogo'; n = 0; acertos = 0; resposta = null; ctx.atualizar(); document.querySelector('h1')?.focus(); }
  function responder(eGolpe) {
    if (resposta !== null) return;
    resposta = eGolpe;
    if (eGolpe === MENSAGENS[n].golpe) acertos += 1;
    ctx.atualizar();
  }
  function proxima() {
    n += 1;
    resposta = null;
    if (n === MENSAGENS.length) { fase = 'fim'; registrarGolpe(acertos, MENSAGENS.length); }
    ctx.atualizar();
    document.querySelector('h1')?.focus();
    window.scrollTo(0, 0);
  }

  return {
    titulo: 'É golpe?',
    get voltar() { return fase === 'inicio' ? undefined : () => { fase = 'inicio'; ctx.atualizar(); }; },
    view() {
      if (fase === 'inicio') {
        const { melhor, total } = estado.progresso.golpe;
        return `<h1 tabindex="-1">É golpe ou não é?</h1>
          ${alertaGolpe('Pare!', 'Banco não pede senha por mensagem.')}
          <p class="texto-grande">Treine com ${MENSAGENS.length} mensagens parecidas com as que chegam no seu celular. Aqui, nada é de verdade.</p>
          ${total ? `<p class="placar">${icone('tesoura')}<span>Seu melhor resultado: ${melhor} de ${total}</span></p>` : ''}
          <button class="botao botao-principal" data-comecar>Começar treino</button>`;
      }
      if (fase === 'fim') {
        const bom = acertos >= MENSAGENS.length - 1;
        return `<div class="arremate-fim"><span class="selo-ouro">${icone('tesoura', 44)}</span>
          <h1 tabindex="-1">${acertos} de ${MENSAGENS.length} certas</h1></div>
          <p class="texto-grande">${bom ? 'Olho vivo! Você reconhece os sinais.' : 'Treine de novo. Pressa, senha e link são os principais sinais.'}</p>
          <button class="botao botao-principal" data-comecar>Treinar de novo</button>`;
      }
      const m = MENSAGENS[n];
      const certa = resposta !== null && resposta === m.golpe;
      return `<div class="passos"><p class="passos-texto">Mensagem ${n + 1} de ${MENSAGENS.length}</p>
        <div class="passos-barra"><span style="width:${((n + 1) / MENSAGENS.length) * 100}%"></span></div>
        <h1 tabindex="-1" class="titulo-passo">É golpe?</h1></div>
        <article class="mensagem">
          <p class="mensagem-de">${esc(m.canal)}: ${esc(m.de)}</p>
          <p class="mensagem-balao">${esc(m.texto)}</p>
        </article>
        ${resposta === null ? `<div class="duplo">
          <button class="botao botao-golpe" data-r="1">${icone('alerta')}<span>É golpe</span></button>
          <button class="botao botao-seguro" data-r="0">${icone('check')}<span>Não é golpe</span></button>
        </div>` : `
        <div class="retorno ${certa ? 'retorno-certo' : 'retorno-errado'}" role="status">${icone(certa ? 'check' : 'alerta', 26)}<span><strong>${certa ? 'Acertou.' : 'Não foi dessa vez.'}</strong> ${m.golpe ? 'Isso é golpe.' : 'Essa mensagem é segura.'}</span></div>
        <ul class="sinais">${m.sinais.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
        <button class="botao botao-principal" data-prox>${n + 1 === MENSAGENS.length ? 'Ver resultado' : 'Próxima mensagem'}</button>`}`;
    },
    montar(raiz) {
      raiz.querySelector('[data-comecar]')?.addEventListener('click', comecar);
      raiz.querySelector('[data-prox]')?.addEventListener('click', proxima);
      raiz.querySelectorAll('[data-r]').forEach((b) => b.addEventListener('click', () => responder(b.dataset.r === '1')));
    },
    voz() {
      if (fase !== 'jogo') return [{ rotulo: 'Começar', frases: ['comecar', 'comecar treino', 'treinar', 'treinar de novo'], fazer: comecar }];
      if (resposta === null) {
        return [
          { rotulo: 'É golpe', frases: ['e golpe', 'golpe', 'sim', 'falso'], fazer: () => responder(true) },
          { rotulo: 'Não é golpe', frases: ['nao e golpe', 'nao', 'seguro', 'verdadeiro'], fazer: () => responder(false) },
        ];
      }
      return [{ rotulo: 'Próxima', frases: ['proxima', 'proximo', 'continuar', 'ver resultado'], fazer: proxima }];
    },
  };
}
