import { copyFileSync, mkdirSync } from 'node:fs';

mkdirSync('../prototipo', { recursive: true });
copyFileSync('dist-prototipo/index.html', '../prototipo/arremate-prototipo.html');
console.log('Protótipo salvo em prototipo/arremate-prototipo.html');
