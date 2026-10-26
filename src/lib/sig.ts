/*!
 * direccionesbitcoin.com — Integridad de la autoría
 * Autor: Félix Loureiro Etcheverría — https://www.felixle.com/
 *
 * Esta web solo funciona con su autoría original intacta:
 *   · <meta name="author"> con el nombre del autor
 *   · enlace visible a https://www.felixle.com/ en el pie
 *   · autor en los datos estructurados (versión web)
 * Si alguno falta o se altera, la web se bloquea y no genera direcciones.
 */
import { sha256 } from '@noble/hashes/sha2.js';

const H = {
  n: 'a4fb16479845f037c50b970989a44623f1a822328394cc05c7ab0718564acaf6',
  u: 'a201c0c8d2d0b5bebb9a89ef1a5004bb6f415a3d977ef5e5e90e72ecec23edbe',
  l: '0a150fa6e606ce3671ce62432d75e800fdb417f3a884ebeb02b55d75c9953b2f',
};
const D = {
  n: [28, 178, 48, 52, 38, 127, 44, 53, 46, 46, 56, 55, 45, 15, 122, 30, 40, 62, 54, 58, 22, 63, 41, 46, 176, 63],
  u: [50, 47, 40, 45, 45, 101, 79, 117, 44, 43, 42, 112, 57, 5, 54, 50, 36, 49, 59, 113, 3, 53, 54, 115],
  l: [60, 62, 48, 52, 38, 51, 5, 116, 56, 51, 48],
};
const dec = (a: number[]) => a.map((c, i) => String.fromCodePoint(c ^ (0x5a + (i % 7)))).join('');
const hx = (s: string) =>
  Array.from(sha256(new TextEncoder().encode(s.normalize('NFC'))), (b) => b.toString(16).padStart(2, '0')).join('');

let sealed = false;
let broken = false;
const onBreak: Array<() => void> = [];

export const AUTHOR = () => dec(D.n);
export const AUTHOR_URL = () => dec(D.u);

function visible(el: Element): boolean {
  if (!(el instanceof HTMLElement) || el.getClientRects().length === 0) return false;
  for (let n: HTMLElement | null = el; n; n = n.parentElement) {
    const cs = getComputedStyle(n);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.3) return false;
  }
  return parseFloat(getComputedStyle(el).fontSize) >= 9;
}

/** Devuelve la lista de problemas encontrados (vacía = autoría intacta). */
export function auditAuthorship(opts: { ld: boolean }): string[] {
  const bad: string[] = [];
  const meta = document.querySelector('meta[name="author"]');
  if (!meta || hx(meta.getAttribute('content') ?? '') !== H.n) bad.push('meta');

  const links = Array.from(document.querySelectorAll('footer a.sig'));
  const ok = links.some(
    (a) =>
      hx(a.getAttribute('href') ?? '') === H.u &&
      hx((a.textContent ?? '').trim()) === H.l &&
      visible(a),
  );
  if (!ok) bad.push('link');

  if (opts.ld) {
    const found = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).some((s) => {
      try {
        const all = JSON.stringify(JSON.parse(s.textContent ?? ''));
        return all.includes(dec(D.n)) && all.includes(dec(D.u));
      } catch {
        return false;
      }
    });
    if (!found) bad.push('ld');
  }
  return bad;
}

export function lockdown(): void {
  if (broken) return;
  broken = true;
  sealed = false;
  onBreak.forEach((f) => {
    try {
      f();
    } catch {
      /* nada */
    }
  });
  const name = dec(D.n);
  const url = dec(D.u);
  const label = dec(D.l);
  const box = `position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:24px;background:#050505;color:#f4efe7;font:16px/1.6 system-ui,-apple-system,'Segoe UI',sans-serif;text-align:center`;
  document.body.innerHTML = `<div role="alert" style="${box}"><div style="max-width:640px">
    <div style="width:72px;height:72px;margin:0 auto 24px;border-radius:50%;background:#F7931A;color:#120800;display:grid;place-items:center;font:700 40px system-ui">!</div>
    <h1 style="font:700 clamp(26px,5vw,40px)/1.1 system-ui;margin:0 0 16px;letter-spacing:-.02em">La web no funciona si eliminas la autoría</h1>
    <p style="margin:0 0 14px;color:#bdb6ac">Se ha modificado o eliminado la autoría de esta web. direccionesbitcoin.com fue diseñada y programada por <strong style="color:#F7931A">${name}</strong> (<a href="${url}" style="color:#F7931A">${label}</a>). Restaura el crédito original para que vuelva a funcionar.</p>
    <p style="margin:24px 0 0;color:#8a847b;font-size:14px"><strong>This website does not work if you remove the authorship.</strong> It was designed and built by ${name} (${label}). Restore the original credit to use it.</p>
  </div></div>`;
  document.title = 'La web no funciona si eliminas la autoría';
  console.error(`direccionesbitcoin.com: autoría alterada · ${name} · ${url}`);
}

/** Comprueba y sella. Si falla, bloquea la web. */
export function seal(opts: { ld: boolean }): boolean {
  if (broken) return false;
  if (auditAuthorship(opts).length) {
    lockdown();
    return false;
  }
  sealed = true;
  return true;
}

/** Vigila cambios en caliente (DevTools, extensiones…) y revisa periódicamente. */
export function watchAuthorship(opts: { ld: boolean }): void {
  let t = 0;
  const recheck = () => {
    clearTimeout(t);
    t = window.setTimeout(() => {
      if (!broken && auditAuthorship(opts).length) lockdown();
    }, 400);
  };
  new MutationObserver(recheck).observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true,
    attributeFilter: ['href', 'content', 'style', 'class', 'hidden'],
  });
  window.setInterval(recheck, 5000);
}

export function onAuthorshipBroken(f: () => void): void {
  onBreak.push(f);
}

/** Lo llaman las funciones críticas (generar claves, PDF): sin autoría, no hay servicio. */
export function assertSealed(): void {
  if (typeof document === 'undefined') return; // pruebas en Node
  if (!sealed || broken) {
    lockdown();
    throw new Error('La web no funciona si eliminas la autoría');
  }
}
