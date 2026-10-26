/*!
 * direccionesbitcoin.com — Build completo
 * 1) versión offline (un HTML)  2) huella SHA-256  3) web ES/EN  4) ficheros SEO
 * Autor: Félix Loureiro Etcheverría
 */
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://www.direccionesbitcoin.com';
const run = (cmd) => execSync(cmd, { cwd: root, stdio: 'inherit' });

run('npx vite build -c vite.offline.config.ts --logLevel warn');
const offlinePath = resolve(root, '.cache/offline/offline.html');
const buf = readFileSync(offlinePath);
const sha256 = createHash('sha256').update(buf).digest('hex');
const size = `${(buf.length / 1024 / 1024).toFixed(2)} MB`;
mkdirSync(resolve(root, '.cache'), { recursive: true });
writeFileSync(resolve(root, '.cache/offline-meta.json'), JSON.stringify({ sha256, size }, null, 2));
console.log(`offline: ${size} · sha256 ${sha256}`);

run('npx vite build --logLevel warn');
const dist = resolve(root, 'dist');
copyFileSync(offlinePath, resolve(dist, 'direccionesbitcoin-offline.html'));
writeFileSync(resolve(dist, 'direccionesbitcoin-offline.sha256'), `${sha256}  direccionesbitcoin-offline.html\n`);

const today = new Date().toISOString().slice(0, 10);
const alt = `    <xhtml:link rel="alternate" hreflang="es" href="${SITE}/"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/en/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/>`;
const files = {
  'robots.txt': `User-agent: *\nAllow: /\nDisallow: /direccionesbitcoin-offline.html\n\nSitemap: ${SITE}/sitemap.xml\n`,
  'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${SITE}/</loc>
    <lastmod>${today}</lastmod>
${alt}
  </url>
  <url>
    <loc>${SITE}/en/</loc>
    <lastmod>${today}</lastmod>
${alt}
  </url>
</urlset>
`,
  'llms.txt': `# direccionesbitcoin.com

> Generador gratuito de direcciones Bitcoin SegWit nativas (bc1q) con frase semilla BIP39 de 12 o 24 palabras y cartera de papel en PDF. Todo se genera en el navegador del usuario; no hay servidor de claves, cookies ni analítica. Pensado exclusivamente para importes pequeños (propinas, regalos, pruebas), nunca para ahorros.

- [Inicio (español)](${SITE}/): generador, aviso de importes pequeños, generación masiva, versión offline, guía y preguntas frecuentes.
- [Home (English)](${SITE}/en/): same content in English.

## Detalles técnicos
- Direcciones: SegWit nativo P2WPKH (bc1q), derivación BIP84 m/84'/0'/0'/0/0.
- Semilla: BIP39 (lista inglesa), 12 palabras (128 bits) o 24 palabras (256 bits).
- Aleatoriedad: crypto.getRandomValues del navegador, mezclado mediante SHA-256 con entropía opcional del movimiento del usuario.
- Bibliotecas: @scure/bip39, @scure/bip32, @scure/base, @noble/hashes.
- PDF: tarjeta A4 plegable con cara pública (dirección + QR) y cara secreta (frase, clave WIF + QR).
- Versión offline: ${SITE}/direccionesbitcoin-offline.html (SHA-256 ${sha256}).

## Autor
Félix Loureiro Etcheverría — https://www.felixle.com
`,
  'humans.txt': `/* TEAM */
Diseño y desarrollo: Félix Loureiro Etcheverría
Web: https://www.felixle.com
Ubicación: España

/* SITE */
Última actualización: ${today}
Idiomas: Español, English
Tecnología: TypeScript, Vite, Three.js, GSAP, Lenis, jsPDF, @scure/@noble
`,
  'site.webmanifest': JSON.stringify(
    {
      name: 'Direcciones Bitcoin',
      short_name: 'Direcciones BTC',
      start_url: '/',
      display: 'standalone',
      background_color: '#050505',
      theme_color: '#050505',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2,
  ),
};
for (const [name, content] of Object.entries(files)) writeFileSync(resolve(dist, name), content);
console.log('build listo → dist/');
