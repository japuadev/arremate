import '@fontsource/lexend/latin-500.css';
import '@fontsource/lexend/latin-700.css';
import '@fontsource/atkinson-hyperlegible-next/latin-400.css';
import '@fontsource/atkinson-hyperlegible-next/latin-700.css';
import './estilos/tokens.css';
import './estilos/base.css';
import './estilos/componentes.css';
import './estilos/paginas.css';

import { iniciarRoteador } from './app/roteador.js';
import { aplicarPreferencias } from './app/estado.js';

aplicarPreferencias();
iniciarRoteador(document.getElementById('app'));

if ('serviceWorker' in navigator && location.protocol.startsWith('http') && import.meta.env.PROD) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
