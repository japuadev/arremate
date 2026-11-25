// Transforma a frase reconhecida em uma ação. Não depende do navegador, por isso tem testes em tests/.

export function normalizar(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/r\$\s*(\d+(?:[.,]\d{1,2})?)/g, '$1 reais')
    .replace(/(\d+),(\d{1,2})\b/g, '$1.$2')
    .replace(/[^a-z0-9.\s]/g, ' ')
    .replace(/(?<!\d)\.|\.(?!\d)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const UNIDADES = { um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10, onze: 11, doze: 12, treze: 13, catorze: 14, quatorze: 14, quinze: 15, dezesseis: 16, dezessete: 17, dezoito: 18, dezenove: 19 };
const DEZENAS = { vinte: 20, trinta: 30, quarenta: 40, cinquenta: 50, sessenta: 60, setenta: 70, oitenta: 80, noventa: 90 };
const CENTENAS = { cem: 100, cento: 100, duzentos: 200, duzentas: 200, trezentos: 300, trezentas: 300, quatrocentos: 400, quatrocentas: 400, quinhentos: 500, quinhentas: 500, seiscentos: 600, seiscentas: 600, setecentos: 700, setecentas: 700, oitocentos: 800, oitocentas: 800, novecentos: 900, novecentas: 900 };

const valorPalavra = (p) => UNIDADES[p] ?? DEZENAS[p] ?? CENTENAS[p];

export function numerosEmDigitos(texto) {
  const palavras = texto.split(' ');
  const saida = [];
  for (let i = 0; i < palavras.length; i += 1) {
    if (valorPalavra(palavras[i]) === undefined && palavras[i] !== 'mil') { saida.push(palavras[i]); continue; }
    let total = 0;
    let parte = 0;
    let j = i;
    while (j < palavras.length) {
      const p = palavras[j];
      if (p === 'mil') { total += (parte || 1) * 1000; parte = 0; j += 1; } else if (valorPalavra(p) !== undefined) { parte += valorPalavra(p); j += 1; } else if (p === 'e' && j + 1 < palavras.length && (valorPalavra(palavras[j + 1]) !== undefined)) { j += 1; } else break;
    }
    saida.push(String(total + parte));
    i = j - 1;
  }
  return saida.join(' ');
}

// Para telefone, CEP e código: "oitenta e um nove nove" vira 8199, e não uma soma.
export function digitosFalados(texto) {
  const palavras = normalizar(texto).split(' ');
  let saida = '';
  for (let i = 0; i < palavras.length; i += 1) {
    const p = palavras[i];
    if (/^\d+$/.test(p)) { saida += p; continue; }
    if (DEZENAS[p] && palavras[i + 1] === 'e' && UNIDADES[palavras[i + 2]] < 10) {
      saida += String(DEZENAS[p] + UNIDADES[palavras[i + 2]]);
      i += 2;
    } else if (valorPalavra(p) !== undefined) {
      saida += String(valorPalavra(p));
    }
  }
  return saida;
}

const contem = (texto, frase) => ` ${texto} `.includes(` ${frase} `);

function melhorEntre(texto, comandos) {
  let melhor = null;
  let tamanho = 0;
  for (const c of comandos) {
    for (const f of c.frases) {
      const frase = normalizar(f);
      if (frase && contem(texto, frase) && frase.length > tamanho) { melhor = c; tamanho = frase.length; }
    }
  }
  return melhor;
}

// Frases de anotação: "vendi 3 calças por 50 reais", "paguei 40 reais de linha",
// "tenho 20 camisas", "pedido da Maria 10 blusas".
export function interpretarAnotacao(textoOriginal) {
  const resultado = lerAnotacao(numerosEmDigitos(normalizar(textoOriginal)));
  return resultado ? devolverAcentos(resultado, textoOriginal) : null;
}

// O interpretador trabalha sem acentos, mas a anotação salva deve manter "calças" e "Maria".
function devolverAcentos(resultado, original) {
  const mapa = {};
  for (const p of String(original).split(/\s+/)) mapa[normalizar(p)] = p.replace(/[.,!?;:]+$/, '');
  const restaurar = (texto) => texto.split(' ').map((p) => mapa[p] ?? p).join(' ');
  if (resultado.descricao) resultado.descricao = restaurar(resultado.descricao);
  if (resultado.linha) {
    for (const campo of ['descricao', 'peca', 'cliente']) {
      if (resultado.linha[campo]) resultado.linha[campo] = restaurar(resultado.linha[campo]);
    }
  }
  return resultado;
}

function lerAnotacao(t) {

  let m = t.match(/^(?:eu )?(vendi|recebi|paguei|gastei|comprei) (.+)$/);
  if (m) {
    const resto = m[2];
    const tipo = ['vendi', 'recebi'].includes(m[1]) ? 'entrou' : 'saiu';
    const valor = resto.match(/(\d+(?:\.\d{1,2})?) reais/) || resto.match(/(?:por|a|de) (\d+(?:\.\d{1,2})?)\b/);
    if (!valor) return { tipo: 'faltaValor', descricao: resto };
    const descricao = resto
      .replace(valor[0], ' ')
      .replace(/\b(por|de|a)\s*$/, '')
      .replace(/^\s*(de|por)\s+/, '')
      .replace(/\s+/g, ' ')
      .trim();
    return { tipo: 'caixa', linha: { tipo, descricao: descricao || (tipo === 'entrou' ? 'venda' : 'gasto'), valor: Number(valor[1]) } };
  }

  m = t.match(/^(?:pedido|encomenda) (?:de|da|do) ([a-z ]+?) (\d+) (.+)$/);
  if (m) return { tipo: 'pedidos', linha: { cliente: m[1], peca: m[3], quantidade: Number(m[2]), situacao: 'A fazer' } };

  m = t.match(/^(?:eu )?(?:tenho|chegaram|chegou|produzi|fiz|costurei) (\d+) (.+)$/);
  if (m) return { tipo: 'estoque', linha: { peca: m[2], quantidade: Number(m[1]) } };

  return null;
}

export const COMANDOS_GERAIS = [
  { acao: 'inicio', rotulo: 'Início', frases: ['inicio', 'tela inicial', 'comeco', 'aprender', 'minhas trilhas', 'trilhas'] },
  { acao: 'golpe', rotulo: 'É golpe?', frases: ['e golpe', 'golpe', 'treinar golpe', 'simulador de golpe'] },
  { acao: 'socorro', rotulo: 'Socorro', frases: ['socorro', 'preciso de ajuda', 'urgente'] },
  { acao: 'voltar', rotulo: 'Voltar', frases: ['voltar', 'volta', 'tela anterior'] },
  { acao: 'ouvir', rotulo: 'Ouvir', frases: ['ouvir', 'leia', 'ler a tela', 'repetir', 'repete', 'fala de novo'] },
  { acao: 'parar', rotulo: 'Parar', frases: ['parar', 'pare', 'silencio', 'chega'] },
  { acao: 'ajustes', rotulo: 'Ajustes', frases: ['ajustes', 'configuracoes', 'meu perfil'] },
  { acao: 'planilhas', rotulo: 'Meu caixa', frases: ['planilhas', 'minhas planilhas', 'abrir planilha', 'meu caixa', 'meu dinheiro', 'dinheiro do mes', 'financas', 'quanto sobrou', 'quanto entrou', 'quanto gastei'] },
  { acao: 'materiais', rotulo: 'Materiais de gestão', frases: ['materiais', 'materiais de gestao', 'cursos', 'cartilhas', 'sebrae'] },
  { acao: 'preco', rotulo: 'Preço da peça', frases: ['preco da peca', 'calcular preco', 'quanto cobrar'] },
  { acao: 'trilha:organizar', rotulo: 'Organizar meu negócio', frases: ['organizar', 'organizar meu negocio'] },
  { acao: 'trilha:formalizar', rotulo: 'Formalizar', frases: ['formalizar', 'abrir mei', 'cnpj', 'mei'] },
  { acao: 'trilha:dinheiro', rotulo: 'Dinheiro on-line', frases: ['dinheiro', 'dinheiro online', 'banco', 'pagar conta'] },
  { acao: 'trilha:proteger', rotulo: 'Me proteger', frases: ['proteger', 'me proteger', 'seguranca'] },
  { acao: 'letra:mais', rotulo: 'Aumentar letra', frases: ['aumentar letra', 'letra maior', 'aumenta a letra'] },
  { acao: 'letra:menos', rotulo: 'Diminuir letra', frases: ['diminuir letra', 'letra menor', 'diminui a letra'] },
  { acao: 'ajuda', rotulo: 'O que posso falar', frases: ['o que posso falar', 'comandos', 'ajuda'] },
];

// A tela atual tem prioridade: em "É golpe?", dizer "é golpe" responde à pergunta em vez de abrir o menu.
export function interpretar(texto, comandosDaTela = []) {
  const t = normalizar(texto);
  if (!t) return null;
  const daTela = melhorEntre(t, comandosDaTela);
  if (daTela) return { tipo: 'tela', comando: daTela };
  const anotacao = interpretarAnotacao(texto);
  if (anotacao) return { tipo: 'anotacao', anotacao };
  const geral = melhorEntre(t, COMANDOS_GERAIS);
  if (geral) return { tipo: 'geral', acao: geral.acao, rotulo: geral.rotulo };
  return null;
}

const NUMERAIS = ['um', 'dois', 'tres', 'quatro', 'cinco', 'seis'];
const ORDINAIS = ['primeira', 'segunda', 'terceira', 'quarta', 'quinta', 'sexta'];

export function comandosDeOpcoes(rotulos, fazer) {
  return rotulos.map((rotulo, i) => ({
    rotulo,
    frases: [rotulo, String(i + 1), NUMERAIS[i], ORDINAIS[i], `opcao ${i + 1}`, `opcao ${NUMERAIS[i]}`],
    fazer: () => fazer(i),
  }));
}
