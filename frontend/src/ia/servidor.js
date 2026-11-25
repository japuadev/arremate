// IA de verdade: o back-end chama o Gemini com a chave guardada numa variável de ambiente
// (POST /ajuda/perguntar e POST /ajuda/outro-jeito, em docs/CONTRATO_API.md).
// Os códigos de erro do servidor viram os tipos de erro que a tela sabe explicar.
import { ErroIA } from './contrato.js';

export const SEM_CHAVE = 'ia_nao_configurada';

const ERROS = {
  ia_formato: 'formato',
  ia_tempo_esgotado: 'tempo',
  ia_limite: 'limite',
  limite_pedidos: 'limite',
  ia_indisponivel: 'indisponivel',
  texto_invalido: 'texto',
  passo_invalido: 'texto',
};

function converter(erro, sinal) {
  if (sinal?.aborted) return new ErroIA('tempo');
  if (erro instanceof ErroIA) return erro;
  if (erro?.message === SEM_CHAVE) return erro; // tratado em index.js: passa para a simulação
  if (erro instanceof TypeError) return new ErroIA(typeof navigator !== 'undefined' && !navigator.onLine ? 'sem_internet' : 'indisponivel');
  return new ErroIA(ERROS[erro?.message] ?? 'indisponivel');
}

export function criarIAServidor(api) {
  return {
    nome: 'servidor',
    async perguntar(relato, sinal) {
      try { return await api.perguntarAjuda(relato, sinal); } catch (e) { throw converter(e, sinal); }
    },
    async outroJeito(relato, passo, sinal) {
      try { return await api.outroJeitoAjuda(relato, passo, sinal); } catch (e) { throw converter(e, sinal); }
    },
  };
}
