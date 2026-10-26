/*!
 * direccionesbitcoin.com — Build offline: un único HTML autocontenido
 * Autor: Félix Loureiro Etcheverría
 */
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [viteSingleFile({ removeViteModuleLoader: true })],
  define: { __OFFLINE__: 'true' },
  publicDir: false,
  resolve: {
    alias: {
      html2canvas: resolve(import.meta.dirname, 'src/lib/empty.ts'),
      canvg: resolve(import.meta.dirname, 'src/lib/empty.ts'),
      dompurify: resolve(import.meta.dirname, 'src/lib/empty.ts'),
    },
  },
  build: {
    target: 'es2022',
    outDir: '.cache/offline',
    emptyOutDir: true,
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    rollupOptions: { input: resolve(import.meta.dirname, 'offline.html') },
  },
});
