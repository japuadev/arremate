import { icone } from './icones.js';
import { esc } from '../app/utilidades.js';
import { t } from '../personalizacao/perfil.js';

export const NIVEIS = {
  1: { nome: 'Fácil', forma: 'circulo' },
  2: { nome: 'Médio', forma: 'triangulo' },
  3: { nome: 'Avançado', forma: 'quadrado' },
};

export function formaNivel(n) {
  const f = {
    1: '<circle cx="8" cy="8" r="7"/>',
    2: '<path d="M8 1 15.5 15H.5z"/>',
    3: '<rect x="1" y="1" width="14" height="14"/>',
  }[n];
  return `<svg class="forma forma-${n}" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">${f}</svg>`;
}

export function etiqueta({ href, cor, icone: ic, titulo, tempo, nivel, feita = false, destaque = '' }) {
  const meta = [tempo ? `${tempo} min` : '', nivel ? NIVEIS[nivel].nome : ''].filter(Boolean);
  return `<a class="etiqueta ${feita ? 'etiqueta-feita' : ''}" href="${href}">
    <span class="etiqueta-ponto">
      <span class="etiqueta-icone" style="--cor:var(--trilha-${cor});--cor-icone:var(--trilha-${cor}-icone)">${icone(ic, 30)}</span>
      <span class="etiqueta-texto">
        ${meta.length ? `<span class="etiqueta-meta">${nivel ? formaNivel(nivel) : ''}${meta.join(', ')}</span>` : ''}
        <span class="etiqueta-titulo">${esc(titulo)}</span>
        ${destaque ? `<span class="etiqueta-destaque">${esc(destaque)}</span>` : ''}
      </span>
      ${feita ? `<span class="etiqueta-ok" aria-label="Feita">${icone('check', 26)}</span>` : ''}
    </span>
  </a>`;
}

// Contador "Passo N de M" com uma trilha de segmentos: feitos, atual e que faltam.
export function passos(atual, total, titulo = '') {
  const segmentos = Array.from({ length: total }, (_, i) => {
    const classe = i + 1 < atual ? 'feito' : i + 1 === atual ? 'atual' : '';
    return `<li class="${classe}"></li>`;
  }).join('');
  return `<div class="passos">
    <p class="passos-texto">Passo ${atual} de ${total}</p>
    <ol class="passos-trilha" aria-hidden="true">${segmentos}</ol>
    ${titulo ? `<h1 tabindex="-1" class="titulo-passo">${esc(titulo)}</h1>` : ''}
  </div>`;
}

export function campo({ id, rotulo, valor = '', tipo = 'text', modo = '', ajuda = '', erro = '', comVoz = false, maximo = '' }) {
  return `<div class="grupo-campo ${erro ? 'grupo-erro' : ''}">
    <label for="${id}">${esc(rotulo)}</label>
    <div class="linha-campo">
      <input class="campo" id="${id}" name="${id}" type="${tipo}" value="${esc(valor)}" ${modo ? `inputmode="${modo}"` : ''} ${maximo ? `maxlength="${maximo}"` : ''} ${erro ? `aria-invalid="true" aria-describedby="${id}-erro"` : ''} autocomplete="off" />
      ${comVoz ? `<button type="button" class="botao-mic" data-ditar="${id}" aria-label="Falar ${esc(rotulo)}">${icone('mic')}</button>` : ''}
    </div>
    ${ajuda ? `<p class="campo-ajuda">${esc(ajuda)}</p>` : ''}
    ${erro ? `<p class="alerta-campo" id="${id}-erro">${icone('alerta', 24)}<span>${esc(erro)}</span></p>` : ''}
    <p class="campo-ajuda" data-msg="${id}" aria-live="polite"></p>
  </div>`;
}

export function alertaGolpe(forte, resto) {
  return `<div class="alerta-golpe" role="alert">${icone('alerta', 34)}<p><strong>${esc(forte)}</strong> ${esc(resto)}</p></div>`;
}

export function faixaSimulacao() {
  return `<p class="faixa-simulacao">${icone('alerta', 24)}<span>Isto é um treino. Nada é enviado ao governo.</span></p>`;
}

const ROTULOS_LINK = { oficial: 'Site oficial', busca: 'Pesquisar no Google', video: 'Pesquisar vídeos no YouTube' };

export function blocoLinks(links, titulo = '') {
  if (!links?.length) return '';
  const temBusca = links.some((l) => l.tipo !== 'oficial');
  return `<section class="links">
    ${titulo ? `<h2>${esc(titulo)}</h2>` : ''}
    ${links.map((l) => `<a class="link-util" href="${esc(t(l.url))}" target="_blank" rel="noopener noreferrer">
      ${icone(l.tipo === 'oficial' ? 'banco' : l.tipo === 'video' ? 'play' : 'lupa', 26)}
      <span><strong>${esc(t(l.rotulo))}</strong><small>${ROTULOS_LINK[l.tipo]}${l.site ? `: ${esc(l.site)}` : ''}</small></span>
      ${icone('externo', 22)}
    </a>`).join('')}
    ${temBusca ? '<p class="nota-baixa">Na busca, prefira endereços oficiais. Serviços do governo terminam em gov.br.</p>' : ''}
  </section>`;
}

// Cartão de material de gestão (curso, cartilha, planilha), com o tipo, a fonte e o tempo.
export function cartaoMaterial(m, tipos) {
  const tipo = tipos[m.tipo];
  return `<a class="material" href="${esc(m.url)}" target="_blank" rel="noopener noreferrer">
    <span class="material-tipo">${icone(tipo.icone, 20)}${esc(tipo.nome)}${m.certificado ? ' com certificado' : ''}</span>
    <strong class="material-titulo">${esc(m.titulo)}</strong>
    <span class="material-resumo">${esc(m.resumo)}</span>
    <span class="material-meta"><span>${esc(m.fonte)}</span><span>${esc(m.tempo)}</span><span class="material-gratis">Grátis</span></span>
    <span class="material-abrir">Abrir ${icone('externo', 20)}</span>
  </a>`;
}

export function blocoMateriais(lista, tipos, titulo = 'Materiais de gestão') {
  if (!lista.length) return '';
  return `<section class="pilha">
    <h2>${esc(titulo)}</h2>
    ${lista.map((m) => cartaoMaterial(m, tipos)).join('')}
    <a class="link-mais" href="#/materiais">Ver todos os materiais ${icone('avancar', 22)}</a>
  </section>`;
}
