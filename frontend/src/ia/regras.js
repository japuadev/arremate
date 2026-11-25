// Regra fixa da Ajuda: em golpe com dinheiro já enviado, o primeiro passo é sempre falar
// com o banco e pedir o MED (Mecanismo Especial de Devolução do Pix). As instruções da IA
// já pedem isso; esta regra garante, mesmo se a IA esquecer ou sair do escopo.
import { normalizar } from '../voz/comandos.js';
import { LIMITES } from './contrato.js';

export const PASSO_MED = 'Fale agora com o seu banco, pelo aplicativo ou pelo telefone do cartão, e peça o MED: Mecanismo Especial de Devolução.';
const TELA_BANCO = { modelo: 'apps', alvo: 'banco' };

const tem = (texto, palavras) => palavras.some((p) => ` ${texto} `.includes(` ${p} `));

const MANDEI = ['fiz', 'mandei', 'enviei', 'transferi', 'paguei', 'depositei', 'passei', 'fizemos', 'mandamos', 'pagamos', 'transferimos'];
const DINHEIRO = ['pix', 'dinheiro', 'reais', 'transferencia', 'deposito', 'boleto', 'ted', 'doc', 'valor', 'pagamento'];
const GOLPE = ['golpe', 'golpista', 'golpistas', 'fraude', 'falso', 'falsa', 'enganado', 'enganada', 'enganaram', 'roubaram', 'roubado', 'bandido', 'era mentira', 'nao era ele', 'nao era ela'];
const CAI = ['cai no golpe', 'cai num golpe', 'cai em um golpe', 'cai em golpe', 'levei um golpe', 'sofri um golpe', 'sofri golpe'];

/** A pessoa conta que já mandou dinheiro para golpista? */
export function dinheiroJaEnviado(relato) {
  const t = normalizar(relato);
  const mandou = tem(t, MANDEI) && (tem(t, DINHEIRO) || tem(t, ['paguei', 'transferi', 'depositei']));
  return (mandou && tem(t, GOLPE)) || (tem(t, CAI) && tem(t, DINHEIRO));
}

const pedeMED = (texto) => {
  const t = normalizar(texto);
  return tem(t, ['banco']) && (tem(t, ['med']) || t.includes('mecanismo especial de devolucao'));
};

/** Garante o MED no primeiro passo quando o relato é de dinheiro enviado a golpista. */
export function garantirPassoMED(relato, resposta) {
  if (!dinheiroJaEnviado(relato)) return resposta;
  if (resposta.foraDoEscopo) {
    return { foraDoEscopo: false, urgente: true, passos: [{ texto: PASSO_MED, tela: TELA_BANCO }], dica: 'Quanto antes o banco souber, maior a chance de o dinheiro voltar.' };
  }
  if (pedeMED(resposta.passos[0].texto)) return { ...resposta, urgente: true };
  const outros = resposta.passos.filter((p) => !pedeMED(p.texto));
  return { ...resposta, urgente: true, passos: [{ texto: PASSO_MED, tela: TELA_BANCO }, ...outros].slice(0, LIMITES.passos) };
}
