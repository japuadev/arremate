import { estado } from '../app/estado.js';
import { campo, faixaSimulacao, passos } from '../componentes/comuns.js';
import { ligarDitado } from '../componentes/ditado.js';
import { icone } from '../componentes/icones.js';
import { esc, ir, reais, soDigitos } from '../app/utilidades.js';
import { pecaAtual, tipoAtual } from '../personalizacao/perfil.js';
import { comandosDeOpcoes, digitosFalados } from '../voz/comandos.js';

const ATIVIDADES = ['Facção de roupas', 'Confecção de roupas', 'Comércio de roupas'];

function fluxo(ctx, { titulo, voltarPara, etapas, concluir }) {
  let n = 0;
  let erro = '';
  const dados = {};
  const ativa = () => etapas[n];
  const final = () => n === etapas.length;

  function avancar() {
    const raiz = document.querySelector('#conteudo');
    const e = ativa();
    if (e.campo) dados[e.campo] = raiz.querySelector(`#${e.campo}`).value.trim();
    erro = e.validar?.(dados) || '';
    if (erro) { ctx.atualizar(); return; }
    n += 1;
    ctx.atualizar();
    document.querySelector('h1')?.focus();
    window.scrollTo(0, 0);
  }
  const escolher = (i) => { dados[ativa().chave] = ativa().opcoes[i]; avancar(); };

  return {
    titulo, semAbas: true,
    voltar: () => { if (n > 0 && !final()) { n -= 1; erro = ''; ctx.atualizar(); } else ir(voltarPara); },
    view() {
      if (final()) return concluir(dados);
      const e = ativa();
      let meio = '';
      if (e.campo) meio = campo({ id: e.campo, rotulo: e.rotulo, valor: dados[e.campo] ?? e.inicial?.() ?? '', modo: e.modo, erro, comVoz: true, ajuda: e.ajuda });
      if (e.opcoes) meio = `<div class="opcoes">${e.opcoes.map((o, i) => `<button class="opcao" data-op="${i}"><span class="opcao-num" aria-hidden="true">${i + 1}</span><span>${esc(o)}</span></button>`).join('')}</div>`;
      if (e.resumo) meio = `<dl class="revisao">${e.resumo(dados).map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>`;
      if (e.texto) meio = `<p class="texto-grande">${esc(e.texto)}</p>${meio}`;
      return `${faixaSimulacao()}${passos(n + 1, etapas.length, e.titulo)}${meio}
        ${e.opcoes ? '' : `<button class="botao botao-principal" data-prox>${esc(e.botao || 'Continuar')}</button>`}`;
    },
    montar(raiz) {
      ligarDitado(raiz, (t, id) => (id === 'cep' || id === 'valor' ? digitosFalados(t) : t));
      raiz.querySelector('[data-prox]')?.addEventListener('click', avancar);
      raiz.querySelectorAll('[data-op]').forEach((b) => b.addEventListener('click', () => escolher(Number(b.dataset.op))));
    },
    voz() {
      if (final()) return [];
      if (ativa().opcoes) return comandosDeOpcoes(ativa().opcoes, escolher);
      return [{ rotulo: 'Continuar', frases: ['continuar', 'proximo', 'confirmar', 'emitir', 'entrar'], fazer: avancar }];
    },
  };
}

function telaConcluida(linha, valor, rota, aviso2) {
  return `${faixaSimulacao()}<div class="confirmacao" role="status">${icone('check', 48)}<h1 tabindex="-1">${esc(linha)}</h1><p>${esc(valor)}</p></div>
    <p class="texto-grande">${esc(aviso2)}</p>
    <a class="botao botao-principal" href="#${rota}">Voltar para a trilha</a>`;
}

export function paginaSimuladorMei(ctx) {
  return fluxo(ctx, {
    titulo: 'Treino: abrir MEI', voltarPara: '/trilha/formalizar',
    etapas: [
      { titulo: 'Entre na sua conta gov.br', texto: 'No site de verdade, você entra com o CPF e a senha do gov.br. Aqui, é só continuar.', botao: 'Entrar com gov.br' },
      { titulo: 'Escolha o nome do negócio', campo: 'fantasia', rotulo: 'Nome do negócio', inicial: () => estado.perfil.negocio, validar: (d) => (d.fantasia ? '' : 'Falta o nome do negócio.') },
      { titulo: 'O que você faz?', chave: 'atividade', opcoes: ATIVIDADES },
      { titulo: 'Onde fica o negócio?', campo: 'cep', rotulo: 'CEP', modo: 'numeric', ajuda: 'Pode inventar. É só um treino.', validar: (d) => { const f = 8 - soDigitos(d.cep).length; if (f === 0) return ''; return f > 0 ? `Falta${f > 1 ? 'm' : ''} ${f} número${f > 1 ? 's' : ''}. O CEP tem 8.` : 'Tem número a mais. O CEP tem 8.'; } },
      { titulo: 'Confira tudo', resumo: (d) => [['Nome', d.fantasia], ['Atividade', d.atividade], ['CEP', d.cep]], botao: 'Confirmar cadastro' },
    ],
    concluir: () => telaConcluida('Cadastro concluído', 'CNPJ de treino: 00.000.000/0001-00', '/trilha/formalizar', 'No site oficial, os passos são parecidos e o cadastro é de graça.'),
  });
}

export function paginaSimuladorNota(ctx) {
  const faccao = tipoAtual().id === 'faccao';
  return fluxo(ctx, {
    titulo: 'Treino: emitir nota', voltarPara: '/trilha/formalizar',
    etapas: [
      { titulo: 'Para quem é a nota?', campo: 'cliente', rotulo: 'Nome da empresa ou pessoa', inicial: () => 'Confecção Exemplo', validar: (d) => (d.cliente ? '' : 'Falta o nome de quem recebe a nota.') },
      { titulo: 'O que foi feito?', campo: 'descricao', rotulo: 'Descrição', inicial: () => `${faccao ? 'Costura de' : 'Venda de'} 50 ${pecaAtual().varias}`, validar: (d) => (d.descricao ? '' : 'Falta dizer o que foi feito.') },
      { titulo: 'Qual o valor?', campo: 'valor', rotulo: 'Valor em reais', modo: 'decimal', validar: (d) => (Number(d.valor.replace(',', '.')) > 0 ? '' : 'Escreva o valor em números. Exemplo: 350,00') },
      { titulo: 'Revise antes de emitir', resumo: (d) => [['Para', d.cliente], ['Descrição', d.descricao], ['Valor', reais(Number(d.valor.replace(',', '.')))]], botao: 'Emitir nota de treino' },
    ],
    concluir: (d) => telaConcluida('Nota emitida no treino', `${d.cliente}, ${reais(Number(d.valor.replace(',', '.')))}`, '/trilha/formalizar', 'No emissor oficial, guarde o arquivo da nota e envie para quem contratou.'),
  });
}
