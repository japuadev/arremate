import { VIDEOS, PERMITIR_COLAR_VIDEO } from '../dados/videos.js';
import { estado, salvarVideo } from '../app/estado.js';
import { icone } from './icones.js';
import { esc } from '../app/utilidades.js';

export function interpretarVideo(endereco) {
  const e = String(endereco || '').trim();
  const yt = e.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return { tipo: 'youtube', id: yt[1] };
  if (/\.(mp4|webm)(\?.*)?$/i.test(e)) return { tipo: 'arquivo', src: e };
  return null;
}

function player(v, titulo) {
  if (v.tipo === 'arquivo') return `<video controls preload="metadata" src="${esc(v.src)}"></video>`;
  const pagina = `https://www.youtube.com/watch?v=${esc(v.id)}`;
  // O YouTube recusa player dentro de arquivo aberto do aparelho; ali, a capa abre o vídeo.
  if (location.protocol === 'file:') {
    return `<img alt="" src="https://i.ytimg.com/vi/${esc(v.id)}/hqdefault.jpg" />
      <a class="video-capa" href="${pagina}" target="_blank" rel="noopener noreferrer">${icone('play', 56)}<span>Assistir no YouTube</span></a>`;
  }
  return `<iframe src="https://www.youtube-nocookie.com/embed/${esc(v.id)}" title="${esc(titulo)}" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>`;
}

export function blocoVideo(aula) {
  const colado = estado.videos[aula.id];
  const v = interpretarVideo(colado || VIDEOS[aula.id]);
  if (v) {
    return `<section class="video"><h2>Veja como se faz</h2><div class="video-quadro">${player(v, aula.titulo)}</div>
      ${colado && PERMITIR_COLAR_VIDEO ? '<button class="video-trocar" data-video-remover>Trocar vídeo</button>' : ''}</section>`;
  }
  return `<section class="video"><h2>Veja como se faz</h2>
    <div class="video-quadro video-vazio"><div class="video-capa">${icone('play', 52)}<span>O vídeo desta aula entra aqui</span></div></div>
    ${PERMITIR_COLAR_VIDEO ? `<form class="linha-campo" data-video-form novalidate>
      <input class="campo" name="video" aria-label="Link do vídeo" placeholder="Cole o link do vídeo" autocomplete="off" />
      <button class="botao botao-contorno video-botao" type="submit">Inserir</button>
    </form><p class="alerta-campo" data-video-erro hidden>${icone('alerta', 24)}<span>Cole um link do YouTube ou de um arquivo .mp4.</span></p>` : ''}</section>`;
}

export function ligarVideo(raiz, atualizar) {
  const id = location.hash.split('/').pop();
  raiz.querySelector('[data-video-remover]')?.addEventListener('click', () => { salvarVideo(id, ''); atualizar(); });
  raiz.querySelector('[data-video-form]')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const valor = e.target.video.value;
    if (!interpretarVideo(valor)) { raiz.querySelector('[data-video-erro]').hidden = false; return; }
    salvarVideo(id, valor.trim());
    atualizar();
  });
}
