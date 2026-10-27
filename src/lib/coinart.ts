/*!
 * direccionesbitcoin.com — Arte procedural de la moneda (3D y PDF)
 * Autor: Félix Loureiro Etcheverría
 */
import { BTC_PATH } from './btcpath';

/* ---------- Texturas procedurales de la moneda ---------- */
export function faceCanvas(kind: 'color' | 'bump', size = 1024): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  g.scale(size / 1024, size / 1024);
  const S = 1024;
  const cx = S / 2;
  const isBump = kind === 'bump';

  if (isBump) {
    g.fillStyle = '#5a5a5a';
    g.fillRect(0, 0, S, S);
  } else {
    const grad = g.createRadialGradient(cx * 0.8, cx * 0.7, 40, cx, cx, cx);
    grad.addColorStop(0, '#ffd08a');
    grad.addColorStop(0.45, '#f7a033');
    grad.addColorStop(1, '#b8600a');
    g.fillStyle = grad;
    g.fillRect(0, 0, S, S);
    // grano cepillado concéntrico
    for (let i = 0; i < 2600; i++) {
      const r = Math.random() * cx;
      const a = Math.random() * Math.PI * 2;
      g.strokeStyle = `rgba(${Math.random() > 0.5 ? '255,240,210' : '90,40,0'},${Math.random() * 0.06})`;
      g.lineWidth = 1;
      g.beginPath();
      g.arc(cx, cx, r, a, a + 0.15 + Math.random() * 0.3);
      g.stroke();
    }
  }

  const ring = (r: number, w: number, col: string) => {
    g.beginPath();
    g.arc(cx, cx, r, 0, Math.PI * 2);
    g.lineWidth = w;
    g.strokeStyle = col;
    g.stroke();
  };
  ring(cx - 18, 22, isBump ? '#ffffff' : 'rgba(255,230,190,.55)');
  ring(cx - 70, 4, isBump ? '#ffffff' : 'rgba(255,240,215,.6)');
  ring(cx - 150, 3, isBump ? '#2a2a2a' : 'rgba(110,50,0,.45)');

  // texto circular
  const text = 'DIRECCIONESBITCOIN.COM  ·  BC1Q  ·  BIP39  ·  21 000 000  ·  ';
  g.font = '600 38px "Space Grotesk Variable", system-ui, sans-serif';
  g.fillStyle = isBump ? '#f0f0f0' : 'rgba(255,240,215,.85)';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const rText = cx - 110;
  const step = (Math.PI * 2) / text.length;
  for (let i = 0; i < text.length; i++) {
    g.save();
    g.translate(cx, cx);
    g.rotate(i * step);
    g.translate(0, -rText);
    g.fillText(text[i], 0, 0);
    g.restore();
  }

  // logotipo ₿ en relieve
  const p = new Path2D(BTC_PATH);
  g.save();
  g.translate(cx, cx);
  const k = 12.5;
  g.scale(k, k);
  g.translate(-32, -32);
  if (isBump) {
    g.fillStyle = '#ffffff';
    g.fill(p);
  } else {
    g.shadowColor = 'rgba(80,30,0,.7)';
    g.shadowBlur = 0.8;
    g.shadowOffsetX = 0.2;
    g.shadowOffsetY = 0.3;
    const lg = g.createLinearGradient(0, 10, 0, 54);
    lg.addColorStop(0, '#fff3dd');
    lg.addColorStop(1, '#ffc46e');
    g.fillStyle = lg;
    g.fill(p);
  }
  g.restore();
  return c;
}

export function edgeCanvas(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 32;
  const g = c.getContext('2d')!;
  for (let x = 0; x < 1024; x += 8) {
    g.fillStyle = '#ffffff';
    g.fillRect(x, 0, 4, 32);
    g.fillStyle = '#202020';
    g.fillRect(x + 4, 0, 4, 32);
  }
  return c;
}

