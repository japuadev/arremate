// Contrato do serviço de IA da tela Ajuda.
//
// A tela só conhece o objeto devolvido por obterServicoIA() (ia/index.js), com dois métodos:
//
//   perguntar(texto)        -> Promise<{ resposta: RespostaAjuda, escondeuDados: boolean }>
//   outroJeito(texto, passo) -> Promise<string>
//
// Ela não sabe se a resposta veio do servidor (Gemini) ou da versão simulada.
//
// Cada versão da IA (servidor.js, simulado.js) implementa só:
//
//   { nome, perguntar(textoMascarado, sinal) -> Promise<unknown>,
//           outroJeito(textoMascarado, passo, sinal) -> Promise<unknown> }
//
// e devolve o JSON cru. Esconder dados, validar o formato e aplicar a regra do MED é
// sempre feito em servico.js, igual para as duas versões.
//
// RespostaAjuda (depois da validação):
//   { foraDoEscopo: false, urgente: boolean, passos: [{ texto, tela | null }], dica: string }
//   { foraDoEscopo: true, mensagem: string }

/** Falhas que a tela sabe explicar. */
export const TIPOS_ERRO = ['formato', 'sem_internet', 'tempo', 'indisponivel', 'limite', 'texto'];

export class ErroIA extends Error {
  constructor(tipo) {
    super(`Falha no serviço de IA: ${tipo}`);
    this.name = 'ErroIA';
    this.tipo = TIPOS_ERRO.includes(tipo) ? tipo : 'indisponivel';
  }
}

export const LIMITES = {
  passos: 5,
  palavrasPorPasso: 25,
  letrasPorPasso: 220,
  palavrasDica: 30,
  palavrasMensagem: 45,
  palavrasOutroJeito: 45,
  letrasTexto: 1000,
};
