/*!
 * direccionesbitcoin.com — Maquetado de la página (se pre-renderiza en build)
 * Autor: Félix Loureiro Etcheverría
 */
import { dict, SITE, type Lang } from './i18n.ts';
import { BTC_PATH } from './lib/btcpath.ts';

export interface BuildMeta {
  offline: boolean;
  hash: string;
  size: string;
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const icon = {
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7" /></svg>',
  cross: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>',
  copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
  pdf: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19h14"/></svg>',
  eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  flip: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg>',
};

export const btcMark = (cls = 'mark') =>
  `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="31" fill="#F7931A"/><path fill="#fff" transform="rotate(14 32 32)" d="${BTC_PATH}"/></svg>`;

export const AUTHOR_NAME = 'Félix Loureiro Etcheverría';
export const AUTHOR_URL = 'https://www.felixle.com/';

/** Cabecera SEO completa. `extra` permite inyectar verificaciones (Google/Bing) en build. */
export function renderHead(lang: Lang, opts: { modified?: string; extra?: string } = {}): string {
  const t = dict[lang];
  const url = lang === 'es' ? `${SITE}/` : `${SITE}/en/`;
  const name = lang === 'es' ? 'Direcciones Bitcoin' : 'Bitcoin Addresses';
  const og = `${SITE}/og-${lang}.png`;
  const modified = opts.modified ?? new Date().toISOString().slice(0, 10);
  const person = {
    '@type': 'Person',
    '@id': `${AUTHOR_URL}#person`,
    name: AUTHOR_NAME,
    url: AUTHOR_URL,
    sameAs: [AUTHOR_URL],
    jobTitle: lang === 'es' ? 'Desarrollador blockchain y diseñador web' : 'Blockchain developer and web designer',
    knowsAbout: ['Bitcoin', 'Blockchain', 'BIP39', 'Web3', 'WebGL'],
  };
  const ref = { '@id': `${AUTHOR_URL}#person` };
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      person,
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        url: `${SITE}/`,
        name: 'direccionesbitcoin.com',
        alternateName: ['Direcciones Bitcoin', 'Bitcoin Addresses'],
        description: t.metaDesc,
        inLanguage: ['es', 'en'],
        author: ref,
        creator: ref,
        publisher: ref,
        copyrightHolder: ref,
        copyrightYear: 2026,
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: t.htmlTitle,
        description: t.metaDesc,
        inLanguage: lang,
        isPartOf: { '@id': `${SITE}/#website` },
        about: { '@id': `${url}#app` },
        mainEntity: { '@id': `${url}#app` },
        primaryImageOfPage: { '@type': 'ImageObject', url: og, width: 1200, height: 630 },
        datePublished: '2026-10-26',
        dateModified: modified,
        author: ref,
        breadcrumb: { '@id': `${url}#breadcrumb` },
        keywords: t.keywords,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [{ '@type': 'ListItem', position: 1, name: t.breadcrumb, item: url }],
      },
      {
        '@type': ['WebApplication', 'SoftwareApplication'],
        '@id': `${url}#app`,
        name,
        url,
        inLanguage: lang,
        applicationCategory: 'FinanceApplication',
        applicationSubCategory: 'Bitcoin paper wallet generator',
        operatingSystem: 'Any (web browser)',
        browserRequirements: 'Requires JavaScript and Web Crypto API',
        isAccessibleForFree: true,
        description: t.metaDesc,
        image: og,
        screenshot: og,
        featureList: [t.gen.w12, t.gen.w24, 'SegWit bc1q (BIP84)', t.gen.pdf, t.bulk.title, t.offline.btn],
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR', availability: 'https://schema.org/InStock' },
        author: ref,
        creator: ref,
        publisher: ref,
        datePublished: '2026-10-26',
      },
      {
        '@type': 'HowTo',
        '@id': `${url}#howto`,
        name: t.howTo.name,
        inLanguage: lang,
        totalTime: 'PT3M',
        estimatedCost: { '@type': 'MonetaryAmount', currency: 'EUR', value: '0' },
        tool: [{ '@type': 'HowToTool', name: lang === 'es' ? 'Impresora' : 'Printer' }],
        step: t.howTo.steps.map((text, i) => ({ '@type': 'HowToStep', position: i + 1, name: text.split(/[.,(]/)[0], text, url: `${url}#generar` })),
        author: ref,
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        inLanguage: lang,
        author: ref,
        mainEntity: t.faq.items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
    ],
  };
  const robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  return `
    <title>${esc(t.htmlTitle)}</title>
    <meta name="description" content="${esc(t.metaDesc)}" />
    <meta name="keywords" content="${esc(t.keywords)}" />
    <meta name="author" content="${AUTHOR_NAME}" />
    <meta name="creator" content="${AUTHOR_NAME}" />
    <meta name="publisher" content="${AUTHOR_NAME}" />
    <meta name="copyright" content="© 2026 ${AUTHOR_NAME}" />
    <meta name="robots" content="${robots}" />
    <meta name="googlebot" content="${robots}" />
    <meta name="bingbot" content="${robots}" />
    <meta name="application-name" content="direccionesbitcoin.com" />
    <meta name="apple-mobile-web-app-title" content="${name}" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="rating" content="general" />
    <link rel="author" href="${AUTHOR_URL}" />
    <link rel="me" href="${AUTHOR_URL}" />
    <link rel="canonical" href="${url}" />
    <link rel="alternate" hreflang="es" href="${SITE}/" />
    <link rel="alternate" hreflang="en" href="${SITE}/en/" />
    <link rel="alternate" hreflang="x-default" href="${SITE}/" />
    <link rel="alternate" type="text/plain" href="${SITE}/llms.txt" title="llms.txt" />
    <link rel="sitemap" type="application/xml" href="${SITE}/sitemap.xml" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="direccionesbitcoin.com" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${esc(t.htmlTitle)}" />
    <meta property="og:description" content="${esc(t.metaDesc)}" />
    <meta property="og:image" content="${og}" />
    <meta property="og:image:secure_url" content="${og}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(t.ogAlt)}" />
    <meta property="og:locale" content="${lang === 'es' ? 'es_ES' : 'en_US'}" />
    <meta property="og:locale:alternate" content="${lang === 'es' ? 'en_US' : 'es_ES'}" />
    <meta property="article:author" content="${AUTHOR_URL}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(t.htmlTitle)}" />
    <meta name="twitter:description" content="${esc(t.metaDesc)}" />
    <meta name="twitter:image" content="${og}" />
    <meta name="twitter:image:alt" content="${esc(t.ogAlt)}" />
    ${opts.extra ?? ''}
    <script type="application/ld+json">${JSON.stringify(graph).replace(/</g, '\\u003c')}</script>`;
}

export function renderBody(lang: Lang, meta: BuildMeta): string {
  const t = dict[lang];
  const other = lang === 'es' ? '/en/' : '/';
  const langHref = meta.offline ? '#' : other;

  const header = `
  <a class="skip" href="#generar">${t.skip}</a>
  <header class="nav" data-nav>
    <a class="brand" href="${meta.offline ? '#top' : lang === 'es' ? '/' : '/en/'}" aria-label="direccionesbitcoin.com">
      ${btcMark()}<span>direcciones<b>bitcoin</b></span>
    </a>
    <nav aria-label="menu">
      <a href="#generar">${t.nav.gen}</a>
      <a href="#masiva">${t.nav.bulk}</a>
      <a href="#offline">${t.nav.offline}</a>
      <a href="#guia">${t.nav.guide}</a>
      <a href="#faq">${t.nav.faq}</a>
    </nav>
    <div class="nav-right">
      <span class="net" data-net><i></i><em></em></span>
      <a class="lang" href="${langHref}" hreflang="${lang === 'es' ? 'en' : 'es'}" data-lang-switch="${lang === 'es' ? 'en' : 'es'}" aria-label="${t.langSwitchLabel}">${t.langSwitch}</a>
    </div>
  </header>`;

  const hero = `
  <section class="hero" id="top">
    <div class="hero-copy">
      <p class="eyebrow reveal">${t.hero.eyebrow}</p>
      <h1 class="reveal"><span>${t.hero.title1}</span> <span class="accent">${t.hero.title2}</span></h1>
      <p class="lead reveal">${t.hero.sub}</p>
      <div class="cta-row reveal">
        <a class="btn btn-primary magnetic" href="#generar">${icon.bolt}<span>${t.hero.cta}</span></a>
        <a class="btn btn-ghost" href="#pequeno">${t.hero.cta2}</a>
      </div>
      <ul class="chips reveal">${t.hero.chips.map((c) => `<li>${c}</li>`).join('')}</ul>
    </div>
    <div class="hero-anchor" data-coin-anchor="hero" aria-hidden="true"></div>
    <div class="scroll-cue" aria-hidden="true"><span>${t.hero.scroll}</span><i></i></div>
  </section>`;

  const small = `
  <section class="section small" id="pequeno">
    <div class="wrap">
      <div class="small-grid">
        <div>
          <p class="kicker reveal">${t.small.kicker}</p>
          <h2 class="reveal">${t.small.title}</h2>
          <p class="lead reveal">${t.small.lead}</p>
          <div class="meter reveal" data-meter>
            <div class="meter-head"><span>${t.small.meterLabel}</span></div>
            <div class="meter-bar"><i></i></div>
            <div class="meter-scale"><span>${t.small.meterLow}</span><span>${t.small.meterHigh}</span></div>
          </div>
        </div>
        <div class="small-anchor" data-coin-anchor="small" aria-hidden="true"></div>
      </div>
      <div class="yesno">
        <div class="panel yes reveal">
          <h3>${t.small.yesTitle}</h3>
          <ul>${t.small.yes.map((x) => `<li>${icon.check}<span>${x}</span></li>`).join('')}</ul>
        </div>
        <div class="panel no reveal">
          <h3>${t.small.noTitle}</h3>
          <ul>${t.small.no.map((x) => `<li>${icon.cross}<span>${x}</span></li>`).join('')}</ul>
        </div>
      </div>
      <div class="risks">
        ${t.small.risks
          .map(([h, p], i) => `<article class="risk reveal"><span class="num">0${i + 1}</span><h3>${h}</h3><p>${p}</p></article>`)
          .join('')}
      </div>
    </div>
  </section>`;

  const gen = `
  <section class="section gen" id="generar">
    <div class="wrap">
      <p class="kicker reveal">${t.gen.kicker}</p>
      <h2 class="reveal">${t.gen.title}</h2>
      <p class="lead reveal">${t.gen.lead}</p>
      <div class="gen-grid">
        <div class="gen-controls">
          <div class="entropy-pad" data-coin-anchor="gen" data-entropy-pad>
            <span class="pad-hint">${t.gen.entropyHint}</span>
            <span class="pad-corner tl"></span><span class="pad-corner tr"></span><span class="pad-corner bl"></span><span class="pad-corner br"></span>
          </div>
          <div class="entropy">
            <div class="entropy-head"><span>${t.gen.entropy}</span><b data-entropy-val>0%</b></div>
            <div class="entropy-bar"><i data-entropy-bar></i></div>
          </div>
          <fieldset class="seg" data-words>
            <legend>${t.gen.words}</legend>
            <label><input type="radio" name="words" value="12" checked /><span><b>${t.gen.w12}</b><small>${t.gen.w12hint}</small></span></label>
            <label><input type="radio" name="words" value="24" /><span><b>${t.gen.w24}</b><small>${t.gen.w24hint}</small></span></label>
          </fieldset>
          <button class="btn btn-primary btn-xl magnetic" type="button" data-generate>${icon.bolt}<span data-generate-label>${t.gen.btn}</span></button>
          <p class="net-note" data-net-note></p>
        </div>

        <div class="gen-result">
          <div class="card3d is-empty" data-card>
            <div class="card-inner" data-card-inner>
              <div class="face front">
                <div class="face-top">${btcMark('mark sm')}<span>${t.gen.front}</span><em>bc1q · BIP84</em></div>
                <div class="qr-wrap"><canvas data-qr-addr width="220" height="220" aria-label="QR"></canvas><div class="qr-ph">₿</div></div>
                <p class="label">${t.gen.address}</p>
                <p class="addr" data-addr>bc1q ···· ···· ···· ···· ···· ···· ···· ···· ····</p>
                <p class="small-only">${t.gen.smallOnly}</p>
                <p class="hint">${t.gen.addressHint}</p>
                <span class="holo" aria-hidden="true"></span>
              </div>
              <div class="face back">
                <div class="face-top">${btcMark('mark sm')}<span>${t.gen.back}</span><em data-words-count>12</em></div>
                <p class="label">${t.gen.seed}</p>
                <ol class="seed is-hidden" data-seed></ol>
                <p class="label">${t.gen.wif}</p>
                <p class="wif is-hidden" data-wif>K···············································</p>
                <p class="label">${t.gen.path}</p>
                <p class="path" data-path>m/84'/0'/0'/0/0</p>
                <p class="hint warn">${t.gen.seedHint}</p>
                <span class="holo" aria-hidden="true"></span>
              </div>
            </div>
          </div>
          <div class="result-actions" data-actions hidden>
            <button class="btn btn-primary" type="button" data-pdf>${icon.pdf}<span data-pdf-label>${t.gen.pdf}</span></button>
            <button class="btn btn-ghost" type="button" data-copy>${icon.copy}<span data-copy-label>${t.gen.copy}</span></button>
            <button class="btn btn-ghost" type="button" data-flip>${icon.flip}<span>${t.gen.flip}</span></button>
            <button class="btn btn-ghost" type="button" data-reveal aria-pressed="false">${icon.eye}<span data-reveal-label>${t.gen.reveal}</span></button>
          </div>
          <p class="volatile" data-volatile hidden>${t.gen.volatile}</p>
        </div>
      </div>
    </div>
  </section>`;

  const bulk = `
  <section class="section bulk" id="masiva">
    <div class="wrap">
      <div class="bulk-grid">
        <div>
          <p class="kicker reveal">${t.bulk.kicker}</p>
          <h2 class="reveal">${t.bulk.title}</h2>
          <p class="lead reveal">${t.bulk.lead}</p>
          <form class="bulk-form reveal" data-bulk-form>
            <label class="field"><span>${t.bulk.count}</span>
              <span class="stepper"><button type="button" data-step="-1" aria-label="−">−</button><input type="number" min="2" max="100" value="10" name="count" inputmode="numeric" /><button type="button" data-step="1" aria-label="+">+</button></span>
            </label>
            <label class="field"><span>${t.bulk.words}</span>
              <select name="words"><option value="12">12</option><option value="24">24</option></select>
            </label>
            <button class="btn btn-primary" type="submit" data-bulk-btn>${icon.bolt}<span data-bulk-label>${t.bulk.btn}</span></button>
          </form>
        </div>
        <div class="bulk-anchor" data-coin-anchor="bulk" aria-hidden="true"></div>
      </div>
      <div class="bulk-out" data-bulk-out hidden>
        <div class="bulk-bar"><p><b data-bulk-count></b> <span>${t.bulk.done}</span></p>
          <div class="bulk-actions">
            <button class="btn btn-primary" type="button" data-bulk-pdf>${icon.pdf}<span data-bulk-pdf-label>${t.bulk.pdf}</span></button>
            <button class="btn btn-ghost" type="button" data-bulk-csv>${icon.pdf}<span>${t.bulk.csv}</span></button>
            <button class="btn btn-ghost" type="button" data-bulk-clear>${icon.cross}<span>${t.bulk.clear}</span></button>
          </div>
        </div>
        <div class="table-wrap"><table><thead><tr>${t.bulk.th.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody data-bulk-rows></tbody></table></div>
      </div>
    </div>
  </section>`;

  const offline = `
  <section class="section offline" id="offline">
    <div class="wrap">
      <p class="kicker reveal">${t.offline.kicker}</p>
      <h2 class="reveal">${t.offline.title}</h2>
      <p class="lead reveal">${meta.offline ? `<strong>${t.offline.inOffline}</strong> ` : ''}${t.offline.lead}</p>
      <ol class="steps">
        ${t.offline.steps.map(([h, p], i) => `<li class="step reveal"><span class="num">${i + 1}</span><div><h3>${h}</h3><p>${p}</p></div></li>`).join('')}
      </ol>
      ${
        meta.offline
          ? ''
          : `<div class="dl reveal">
        <a class="btn btn-primary btn-xl magnetic" href="/direccionesbitcoin-offline.html" download="direccionesbitcoin-offline.html">${icon.pdf}<span>${t.offline.btn}</span></a>
        <dl class="hash"><dt>${t.offline.hash}</dt><dd><code>${meta.hash}</code></dd><dt>${t.offline.size}</dt><dd>${meta.size}</dd></dl>
      </div>`
      }
    </div>
  </section>`;

  const guide = `
  <section class="section guide" id="guia">
    <div class="wrap">
      <p class="kicker reveal">${t.guide.kicker}</p>
      <h2 class="reveal">${t.guide.title}</h2>
      <div class="guide-grid">
        ${t.guide.items.map(([h, p], i) => `<article class="g reveal"><span class="num">0${i + 1}</span><h3>${h}</h3><p>${p}</p></article>`).join('')}
      </div>
    </div>
  </section>`;

  const about = `
  <section class="section about" id="sobre">
    <div class="wrap narrow">
      <p class="kicker reveal">${t.about.kicker}</p>
      <h2 class="reveal">${t.about.title}</h2>
      ${t.about.paras.map((p) => `<p class="lead reveal">${p}</p>`).join('')}
      <ul class="tags reveal">${t.about.tags.map((x) => `<li>${x}</li>`).join('')}</ul>
    </div>
  </section>`;

  const faq = `
  <section class="section faq" id="faq">
    <div class="wrap narrow">
      <p class="kicker reveal">${t.faq.kicker}</p>
      <h2 class="reveal">${t.faq.title}</h2>
      <div class="faq-list">
        ${t.faq.items.map(([q, a]) => `<details class="reveal"><summary><span>${esc(q)}</span><i></i></summary><p>${esc(a)}</p></details>`).join('')}
      </div>
    </div>
  </section>`;

  const footer = `
  <footer class="foot">
    <div class="wrap">
      <div class="foot-top">
        <a class="brand" href="#top">${btcMark()}<span>direcciones<b>bitcoin</b></span></a>
        <p>${t.footer.tagline}</p>
      </div>
      <p class="foot-note">${t.footer.note}</p>
      <p class="foot-legal">${t.footer.disclaimer}</p>
      <p class="foot-bottom"><span>© ${new Date().getFullYear()} direccionesbitcoin.com</span><a class="sig" href="https://www.felixle.com/" rel="noopener" target="_blank">felixle.com</a></p>
    </div>
  </footer>`;

  return `${header}<main id="main">${hero}${small}${gen}${bulk}${offline}${guide}${about}${faq}</main>${footer}
  <div class="toast" role="status" aria-live="polite" data-toast></div>`;
}
