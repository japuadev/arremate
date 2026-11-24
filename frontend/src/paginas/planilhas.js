import { MODELOS, SITUACOES } from '../dados/modelos.js';
import { estado, salvarPlanilha } from '../app/estado.js';
import { campo } from '../componentes/comuns.js';
import { ligarDitado } from '../componentes/ditado.js';
import { icone } from '../componentes/icones.js';
import { aviso, esc, ir, reais } from '../app/utilidades.js';
import { t } from '../personalizacao/perfil.js';

export function paginaModelos() {
  return {
    titulo: 'Minhas planilhas', voltar: '/inicio',
    view: () => `<h1 tabindex="-1">Minhas planilhas</h1>
      <p class="texto-grande">Prontas para usar no seu dia a dia.</p>
      <div class="pilha">${Object.values(MODELOS).map((m) => `<a class="linha-atalho" href="#/planilhas/${m.id}">${icone(m.icone, 32)}<span><strong>${m.nome}</strong><br>${m.descricao}</span></a>`).join('')}</div>`,
    voz: () => Object.values(MODELOS).map((m) => ({ rotulo: m.nome, frases: [m.nome], fazer: () => ir(`/planilhas/${m.id}`) })),
  };
}

const paraLinhaCsv = (id, l) => ({
  estoque: [l.peca, l.quantidade, l.data],
  caixa: [l.tipo === 'entrou' ? 'Entrou' : 'Saiu', l.descricao, String(l.valor).replace('.', ','), l.data],
  pedidos: [l.cliente, l.peca, l.quantidade, l.situacao, l.data],
})[id];

function baixarCsv(m, linhas) {
  // Ponto e vírgula e marcação BOM para o Excel em português abrir com acentos e colunas certas.
  const texto = [m.colunas, ...linhas.map((l) => paraLinhaCsv(m.id, l))]
    .map((c) => c.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';')).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([`﻿${texto}`], { type: 'text/csv;charset=utf-8' }));
  a.download = `arremate-${m.id}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  aviso('Planilha baixada. Abra no Excel.');
}

export function paginaPlanilha(id, ctx) {
  const m = MODELOS[id];
  if (!m) { ir('/planilhas'); return { view: () => '' }; }
  let erros = {};
  let tipoCaixa = 'entrou';
  const linhas = () => estado.planilhas[id];
  const hoje = () => new Date().toLocaleDateString('pt-BR');
  const lerNum = (v) => Number(String(v).replace(/\./g, '').replace(',', '.'));

  function formulario() {
    if (id === 'estoque') return campo({ id: 'peca', rotulo: 'Nome da peça', erro: erros.peca, comVoz: true }) + campo({ id: 'quantidade', rotulo: 'Quantidade', modo: 'numeric', erro: erros.quantidade });
    if (id === 'pedidos') return campo({ id: 'cliente', rotulo: 'Quem pediu', erro: erros.cliente, comVoz: true }) + campo({ id: 'peca', rotulo: 'Peça', erro: erros.peca, comVoz: true }) + campo({ id: 'quantidade', rotulo: 'Quantidade', modo: 'numeric', erro: erros.quantidade });
    return `<div class="duplo" role="group" aria-label="Tipo">
        <button type="button" class="opcao-pequena" aria-pressed="${tipoCaixa === 'entrou'}" data-tipo="entrou">${icone('mais')}Entrou</button>
        <button type="button" class="opcao-pequena" aria-pressed="${tipoCaixa === 'saiu'}" data-tipo="saiu">${icone('menos')}Saiu</button>
      </div>${campo({ id: 'descricao', rotulo: 'O que foi', erro: erros.descricao, comVoz: true })}${campo({ id: 'valor', rotulo: 'Valor em reais', modo: 'decimal', erro: erros.valor })}`;
  }

  function resumo() {
    const l = linhas();
    if (id === 'estoque') return `<div class="resumo"><p><span>Total em estoque</span><strong>${l.reduce((s, x) => s + x.quantidade, 0)} peças</strong></p></div>`;
    if (id === 'pedidos') return `<div class="resumo"><p><span>A fazer</span><strong>${l.filter((x) => x.situacao === 'A fazer').length}</strong></p><p><span>Prontos</span><strong>${l.filter((x) => x.situacao === 'Pronto').length}</strong></p></div>`;
    const e = l.filter((x) => x.tipo === 'entrou').reduce((s, x) => s + x.valor, 0);
    const a = l.filter((x) => x.tipo === 'saiu').reduce((s, x) => s + x.valor, 0);
    return `<div class="resumo"><p><span>Entrou</span><strong>${reais(e)}</strong></p><p><span>Saiu</span><strong>${reais(a)}</strong></p><p class="resumo-total"><span>Sobrou</span><strong>${reais(e - a)}</strong></p></div>`;
  }

  function linhaHtml(l, i) {
    const excluir = `<button class="botao-icone" data-del="${i}" aria-label="Apagar linha">${icone('lixo', 24)}</button>`;
    if (id === 'estoque') {
      return `<li class="registro"><span class="registro-texto"><strong>${esc(l.peca)}</strong></span>
        <span class="contador"><button class="botao-icone" data-q="${i}:-1" aria-label="Tirar uma">${icone('menos', 24)}</button><b>${l.quantidade}</b><button class="botao-icone" data-q="${i}:1" aria-label="Somar uma">${icone('mais', 24)}</button></span>${excluir}</li>`;
    }
    if (id === 'pedidos') {
      return `<li class="registro"><span class="registro-texto"><strong>${esc(l.cliente)}</strong>${l.quantidade} ${esc(l.peca)}</span>
        <button class="situacao situacao-${SITUACOES.indexOf(l.situacao)}" data-sit="${i}" aria-label="Mudar situação: ${esc(l.situacao)}">${esc(l.situacao)}</button>${excluir}</li>`;
    }
    return `<li class="registro"><span class="registro-texto"><strong>${esc(l.descricao)}</strong>${esc(l.data)}</span>
      <b class="${l.tipo === 'entrou' ? 'valor-entrou' : 'valor-saiu'}">${l.tipo === 'entrou' ? '+' : '−'} ${reais(l.valor)}</b>${excluir}</li>`;
  }

  return {
    titulo: m.nome, voltar: '/planilhas',
    view() {
      const l = linhas();
      return `<h1 tabindex="-1">${m.nome}</h1>
        ${resumo()}
        ${l.length ? `<ul class="registros">${l.map(linhaHtml).join('')}</ul>` : `<p class="vazio">Nada anotado ainda. Toque em Falar e diga: ${esc(t(m.ajudaVoz))}.</p>`}
        <form class="pilha caderno" data-form novalidate>
          <h2>Anotar à mão</h2>
          ${formulario()}
          <button class="botao botao-principal" type="submit">Anotar</button>
        </form>
        <button class="botao botao-contorno" data-csv ${l.length ? '' : 'disabled'}>${icone('baixar')}<span>Baixar para o Excel</span></button>`;
    },
    montar(raiz) {
      ligarDitado(raiz);
      raiz.querySelectorAll('[data-tipo]').forEach((b) => b.addEventListener('click', () => { tipoCaixa = b.dataset.tipo; ctx.atualizar(); }));
      raiz.querySelector('[data-csv]').addEventListener('click', () => baixarCsv(m, linhas()));
      raiz.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => {
        salvarPlanilha(id, linhas().filter((_, i) => i !== Number(b.dataset.del)));
        ctx.atualizar();
      }));
      raiz.querySelectorAll('[data-q]').forEach((b) => b.addEventListener('click', () => {
        const [i, d] = b.dataset.q.split(':').map(Number);
        salvarPlanilha(id, linhas().map((x, n) => (n === i ? { ...x, quantidade: Math.max(0, x.quantidade + d) } : x)));
        ctx.atualizar();
      }));
      raiz.querySelectorAll('[data-sit]').forEach((b) => b.addEventListener('click', () => {
        const i = Number(b.dataset.sit);
        salvarPlanilha(id, linhas().map((x, n) => (n === i ? { ...x, situacao: SITUACOES[(SITUACOES.indexOf(x.situacao) + 1) % SITUACOES.length] } : x)));
        ctx.atualizar();
      }));
      raiz.querySelector('[data-form]').addEventListener('submit', (e) => {
        e.preventDefault();
        const v = Object.fromEntries(new FormData(e.target));
        erros = {};
        const q = lerNum(v.quantidade);
        const preco = lerNum(v.valor);
        if (id !== 'caixa' && !v.peca?.trim()) erros.peca = 'Falta o nome da peça.';
        if (id === 'pedidos' && !v.cliente?.trim()) erros.cliente = 'Falta dizer quem pediu.';
        if (id !== 'caixa' && !(q > 0)) erros.quantidade = 'Escreva a quantidade em números.';
        if (id === 'caixa' && !v.descricao?.trim()) erros.descricao = 'Falta dizer o que foi.';
        if (id === 'caixa' && !(preco > 0)) erros.valor = 'Escreva o valor em números. Exemplo: 50,00';
        if (Object.keys(erros).length) { ctx.atualizar(); return; }
        let nova;
        if (id === 'estoque') nova = { peca: v.peca.trim(), quantidade: q };
        if (id === 'pedidos') nova = { cliente: v.cliente.trim(), peca: v.peca.trim(), quantidade: q, situacao: 'A fazer' };
        if (id === 'caixa') nova = { tipo: tipoCaixa, descricao: v.descricao.trim(), valor: preco };
        salvarPlanilha(id, [...linhas(), { ...nova, data: hoje() }]);
        aviso('Anotado.');
        ctx.atualizar();
      });
    },
    voz: () => [{ rotulo: 'Baixar', frases: ['baixar', 'baixar planilha', 'baixar para o excel'], fazer: () => linhas().length && baixarCsv(m, linhas()) }],
  };
}
