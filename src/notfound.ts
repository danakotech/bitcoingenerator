/*!
 * direccionesbitcoin.com — Página 404
 * Diseño y código: Félix Loureiro Etcheverría — https://www.felixle.com
 */
import './styles/fonts.css';
import './styles/main.css';
import { seal, watchAuthorship } from './lib/sig';

async function start() {
  if (!seal({ ld: true })) return;
  watchAuthorship({ ld: true });
  try {
    await document.fonts.load('600 38px "Space Grotesk Variable"');
  } catch {
    /* fuente opcional */
  }
  try {
    const { createScene } = await import('./scene');
    const scene = createScene(document.querySelector<HTMLCanvasElement>('#scene')!);
    if (!scene) document.documentElement.classList.add('no-webgl');
    else {
      scene.setAnchorsRoot(document);
      setTimeout(() => scene.celebrate(), 600);
      addEventListener('pointermove', () => scene.energize(0.02), { passive: true });
    }
  } catch {
    document.documentElement.classList.add('no-webgl');
  }
}

void start();
