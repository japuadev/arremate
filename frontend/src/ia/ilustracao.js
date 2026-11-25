// Telas ilustradas dos passos da Ajuda. A IA não desenha: escolhe um modelo e preenche os
// campos; o app confere e desenha com as peças de componentes/telas.js (as mesmas das aulas).
// Tela fora do combinado é só descartada: o passo aparece sem figura, mas a resposta vale.
//
// Modelos (as instruções do servidor descrevem os mesmos, em InstrucoesAjuda.java):
//   apps     { alvo: 'banco' | 'mensagens' | 'camera' | 'navegador' | 'planilha' | 'loja' }
//   lista    { titulo, itens: [2 a 5], alvo: posição }
//   aviso    { titulo, texto, botao }
//   conversa { contato, mensagens: [1 a 3 de { de: 'eu' | 'outro', texto }] }
//   campo    { titulo, campos: [1 a 3 de { rotulo, exemplo }], alvo: posição, botao? }
import { COR, botao, bolha, cabecalho, campo, celular, linhaLista, olheAqui, telaDeApps, texto, toque, topoConversa } from '../componentes/telas.js';

const APPS = ['banco', 'mensagens', 'camera', 'navegador', 'planilha', 'loja'];
const NOMES_APP = { banco: 'Banco', mensagens: 'Mensagens', camera: 'Câmera', navegador: 'Internet', planilha: 'Planilhas', loja: 'Loja' };

const ehObjeto = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
const ehTexto = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.trim().length <= max;
const ehPosicao = (v, total) => Number.isInteger(v) && v >= 0 && v < total;
const lista = (v, min, max, ok) => Array.isArray(v) && v.length >= min && v.length <= max && v.every(ok);

const VALIDAR = {
  apps: (t) => APPS.includes(t.alvo) && { modelo: 'apps', alvo: t.alvo },
  lista: (t) => ehTexto(t.titulo, 22) && lista(t.itens, 2, 5, (i) => ehTexto(i, 20)) && ehPosicao(t.alvo, t.itens.length)
    && { modelo: 'lista', titulo: t.titulo.trim(), itens: t.itens.map((i) => i.trim()), alvo: t.alvo },
  aviso: (t) => ehTexto(t.titulo, 22) && ehTexto(t.texto, 60) && ehTexto(t.botao, 18)
    && { modelo: 'aviso', titulo: t.titulo.trim(), texto: t.texto.trim(), botao: t.botao.trim() },
  conversa: (t) => ehTexto(t.contato, 20) && lista(t.mensagens, 1, 3, (m) => ehObjeto(m) && ['eu', 'outro'].includes(m.de) && ehTexto(m.texto, 60))
    && { modelo: 'conversa', contato: t.contato.trim(), mensagens: t.mensagens.map((m) => ({ de: m.de, texto: m.texto.trim() })) },
  campo: (t) => ehTexto(t.titulo, 22) && lista(t.campos, 1, 3, (c) => ehObjeto(c) && ehTexto(c.rotulo, 20) && (c.exemplo === undefined || c.exemplo === '' || ehTexto(c.exemplo, 24)))
    && ehPosicao(t.alvo, t.campos.length) && (t.botao === undefined || ehTexto(t.botao, 18))
    && { modelo: 'campo', titulo: t.titulo.trim(), campos: t.campos.map((c) => ({ rotulo: c.rotulo.trim(), exemplo: (c.exemplo || '').trim() })), alvo: t.alvo, botao: t.botao?.trim() || '' },
};

/** Devolve a tela conferida ou null. */
export function validarTela(tela) {
  if (!ehObjeto(tela) || !Object.hasOwn(VALIDAR, tela.modelo)) return null;
  return VALIDAR[tela.modelo](tela) || null;
}

// Quebra um texto em linhas de até `max` letras, sem cortar palavras.
export function quebrarLinhas(frase, max) {
  const linhas = [];
  for (const palavra of frase.split(/\s+/)) {
    const ultima = linhas[linhas.length - 1];
    if (ultima !== undefined && `${ultima} ${palavra}`.length <= max) linhas[linhas.length - 1] = `${ultima} ${palavra}`;
    else linhas.push(palavra);
  }
  return linhas;
}

const DESENHAR = {
  apps: (t) => ({
    descricao: `Tela inicial do celular com o dedo no aplicativo ${NOMES_APP[t.alvo]}.`,
    svg: telaDeApps(t.alvo),
  }),
  lista: (t) => ({
    descricao: `Tela ${t.titulo} com a opção ${t.itens[t.alvo]} marcada.`,
    svg: `${cabecalho(t.titulo)}
      ${t.itens.map((item, i) => linhaLista(80 + i * 44, item, { destaque: i === t.alvo })).join('')}
      ${toque(190, 80 + t.alvo * 44 + 26)}`,
  }),
  aviso: (t) => ({
    descricao: `Aviso ${t.titulo}: ${t.texto}. Botão ${t.botao}.`,
    svg: `${cabecalho(t.titulo, { voltar: false })}
      <rect x="30" y="100" width="180" height="110" rx="12" fill="#fff" stroke="${COR.linha}" stroke-width="1.5"/>
      ${quebrarLinhas(t.texto, 24).slice(0, 4).map((l, i) => texto(120, 130 + i * 20, l, { tam: 12.5, ancora: 'middle', max: 26 })).join('')}
      ${botao(40, 240, 160, t.botao)}
      ${toque(150, 258)}`,
  }),
  conversa: (t) => {
    let y = 92;
    const baloes = t.mensagens.map((m) => {
      const linhas = quebrarLinhas(m.texto, 25).slice(0, 3);
      const desenho = { y, altura: 14 + linhas.length * 16, svg: bolha(y, linhas, { eu: m.de === 'eu' }), outro: m.de === 'outro' };
      y += desenho.altura + 10;
      return desenho;
    });
    const marcado = [...baloes].reverse().find((b) => b.outro);
    return {
      descricao: `Conversa com ${t.contato}: ${t.mensagens.map((m) => `${m.de === 'eu' ? 'você' : t.contato} diz ${m.texto}`).join('. ')}.`,
      svg: `${topoConversa(t.contato)}${baloes.map((b) => b.svg).join('')}${marcado ? olheAqui(20, marcado.y - 4, 188, marcado.altura + 8) : ''}`,
    };
  },
  campo: (t) => {
    const yAlvo = 96 + t.alvo * 52;
    return {
      descricao: `Formulário ${t.titulo} com o campo ${t.campos[t.alvo].rotulo} marcado.`,
      svg: `${cabecalho(t.titulo)}
        ${t.campos.map((c, i) => campo(96 + i * 52, c.rotulo, c.exemplo, { foco: i === t.alvo })).join('')}
        ${t.botao ? botao(40, 96 + t.campos.length * 52 + 10, 160, t.botao) : ''}
        ${toque(170, yAlvo + 22)}`,
    };
  },
};

/** Desenha a tela conferida dentro da moldura do celular. */
export function desenharTela(tela) {
  const t = validarTela(tela);
  if (!t) return '';
  const { descricao, svg } = DESENHAR[t.modelo](t);
  return celular(descricao, svg);
}
