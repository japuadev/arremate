// Toda resposta da IA passa por aqui antes de aparecer na tela. Se algo estiver fora do
// combinado, a resposta é descartada com ErroIA('formato') e a tela mostra uma mensagem
// simples e os guias prontos, em vez de um conteúdo imprevisível.
//
// Formato combinado (o mesmo pedido nas instruções do servidor):
//   { "foraDoEscopo": false, "urgente": true|false, "passos": ["...", { "texto": "...", "tela": {...} }], "dica": "..." }
//   { "foraDoEscopo": true, "mensagem": "..." }
import { ErroIA, LIMITES } from './contrato.js';
import { validarTela } from './ilustracao.js';

const ehObjeto = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
const ehTexto = (v) => typeof v === 'string' && v.trim().length > 0;
export const contarPalavras = (texto) => String(texto).trim().split(/\s+/).filter(Boolean).length;
const cabe = (texto, palavras, letras = Infinity) => ehTexto(texto) && contarPalavras(texto) <= palavras && texto.trim().length <= letras;

export function validarAjuda(dado) {
  if (!ehObjeto(dado) || typeof dado.foraDoEscopo !== 'boolean') throw new ErroIA('formato');

  if (dado.foraDoEscopo) {
    if (!cabe(dado.mensagem, LIMITES.palavrasMensagem)) throw new ErroIA('formato');
    return { foraDoEscopo: true, mensagem: dado.mensagem.trim() };
  }

  if (typeof dado.urgente !== 'boolean') throw new ErroIA('formato');
  if (!Array.isArray(dado.passos) || dado.passos.length === 0 || dado.passos.length > LIMITES.passos) throw new ErroIA('formato');

  // Cada passo vem como texto ou como { texto, tela }. Tela inválida só some; texto inválido derruba tudo.
  const passos = dado.passos.map((p) => {
    const texto = ehObjeto(p) ? p.texto : p;
    if (!cabe(texto, LIMITES.palavrasPorPasso, LIMITES.letrasPorPasso)) throw new ErroIA('formato');
    return { texto: texto.trim(), tela: ehObjeto(p) ? validarTela(p.tela) : null };
  });

  // A dica é opcional: se vier fora do combinado, a resposta segue sem ela.
  const dica = cabe(dado.dica, LIMITES.palavrasDica) ? dado.dica.trim() : '';

  return { foraDoEscopo: false, urgente: dado.urgente, passos, dica };
}

export function validarOutroJeito(dado) {
  const texto = ehObjeto(dado) ? dado.texto : dado;
  if (!cabe(texto, LIMITES.palavrasOutroJeito)) throw new ErroIA('formato');
  return texto.trim();
}
