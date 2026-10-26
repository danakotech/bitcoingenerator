/*!
 * direccionesbitcoin.com — Build web (ES en /, EN en /en/), HTML pre-renderizado
 * Autor: Félix Loureiro Etcheverría
 */
import { defineConfig, type Plugin } from 'vite';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderHead, renderBody } from './src/content.ts';

function offlineMeta() {
  const p = resolve(import.meta.dirname, '.cache/offline-meta.json');
  if (existsSync(p)) return JSON.parse(readFileSync(p, 'utf8')) as { sha256: string; size: string };
  return { sha256: '—', size: '—' };
}

function prerender(): Plugin {
  return {
    name: 'db-prerender',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        if (!html.includes('<!--APP_HEAD-->')) return html;
        const lang = ctx.filename.replace(/\\/g, '/').endsWith('/en/index.html') ? 'en' : 'es';
        const meta = offlineMeta();
        // Verificaciones opcionales de buscadores (variables de entorno en Vercel)
        const extra = [
          process.env.GOOGLE_SITE_VERIFICATION && `<meta name="google-site-verification" content="${process.env.GOOGLE_SITE_VERIFICATION}" />`,
          process.env.BING_SITE_VERIFICATION && `<meta name="msvalidate.01" content="${process.env.BING_SITE_VERIFICATION}" />`,
          process.env.YANDEX_VERIFICATION && `<meta name="yandex-verification" content="${process.env.YANDEX_VERIFICATION}" />`,
        ]
          .filter(Boolean)
          .join('\n    ');
        return html
          .replace('<!--APP_HEAD-->', renderHead(lang, { extra }))
          .replace('<!--APP_BODY-->', renderBody(lang, { offline: false, hash: meta.sha256, size: meta.size }));
      },
    },
  };
}

export default defineConfig({
  plugins: [prerender()],
  define: { __OFFLINE__: 'false' },
  resolve: {
    alias: {
      html2canvas: resolve(import.meta.dirname, 'src/lib/empty.ts'),
      canvg: resolve(import.meta.dirname, 'src/lib/empty.ts'),
      dompurify: resolve(import.meta.dirname, 'src/lib/empty.ts'),
    },
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        es: resolve(import.meta.dirname, 'index.html'),
        en: resolve(import.meta.dirname, 'en/index.html'),
        notfound: resolve(import.meta.dirname, '404.html'),
      },
    },
  },
});
