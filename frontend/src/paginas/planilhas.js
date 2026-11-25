// Finanças: painel do mês, caixa com categorias, estoque, pedidos, calculadora de preço
// e o arquivo do Excel com tudo.
import { MODELOS, SITUACOES, CATEGORIAS, PRECO_INICIAL, nomeCategoria, categoriaPorDescricao } from '../dados/modelos.js';
import { estado, salvarPlanilha, salvarCalculo } from '../app/estado.js';
import { visao, mesAtual, mesDaData, nomeDoMes, porCategoria, resumoDoMes, somarMes, calcularPreco, lerData } from '../app/financas.js';
import { baixarControle } from '../app/exportar.js';
import { campo } from '../componentes/comuns.js';
import { ligarDitado } from '../componentes/ditado.js';
import { icone } from '../componentes/icones.js';
import { aviso, esc, ir, reais } from '../app/utilidades.js';
import { t, pecaAtual } from '../personalizacao/perfil.js';

const hoje = () => new Date().toLocaleDateString('pt-BR');
const hojeIso = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const lerNum = (v) => Number(String(v ?? '').replace(/\s|R\$/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'));
const maiuscula = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function baixar(aba) {
  baixarControle(estado, aba);
  aviso('Planilha baixada. Abre no Excel e no Google Planilhas.');
}

function seletorMes() {
  const proximoBloqueado = visao.mes >= mesAtual();
  return `<div class="mes-seletor" role="group" aria-label="Escolher o mês">
    <button class="botao-icone" data-mes="-1" aria-label="Mês anterior">${icone('voltar', 24)}</button>
    <p aria-live="polite"><strong>${maiuscula(nomeDoMes(visao.mes))}</strong></p>
    <button class="botao-icone" data-mes="1" aria-label="Próximo mês" ${proximoBloqueado ? 'disabled' : ''}>${icone('avancar', 24)}</button>
  </div>`;
}

function ligarSeletorMes(raiz, ctx) {
  raiz.querySelectorAll('[data-mes]').forEach((b) => b.addEventListener('click', () => {
    visao.mes = somarMes(visao.mes, Number(b.dataset.mes));
    ctx.atualizar();
  }));
}

const comandosMes = (ctx) => [
  { rotulo: 'Mês anterior', frases: ['mes anterior', 'mes passado'], fazer: () => { visao.mes = somarMes(visao.mes, -1); ctx.atualizar(); } },
  { rotulo: 'Este mês', frases: ['este mes', 'mes atual', 'esse mes'], fazer: () => { visao.mes = mesAtual(); ctx.atualizar(); } },
];

// Painel do mês: quanto entrou, quanto saiu e quanto sobrou, com a barra comparando os dois.
function painelMes(r, anterior) {
  const maior = Math.max(r.entrou, r.saiu, 1);
  const diferenca = r.sobrou - anterior.sobrou;
  let comparacao = '';
  if (anterior.quantidade && r.quantidade) {
    comparacao = diferenca === 0
      ? `Igual a ${nomeDoMes(anterior.mes, { comAno: false })}.`
      : `${reais(Math.abs(diferenca))} ${diferenca > 0 ? 'a mais' : 'a menos'} que em ${nomeDoMes(anterior.mes, { comAno: false })}.`;
  }
  return `<section class="painel-mes ${r.sobrou < 0 ? 'painel-mes-negativo' : ''}">
    <p class="painel-mes-rotulo">${r.sobrou < 0 ? 'Faltou' : 'Sobrou'} no mês</p>
    <p class="painel-mes-valor">${reais(Math.abs(r.sobrou))}</p>
    ${comparacao ? `<p class="painel-mes-comparacao">${esc(comparacao)}</p>` : ''}
    <div class="barras-mes">
      <p><span>${icone('mais', 20)}Entrou</span><strong>${reais(r.entrou)}</strong></p>
      <span class="barra"><i class="barra-entrou" style="width:${(r.entrou / maior) * 100}%"></i></span>
      <p><span>${icone('menos', 20)}Saiu</span><strong>${reais(r.saiu)}</strong></p>
      <span class="barra"><i class="barra-saiu" style="width:${(r.saiu / maior) * 100}%"></i></span>
    </div>
  </section>`;
}

function listaCategorias(titulo, itens, tipo) {
  if (!itens.length) return '';
  return `<section class="pilha">
    <h2>${titulo}</h2>
    <ul class="categorias">${itens.map((c) => `<li>
      <p><span>${esc(c.nome)}</span><strong>${reais(c.valor)}</strong></p>
      <span class="barra" aria-hidden="true"><i class="barra-${tipo}" style="width:${Math.max(c.parte * 100, 2)}%"></i></span>
      <small>${Math.round(c.parte * 100)}% ${tipo === 'saiu' ? 'das saídas' : 'das entradas'}</small>
    </li>`).join('')}</ul>
  </section>`;
}

// ---------- Painel de finanças ----------

export function paginaFinancas(ctx) {
  return {
    titulo: 'Meu caixa',
    view() {
      const caixa = estado.planilhas.caixa;
      const r = resumoDoMes(caixa, visao.mes);
      const anterior = resumoDoMes(caixa, somarMes(visao.mes, -1));
      const aFazer = estado.planilhas.pedidos.filter((x) => x.situacao === 'A fazer').length;
      const pecas = estado.planilhas.estoque.reduce((s, x) => s + Number(x.quantidade || 0), 0);
      return `<h1 tabindex="-1">Meu caixa</h1>
        ${seletorMes()}
        ${r.quantidade ? painelMes(r, anterior) : `<p class="vazio">Nada anotado em ${nomeDoMes(visao.mes, { comAno: false })}. Toque em Falar e diga: ${esc(t(MODELOS.caixa.ajudaVoz))}.</p>`}
        <a class="botao botao-principal" href="#/planilhas/caixa">${icone('mais')}<span>Anotar entrada ou saída</span></a>
        ${listaCategorias('Para onde foi o dinheiro', porCategoria(caixa, visao.mes, 'saiu'), 'saiu')}
        ${listaCategorias('De onde veio o dinheiro', porCategoria(caixa, visao.mes, 'entrou'), 'entrou')}
        <section class="pilha">
          <h2>Minhas planilhas</h2>
          <div class="cartoes-planilha">
            <a class="cartao-planilha" href="#/planilhas/caixa">${icone('dinheiro', 30)}<strong>Caixa</strong><span>${r.quantidade} ${r.quantidade === 1 ? 'anotação' : 'anotações'} no mês</span></a>
            <a class="cartao-planilha" href="#/planilhas/estoque">${icone('caixa', 30)}<strong>Estoque</strong><span>${pecas} ${pecas === 1 ? 'peça' : 'peças'}</span></a>
            <a class="cartao-planilha" href="#/planilhas/pedidos">${icone('recibo', 30)}<strong>Pedidos</strong><span>${aFazer} a fazer</span></a>
            <a class="cartao-planilha" href="#/planilhas/preco">${icone('etiqueta', 30)}<strong>Preço da peça</strong><span>Calcular quanto cobrar</span></a>
          </div>
        </section>
        <section class="baixar-excel">
          <span class="baixar-excel-icone" aria-hidden="true">${icone('planilha', 34)}</span>
          <div>
            <h2>Levar para o Excel</h2>
            <p>Um arquivo com resumo do mês, caixa, estoque, pedidos e preço da peça. As contas já vêm prontas.</p>
          </div>
          <button class="botao botao-contorno" data-baixar>${icone('baixar')}<span>Baixar planilha</span></button>
        </section>`;
    },
    montar(raiz) {
      ligarSeletorMes(raiz, ctx);
      raiz.querySelector('[data-baixar]').addEventListener('click', () => baixar('Resumo'));
    },
    voz: () => [
      ...comandosMes(ctx),
      ...Object.values(MODELOS).map((m) => ({ rotulo: m.nome, frases: [m.nome, `abrir ${m.nome}`], fazer: () => ir(`/planilhas/${m.id}`) })),
      { rotulo: 'Preço da peça', frases: ['preco', 'preco da peca', 'calcular preco'], fazer: () => ir('/planilhas/preco') },
      { rotulo: 'Baixar', frases: ['baixar', 'baixar planilha', 'excel'], fazer: () => baixar('Resumo') },
    ],
  };
}

// ---------- Caixa, estoque e pedidos ----------

const ABA_EXCEL = { caixa: 'Caixa', estoque: 'Estoque', pedidos: 'Pedidos' };

export function paginaPlanilha(id, ctx) {
  const m = MODELOS[id];
  if (!m) { ir('/planilhas'); return { view: () => '' }; }
  let erros = {};
  let tipoCaixa = 'entrou';
  let categoria = '';
  const linhas = () => estado.planilhas[id];

  function formulario() {
    if (id === 'estoque') return campo({ id: 'peca', rotulo: 'Nome da peça', erro: erros.peca, comVoz: true }) + campo({ id: 'quantidade', rotulo: 'Quantidade', modo: 'numeric', erro: erros.quantidade });
    if (id === 'pedidos') return campo({ id: 'cliente', rotulo: 'Quem pediu', erro: erros.cliente, comVoz: true }) + campo({ id: 'peca', rotulo: 'Peça', erro: erros.peca, comVoz: true }) + campo({ id: 'quantidade', rotulo: 'Quantidade', modo: 'numeric', erro: erros.quantidade });
    return `<div class="duplo" role="group" aria-label="Tipo">
        <button type="button" class="opcao-pequena opcao-entrou" aria-pressed="${tipoCaixa === 'entrou'}" data-tipo="entrou">${icone('mais')}Entrou</button>
        <button type="button" class="opcao-pequena opcao-saiu" aria-pressed="${tipoCaixa === 'saiu'}" data-tipo="saiu">${icone('menos')}Saiu</button>
      </div>
      ${campo({ id: 'descricao', rotulo: tipoCaixa === 'entrou' ? 'De onde veio' : 'Com o que gastou', erro: erros.descricao, comVoz: true })}
      ${campo({ id: 'valor', rotulo: 'Valor em reais', modo: 'decimal', erro: erros.valor })}
      <fieldset class="filtro">
        <legend>Categoria <span class="nota-baixa">(se não escolher, o app adivinha)</span></legend>
        <div class="filtro-lista">${CATEGORIAS[tipoCaixa].map((c) => `<button type="button" class="filtro-item" aria-pressed="${categoria === c.id}" data-categoria="${c.id}">${esc(c.nome)}</button>`).join('')}</div>
      </fieldset>
      <div class="grupo-campo">
        <label for="quando">Data</label>
        <input class="campo" id="quando" name="quando" type="date" value="${hojeIso()}" max="${hojeIso()}" />
      </div>`;
  }

  function resumo() {
    const l = linhas();
    if (id === 'estoque') return `<div class="resumo"><p><span>Total em estoque</span><strong>${l.reduce((s, x) => s + x.quantidade, 0)} peças</strong></p><p><span>Tipos de peça</span><strong>${l.length}</strong></p></div>`;
    if (id === 'pedidos') return `<div class="resumo">${SITUACOES.map((s, i) => `<p><span>${s}</span><strong class="situacao-texto-${i}">${l.filter((x) => x.situacao === s).length}</strong></p>`).join('')}</div>`;
    const r = resumoDoMes(l, visao.mes);
    return `<div class="resumo"><p><span>Entrou</span><strong class="valor-entrou">${reais(r.entrou)}</strong></p><p><span>Saiu</span><strong class="valor-saiu">${reais(r.saiu)}</strong></p><p class="resumo-total"><span>${r.sobrou < 0 ? 'Faltou' : 'Sobrou'}</span><strong>${reais(Math.abs(r.sobrou))}</strong></p></div>`;
  }

  function linhaHtml(l, i) {
    const excluir = `<button class="botao-icone" data-del="${i}" aria-label="Apagar linha">${icone('lixo', 24)}</button>`;
    if (id === 'estoque') {
      return `<li class="registro"><span class="registro-texto"><strong>${esc(l.peca)}</strong><small>Atualizado em ${esc(l.data)}</small></span>
        <span class="contador"><button class="botao-icone" data-q="${i}:-1" aria-label="Tirar uma">${icone('menos', 24)}</button><b>${l.quantidade}</b><button class="botao-icone" data-q="${i}:1" aria-label="Somar uma">${icone('mais', 24)}</button></span>${excluir}</li>`;
    }
    if (id === 'pedidos') {
      return `<li class="registro"><span class="registro-texto"><strong>${esc(l.cliente)}</strong>${l.quantidade} ${esc(l.peca)}<small>${esc(l.data)}</small></span>
        <button class="situacao situacao-${SITUACOES.indexOf(l.situacao)}" data-sit="${i}" aria-label="Mudar situação: ${esc(l.situacao)}">${esc(l.situacao)}</button>${excluir}</li>`;
    }
    const entrou = l.tipo === 'entrou';
    return `<li class="registro"><span class="marca-tipo ${entrou ? 'marca-entrou' : 'marca-saiu'}" aria-hidden="true">${icone(entrou ? 'mais' : 'menos', 18)}</span>
      <span class="registro-texto"><strong>${esc(l.descricao)}</strong><small>${esc(nomeCategoria(l.categoria || (entrou ? 'venda' : 'outra-saida')))}</small></span>
      <b class="${entrou ? 'valor-entrou' : 'valor-saiu'}">${entrou ? '+' : '−'} ${reais(l.valor)}</b>${excluir}</li>`;
  }

  // O caixa mostra só o mês escolhido, do dia mais recente para o mais antigo, separado por dia.
  function listaCaixa() {
    const doMes = linhas().map((l, i) => ({ l, i })).filter(({ l }) => mesDaData(l.data) === visao.mes)
      .sort((a, b) => (lerData(b.l.data) - lerData(a.l.data)) || b.i - a.i);
    if (!doMes.length) return `<p class="vazio">Nada anotado neste mês. Toque em Falar e diga: ${esc(t(m.ajudaVoz))}.</p>`;
    let dia = '';
    return `<ul class="registros">${doMes.map(({ l, i }) => {
      const titulo = l.data !== dia ? `<li class="registro-dia">${l.data === hoje() ? 'Hoje' : esc(l.data)}</li>` : '';
      dia = l.data;
      return titulo + linhaHtml(l, i);
    }).join('')}</ul>`;
  }

  return {
    titulo: m.nome, voltar: '/planilhas',
    view() {
      const l = linhas();
      let lista;
      if (id === 'caixa') lista = listaCaixa();
      else lista = l.length ? `<ul class="registros">${l.map(linhaHtml).join('')}</ul>` : `<p class="vazio">Nada anotado ainda. Toque em Falar e diga: ${esc(t(m.ajudaVoz))}.</p>`;
      return `<h1 tabindex="-1">${m.nome}</h1>
        ${id === 'caixa' ? seletorMes() : ''}
        ${resumo()}
        ${lista}
        <form class="pilha caderno" data-form novalidate>
          <h2>Anotar à mão</h2>
          ${formulario()}
          <button class="botao botao-principal" type="submit">Anotar</button>
        </form>
        <button class="botao botao-contorno" data-baixar>${icone('baixar')}<span>Baixar para o Excel</span></button>`;
    },
    montar(raiz) {
      ligarDitado(raiz);
      if (id === 'caixa') ligarSeletorMes(raiz, ctx);
      raiz.querySelectorAll('[data-tipo]').forEach((b) => b.addEventListener('click', () => { tipoCaixa = b.dataset.tipo; categoria = ''; ctx.atualizar(); }));
      raiz.querySelectorAll('[data-categoria]').forEach((b) => b.addEventListener('click', () => {
        categoria = categoria === b.dataset.categoria ? '' : b.dataset.categoria;
        raiz.querySelectorAll('[data-categoria]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.categoria === categoria)));
      }));
      raiz.querySelector('[data-baixar]').addEventListener('click', () => baixar(ABA_EXCEL[id]));
      raiz.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => {
        salvarPlanilha(id, linhas().filter((_, i) => i !== Number(b.dataset.del)));
        aviso('Linha apagada.');
        ctx.atualizar();
      }));
      raiz.querySelectorAll('[data-q]').forEach((b) => b.addEventListener('click', () => {
        const [i, d] = b.dataset.q.split(':').map(Number);
        salvarPlanilha(id, linhas().map((x, n) => (n === i ? { ...x, quantidade: Math.max(0, x.quantidade + d), data: hoje() } : x)));
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
        let data = hoje();
        if (id === 'estoque') nova = { peca: v.peca.trim(), quantidade: q };
        if (id === 'pedidos') nova = { cliente: v.cliente.trim(), peca: v.peca.trim(), quantidade: q, situacao: 'A fazer' };
        if (id === 'caixa') {
          const descricao = v.descricao.trim();
          nova = { tipo: tipoCaixa, descricao, valor: Math.round(preco * 100) / 100, categoria: categoria || categoriaPorDescricao(tipoCaixa, descricao) };
          const [a, mm, d] = String(v.quando || '').split('-');
          if (a && mm && d) data = `${d}/${mm}/${a}`;
          visao.mes = mesDaData(data) || visao.mes;
          categoria = '';
        }
        salvarPlanilha(id, [...linhas(), { ...nova, data }]);
        aviso(id === 'caixa' ? `Anotado em ${nomeCategoria(nova.categoria)}.` : 'Anotado.');
        ctx.atualizar();
      });
    },
    voz: () => [
      ...(id === 'caixa' ? comandosMes(ctx) : []),
      { rotulo: 'Baixar', frases: ['baixar', 'baixar planilha', 'baixar para o excel'], fazer: () => baixar(ABA_EXCEL[id]) },
    ],
  };
}

// ---------- Calculadora de preço ----------

export function paginaPreco(ctx) {
  const valores = { ...PRECO_INICIAL, ...estado.calculos.preco };
  const CAMPOS = [
    { id: 'material', rotulo: 'Material por peça (R$)', ajuda: 'Tecido, linha, botão, zíper, etiqueta.' },
    { id: 'maoDeObra', rotulo: 'Mão de obra por peça (R$)', ajuda: 'O que paga, ou quer receber, para costurar uma peça.' },
    { id: 'contasMes', rotulo: 'Contas do mês (R$)', ajuda: 'Energia, aluguel, internet, DAS do MEI.' },
    { id: 'pecasMes', rotulo: 'Peças feitas por mês', ajuda: 'Uma média dos últimos meses.', inteiro: true },
    { id: 'lucro', rotulo: 'Lucro que quer ter (%)', ajuda: 'Em cima do custo. 30% é um ponto de partida comum.', inteiro: true },
  ];
  const mostrar = (v, inteiro) => (inteiro ? String(v) : Number(v).toFixed(2).replace('.', ','));

  function resultado() {
    const r = calcularPreco(valores);
    return `<section class="resultado-preco" aria-live="polite">
      <p class="painel-mes-rotulo">Preço sugerido por ${esc(pecaAtual().uma)}</p>
      <p class="painel-mes-valor">${reais(r.preco)}</p>
      <dl class="conta-preco">
        <div><dt>Material</dt><dd>${reais(valores.material)}</dd></div>
        <div><dt>Mão de obra</dt><dd>${reais(valores.maoDeObra)}</dd></div>
        <div><dt>Parte das contas</dt><dd>${reais(r.parteContas)}</dd></div>
        <div class="conta-total"><dt>Custo da peça</dt><dd>${reais(r.custo)}</dd></div>
        <div><dt>Lucro de ${valores.lucro}%</dt><dd>+ ${reais(r.ganho)}</dd></div>
      </dl>
      <p>Com ${valores.pecasMes} peças, sobram ${reais(r.ganho * valores.pecasMes)} no mês.</p>
    </section>`;
  }

  return {
    titulo: 'Preço da peça', voltar: '/planilhas',
    view: () => `<h1 tabindex="-1">Quanto cobrar por peça</h1>
      <p class="texto-grande">Preço bom paga o material, o trabalho, as contas do mês e ainda sobra.</p>
      <div data-resultado>${resultado()}</div>
      <form class="pilha caderno" data-form novalidate>
        <h2>Seus números</h2>
        ${CAMPOS.map((c) => campo({ id: c.id, rotulo: c.rotulo, valor: mostrar(valores[c.id], c.inteiro), modo: c.inteiro ? 'numeric' : 'decimal', ajuda: c.ajuda })).join('')}
      </form>
      <p class="nota-baixa">Esta conta é um ponto de partida. Compare com o preço que o mercado paga e, se puder, converse com um contador ou com o Sebrae.</p>
      <button class="botao botao-contorno" data-baixar>${icone('baixar')}<span>Baixar calculadora para o Excel</span></button>`,
    montar(raiz) {
      raiz.querySelector('[data-form]').addEventListener('input', (e) => {
        const v = lerNum(e.target.value);
        if (!Number.isFinite(v) || v < 0) return;
        valores[e.target.name] = v;
        salvarCalculo('preco', { ...valores });
        raiz.querySelector('[data-resultado]').innerHTML = resultado();
      });
      raiz.querySelector('[data-form]').addEventListener('submit', (e) => e.preventDefault());
      raiz.querySelector('[data-baixar]').addEventListener('click', () => baixar('Preço da peça'));
    },
    voz: () => [{ rotulo: 'Baixar', frases: ['baixar', 'baixar calculadora'], fazer: () => baixar('Preço da peça') }],
  };
}
