/*!
 * direccionesbitcoin.com — Aviso a IndexNow (Bing, Yandex, Seznam, Naver…)
 * Uso (después de cada despliegue en producción):  npm run indexnow
 * Autor: Félix Loureiro Etcheverría — https://www.felixle.com/
 */
import { HOST, SITE, INDEXNOW_KEY, URLS } from './seo.config.mjs';

const keyLocation = `${SITE}/${INDEXNOW_KEY}.txt`;

// 1) La clave debe estar publicada antes de avisar
const check = await fetch(keyLocation, { redirect: 'follow' }).catch(() => null);
const body = check?.ok ? (await check.text()).trim() : '';
if (body !== INDEXNOW_KEY) {
  console.error(`✗ La clave no está publicada en ${keyLocation} (HTTP ${check?.status ?? 'sin respuesta'}). Despliega primero.`);
  process.exit(1);
}

// 2) Aviso a los motores
const payload = { host: HOST, key: INDEXNOW_KEY, keyLocation, urlList: URLS };
for (const endpoint of ['https://api.indexnow.org/indexnow', 'https://www.bing.com/indexnow', 'https://yandex.com/indexnow']) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  }).catch((e) => ({ ok: false, status: e.message }));
  console.log(`${res.ok ? '✓' : '✗'} ${endpoint} → ${res.status}`);
}
console.log(`URLs enviadas:\n${URLS.map((u) => '  ' + u).join('\n')}`);
