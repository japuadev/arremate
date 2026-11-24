import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// "npm run prototipo" junta tudo em um único HTML, que abre com dois cliques.
export default defineConfig(({ mode }) => {
  const prototipo = mode === 'prototipo';
  return {
    base: './',
    plugins: prototipo ? [viteSingleFile()] : [],
    build: {
      outDir: prototipo ? 'dist-prototipo' : 'dist',
      assetsInlineLimit: prototipo ? 100000000 : 4096,
    },
  };
});
