import { PERGUNTAS } from '../dados/diagnostico.js';
import { TIPOS, PECAS, ordenarTrilhas, nivelDaNota } from '../personalizacao/perfil.js';
import { trilhaPorId } from '../dados/trilhas.js';
import { atualizarPerfil, atualizarPreferencias, estado } from '../app/estado.js';
import { comandosDeOpcoes } from '../voz/comandos.js';
import { passos, campo } from '../componentes/comuns.js';
import { ligarDitado } from '../componentes/ditado.js';
import { icone } from '../componentes/icones.js';
import { esc, ir } from '../app/utilidades.js';

const MOTIVOS = {
  organizar: 'Você ainda anota tudo à mão. Vamos deixar suas contas e seu estoque mais fáceis.',
  formalizar: 'Ter CNPJ abre portas para vender e emitir nota. Vamos fazer isso passo a passo.',
  dinheiro: 'Pagar e receber pelo celular vai poupar seu tempo. Vamos treinar com calma.',
  proteger: 'Saber reconhecer um golpe protege o seu dinheiro. Vamos treinar isso primeiro.',
};

export function paginaDiagnostico(ctx) {
  let i = -1; // -1 = nome; PERGUNTAS.length = resultado
  const notas = { organizar: 0, formalizar: 0, dinheiro: 0, proteger: 0 };
  let ordem = [];

  const opcoesDe = (p) => {
    if (p.fonte === 'tipos') return TIPOS.map((x) => ({ t: x.nome, valor: x.id }));
    if (p.fonte === 'pecas') return PECAS.map((x) => ({ t: x.nome, valor: x.id }));
    return p.opcoes;
  };

  function responder(indice) {
    const p = PERGUNTAS[i];
    const o = opcoesDe(p)[indice];
    if (p.perfil) atualizarPerfil({ [p.perfil]: o.valor });
    if (p.trilha) notas[p.trilha] = o.nota;
    if (p.preferencia) atualizarPreferencias({ [p.preferencia]: o.valor });
    i += 1;
    if (i === PERGUNTAS.length) {
      ordem = ordenarTrilhas(notas);
      const niveis = Object.fromEntries(Object.entries(notas).map(([k, v]) => [k, nivelDaNota(v)]));
      atualizarPerfil({ trilhas: ordem, niveis });
    }
    ctx.atualizar();
    document.querySelector('h1')?.focus();
    window.scrollTo(0, 0);
  }

  return {
    titulo: 'Diagnóstico', semAbas: true, semAjustes: true,
    get voltar() { return i < 0 ? undefined : () => { i -= 1; ctx.atualizar(); }; },
    view() {
      if (i === -1) {
        return `${passos(1, PERGUNTAS.length + 1, 'Vamos nos conhecer')}
          <p class="texto-grande">Sete perguntas rápidas para o app começar pelo que você mais precisa.</p>
          <form class="pilha" data-nome novalidate>
            ${campo({ id: 'nome', rotulo: 'Como você se chama?', valor: estado.perfil.nome, comVoz: true })}
            ${campo({ id: 'negocio', rotulo: 'Nome do seu negócio (se tiver)', valor: estado.perfil.negocio, comVoz: true })}
            <button class="botao botao-principal" type="submit">Continuar</button>
          </form>`;
      }
      if (i === PERGUNTAS.length) {
        const primeira = trilhaPorId(ordem[0]);
        return `<div class="resultado jeans"><div class="jeans-costura">
            <h1 tabindex="-1">${esc(estado.perfil.nome ? `${estado.perfil.nome}, comece` : 'Comece')} por ${esc(primeira.nome)}</h1>
            <p>${esc(MOTIVOS[primeira.id])}</p>
          </div></div>
          <h2>Sua ordem de trilhas</h2>
          <ol class="ordem">${ordem.map((id) => { const x = trilhaPorId(id); return `<li><span class="etiqueta-icone" style="--cor:var(--trilha-${x.cor});--cor-icone:var(--trilha-${x.cor}-icone)">${icone(x.icone, 26)}</span>${esc(x.nome)}</li>`; }).join('')}</ol>
          <button class="botao botao-principal" data-ir>Começar minha trilha</button>
          <p class="nota-baixa">Você pode mudar tudo isso depois em Ajustes.</p>`;
      }
      const p = PERGUNTAS[i];
      return `${passos(i + 2, PERGUNTAS.length + 1, p.titulo)}
        <div class="opcoes">${opcoesDe(p).map((o, n) => `<button class="opcao" data-op="${n}"><span class="opcao-num" aria-hidden="true">${n + 1}</span><span>${esc(o.t)}</span></button>`).join('')}</div>
        <p class="nota-baixa">Toque na resposta ou fale o número.</p>`;
    },
    montar(raiz) {
      raiz.querySelector('[data-nome]')?.addEventListener('submit', (e) => {
        e.preventDefault();
        atualizarPerfil({ nome: raiz.querySelector('#nome').value.trim(), negocio: raiz.querySelector('#negocio').value.trim() });
        i = 0;
        ctx.atualizar();
        document.querySelector('h1')?.focus();
      });
      ligarDitado(raiz);
      raiz.querySelectorAll('[data-op]').forEach((b) => b.addEventListener('click', () => responder(Number(b.dataset.op))));
      raiz.querySelector('[data-ir]')?.addEventListener('click', () => {
        atualizarPerfil({ diagnosticoFeito: true });
        ir(`/trilha/${ordem[0]}`);
      });
    },
    voz() {
      if (i === -1) return [{ rotulo: 'Continuar', frases: ['continuar', 'proximo'], fazer: () => document.querySelector('[data-nome]').requestSubmit() }];
      if (i === PERGUNTAS.length) return [{ rotulo: 'Começar', frases: ['comecar', 'comecar minha trilha'], fazer: () => document.querySelector('[data-ir]').click() }];
      return comandosDeOpcoes(opcoesDe(PERGUNTAS[i]).map((o) => o.t), responder);
    },
  };
}
