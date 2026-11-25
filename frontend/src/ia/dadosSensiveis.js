// Antes de qualquer envio à IA: troca por "••••" números longos (CPF, cartão, conta,
// telefone, códigos) e valores de senha ou código. O relato continua compreensível
// ("Passei a senha •••• para um rapaz"), mas esses dados nunca saem do aparelho.
// Valores em dinheiro ("R$ 1.500,00", "200 reais") ficam, porque ajudam a entender o caso.
// O servidor repete a mesma proteção (backend: MascaraDadosSensiveis.java).

export const MASCARA = '••••';

const DINHEIRO = /R\$\s?\d[\d.,]*|\b\d[\d.,]*\s?(?:reais|real|mil)\b/gi;
const NUMEROS_LONGOS = /\d(?:[\s./-]?\d){3,}/g;
const PALAVRA = '(senha|c[oó]digo|token|pin)';
const VALOR = '([^\\s,.;!?]+)';
// "senha: banana", "código é xyz"
const VALOR_DIRETO = new RegExp(`(?<![\\p{L}])${PALAVRA}(\\s*(?:é|:)\\s*)${VALOR}`, 'giu');
// "senha abc123"
const VALOR_COM_NUMERO = new RegExp(`(?<![\\p{L}])${PALAVRA}(\\s+)([^\\s,.;!?]*\\d[^\\s,.;!?]*)`, 'giu');
// "minha senha do banco é banana"
const SENHA_DEPOIS = new RegExp(`(?<![\\p{L}])(senha|pin)(?![\\p{L}])((?:\\s+\\S+){0,3}?\\s+(?:é|:)\\s*)${VALOR}`, 'giu');

const marcador = (i) => `\u0000${String.fromCharCode(65 + i)}\u0000`;

export function mascararDadosSensiveis(texto) {
  const guardados = [];
  let saida = String(texto ?? '').replace(DINHEIRO, (valor) => {
    if (guardados.length >= 26) return valor;
    guardados.push(valor);
    return marcador(guardados.length - 1);
  });
  saida = saida.replace(NUMEROS_LONGOS, MASCARA);
  for (const padrao of [VALOR_DIRETO, VALOR_COM_NUMERO, SENHA_DEPOIS]) {
    saida = saida.replace(padrao, (_, palavra, meio) => `${palavra}${meio}${MASCARA}`);
  }
  return guardados.reduce((s, valor, i) => s.replace(marcador(i), valor), saida);
}

export const temDadoSensivel = (texto) => mascararDadosSensiveis(texto) !== String(texto ?? '');
