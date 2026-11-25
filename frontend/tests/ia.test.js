import test from 'node:test';
import assert from 'node:assert/strict';
import { mascararDadosSensiveis as m, temDadoSensivel } from '../src/ia/dadosSensiveis.js';
import { validarAjuda, validarOutroJeito } from '../src/ia/validacao.js';
import { validarTela, desenharTela } from '../src/ia/ilustracao.js';
import { dinheiroJaEnviado, garantirPassoMED, PASSO_MED } from '../src/ia/regras.js';
import { criarServicoAjuda } from '../src/ia/servico.js';
import { criarIASimulada, responderSimulado, TEMAS, PASSOS_GERAIS } from '../src/ia/simulado.js';
import { ErroIA } from '../src/ia/contrato.js';

const formato = (e) => e instanceof ErroIA && e.tipo === 'formato';

// ---------- Mascaramento ----------

test('mascara CPF, cartão, conta, telefone e códigos', () => {
  assert.equal(m('Meu CPF é 123.456.789-00'), 'Meu CPF é ••••');
  assert.equal(m('cartão 1234 5678 9012 3456'), 'cartão ••••');
  assert.equal(m('agência 1234 conta 56789-0'), 'agência •••• conta ••••');
  assert.equal(m('liga pra mim no 81 99988-7766'), 'liga pra mim no ••••');
  assert.equal(m('o código que chegou foi 482913'), 'o código que chegou foi ••••');
});

test('mascara senha e código escritos com palavras', () => {
  assert.equal(m('minha senha é banana'), 'minha senha é ••••');
  assert.equal(m('Senha: abc'), 'Senha: ••••');
  assert.equal(m('passei a senha abc123 pra ele'), 'passei a senha •••• pra ele');
  assert.equal(m('a senha do banco é banana'), 'a senha do banco é ••••');
  assert.equal(m('código: XPTO'), 'código: ••••');
  assert.equal(m('o pin é 12'), 'o pin é ••••');
});

test('mantém valores em dinheiro e perguntas sem dados', () => {
  assert.equal(m('fiz um Pix de R$ 1.500,00 para golpista'), 'fiz um Pix de R$ 1.500,00 para golpista');
  assert.equal(m('mandei 2000 reais'), 'mandei 2000 reais');
  assert.equal(m('qual o código do boleto?'), 'qual o código do boleto?');
  assert.equal(m('esqueci a senha do banco'), 'esqueci a senha do banco');
  assert.equal(m('vendi 3 calças'), 'vendi 3 calças');
});

test('avisa quando há dado sensível', () => {
  assert.equal(temDadoSensivel('meu cpf 12345678900'), true);
  assert.equal(temDadoSensivel('caí num golpe do pix'), false);
});

// ---------- Validação do JSON ----------

const valida = { foraDoEscopo: false, urgente: true, passos: ['Ligue para o banco.', { texto: 'Peça o MED.', tela: { modelo: 'apps', alvo: 'banco' } }], dica: 'Seja rápida.' };

test('aceita resposta no formato combinado', () => {
  const r = validarAjuda(valida);
  assert.equal(r.urgente, true);
  assert.deepEqual(r.passos[0], { texto: 'Ligue para o banco.', tela: null });
  assert.deepEqual(r.passos[1].tela, { modelo: 'apps', alvo: 'banco' });
  assert.equal(r.dica, 'Seja rápida.');
});

test('aceita recusa fora do escopo', () => {
  assert.deepEqual(validarAjuda({ foraDoEscopo: true, mensagem: 'Com isso eu não ajudo.' }), { foraDoEscopo: true, mensagem: 'Com isso eu não ajudo.' });
});

test('recusa respostas fora do formato', () => {
  const longo = Array(26).fill('palavra').join(' ');
  const casos = [
    null, 'texto solto', [], {},
    { urgente: false, passos: ['a'] }, // sem foraDoEscopo
    { foraDoEscopo: 'nao', urgente: false, passos: ['a'] },
    { foraDoEscopo: false, passos: ['a'] }, // sem urgente
    { foraDoEscopo: false, urgente: 'sim', passos: ['a'] },
    { foraDoEscopo: false, urgente: false, passos: [] },
    { foraDoEscopo: false, urgente: false, passos: ['1', '2', '3', '4', '5', '6'] },
    { foraDoEscopo: false, urgente: false, passos: [longo] },
    { foraDoEscopo: false, urgente: false, passos: [42] },
    { foraDoEscopo: false, urgente: false, passos: [{ tela: { modelo: 'apps', alvo: 'banco' } }] },
    { foraDoEscopo: true }, // recusa sem mensagem
    { foraDoEscopo: true, mensagem: '   ' },
  ];
  for (const caso of casos) assert.throws(() => validarAjuda(caso), formato, JSON.stringify(caso));
});

test('tela ou dica fora do combinado somem, mas a resposta vale', () => {
  const r = validarAjuda({ foraDoEscopo: false, urgente: false, passos: [{ texto: 'Toque.', tela: { modelo: 'lista', titulo: 'Menu', itens: ['A', 'B'], alvo: 7 } }], dica: 42 });
  assert.equal(r.passos[0].tela, null);
  assert.equal(r.dica, '');
});

test('valida a explicação de outro jeito', () => {
  assert.equal(validarOutroJeito({ texto: ' Procure o botão azul. ' }), 'Procure o botão azul.');
  assert.throws(() => validarOutroJeito({ texto: '' }), formato);
  assert.throws(() => validarOutroJeito({ outra: 'coisa' }), formato);
  assert.throws(() => validarOutroJeito({ texto: Array(46).fill('a').join(' ') }), formato);
});

// ---------- Telas ilustradas ----------

test('telas: confere modelos e desenha com descrição', () => {
  assert.equal(validarTela({ modelo: 'apps', alvo: 'foguete' }), null);
  assert.equal(validarTela({ modelo: 'desconhecido' }), null);
  assert.equal(validarTela({ modelo: 'lista', titulo: 'Menu', itens: ['Só um'], alvo: 0 }), null);
  assert.equal(validarTela({ modelo: 'conversa', contato: 'Ana', mensagens: [{ de: 'ele', texto: 'oi' }] }), null);
  assert.ok(validarTela({ modelo: 'campo', titulo: 'Pix', campos: [{ rotulo: 'Chave', exemplo: 'Telefone' }], alvo: 0, botao: 'Continuar' }));
  const svg = desenharTela({ modelo: 'lista', titulo: 'Atendimento', itens: ['Contestar Pix', 'Cartões'], alvo: 0 });
  assert.match(svg, /^<svg class="tela-celular"/);
  assert.match(svg, /aria-label="Tela Atendimento com a opção Contestar Pix marcada\."/);
  assert.equal(desenharTela({ modelo: 'apps', alvo: '<script>' }), '');
});

// ---------- Regra do MED ----------

test('reconhece golpe com dinheiro já enviado', () => {
  assert.equal(dinheiroJaEnviado('Fiz um Pix de 300 reais para um golpista'), true);
  assert.equal(dinheiroJaEnviado('caí no golpe do pix'), true);
  assert.equal(dinheiroJaEnviado('transferi dinheiro e era golpe'), true);
  assert.equal(dinheiroJaEnviado('paguei um boleto falso'), true);
  assert.equal(dinheiroJaEnviado('como evitar golpe do pix?'), false);
  assert.equal(dinheiroJaEnviado('fiz um pix para minha fornecedora'), false);
  assert.equal(dinheiroJaEnviado('recebi um boleto estranho'), false);
});

test('primeiro passo é sempre falar com o banco e pedir o MED', () => {
  const sem = validarAjuda({ foraDoEscopo: false, urgente: false, passos: ['Faça o boletim de ocorrência.', 'Guarde os prints.'] });
  const r = garantirPassoMED('fiz um pix pra golpista', sem);
  assert.equal(r.passos[0].texto, PASSO_MED);
  assert.equal(r.urgente, true);
  assert.equal(r.passos.length, 3);

  const com = validarAjuda({ foraDoEscopo: false, urgente: true, passos: ['Ligue para o banco e peça o MED.', 'Faça o boletim.'] });
  assert.deepEqual(garantirPassoMED('fiz um pix pra golpista', com), com); // já está certo

  const cheio = validarAjuda({ foraDoEscopo: false, urgente: true, passos: ['1.', '2.', '3.', '4.', 'Depois, peça o MED ao banco.'] });
  const r2 = garantirPassoMED('transferi dinheiro pra um golpista', cheio);
  assert.equal(r2.passos.length, 5);
  assert.equal(r2.passos[0].texto, PASSO_MED);
  assert.equal(r2.passos.filter((p) => p.texto.includes('MED')).length, 1); // sem repetir

  const fora = garantirPassoMED('fiz um pix pra golpista', { foraDoEscopo: true, mensagem: 'Não ajudo.' });
  assert.equal(fora.foraDoEscopo, false);
  assert.equal(fora.passos[0].texto, PASSO_MED);

  const outro = validarAjuda({ foraDoEscopo: false, urgente: false, passos: ['Confira o boleto.'] });
  assert.deepEqual(garantirPassoMED('recebi um boleto estranho', outro), outro);
});

// ---------- Versão simulada e serviço único ----------

test('respostas fixas da simulação passam na validação, com todas as telas válidas', () => {
  for (const tema of TEMAS) {
    for (const p of tema.passos) {
      if (p.tela) assert.ok(validarTela(p.tela), `${tema.id}: ${p.texto}`);
      assert.ok(validarOutroJeito({ texto: p.outroJeito }));
    }
  }
  for (const p of PASSOS_GERAIS) if (p.tela) assert.ok(validarTela(p.tela));
  for (const relato of ['fiz um pix pra golpista', 'recebi um boleto estranho', 'cliquei num link', 'cobraram o DAS do MEI', 'problema no celular', 'receita de bolo']) {
    assert.doesNotThrow(() => validarAjuda(responderSimulado(relato)), relato);
  }
});

const servicoSimulado = () => criarServicoAjuda(() => criarIASimulada({ atraso: 0 }));

test('simulação: golpe do Pix começa pelo banco e pelo MED', async () => {
  const { resposta } = await servicoSimulado().perguntar('Caí no golpe do Pix, mandei 300 reais');
  assert.equal(resposta.urgente, true);
  assert.equal(resposta.passos[0].texto, PASSO_MED);
});

test('simulação: boleto, link e MEI têm respostas próprias', async () => {
  const s = servicoSimulado();
  assert.match((await s.perguntar('Recebi um boleto estranho')).resposta.passos[0].texto, /Não pague/);
  assert.match((await s.perguntar('Toquei num link suspeito')).resposta.passos[0].texto, /Feche a página/);
  assert.match((await s.perguntar('Estão cobrando dívida do MEI')).resposta.passos[0].texto, /guia/);
});

test('simulação: assunto fora do escopo recebe recusa educada', async () => {
  const { resposta } = await servicoSimulado().perguntar('Qual a receita de bolo de milho?');
  assert.equal(resposta.foraDoEscopo, true);
  assert.match(resposta.mensagem, /não consegue ajudar/);
});

test('serviço esconde os dados antes de enviar, para qualquer versão', async () => {
  let enviado;
  const espia = { perguntar: async (texto) => { enviado = texto; return { foraDoEscopo: false, urgente: false, passos: ['Ok.'] }; } };
  const { escondeuDados } = await criarServicoAjuda(() => espia).perguntar('meu CPF é 123.456.789-00 e a senha é banana');
  assert.equal(enviado, 'meu CPF é •••• e a senha é ••••');
  assert.equal(escondeuDados, true);
});

test('serviço recusa JSON fora do formato e respeita o limite de tempo', async () => {
  const torta = { perguntar: async () => ({ passos: 'tudo junto' }) };
  await assert.rejects(criarServicoAjuda(() => torta).perguntar('boleto'), formato);

  const lenta = { perguntar: (_, sinal) => new Promise((_r, rejeitar) => sinal.addEventListener('abort', () => rejeitar(new Error('abortado')))) };
  await assert.rejects(criarServicoAjuda(() => lenta, { limiteTempo: 30 }).perguntar('boleto'), (e) => e.tipo === 'tempo');

  await assert.rejects(servicoSimulado().perguntar('   '), (e) => e.tipo === 'texto');
});

test('serviço: outra explicação para o mesmo passo', async () => {
  const texto = await servicoSimulado().outroJeito('recebi um boleto estranho', TEMAS[1].passos[0].texto);
  assert.equal(texto, TEMAS[1].passos[0].outroJeito);
});
