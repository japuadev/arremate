// Tela Ajuda: a pessoa escreve ou fala o problema e a IA responde em passos curtos, um por
// vez (como o "Perguntar" do Escuta Ativa). Os guias prontos ficam embaixo, como
// "Situações comuns", e são o plano B quando a IA falha.
//
// Fases: inicio -> pensando -> resposta -> concluida
//                          \-> fora (assunto fora do escopo) | erro (sem internet, formato...)
import { GUIAS } from '../dados/ajuda.js';
import { alertaGolpe, blocoLinks, etiqueta, passos } from '../componentes/comuns.js';
import { ligarDitado } from '../componentes/ditado.js';
import { icone } from '../componentes/icones.js';
import { estado } from '../app/estado.js';
import { esc, ir } from '../app/utilidades.js';
import { falar } from '../voz/sintese.js';
import { obterServicoIA } from '../ia/index.js';
import { ErroIA, LIMITES } from '../ia/contrato.js';
import { desenharTela } from '../ia/ilustracao.js';

const MENSAGENS_ERRO = {
  formato: 'A resposta veio confusa e eu não vou mostrar. Veja as situações comuns abaixo.',
  sem_internet: 'Sem internet agora. As situações comuns abaixo funcionam sem internet.',
  tempo: 'A ajuda demorou demais. Tente de novo ou veja as situações comuns.',
  limite: 'Muitos pedidos agora. Espere um pouco ou veja as situações comuns.',
  indisponivel: 'A ajuda não respondeu agora. Tente de novo ou veja as situações comuns.',
};
const FALHA_OUTRO_JEITO = 'Não consegui outra explicação agora. Toque em Repetir para ouvir o passo de novo.';

const situacoesComuns = () => `<section class="pilha">
    <h2>Situações comuns</h2>
    <div class="grade-cartoes">${GUIAS.map((g) => etiqueta({ href: `#/ajuda/${g.id}`, cor: 'proteger', icone: g.icone, titulo: g.titulo })).join('')}</div>
  </section>`;

const comandosGuias = () => GUIAS.map((g) => ({ rotulo: g.titulo, frases: [g.titulo, ...g.palavras], fazer: () => ir(`/ajuda/${g.id}`) }));

export function paginaAjuda(ctx) {
  const servico = obterServicoIA();
  let fase = 'inicio';
  let relato = '';
  let erroCampo = '';
  let tipoErro = '';
  let resposta = null;
  let escondeuDados = false;
  let n = 0;
  let alternativa = '';
  let buscando = false;
  let ultimoFalado = '';

  const naAjuda = () => location.hash === '#/ajuda' || location.hash.startsWith('#/ajuda?');
  const passoAtual = () => resposta?.passos?.[n];

  function mudar(novaFase) {
    fase = novaFase;
    ctx.atualizar({ focar: true });
    document.querySelector('h1')?.focus();
    window.scrollTo(0, 0);
  }

  async function pedir() {
    if (!relato.trim()) { erroCampo = 'Conte o que aconteceu antes de pedir ajuda.'; ctx.atualizar(); return; }
    erroCampo = '';
    mudar('pensando');
    try {
      const r = await servico.perguntar(relato);
      if (!naAjuda()) return;
      resposta = r.resposta;
      escondeuDados = r.escondeuDados;
      n = 0;
      alternativa = '';
      mudar(resposta.foraDoEscopo ? 'fora' : 'resposta');
    } catch (erro) {
      if (!naAjuda()) return;
      const tipo = erro instanceof ErroIA ? erro.tipo : 'indisponivel';
      if (tipo === 'texto') { erroCampo = `Escreva o que aconteceu, com até ${LIMITES.letrasTexto} letras.`; mudar('inicio'); return; }
      tipoErro = tipo;
      mudar('erro');
    }
  }

  function irPara(novo) {
    n = novo;
    alternativa = '';
    mudar(n >= resposta.passos.length ? 'concluida' : 'resposta');
  }

  async function naoEntendi() {
    if (buscando) return;
    buscando = true;
    ctx.atualizar();
    let achou = false;
    try {
      alternativa = await servico.outroJeito(relato, passoAtual().texto);
      achou = true;
    } catch {
      alternativa = FALHA_OUTRO_JEITO;
    }
    buscando = false;
    if (!naAjuda()) return;
    ctx.atualizar(); // redesenhar para a fala; por isso a fala vem depois
    if (achou) falar(alternativa);
  }

  const repetir = () => falar(alternativa || passoAtual()?.texto);

  function recomecar() {
    relato = '';
    resposta = null;
    mudar('inicio');
  }

  // ---------- Fases ----------

  const vistaInicio = () => `<h1 tabindex="-1">Ajuda</h1>
    <form class="cartao-destaque pilha" data-perguntar novalidate>
      <label for="relato" class="rotulo-grande">Conte o que aconteceu</label>
      <div class="linha-campo linha-relato">
        <textarea id="relato" name="relato" class="campo campo-relato" rows="3" maxlength="${LIMITES.letrasTexto}" placeholder="Ex.: fiz um Pix para um golpista" ${erroCampo ? 'aria-invalid="true" aria-describedby="relato-erro"' : ''}>${esc(relato)}</textarea>
        <button type="button" class="botao-mic" data-ditar="relato" aria-label="Falar o que aconteceu">${icone('mic')}</button>
      </div>
      <p class="campo-ajuda" data-msg="relato" aria-live="polite"></p>
      ${erroCampo ? `<p class="alerta-campo" id="relato-erro">${icone('alerta', 24)}<span>${esc(erroCampo)}</span></p>` : ''}
      <p class="aviso-ia">${icone('cadeado', 20)}<span>Vai para uma IA. Escondemos números e senhas.</span></p>
      <button class="botao botao-principal" type="submit">Pedir ajuda</button>
    </form>
    ${situacoesComuns()}`;

  const vistaPensando = () => `<h1 tabindex="-1">Ajuda</h1>
    <div class="pensando" role="status">
      <span class="ondas ondas-ativas" aria-hidden="true">${icone('conversa', 40)}</span>
      <p class="folha-status">Pensando na melhor ajuda…</p>
      <p class="pensando-relato">Você contou: ${esc(relato)}</p>
    </div>`;

  function vistaResposta() {
    const p = passoAtual();
    const ultimo = n === resposta.passos.length - 1;
    const figura = p.tela ? desenharTela(p.tela) : '';
    return `${resposta.urgente && n === 0 ? alertaGolpe('Corra!', 'Quanto antes você agir, melhor.') : ''}
      ${passos(n + 1, resposta.passos.length, 'O que fazer')}
      <div class="passo">
        ${figura ? `<figure class="passo-figura">${figura}</figure>` : ''}
        <p class="passo-texto texto-grande">${esc(p.texto)}</p>
      </div>
      ${alternativa ? `<div class="alternativa" role="status"><p class="forte">Outro jeito de explicar</p><p>${esc(alternativa)}</p></div>` : ''}
      <div class="duplo">
        <button class="botao botao-contorno" data-repetir>${icone('recarregar')}<span>Repetir</span></button>
        <button class="botao botao-principal" data-proximo><span>${ultimo ? 'Terminei' : 'Próximo'}</span>${ultimo ? icone('check') : icone('avancar')}</button>
      </div>
      <button class="botao botao-contorno" data-nao-entendi ${buscando ? 'disabled' : ''}>${buscando ? 'Buscando outro jeito…' : 'Não entendi'}</button>
      ${escondeuDados ? '<p class="nota-baixa">Escondemos números e senhas antes de enviar.</p>' : ''}`;
  }

  const vistaConcluida = () => `<div class="arremate-fim">
      <span class="selo-ouro">${icone('check', 44)}</span>
      <h1 tabindex="-1">Pronto</h1>
    </div>
    ${resposta.dica ? `<p class="cartao-destaque texto-grande">${esc(resposta.dica)}</p>` : ''}
    <button class="botao botao-principal" data-nova>Contar outro problema</button>
    <button class="botao botao-contorno" data-rever>Ver os passos de novo</button>
    ${situacoesComuns()}`;

  const vistaFora = () => `<h1 tabindex="-1">Ajuda</h1>
    <p class="cartao-destaque texto-grande">${esc(resposta.mensagem)}</p>
    <button class="botao botao-principal" data-nova>Escrever outro problema</button>
    ${situacoesComuns()}`;

  const vistaErro = () => `<h1 tabindex="-1">Ajuda</h1>
    <p class="retorno retorno-errado" role="alert">${icone('alerta', 26)}<span>${esc(MENSAGENS_ERRO[tipoErro] || MENSAGENS_ERRO.indisponivel)}</span></p>
    ${tipoErro === 'formato' || tipoErro === 'sem_internet' ? '' : '<button class="botao botao-principal" data-tentar>Tentar de novo</button>'}
    ${situacoesComuns()}
    <button class="botao botao-contorno" data-nova>Escrever outro problema</button>`;

  const VISTAS = { inicio: vistaInicio, pensando: vistaPensando, resposta: vistaResposta, concluida: vistaConcluida, fora: vistaFora, erro: vistaErro };

  return {
    titulo: 'Ajuda',
    get voltar() {
      if (fase === 'resposta' && n > 0) return () => irPara(n - 1);
      if (fase === 'inicio' || fase === 'pensando') return undefined;
      return () => mudar('inicio');
    },
    view: () => VISTAS[fase](),
    montar(raiz) {
      const campo = raiz.querySelector('#relato');
      campo?.addEventListener('input', () => { relato = campo.value; });
      ligarDitado(raiz, (texto) => {
        relato = [relato.trim(), texto].filter(Boolean).join(' ');
        return relato;
      });
      raiz.querySelector('[data-perguntar]')?.addEventListener('submit', (e) => { e.preventDefault(); relato = campo.value; pedir(); });
      raiz.querySelector('[data-repetir]')?.addEventListener('click', repetir);
      raiz.querySelector('[data-proximo]')?.addEventListener('click', () => irPara(n + 1));
      raiz.querySelector('[data-nao-entendi]')?.addEventListener('click', naoEntendi);
      raiz.querySelector('[data-nova]')?.addEventListener('click', recomecar);
      raiz.querySelector('[data-rever]')?.addEventListener('click', () => irPara(0));
      raiz.querySelector('[data-tentar]')?.addEventListener('click', pedir);

      // A cada passo novo, lê o passo em voz alta (se a leitura automática estiver ligada,
      // quem lê é o roteador, com a tela inteira).
      const marca = fase === 'resposta' ? `${n}|${passoAtual().texto}` : '';
      if (marca && marca !== ultimoFalado && !estado.preferencias.lerSozinho) setTimeout(() => falar(`Passo ${n + 1}. ${passoAtual().texto}`), 300);
      ultimoFalado = marca;
    },
    voz() {
      if (fase === 'resposta') {
        return [
          { rotulo: 'Repetir', frases: ['repetir', 'repete', 'fala de novo'], fazer: repetir },
          { rotulo: 'Próximo', frases: ['proximo', 'proximo passo', 'continuar', 'terminei', 'pronto'], fazer: () => irPara(n + 1) },
          { rotulo: 'Não entendi', frases: ['nao entendi', 'explica de novo', 'outro jeito', 'nao achei'], fazer: naoEntendi },
        ];
      }
      if (fase === 'inicio') return [{ rotulo: 'Pedir ajuda', frases: ['pedir ajuda', 'enviar'], fazer: () => document.querySelector('[data-perguntar]')?.requestSubmit() }, ...comandosGuias()];
      if (fase === 'pensando') return [];
      return [
        { rotulo: 'Outro problema', frases: ['outro problema', 'escrever de novo', 'comecar de novo'], fazer: recomecar },
        ...(fase === 'erro' ? [{ rotulo: 'Tentar de novo', frases: ['tentar de novo', 'de novo'], fazer: pedir }] : []),
        ...comandosGuias(),
      ];
    },
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
