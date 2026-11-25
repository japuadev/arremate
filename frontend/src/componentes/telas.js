// Peças para desenhar as telas do passo a passo: moldura do celular, dedo com círculo
// pulsando, barra do navegador, campos, listas, conversas e botões.
//
// As telas são genéricas e sem marcas, porque cada celular e cada banco mostra telas
// um pouco diferentes. Todas usam a área de 240 × 320 da moldura <celular>.
import { esc } from '../app/utilidades.js';

export const COR = {
  tinta: '#1B2238',
  apoio: '#5B6278',
  linha: '#D5DBE7',
  fundo: '#F6F7FB',
  indigo: '#1F3A73',
  ouro: '#E0A526',
  ouroEscuro: '#B07D0E',
  verde: '#2F6B4F',
  verdeClaro: '#E3F0E8',
  vermelho: '#B3261E',
  vermelhoClaro: '#FBE7E5',
  bolhaMinha: '#DCEBD9',
};

const DEDO = 'M0 4 C0 -3 10 -3 10 4 V20 C10 14 19 14 19 20 V22 C19 16 28 16 28 22 V24 C28 18 37 18 37 24 V40 C37 54 28 62 17 62 H13 C5 62 1 57 -3 50 L-11 35 C-14 29 -7 25 -3 29 L0 33 Z';

const corta = (texto, max) => (texto.length > max ? `${texto.slice(0, max - 1)}…` : texto);

export function texto(x, y, conteudo, { tam = 12, peso = 400, cor = COR.tinta, ancora = 'start', max = 40 } = {}) {
  return `<text x="${x}" y="${y}" font-size="${tam}" font-weight="${peso}" fill="${cor}" text-anchor="${ancora}">${esc(corta(String(conteudo), max))}</text>`;
}

export function celular(descricao, conteudo) {
  return `<svg class="tela-celular" viewBox="0 0 240 320" role="img" aria-label="${esc(descricao)}">
    <rect x="8" y="4" width="224" height="312" rx="28" fill="${COR.tinta}"/>
    <rect x="15" y="11" width="210" height="298" rx="22" fill="${COR.fundo}"/>
    ${texto(34, 30, '9:41', { tam: 11, peso: 700, cor: COR.apoio })}
    <rect x="182" y="22" width="22" height="10" rx="3" fill="none" stroke="${COR.apoio}" stroke-width="1.5"/>
    <rect x="184" y="24" width="14" height="6" rx="1.5" fill="${COR.apoio}"/>
    ${conteudo}
  </svg>`;
}

/** Dedo apontando para (x, y), com círculo pulsando. */
export function toque(x, y) {
  return `<g class="tela-toque">
    <circle class="tela-toque-pulso" cx="${x}" cy="${y}" r="20"/>
    <circle cx="${x}" cy="${y}" r="20" fill="none" stroke="${COR.ouroEscuro}" stroke-width="4"/>
    <g transform="translate(${x - 5} ${y + 2})"><path d="${DEDO}" fill="#fff" stroke="${COR.tinta}" stroke-width="3" stroke-linejoin="round"/></g>
  </g>`;
}

/** Moldura tracejada em ouro: "olhe aqui". */
export function olheAqui(x, y, w, h) {
  return `<rect class="tela-olhe" x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="none" stroke="${COR.ouroEscuro}" stroke-width="3" stroke-dasharray="7 5"/>`;
}

/** Selo de certo (verde) ou de "não faça" (vermelho). */
export function selo(x, y, tipo = 'ok') {
  const ok = tipo === 'ok';
  const marca = ok
    ? `<path d="M${x - 7} ${y} l5 5 9 -10" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<path d="M${x - 6} ${y - 6} L${x + 6} ${y + 6} M${x + 6} ${y - 6} L${x - 6} ${y + 6}" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>`;
  return `<g><circle cx="${x}" cy="${y}" r="15" fill="${ok ? COR.verde : COR.vermelho}" stroke="#fff" stroke-width="3"/>${marca}</g>`;
}

export function cabecalho(titulo, { voltar = true, cor = '#fff', corTexto = COR.tinta } = {}) {
  return `<g>
    <rect x="15" y="38" width="210" height="36" fill="${cor}"/>
    <line x1="15" y1="74" x2="225" y2="74" stroke="${COR.linha}" stroke-width="1.5"/>
    ${voltar ? `<path d="M34 50 L27 56 L34 62" fill="none" stroke="${corTexto}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
    ${texto(voltar ? 44 : 30, 61, titulo, { tam: 14, peso: 700, cor: corTexto, max: voltar ? 22 : 24 })}
  </g>`;
}

/** Barra de endereço do navegador, com cadeado. */
export function navegador(endereco) {
  return `<g>
    <rect x="15" y="38" width="210" height="38" fill="#fff"/>
    <rect x="24" y="44" width="192" height="26" rx="13" fill="${COR.fundo}" stroke="${COR.linha}"/>
    <rect x="35" y="54" width="9" height="8" rx="1.5" fill="${COR.verde}"/>
    <path d="M37 54 v-2.5 a2.5 2.5 0 0 1 5 0 V54" fill="none" stroke="${COR.verde}" stroke-width="1.6"/>
    ${texto(50, 61, endereco, { tam: 11.5, peso: 700, max: 28 })}
    <line x1="15" y1="76" x2="225" y2="76" stroke="${COR.linha}" stroke-width="1.5"/>
  </g>`;
}

export function botao(x, y, w, rotulo, { cor = COR.indigo, contorno = false, altura = 34 } = {}) {
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${altura}" rx="${altura / 2}" fill="${contorno ? '#fff' : cor}" stroke="${cor}" stroke-width="2"/>
    ${texto(x + w / 2, y + altura / 2 + 4.5, rotulo, { tam: 12.5, peso: 700, cor: contorno ? cor : '#fff', ancora: 'middle', max: 26 })}
  </g>`;
}

/** Campo de formulário com rótulo em cima. */
export function campo(y, rotulo, valor = '', { foco = false, senha = false } = {}) {
  const mostrado = senha ? '•'.repeat(Math.min(valor.length, 14)) : valor;
  return `<g>
    ${texto(28, y, rotulo, { tam: 11, peso: 700, cor: COR.apoio })}
    <rect x="26" y="${y + 6}" width="188" height="30" rx="7" fill="#fff" stroke="${foco ? COR.indigo : COR.linha}" stroke-width="${foco ? 2.5 : 1.5}"/>
    ${mostrado ? texto(36, y + 26, mostrado, { tam: 12, max: 27 }) : ''}
    ${foco ? `<line x1="${38 + mostrado.length * 6.3}" y1="${y + 13}" x2="${38 + mostrado.length * 6.3}" y2="${y + 29}" stroke="${COR.indigo}" stroke-width="2"/>` : ''}
  </g>`;
}

/** Linha de lista (menus, contas, extratos). */
export function linhaLista(y, rotulo, { detalhe = '', valor = '', corValor = COR.tinta, destaque = false, seta = true } = {}) {
  return `<g>
    <rect x="15" y="${y}" width="210" height="44" fill="${destaque ? '#FFF6DC' : '#fff'}"/>
    <line x1="28" y1="${y + 44}" x2="225" y2="${y + 44}" stroke="${COR.linha}" stroke-width="1.2"/>
    <circle cx="36" cy="${y + 22}" r="8" fill="${destaque ? COR.ouro : '#C7CDDA'}"/>
    ${texto(52, y + (detalhe ? 20 : 27), rotulo, { tam: 12.5, peso: destaque ? 700 : 400, max: valor ? 17 : 22 })}
    ${detalhe ? texto(52, y + 35, detalhe, { tam: 10, cor: COR.apoio, max: 24 }) : ''}
    ${valor ? texto(216, y + 27, valor, { tam: 12, peso: 700, cor: corValor, ancora: 'end' }) : ''}
    ${seta && !valor ? `<path d="M204 ${y + 16} l6 6 -6 6" fill="none" stroke="${COR.apoio}" stroke-width="2" stroke-linecap="round"/>` : ''}
  </g>`;
}

/** Balão de conversa. "eu" fica à direita, em verde-claro. */
export function bolha(y, linhas, { eu = false, link = -1, largura = 176 } = {}) {
  const altura = 14 + linhas.length * 16;
  const x = eu ? 210 - largura : 26;
  return `<g>
    <rect x="${x}" y="${y}" width="${largura}" height="${altura}" rx="11" fill="${eu ? COR.bolhaMinha : '#fff'}" stroke="${COR.linha}"/>
    ${linhas.map((l, i) => `<text x="${x + 11}" y="${y + 20 + i * 16}" font-size="11.5" fill="${i === link ? '#1A56B8' : COR.tinta}" ${i === link ? 'text-decoration="underline"' : ''} font-weight="${i === 0 && !eu && linhas.length > 1 && l === l.toUpperCase() ? 700 : 400}">${esc(corta(l, 27))}</text>`).join('')}
  </g>`;
}

/** Topo de uma conversa com contato desconhecido. */
export function topoConversa(nome, { desconhecido = true } = {}) {
  return `<g>
    <rect x="15" y="38" width="210" height="40" fill="#fff"/>
    <line x1="15" y1="78" x2="225" y2="78" stroke="${COR.linha}" stroke-width="1.5"/>
    <path d="M30 52 L24 58 L30 64" fill="none" stroke="${COR.tinta}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="50" cy="58" r="12" fill="${desconhecido ? '#B8BECB' : '#A1887F'}"/>
    ${desconhecido ? texto(50, 63, '?', { tam: 13, peso: 700, cor: '#fff', ancora: 'middle' }) : ''}
    ${texto(70, 63, nome, { tam: 12.5, peso: 700, max: 20 })}
  </g>`;
}

/** Ícone de aplicativo genérico: quadrado colorido com um desenho simples. */
const DESENHOS_APP = {
  banco: (cx, cy) => `<path d="M${cx - 12} ${cy - 4} L${cx} ${cy - 12} L${cx + 12} ${cy - 4} Z M${cx - 8} ${cy - 1} v10 M${cx} ${cy - 1} v10 M${cx + 8} ${cy - 1} v10 M${cx - 13} ${cy + 11} h26"/>`,
  mensagens: (cx, cy) => `<path d="M${cx - 11} ${cy - 8} h22 a3 3 0 0 1 3 3 v11 a3 3 0 0 1 -3 3 h-12 l-6 5 v-5 h-4 a3 3 0 0 1 -3 -3 v-11 a3 3 0 0 1 3 -3z"/>`,
  camera: (cx, cy) => `<rect x="${cx - 12}" y="${cy - 7}" width="24" height="16" rx="3"/><circle cx="${cx}" cy="${cy + 1}" r="5"/>`,
  loja: (cx, cy) => `<path d="M${cx - 11} ${cy - 5} h22 l-2 15 h-18z M${cx - 5} ${cy - 5} v-3 a5 5 0 0 1 10 0 v3"/>`,
  planilha: (cx, cy) => `<rect x="${cx - 11}" y="${cy - 11}" width="22" height="22" rx="2"/><path d="M${cx - 11} ${cy - 3} h22 M${cx - 3} ${cy - 11} v22"/>`,
  navegador: (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="11"/><path d="M${cx - 11} ${cy} h22 M${cx} ${cy - 11} c-6 6 -6 16 0 22 c6 -6 6 -16 0 -22"/>`,
};
const CORES_APP = { banco: '#1F3A73', mensagens: '#2F6B4F', camera: '#5B6278', loja: '#B07D0E', planilha: '#2E7D4F', navegador: '#2A5DB0' };
const NOMES_APP = { banco: 'Banco', mensagens: 'Mensagens', camera: 'Câmera', loja: 'Loja', planilha: 'Planilhas', navegador: 'Internet' };

export function telaDeApps(alvo) {
  const apps = ['mensagens', 'camera', 'navegador', 'banco', 'planilha', 'loja'];
  const pos = (i) => ({ x: 52 + (i % 3) * 68, y: 96 + Math.floor(i / 3) * 88 });
  return `${apps.map((a, i) => {
    const { x, y } = pos(i);
    return `<g>
      <rect x="${x - 24}" y="${y - 24}" width="48" height="48" rx="13" fill="${CORES_APP[a]}"/>
      <g fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${DESENHOS_APP[a](x, y)}</g>
      ${texto(x, y + 40, NOMES_APP[a], { tam: 10, ancora: 'middle' })}
    </g>`;
  }).join('')}
  <rect x="40" y="266" width="160" height="28" rx="14" fill="#fff" stroke="${COR.linha}"/>
  ${texto(56, 284, 'Pesquisar', { tam: 11, cor: COR.apoio })}
  ${alvo ? toque(pos(apps.indexOf(alvo)).x, pos(apps.indexOf(alvo)).y) : ''}`;
}

/** Planilha: letras das colunas, cabeçalho e linhas. */
export function grade(y0, cabecalho, linhas, { colunaDestaque = -1, linhaTotal = false } = {}) {
  const n = cabecalho.length;
  const w = 196 / n;
  const x = (i) => 22 + i * w;
  const letras = cabecalho.map((_, i) => `<g><rect x="${x(i)}" y="${y0}" width="${w}" height="18" fill="#E6E9F0" stroke="${COR.linha}"/>${texto(x(i) + w / 2, y0 + 13, String.fromCharCode(65 + i), { tam: 10, cor: COR.apoio, ancora: 'middle' })}</g>`).join('');
  const celulas = (valores, y, { cab = false, total = false } = {}) => valores.map((v, i) => `<g>
      <rect x="${x(i)}" y="${y}" width="${w}" height="26" fill="${cab ? COR.indigo : i === colunaDestaque ? '#FFF6DC' : '#fff'}" stroke="${COR.linha}"/>
      ${texto(x(i) + 6, y + 17, v, { tam: 11, peso: cab || total ? 700 : 400, cor: cab ? '#fff' : COR.tinta, max: Math.floor(w / 6.4) })}
    </g>`).join('');
  return `${letras}${celulas(cabecalho, y0 + 18, { cab: true })}${linhas.map((l, j) => celulas(l, y0 + 44 + j * 26, { total: linhaTotal && j === linhas.length - 1 })).join('')}`;
}

/** Documento (certificado, nota, guia): folha com título e linhas de dados. */
export function documento(y0, titulo, campos, { selo: comSelo = false, altura } = {}) {
  const h = altura ?? 40 + campos.length * 30;
  return `<g>
    <rect x="30" y="${y0}" width="180" height="${h}" rx="6" fill="#fff" stroke="${COR.linha}" stroke-width="1.5"/>
    <rect x="30" y="${y0}" width="180" height="30" rx="6" fill="${COR.indigo}"/>
    <rect x="30" y="${y0 + 22}" width="180" height="8" fill="${COR.indigo}"/>
    ${texto(120, y0 + 20, titulo, { tam: 12, peso: 700, cor: '#fff', ancora: 'middle', max: 26 })}
    ${campos.map(([rotulo, valor], i) => `${texto(42, y0 + 48 + i * 30, rotulo, { tam: 9.5, cor: COR.apoio })}${texto(42, y0 + 62 + i * 30, valor, { tam: 11.5, peso: 700, max: 26 })}`).join('')}
    ${comSelo ? selo(190, y0 + h - 18) : ''}
  </g>`;
}
