// O serviço que a tela usa. Faz, do mesmo jeito para qualquer versão da IA:
//   1. confere o texto e esconde números longos, senhas e códigos;
//   2. chama a versão escolhida, com limite de tempo;
//   3. valida o JSON devolvido;
//   4. aplica a regra fixa do MED.
// Não depende do navegador: os testes usam com a versão simulada.
import { ErroIA, LIMITES } from './contrato.js';
import { mascararDadosSensiveis } from './dadosSensiveis.js';
import { validarAjuda, validarOutroJeito } from './validacao.js';
import { garantirPassoMED } from './regras.js';

export const LIMITE_TEMPO_MS = 20000;

async function comLimiteDeTempo(chamada, limite) {
  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), limite);
  try {
    return await chamada(controle.signal);
  } catch (erro) {
    if (controle.signal.aborted) throw new ErroIA('tempo');
    throw erro;
  } finally {
    clearTimeout(relogio);
  }
}

function prepararTexto(texto) {
  const limpo = String(texto ?? '').trim();
  if (!limpo || limpo.length > LIMITES.letrasTexto) throw new ErroIA('texto');
  return limpo;
}

/** escolher() devolve a versão da IA a usar em cada pedido (servidor ou simulada). */
export function criarServicoAjuda(escolher, { limiteTempo = LIMITE_TEMPO_MS } = {}) {
  return {
    async perguntar(texto) {
      const relato = prepararTexto(texto);
      const mascarado = mascararDadosSensiveis(relato);
      const dado = await comLimiteDeTempo((sinal) => escolher().perguntar(mascarado, sinal), limiteTempo);
      const resposta = garantirPassoMED(relato, validarAjuda(dado));
      return { resposta, escondeuDados: mascarado !== relato };
    },
    async outroJeito(texto, passo) {
      const mascarado = mascararDadosSensiveis(prepararTexto(texto));
      const dado = await comLimiteDeTempo((sinal) => escolher().outroJeito(mascarado, mascararDadosSensiveis(passo), sinal), limiteTempo);
      return validarOutroJeito(dado);
    },
  };
}
