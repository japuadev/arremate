// Monta o arquivo "Controle do negócio" (.xlsx) com as anotações da pessoa.
// Abas: Resumo, Caixa, Estoque, Pedidos e Preço da peça. As contas ficam em fórmulas,
// então a planilha continua funcionando quando a pessoa anota direto no Excel.
import { gerarXlsx } from './xlsx.js';
import { CATEGORIAS, SITUACOES, PRECO_INICIAL, nomeCategoria } from '../dados/modelos.js';
import { lerData, mesesComAnotacao, mesAtual, somarMes } from './financas.js';

const LINHAS_EXTRAS = 40; // linhas formatadas em branco para continuar anotando no Excel
const NOMES_ENTRADA = CATEGORIAS.entrou.map((c) => c.nome);
const NOMES_SAIDA = CATEGORIAS.saiu.map((c) => c.nome);

const cab = (titulos) => titulos.map((v) => ({ v, s: 'cabecalho' }));
const topo = (titulo, subtitulo) => [[{ v: titulo, s: 'titulo' }], [{ v: subtitulo, s: 'nota' }]];

function abaCaixa(linhas) {
  // Ordem de data, para o saldo acumulado fazer sentido.
  const ordenadas = [...linhas].sort((a, b) => (lerData(a.data) ?? 0) - (lerData(b.data) ?? 0));
  const inicio = 4; // primeira linha de dados
  const total = Math.max(ordenadas.length, 1) + LINHAS_EXTRAS;
  const fim = inicio + total - 1;
  const corpo = [];
  for (let i = 0; i < total; i += 1) {
    const l = ordenadas[i];
    const r = inicio + i;
    const entrou = l?.tipo === 'entrou';
    corpo.push([
      { v: l ? lerData(l.data) : null, s: 'data' },
      { f: `IF(A${r}="","",DATE(YEAR(A${r}),MONTH(A${r}),1))`, s: 'mes' },
      { v: l ? (entrou ? 'Entrou' : 'Saiu') : null, s: 'texto' },
      { v: l ? nomeCategoria(l.categoria || (entrou ? 'venda' : 'outra-saida')) : null, s: 'texto' },
      { v: l?.descricao ?? null, s: 'texto' },
      { v: l && entrou ? Number(l.valor) : null, s: 'moedaEntrou' },
      { v: l && !entrou ? Number(l.valor) : null, s: 'moedaSaiu' },
      { f: r === inicio ? `IF(AND(F${r}="",G${r}=""),"",N(F${r})-N(G${r}))` : `IF(AND(F${r}="",G${r}=""),"",SUM(F$${inicio}:F${r})-SUM(G$${inicio}:G${r}))`, s: 'moeda' },
    ]);
  }
  return {
    nome: 'Caixa',
    cor: 'FF2F6B4F',
    paisagem: true,
    larguras: [12, 11, 10, 24, 34, 14, 14, 16],
    linhas: [
      ...topo('Caixa: dinheiro que entrou e que saiu', 'Anote no mesmo dia. Em "Tipo" e "Categoria", escolha da lista. O saldo e a coluna Mês se preenchem sozinhos.'),
      cab(['Data', 'Mês', 'Tipo', 'Categoria', 'Descrição', 'Entrou (R$)', 'Saiu (R$)', 'Saldo (R$)']),
      ...corpo,
      [null, null, null, null, { v: 'Total', s: 'totalRotulo' }, { f: `SUM(F${inicio}:F${fim})`, s: 'totalMoeda' }, { f: `SUM(G${inicio}:G${fim})`, s: 'totalMoeda' }, { f: `F${fim + 1}-G${fim + 1}`, s: 'totalMoeda' }],
    ],
    alturas: { 1: 30, 2: 30 },
    juntar: ['A2:H2'],
    congelar: 'A4',
    filtro: `A3:H${fim}`,
    listas: [
      { faixa: `C${inicio}:C${fim}`, opcoes: ['Entrou', 'Saiu'] },
      { faixa: `D${inicio}:D${fim}`, opcoes: [...NOMES_ENTRADA, ...NOMES_SAIDA] },
    ],
    fim,
    inicio,
  };
}

function abaResumo(caixa, linhasCaixa, perfil) {
  const C = `Caixa!$B$${caixa.inicio}:$B$${caixa.fim}`;
  const F = `Caixa!$F$${caixa.inicio}:$F$${caixa.fim}`;
  const G = `Caixa!$G$${caixa.inicio}:$G$${caixa.fim}`;
  const D = `Caixa!$D$${caixa.inicio}:$D$${caixa.fim}`;
  // Últimos 6 meses (ou os meses com anotação, se houver mais antigos).
  const recentes = mesesComAnotacao(linhasCaixa);
  const maisNovo = recentes[0] && recentes[0] > mesAtual() ? recentes[0] : mesAtual();
  const meses = Array.from({ length: 6 }, (_, i) => somarMes(maisNovo, i - 5));
  const linhaMes = (mes, r) => {
    const [a, m] = mes.split('-').map(Number);
    return [
      { v: new Date(a, m - 1, 1), s: 'mes' },
      { f: `SUMIFS(${F},${C},A${r})`, s: 'moedaEntrou' },
      { f: `SUMIFS(${G},${C},A${r})`, s: 'moedaSaiu' },
      { f: `B${r}-C${r}`, s: 'moeda' },
      { f: `IF(B${r}=0,"",D${r}/B${r})`, s: 'porcento' },
    ];
  };
  const r0 = 6;
  const tabelaMeses = meses.map((mes, i) => linhaMes(mes, r0 + i));
  const rTotal = r0 + meses.length;
  const rCat = rTotal + 3;
  const categorias = [...NOMES_SAIDA.map((n) => [n, G]), ...NOMES_ENTRADA.map((n) => [n, F])];
  return {
    nome: 'Resumo',
    larguras: [26, 16, 16, 16, 14],
    linhas: [
      [{ v: perfil.negocio || 'Meu negócio', s: 'titulo' }],
      [{ v: 'Controle do negócio feito com o Arremate. Os valores vêm da aba Caixa e se atualizam sozinhos.', s: 'nota' }],
      [],
      [{ v: 'Mês a mês', s: 'subtitulo' }],
      cab(['Mês', 'Entrou', 'Saiu', 'Sobrou', 'Sobra / entrada']),
      ...tabelaMeses,
      [{ v: 'Total dos 6 meses', s: 'totalRotulo' }, { f: `SUM(B${r0}:B${rTotal - 1})`, s: 'totalMoeda' }, { f: `SUM(C${r0}:C${rTotal - 1})`, s: 'totalMoeda' }, { f: `SUM(D${r0}:D${rTotal - 1})`, s: 'totalMoeda' }, { f: `IF(B${rTotal}=0,"",D${rTotal}/B${rTotal})`, s: 'porcento' }],
      [],
      [{ v: 'Por categoria (todos os meses)', s: 'subtitulo' }],
      cab(['Categoria', 'Tipo', 'Total', 'Parte do total']),
      ...categorias.map(([nome, faixa], i) => {
        const r = rCat + 1 + i;
        const saida = faixa === G;
        return [
          { v: nome, s: 'texto' },
          { v: saida ? 'Saiu' : 'Entrou', s: 'texto' },
          { f: `SUMIFS(${faixa},${D},A${r})`, s: saida ? 'moedaSaiu' : 'moedaEntrou' },
          { f: `IF(SUM(${faixa})=0,"",C${r}/SUM(${faixa}))`, s: 'porcento' },
        ];
      }),
    ],
    alturas: { 1: 30 },
    juntar: ['A2:E2'],
    congelar: 'A6',
  };
}

function abaEstoque(linhas) {
  const inicio = 4;
  const total = Math.max(linhas.length, 1) + LINHAS_EXTRAS;
  const fim = inicio + total - 1;
  return {
    nome: 'Estoque',
    cor: 'FFB07D0E',
    larguras: [34, 14, 16],
    linhas: [
      ...topo('Estoque: peças que você tem agora', 'Atualize a quantidade quando a peça sair ou chegar.'),
      cab(['Peça', 'Quantidade', 'Atualizado em']),
      ...Array.from({ length: total }, (_, i) => {
        const l = linhas[i];
        return [{ v: l?.peca ?? null, s: 'texto' }, { v: l ? Number(l.quantidade) : null, s: 'inteiro' }, { v: l ? lerData(l.data) : null, s: 'data' }];
      }),
      [{ v: 'Total de peças', s: 'totalRotulo' }, { f: `SUM(B${inicio}:B${fim})`, s: 'totalInteiro' }, { v: '', s: 'totalRotulo' }],
    ],
    juntar: ['A2:C2'],
    congelar: 'A4',
    filtro: `A3:C${fim}`,
  };
}

function abaPedidos(linhas) {
  const inicio = 4;
  const total = Math.max(linhas.length, 1) + LINHAS_EXTRAS;
  const fim = inicio + total - 1;
  const E = `E${inicio}:E${fim}`;
  const contagem = (rotulo) => [{ v: rotulo, s: 'textoForte' }, { f: `COUNTIF(${E},"${rotulo}")`, s: 'inteiro' }];
  const corpo = Array.from({ length: total }, (_, i) => {
    const l = linhas[i];
    const linha = [
      { v: l ? lerData(l.data) : null, s: 'data' },
      { v: l?.cliente ?? null, s: 'texto' },
      { v: l?.peca ?? null, s: 'texto' },
      { v: l ? Number(l.quantidade) : null, s: 'inteiro' },
      { v: l?.situacao ?? null, s: 'texto' },
    ];
    // Quadro de contagem ao lado da tabela.
    if (i < SITUACOES.length) linha.push(null, ...contagem(SITUACOES[i]));
    return linha;
  });
  return {
    nome: 'Pedidos',
    cor: 'FF2A5DB0',
    larguras: [12, 26, 26, 12, 13, 3, 14, 10],
    linhas: [
      ...topo('Pedidos: quem pediu, o quê e como está', 'Mude a situação na lista: A fazer, Pronto ou Entregue. A cor muda sozinha.'),
      [...cab(['Data', 'Cliente', 'Peça', 'Quantidade', 'Situação']), null, ...cab(['Situação', 'Pedidos'])],
      ...corpo,
    ],
    juntar: ['A2:H2'],
    congelar: 'A4',
    filtro: `A3:E${fim}`,
    listas: [{ faixa: E, opcoes: SITUACOES }],
    cores: [
      { faixa: E, igual: 'Entregue', estilo: 'verde' },
      { faixa: E, igual: 'Pronto', estilo: 'azul' },
      { faixa: E, igual: 'A fazer', estilo: 'amarelo' },
    ],
  };
}

function abaPreco(valores) {
  const v = { ...PRECO_INICIAL, ...valores };
  const linha = (rotulo, valor, estilo, ajuda = '') => [{ v: rotulo, s: 'textoForte' }, { v: valor, s: estilo }, { v: ajuda, s: 'nota' }];
  return {
    nome: 'Preço da peça',
    cor: 'FFE0A526',
    larguras: [40, 16, 46],
    linhas: [
      ...topo('Quanto cobrar por peça', 'Troque só as células amarelas. O resto é calculado.'),
      cab(['O que entra no preço', 'Valor', 'Dica']),
      linha('Material por peça (tecido, linha, aviamento)', v.material, 'entradaMoeda', 'Some o que gasta de material em uma peça.'),
      linha('Mão de obra por peça', v.maoDeObra, 'entradaMoeda', 'Quanto paga (ou quer receber) para costurar uma peça.'),
      linha('Contas do mês (energia, aluguel, internet, DAS)', v.contasMes, 'entradaMoeda', 'Gastos que existem mesmo sem produzir.'),
      linha('Peças feitas por mês', v.pecasMes, 'entradaInteiro', 'Uma média dos últimos meses.'),
      linha('Lucro que quer ter', v.lucro / 100, 'entradaPorcento', 'Em cima do custo. 30% é um ponto de partida comum.'),
      [],
      [{ v: 'Parte das contas em cada peça', s: 'texto' }, { f: 'IF(B7=0,0,B6/B7)', s: 'moeda' }, { v: 'Contas do mês divididas pelas peças.', s: 'nota' }],
      [{ v: 'Custo de cada peça', s: 'textoForte' }, { f: 'B4+B5+B10', s: 'moeda' }, { v: 'Abaixo disso, você paga para trabalhar.', s: 'nota' }],
      [{ v: 'Preço sugerido por peça', s: 'textoForte' }, { f: 'B11*(1+B8)', s: 'destaqueMoeda' }, { v: 'Compare com o preço da concorrência.', s: 'nota' }],
      [{ v: 'Quanto sobra em cada peça', s: 'texto' }, { f: 'B12-B11', s: 'moeda' }],
      [{ v: 'Quanto sobra no mês', s: 'texto' }, { f: 'B13*B7', s: 'moeda' }],
    ],
    alturas: { 1: 30, 11: 26 },
    juntar: ['A2:C2'],
  };
}

const ABAS = ['Resumo', 'Caixa', 'Estoque', 'Pedidos', 'Preço da peça'];

export function montarControle(estado, abaAtiva = 'Resumo') {
  const caixa = abaCaixa(estado.planilhas.caixa);
  const abas = [
    abaResumo(caixa, estado.planilhas.caixa, estado.perfil),
    caixa,
    abaEstoque(estado.planilhas.estoque),
    abaPedidos(estado.planilhas.pedidos),
    abaPreco(estado.calculos?.preco),
  ];
  return gerarXlsx(abas, { ativa: Math.max(0, ABAS.indexOf(abaAtiva)), titulo: `Controle do negócio - ${estado.perfil.negocio || 'Arremate'}` });
}

export function baixarControle(estado, abaAtiva) {
  const bytes = montarControle(estado, abaAtiva);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const nome = (estado.perfil.negocio || 'meu-negocio').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  a.download = `controle-${nome || 'negocio'}.xlsx`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

