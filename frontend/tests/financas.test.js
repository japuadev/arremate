import test from 'node:test';
import assert from 'node:assert/strict';
import { mesDaData, resumoDoMes, porCategoria, somarMes, calcularPreco, nomeDoMes } from '../src/app/financas.js';
import { categoriaPorDescricao, categoriaValida } from '../src/dados/modelos.js';
import { zip, coluna, dataExcel } from '../src/app/xlsx.js';

const caixa = [
  { tipo: 'entrou', descricao: 'venda', valor: 150, data: '20/11/2026', categoria: 'venda' },
  { tipo: 'saiu', descricao: 'linha', valor: 40, data: '21/11/2026', categoria: 'material' },
  { tipo: 'saiu', descricao: 'energia', valor: 60, data: '02/11/2026' },
  { tipo: 'entrou', descricao: 'feira', valor: 99, data: '30/10/2026' },
];

test('mês da data', () => {
  assert.equal(mesDaData('5/1/2026'), '2026-01');
  assert.equal(mesDaData('texto'), '');
});
test('somar mês atravessa o ano', () => {
  assert.equal(somarMes('2026-01', -1), '2025-12');
  assert.equal(somarMes('2026-12', 1), '2027-01');
  assert.equal(nomeDoMes('2026-03'), 'março de 2026');
});
test('resumo do mês', () => {
  assert.deepEqual(resumoDoMes(caixa, '2026-11'), { mes: '2026-11', entrou: 150, saiu: 100, sobrou: 50, quantidade: 3 });
});
test('por categoria: linha sem categoria cai em Outra saída', () => {
  const r = porCategoria(caixa, '2026-11', 'saiu');
  assert.deepEqual(r.map((c) => [c.id, c.valor]), [['outra-saida', 60], ['material', 40]]);
  assert.equal(r[0].parte, 0.6);
});
test('categoria adivinhada pela descrição', () => {
  assert.equal(categoriaPorDescricao('saiu', '40 reais de linha'), 'material');
  assert.equal(categoriaPorDescricao('saiu', 'conta de Energia'), 'contas');
  assert.equal(categoriaPorDescricao('saiu', 'frete para Caruaru'), 'transporte');
  assert.equal(categoriaPorDescricao('saiu', 'presente'), 'outra-saida');
  assert.equal(categoriaPorDescricao('entrou', 'costura de 50 calças'), 'servico');
  assert.equal(categoriaPorDescricao('entrou', '3 calças'), 'venda');
  assert.ok(categoriaValida('saiu', 'material'));
  assert.ok(!categoriaValida('entrou', 'material'));
});
test('preço da peça', () => {
  const r = calcularPreco({ material: 18, maoDeObra: 6, contasMes: 400, pecasMes: 400, lucro: 30 });
  assert.equal(r.custo, 25);
  assert.equal(r.preco, 32.5);
  assert.equal(calcularPreco({ material: 10, maoDeObra: 0, contasMes: 100, pecasMes: 0, lucro: 0 }).preco, 10);
});
test('xlsx: colunas, datas e zip', () => {
  assert.equal(coluna(0), 'A');
  assert.equal(coluna(27), 'AB');
  assert.equal(dataExcel(new Date(2026, 10, 24)), 46350);
  const z = zip({ 'a.txt': 'olá' });
  assert.deepEqual([...z.slice(0, 4)], [0x50, 0x4B, 0x03, 0x04]);
});
