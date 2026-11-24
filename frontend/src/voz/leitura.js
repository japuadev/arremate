// Divide a tela em trechos, na ordem em que aparecem, para ler e destacar um de cada vez.
const TRECHOS = 'h1, h2, p, li, tr, legend, label, .etiqueta, .opcao, .alerta-golpe, .retorno, .mensagem, .revisao > div, .link-util, .resumo, .atalho, .linha-atalho, .confirmacao, .video-capa';

export function blocosDeLeitura(raiz) {
  if (!raiz) return [];
  return [...raiz.querySelectorAll(TRECHOS)]
    .filter((el) => !el.parentElement.closest(TRECHOS) && el.offsetParent !== null)
    .map((el) => ({ el, texto: el.innerText.replace(/\t+/g, ', ').replace(/\s*\n+\s*/g, '. ').replace(/\.{2,}/g, '.').trim() }))
    .filter((b) => b.texto);
}
