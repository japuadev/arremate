import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizar, numerosEmDigitos, digitosFalados, interpretar, interpretarAnotacao, comandosDeOpcoes } from '../src/voz/comandos.js';
import { redirecionarAntiga } from '../src/app/utilidades.js';

test('normaliza acento e pontuação', () => assert.equal(normalizar('É Golpe?!'), 'e golpe'));
test('normaliza valor em R$', () => assert.equal(normalizar('R$ 50,90'), '50.90 reais'));
test('números por extenso', () => {
  assert.equal(numerosEmDigitos('cento e vinte e cinco calcas'), '125 calcas');
  assert.equal(numerosEmDigitos('dois mil e trezentos'), '2300');
  assert.equal(numerosEmDigitos('calcas e blusas'), 'calcas e blusas');
});
test('comando geral', () => {
  assert.equal(interpretar('abrir formalizar').acao, 'trilha:formalizar');
  assert.equal(interpretar('letra maior').acao, 'letra:mais');
});
test('"ajuda" abre a tela Ajuda', () => {
  assert.equal(interpretar('Ajuda').acao, 'ajuda');
  assert.equal(interpretar('Preciso de ajuda!').acao, 'ajuda');
  assert.equal(interpretar('me ajuda aqui').acao, 'ajuda');
  assert.equal(interpretar('Socorro!').acao, 'ajuda'); // sinônimo antigo
  assert.equal(interpretar('é urgente').acao, 'ajuda');
});
test('lista de comandos só com "o que posso falar" e "comandos"', () => {
  assert.equal(interpretar('O que posso falar?').acao, 'comandos');
  assert.equal(interpretar('comandos').acao, 'comandos');
  assert.equal(interpretar('quais são os comandos').acao, 'comandos');
  assert.notEqual(interpretar('ajuda').acao, 'comandos');
});
test('links antigos de Socorro vão para Ajuda', () => {
  assert.equal(redirecionarAntiga('/socorro'), '/ajuda');
  assert.equal(redirecionarAntiga('/socorro/pix'), '/ajuda/pix');
  assert.equal(redirecionarAntiga('/socorrooo'), '/socorrooo');
  assert.equal(redirecionarAntiga('/inicio'), '/inicio');
});
test('frase desconhecida devolve nulo', () => assert.equal(interpretar('qual a previsao do tempo'), null));
test('tela tem prioridade e a frase mais longa vence', () => {
  const tela = [{ frases: ['e golpe', 'golpe'], id: 'g', fazer() {} }, { frases: ['nao e golpe'], id: 'n', fazer() {} }];
  assert.equal(interpretar('é golpe', tela).comando.id, 'g');
  assert.equal(interpretar('não é golpe', tela).comando.id, 'n');
});
test('venda', () => assert.deepEqual(interpretarAnotacao('Vendi 3 calças por 50 reais').linha, { tipo: 'entrou', descricao: '3 calças', valor: 50 }));
test('venda por extenso', () => assert.deepEqual(interpretarAnotacao('vendi duas blusas por cinquenta reais').linha, { tipo: 'entrou', descricao: '2 blusas', valor: 50 }));
test('venda com R$', () => assert.equal(interpretarAnotacao('vendi 3 calças por R$ 50,90').linha.valor, 50.9));
test('gasto', () => {
  assert.deepEqual(interpretarAnotacao('paguei 40 reais de linha').linha, { tipo: 'saiu', descricao: 'linha', valor: 40 });
  assert.deepEqual(interpretarAnotacao('comprei linha por 40').linha, { tipo: 'saiu', descricao: 'linha', valor: 40 });
});
test('venda sem valor pede o valor', () => assert.equal(interpretarAnotacao('vendi 3 calças').tipo, 'faltaValor'));
test('estoque', () => assert.deepEqual(interpretarAnotacao('tenho 20 camisas').linha, { peca: 'camisas', quantidade: 20 }));
test('pedido', () => assert.deepEqual(interpretarAnotacao('pedido da Maria 10 blusas').linha, { cliente: 'Maria', peca: 'blusas', quantidade: 10, situacao: 'A fazer' }));
test('opções por número ou ordinal', () => {
  let r; const c = comandosDeOpcoes(['Ainda não', 'Tenho'], (i) => { r = i; });
  interpretar('dois', c).comando.fazer(); assert.equal(r, 1);
  interpretar('a primeira', c).comando.fazer(); assert.equal(r, 0);
});
test('dígitos falados não somam', () => assert.equal(digitosFalados('oitenta e um nove nove oito'), '81998'));

test('valor falado em reais', async () => {
  const { valorFalado } = await import('../src/voz/comandos.js');
  assert.equal(valorFalado('trezentos e cinquenta reais'), '350');
  assert.equal(valorFalado('50 reais e 30 centavos'), '50,30');
  assert.equal(valorFalado('cinquenta reais e trinta centavos'), '50,30');
  assert.equal(valorFalado('R$ 1.200'), '1200');
  assert.equal(valorFalado('R$ 12,50'), '12,50');
  assert.equal(valorFalado('mil e quinhentos'), '1500');
  assert.equal(valorFalado('banana'), 'banana');
});

test('quantidade falada', async () => {
  const { inteiroFalado } = await import('../src/voz/comandos.js');
  assert.equal(inteiroFalado('vinte e cinco'), '25');
  assert.equal(inteiroFalado('30 por cento'), '30');
  assert.equal(inteiroFalado('120 peças'), '120');
});

test('data falada', async () => {
  const { dataFalada } = await import('../src/voz/comandos.js');
  const hoje = new Date(2026, 10, 25); // 25/11/2026
  assert.equal(dataFalada('hoje', hoje), '2026-11-25');
  assert.equal(dataFalada('ontem', hoje), '2026-11-24');
  assert.equal(dataFalada('anteontem', hoje), '2026-11-23');
  assert.equal(dataFalada('dia vinte', hoje), '2026-11-20');
  assert.equal(dataFalada('dia 28', hoje), '2026-10-28'); // futuro vira mês anterior
  assert.equal(dataFalada('três de outubro', hoje), '2026-10-03');
  assert.equal(dataFalada('vinte de dezembro', hoje), '2025-12-20'); // futuro vira ano anterior
  assert.equal(dataFalada('semana que vem', hoje), null);
});
