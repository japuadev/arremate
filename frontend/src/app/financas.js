// Contas do caixa por mês e por categoria. Não depende do navegador, por isso tem testes em tests/.
import { CATEGORIAS } from '../dados/modelos.js';

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

// "24/11/2026" → "2026-11"
export function mesDaData(data) {
  const m = String(data ?? '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[2].padStart(2, '0')}` : '';
}

export function lerData(data) {
  const m = String(data ?? '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : null;
}

export function mesAtual(hoje = new Date()) {
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
}

// Mês que a pessoa está vendo no painel e no caixa.
export const visao = { mes: mesAtual() };

export function somarMes(mes, n) {
  const [a, m] = mes.split('-').map(Number);
  const d = new Date(a, m - 1 + n, 1);
  return mesAtual(d);
}

export function nomeDoMes(mes, { comAno = true } = {}) {
  const [a, m] = mes.split('-').map(Number);
  return comAno ? `${MESES[m - 1]} de ${a}` : MESES[m - 1];
}

export function resumoDoMes(linhas, mes) {
  const doMes = linhas.filter((l) => mesDaData(l.data) === mes);
  const soma = (tipo) => doMes.filter((l) => l.tipo === tipo).reduce((s, l) => s + Number(l.valor || 0), 0);
  const entrou = soma('entrou');
  const saiu = soma('saiu');
  return { mes, entrou, saiu, sobrou: entrou - saiu, quantidade: doMes.length };
}

// Total de cada categoria no mês, do maior para o menor. Linhas antigas sem categoria entram em "Outra".
export function porCategoria(linhas, mes, tipo) {
  const padrao = tipo === 'entrou' ? 'venda' : 'outra-saida';
  const totais = new Map();
  for (const l of linhas) {
    if (l.tipo !== tipo || mesDaData(l.data) !== mes) continue;
    const id = l.categoria || padrao;
    totais.set(id, (totais.get(id) || 0) + Number(l.valor || 0));
  }
  const total = [...totais.values()].reduce((s, v) => s + v, 0);
  return CATEGORIAS[tipo]
    .filter((c) => totais.has(c.id))
    .map((c) => ({ id: c.id, nome: c.nome, valor: totais.get(c.id), parte: total ? totais.get(c.id) / total : 0 }))
    .sort((a, b) => b.valor - a.valor);
}

// Meses que têm anotação, do mais recente para o mais antigo.
export function mesesComAnotacao(linhas) {
  return [...new Set(linhas.map((l) => mesDaData(l.data)).filter(Boolean))].sort().reverse();
}

// Preço da peça: custo de material + mão de obra + parte das contas do mês, mais o lucro sobre o custo.
export function calcularPreco({ material, maoDeObra, contasMes, pecasMes, lucro }) {
  const n = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const parteContas = n(pecasMes) > 0 ? n(contasMes) / n(pecasMes) : 0;
  const custo = n(material) + n(maoDeObra) + parteContas;
  const preco = custo * (1 + n(lucro) / 100);
  return { parteContas, custo, preco, ganho: preco - custo };
}
