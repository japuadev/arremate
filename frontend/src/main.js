import '@fontsource/lexend/latin-500.css';
import '@fontsource/lexend/latin-700.css';
import '@fontsource/atkinson-hyperlegible-next/latin-400.css';
import '@fontsource/atkinson-hyperlegible-next/latin-700.css';
import './estilos/tokens.css';
import './estilos/base.css';
import './estilos/componentes.css';
import './estilos/paginas.css';

import { iniciarRoteador } from './app/roteador.js';
import { aplicarPreferencias, limparAparelho } from './app/estado.js';
import { ir } from './app/utilidades.js';
import { SESSAO_EXPIRADA } from './api/http.js';

aplicarPreferencias();
iniciarRoteador(document.getElementById('app'));

// O servidor não reconhece mais o token: limpa o aparelho e volta para a tela de entrar.
window.addEventListener(SESSAO_EXPIRADA, () => {
  limparAparelho();
  ir('/entrar');
});

if ('serviceWorker' in navigator && location.protocol.startsWith('http') && import.meta.env.PROD) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
