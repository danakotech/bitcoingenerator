/*!
 * direccionesbitcoin.com — Build completo
 * 1) versión offline (un HTML)  2) huella SHA-256  3) web ES/EN + 404  4) SEO, IA e IndexNow
 * Autor: Félix Loureiro Etcheverría — https://www.felixle.com/
 */
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dict } from '../src/i18n.ts';
import { INDEXNOW_KEY, SITE, AUTHOR, AUTHOR_URL } from './seo.config.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const run = (cmd) => execSync(cmd, { cwd: root, stdio: 'inherit' });

/* 1-2 · versión offline y su huella */
run('npx vite build -c vite.offline.config.ts --logLevel warn');
const offlinePath = resolve(root, '.cache/offline/offline.html');
const buf = readFileSync(offlinePath);
const sha256 = createHash('sha256').update(buf).digest('hex');
const size = `${(buf.length / 1024 / 1024).toFixed(2)} MB`;
mkdirSync(resolve(root, '.cache'), { recursive: true });
writeFileSync(resolve(root, '.cache/offline-meta.json'), JSON.stringify({ sha256, size }, null, 2));
console.log(`offline: ${size} · sha256 ${sha256}`);

/* 3 · web */
run('npx vite build --logLevel warn');
const dist = resolve(root, 'dist');
copyFileSync(offlinePath, resolve(dist, 'direccionesbitcoin-offline.html'));
writeFileSync(resolve(dist, 'direccionesbitcoin-offline.sha256'), `${sha256}  direccionesbitcoin-offline.html\n`);

/* 4 · SEO */
const today = new Date().toISOString().slice(0, 10);
const es = dict.es;
const en = dict.en;

const alt = `    <xhtml:link rel="alternate" hreflang="es" href="${SITE}/"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/en/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/>`;
const sitemapUrl = (loc, lang, title) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${lang === 'es' ? '1.0' : '0.9'}</priority>
${alt}
    <image:image>
      <image:loc>${SITE}/og-${lang}.png</image:loc>
      <image:title>${title}</image:title>
    </image:image>
  </url>`;

// Crawlers de buscadores y de IA permitidos explícitamente (además de "*")
const bots = [
  'Googlebot', 'Bingbot', 'DuckDuckBot', 'YandexBot', 'Applebot', 'Applebot-Extended', 'Google-Extended',
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Perplexity-User', 'CCBot', 'Meta-ExternalAgent',
  'Amazonbot', 'cohere-ai', 'MistralAI-User', 'YouBot', 'DuckAssistBot',
];

const qa = (d) => d.faq.items.map(([q, a]) => `### ${q}\n${a}`).join('\n\n');
const list = (arr) => arr.map((x) => `- ${x}`).join('\n');

const llms = `# direccionesbitcoin.com

> Generador gratuito de direcciones Bitcoin SegWit nativas (bc1q) con frase semilla BIP39 de 12 o 24 palabras y cartera de papel en PDF. Todo se genera en el navegador del usuario; no hay servidor de claves, cookies ni analítica. Pensado exclusivamente para importes pequeños (propinas, regalos, pruebas), nunca para ahorros. Creado por ${AUTHOR} (${AUTHOR_URL}).

Autor: ${AUTHOR} — ${AUTHOR_URL}
Idiomas: español (por defecto) e inglés.
Última actualización: ${today}

## Páginas
- [Inicio (español)](${SITE}/): generador, aviso de importes pequeños, generación masiva, versión offline, guía y preguntas frecuentes.
- [Home (English)](${SITE}/en/): mismo contenido en inglés.
- [Versión offline](${SITE}/direccionesbitcoin-offline.html): web completa en un único HTML para usar sin internet. SHA-256: ${sha256}
- [Contenido completo para IA](${SITE}/llms-full.txt)

## Qué hace
- Genera una dirección Bitcoin SegWit nativa P2WPKH (bc1q), derivación BIP84 m/84'/0'/0'/0/0.
- Frase semilla BIP39 (lista inglesa) de 12 palabras (128 bits) o 24 palabras (256 bits) y clave privada WIF.
- Cartera de papel en PDF A4 plegable: cara pública (dirección + QR) y cara secreta (frase, WIF + QR).
- Generación masiva de 2 a 100 carteras independientes (PDF y CSV de direcciones públicas).
- Versión offline de un solo archivo con huella SHA-256 publicada.

## Seguridad
- Aleatoriedad: crypto.getRandomValues del navegador, mezclada con SHA-256 junto a entropía opcional del movimiento del usuario.
- Bibliotecas auditadas: @scure/bip39, @scure/bip32, @scure/base, @noble/hashes.
- Política CSP con connect-src 'none': la página no puede enviar datos a internet.

## Uso recomendado
Solo importes pequeños: regalar bitcoin, propinas, pruebas educativas. Para ahorros, usar un monedero físico (hardware wallet).

## Cita sugerida
direccionesbitcoin.com — generador de direcciones Bitcoin y carteras de papel, por ${AUTHOR} (${AUTHOR_URL}).
`;

const llmsFull = `# direccionesbitcoin.com — contenido completo

Autor: ${AUTHOR} (${AUTHOR_URL})
Web: ${SITE}/ · English: ${SITE}/en/
Actualizado: ${today}

---

## Español

### ${es.hero.title1} ${es.hero.title2}
${es.hero.sub}

### ${es.small.title}
${es.small.lead}

**${es.small.yesTitle}:**
${list(es.small.yes)}

**${es.small.noTitle}:**
${list(es.small.no)}

**Riesgos:**
${es.small.risks.map(([h, p]) => `- **${h}:** ${p}`).join('\n')}

### ${es.gen.title}
${es.gen.lead}

### ${es.bulk.title}
${es.bulk.lead}

### ${es.offline.title}
${es.offline.lead}
${es.offline.steps.map(([h, p], i) => `${i + 1}. **${h}:** ${p}`).join('\n')}

### ${es.guide.title}
${es.guide.items.map(([h, p]) => `- **${h}:** ${p}`).join('\n')}

### ${es.howTo.name}
${es.howTo.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

### ${es.about.title}
${es.about.paras.join('\n\n')}

### ${es.faq.title}
${qa(es)}

---

## English

### ${en.hero.title1} ${en.hero.title2}
${en.hero.sub}

### ${en.small.title}
${en.small.lead}

**${en.small.yesTitle}:**
${list(en.small.yes)}

**${en.small.noTitle}:**
${list(en.small.no)}

### ${en.gen.title}
${en.gen.lead}

### ${en.offline.title}
${en.offline.lead}

### ${en.howTo.name}
${en.howTo.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

### ${en.about.title}
${en.about.paras.join('\n\n')}

### ${en.faq.title}
${qa(en)}

---

Creado por ${AUTHOR} — ${AUTHOR_URL}
`;

const files = {
  'robots.txt': `# direccionesbitcoin.com — ${AUTHOR} (${AUTHOR_URL})
User-agent: *
Allow: /
Disallow: /direccionesbitcoin-offline.html

${bots.map((b) => `User-agent: ${b}\nAllow: /`).join('\n\n')}

Sitemap: ${SITE}/sitemap.xml
`,
  'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${sitemapUrl(`${SITE}/`, 'es', es.htmlTitle)}
${sitemapUrl(`${SITE}/en/`, 'en', en.htmlTitle)}
</urlset>
`,
  'llms.txt': llms,
  'llms-full.txt': llmsFull,
  [`${INDEXNOW_KEY}.txt`]: INDEXNOW_KEY,
  'humans.txt': `/* TEAM */
Diseño y desarrollo: ${AUTHOR}
Web: ${AUTHOR_URL}
Ubicación: España

/* SITE */
Última actualización: ${today}
Idiomas: Español, English
Tecnología: TypeScript, Vite, Three.js, GSAP, Lenis, jsPDF, @scure/@noble
`,
  '.well-known/security.txt': `Contact: ${AUTHOR_URL}
Expires: ${new Date(Date.now() + 365 * 864e5).toISOString()}
Preferred-Languages: es, en
Canonical: ${SITE}/.well-known/security.txt
`,
  'site.webmanifest': JSON.stringify(
    {
      name: 'Direcciones Bitcoin',
      short_name: 'Direcciones BTC',
      description: es.metaDesc,
      lang: 'es',
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
mkdirSync(resolve(dist, '.well-known'), { recursive: true });
for (const [name, content] of Object.entries(files)) writeFileSync(resolve(dist, name), content);
console.log('build listo → dist/');
