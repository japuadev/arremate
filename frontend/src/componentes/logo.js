// Logo do Arremate: o botão de costura dourado (o mesmo do ícone do app) e o nome em Lexend.
// clara = true para fundo índigo (letras brancas).
const BOTAO = `<svg class="logo-botao" viewBox="106 106 300 300" aria-hidden="true">
  <circle cx="256" cy="256" r="150" fill="#E0A526"/>
  <circle cx="256" cy="256" r="112" fill="none" stroke="#1F3A73" stroke-width="10"/>
  <g fill="#1F3A73"><circle cx="218" cy="218" r="22"/><circle cx="294" cy="218" r="22"/><circle cx="218" cy="294" r="22"/><circle cx="294" cy="294" r="22"/></g>
</svg>`;

export function logo({ clara = false } = {}) {
  return `<span class="logo ${clara ? 'logo-clara' : ''}">${BOTAO}<span class="logo-nome">Arremate</span></span>`;
}
