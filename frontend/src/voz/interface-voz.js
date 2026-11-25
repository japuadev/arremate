// A folha que aparece ao tocar em "Falar", mais a execução dos comandos.
import { interpretar, COMANDOS_GERAIS } from './comandos.js';
import { ouvir, pararEscuta, terminarEscuta, vozDisponivel } from './reconhecimento.js';
import { ouvirTela, pararFala, falar } from './sintese.js';
import { icone } from '../componentes/icones.js';
import { esc, ir, aviso, reais } from '../app/utilidades.js';
import { estado, atualizarPreferencias, salvarPlanilha } from '../app/estado.js';
import { categoriaPorDescricao, nomeCategoria } from '../dados/modelos.js';
import { visao, mesAtual } from '../app/financas.js';

let tela = { comandos: () => [], ler: () => '' };
let folha = null;
let cronometro = null;

function pararCronometro() { clearInterval(cronometro); cronometro = null; }

function iniciarCronometro() {
  pararCronometro();
  const inicio = Date.now();
  const tempo = folha?.querySelector('[data-tempo]');
  const mostrar = () => {
    const s = Math.floor((Date.now() - inicio) / 1000);
    if (tempo) tempo.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };
  mostrar();
  cronometro = setInterval(mostrar, 500);
}

export function definirTelaAtual(t) { tela = t; }

const EXEMPLOS = ['Abrir Formalizar', 'É golpe', 'Vendi 3 calças por 50 reais', 'Letra maior', 'Preciso de ajuda', 'O que posso falar'];

function fecharFolha() {
  pararEscuta();
  pararCronometro();
  folha?.remove();
  folha = null;
}

function mostrarEstado({ status, transcricao = '', erro = '', ouvindo = false }) {
  if (!folha) return;
  folha.querySelector('[data-status]').textContent = status;
  folha.querySelector('[data-transcricao]').textContent = transcricao;
  const e = folha.querySelector('[data-erro]');
  e.hidden = !erro;
  e.querySelector('span').textContent = erro;
  const caixa = folha.querySelector('.folha');
  const jaGravava = caixa.classList.contains('gravando');
  caixa.classList.toggle('gravando', ouvindo);
  if (ouvindo && !jaGravava) iniciarCronometro();
  if (!ouvindo) pararCronometro();
  folha.querySelector('[data-terminei]').hidden = !ouvindo;
  folha.querySelector('[data-repetir]').hidden = ouvindo || !vozDisponivel();
}

function comecarEscuta() {
  pararFala();
  mostrarEstado({ status: 'Pode falar, estou ouvindo', ouvindo: true });
  let recebeu = false;
  let falhou = false;
  ouvir({
    aoParcial: (t) => mostrarEstado({ status: 'Ouvindo', transcricao: t, ouvindo: true }),
    aoFinal: (t) => { recebeu = true; executar(t); },
    aoErro: (m) => { falhou = true; mostrarEstado({ status: 'Não deu para ouvir', erro: m }); },
    aoFim: () => { if (!recebeu && !falhou && folha) mostrarEstado({ status: 'Toque em Tentar de novo' }); },
  });
}

export function abrirEscuta() {
  if (folha) { fecharFolha(); return; }
  folha = document.createElement('div');
  folha.className = 'folha-fundo';
  const avisoVoz = estado.preferencias.avisoVozVisto ? '' : '<p class="folha-privacidade">Para virar texto, sua voz passa pelo serviço do Google. Não fale senhas nem números de cartão.</p>';
  if (!estado.preferencias.avisoVozVisto) atualizarPreferencias({ avisoVozVisto: true });
  folha.innerHTML = `
    <section class="folha" role="dialog" aria-modal="true" aria-label="Comando de voz">
      <div class="ondas" aria-hidden="true">${icone('mic', 40)}</div>
      <div class="barras-som" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <p class="selo-gravando"><span class="ponto-rec" aria-hidden="true"></span>Gravando <span data-tempo>0:00</span></p>
      <p class="folha-status" data-status aria-live="polite"></p>
      <p class="folha-transcricao" data-transcricao></p>
      <button class="botao botao-gravando" data-terminei hidden>${icone('mic')}<span>Terminei de falar</span></button>
      <p class="alerta-campo" data-erro hidden>${icone('alerta', 24)}<span></span></p>
      ${avisoVoz}
      <div class="folha-exemplos">
        <p>Você pode dizer:</p>
        <div class="folha-chips">${EXEMPLOS.map((x) => `<button class="chip" data-exemplo="${esc(x)}">${esc(x)}</button>`).join('')}</div>
      </div>
      <form class="folha-digitar" data-digitar>
        <label for="comando-digitado">Ou digite o comando</label>
        <div class="linha-campo">
          <input id="comando-digitado" class="campo" autocomplete="off" />
          <button class="botao botao-contorno" type="submit">Enviar</button>
        </div>
      </form>
      <div class="folha-acoes">
        <button class="botao botao-contorno" data-repetir hidden>${icone('recarregar')}<span>Tentar de novo</span></button>
        <button class="botao botao-contorno" data-fechar>Fechar</button>
      </div>
    </section>`;
  document.body.append(folha);
  folha.addEventListener('click', (e) => { if (e.target === folha) fecharFolha(); });
  folha.querySelector('[data-fechar]').addEventListener('click', fecharFolha);
  folha.querySelector('[data-repetir]').addEventListener('click', comecarEscuta);
  folha.querySelector('[data-terminei]').addEventListener('click', terminarEscuta);
  folha.querySelectorAll('[data-exemplo]').forEach((b) => b.addEventListener('click', () => executar(b.dataset.exemplo)));
  folha.querySelector('[data-digitar]').addEventListener('submit', (e) => {
    e.preventDefault();
    const c = folha.querySelector('#comando-digitado');
    if (c.value.trim()) executar(c.value);
  });
  folha.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharFolha(); });
  if (vozDisponivel()) comecarEscuta();
  else mostrarEstado({ status: 'Voz indisponível', erro: 'Este navegador não tem reconhecimento de voz. Use o Chrome ou digite o comando.' });
}

// Microfone ao lado de um campo: preenche o campo com o que foi dito.
// aoMensagem(texto, gravando): gravando = true enquanto o microfone está ligado.
export function ditar(aoTexto, aoMensagem, aoFim) {
  pararFala();
  let terminou = false;
  aoMensagem?.('Gravando. Fale agora e toque no microfone quando terminar.', true);
  ouvir({
    aoParcial: (t) => aoMensagem?.(`Gravando: “${t}”`, true),
    aoFinal: (t) => { terminou = true; aoMensagem?.('', false); aoTexto(t); },
    aoErro: (m) => { terminou = true; aoMensagem?.(m, false); },
    aoFim: () => { if (!terminou) aoMensagem?.('', false); aoFim?.(); },
  });
}

function anotar(a) {
  const hoje = new Date().toLocaleDateString('pt-BR');
  if (a.tipo === 'faltaValor') {
    mostrarEstado({ status: 'Faltou o valor', transcricao: a.descricao, erro: 'Diga também quanto foi. Exemplo: vendi 3 calças por 50 reais.' });
    return;
  }
  if (a.tipo === 'caixa') {
    a.linha.categoria = categoriaPorDescricao(a.linha.tipo, a.linha.descricao);
    visao.mes = mesAtual(); // a anotação é de hoje: mostra o mês atual
  }
  salvarPlanilha(a.tipo, [...estado.planilhas[a.tipo], { ...a.linha, data: hoje }]);
  fecharFolha();
  let msg;
  if (a.tipo === 'caixa') msg = `Anotado: ${a.linha.tipo === 'entrou' ? 'entrou' : 'saiu'} ${reais(a.linha.valor)}, ${a.linha.descricao}, em ${nomeCategoria(a.linha.categoria)}.`;
  if (a.tipo === 'estoque') msg = `Anotado no estoque: ${a.linha.quantidade} ${a.linha.peca}.`;
  if (a.tipo === 'pedidos') msg = `Pedido anotado: ${a.linha.cliente}, ${a.linha.quantidade} ${a.linha.peca}.`;
  if (location.hash === `#/planilhas/${a.tipo}`) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else ir(`/planilhas/${a.tipo}`);
  aviso(msg);
  setTimeout(() => falar(msg), 150);
}

function executarGeral(acao) {
  const [nome, valor] = acao.split(':');
  if (nome === 'inicio') ir('/inicio');
  if (nome === 'golpe') ir('/golpe');
  if (nome === 'ajuda') ir('/ajuda');
  if (nome === 'ajustes') ir('/ajustes');
  if (nome === 'planilhas') ir('/planilhas');
  if (nome === 'preco') ir('/planilhas/preco');
  if (nome === 'materiais') ir('/materiais');
  if (nome === 'trilha') ir(`/trilha/${valor}`);
  if (nome === 'voltar') document.querySelector('[data-voltar]')?.click() ?? history.back();
  if (nome === 'ouvir') ouvirTela(tela.ler());
  if (nome === 'parar') pararFala();
  if (nome === 'letra') {
    const atual = estado.preferencias.escala;
    atualizarPreferencias({ escala: Math.min(1.4, Math.max(1, atual + (valor === 'mais' ? 0.2 : -0.2))) });
    aviso(valor === 'mais' ? 'Letra aumentada.' : 'Letra diminuída.');
  }
}

export function executar(texto) {
  const resultado = interpretar(texto, tela.comandos());
  if (!resultado) {
    mostrarEstado({ status: 'Não entendi', transcricao: `“${texto}”`, erro: 'Tente uma das frases abaixo.' });
    return;
  }
  if (resultado.tipo === 'anotacao') { anotar(resultado.anotacao); return; }
  if (resultado.tipo === 'geral' && resultado.acao === 'comandos') {
    mostrarEstado({ status: 'Comandos que eu entendo', transcricao: COMANDOS_GERAIS.filter((c) => c.acao !== 'comandos').map((c) => c.rotulo).join(', ') });
    return;
  }
  fecharFolha();
  if (resultado.tipo === 'tela') { resultado.comando.fazer(); return; }
  executarGeral(resultado.acao);
}
