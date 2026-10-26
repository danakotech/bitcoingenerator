/*!
 * direccionesbitcoin.com — Cartera de papel en PDF (A4, tarjeta plegable)
 * Autor: Félix Loureiro Etcheverría
 */
import type { jsPDF as JsPDF } from 'jspdf';
import QRCode from 'qrcode';
import type { Wallet } from './wallet';
import type { Dict } from '../i18n';
import { faceCanvas } from './coinart';
import { BTC_PATH } from './btcpath';
import { assertSealed, AUTHOR } from './sig';

type RGB = [number, number, number];
const ORANGE: RGB = [247, 147, 26];
const INK: RGB = [14, 14, 14];
const GREY: RGB = [120, 120, 120];
const SOFT: RGB = [255, 244, 230];
const LINE: RGB = [232, 225, 214];
const RED: RGB = [200, 60, 30];

let coinPng: string | null = null;
let markPng: string | null = null;

function coinImage(): string {
  if (coinPng) return coinPng;
  const S = 600;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  g.fillStyle = '#6b3505';
  g.beginPath();
  g.arc(S / 2 + 6, S / 2 + 10, S / 2 - 14, 0, Math.PI * 2);
  g.fill();
  g.save();
  g.beginPath();
  g.arc(S / 2, S / 2, S / 2 - 14, 0, Math.PI * 2);
  g.clip();
  g.drawImage(faceCanvas('color', 1024), 0, 0, S, S);
  const sh = g.createLinearGradient(0, 0, S, S);
  sh.addColorStop(0, 'rgba(255,255,255,.35)');
  sh.addColorStop(0.35, 'rgba(255,255,255,0)');
  sh.addColorStop(0.7, 'rgba(0,0,0,0)');
  sh.addColorStop(1, 'rgba(60,20,0,.35)');
  g.fillStyle = sh;
  g.fillRect(0, 0, S, S);
  g.restore();
  coinPng = c.toDataURL('image/png');
  return coinPng;
}

function markImage(): string {
  if (markPng) return markPng;
  const S = 256;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  g.fillStyle = '#F7931A';
  g.beginPath();
  g.arc(S / 2, S / 2, S / 2 - 2, 0, Math.PI * 2);
  g.fill();
  g.translate(S / 2, S / 2);
  g.rotate((14 * Math.PI) / 180);
  g.scale(S / 64, S / 64);
  g.translate(-32, -32);
  g.fillStyle = '#fff';
  g.fill(new Path2D(BTC_PATH));
  markPng = c.toDataURL('image/png');
  return markPng;
}

/** QR vectorial: un rectángulo por cada tramo horizontal de módulos oscuros. */
function drawQR(doc: JsPDF, text: string, x: number, y: number, size: number, color: RGB = INK) {
  const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
  const n = qr.modules.size;
  const d = qr.modules.data;
  const m = size / n;
  doc.setFillColor(...color);
  for (let r = 0; r < n; r++) {
    let c = 0;
    while (c < n) {
      if (d[r * n + c]) {
        let e = c;
        while (e + 1 < n && d[r * n + e + 1]) e++;
        doc.rect(x + c * m, y + r * m, (e - c + 1) * m + 0.02, m + 0.02, 'F');
        c = e + 1;
      } else c++;
    }
  }
}

const chunk = (s: string, n: number) => s.match(new RegExp(`.{1,${n}}`, 'g')) ?? [s];

function dashedLine(doc: JsPDF, x1: number, y1: number, x2: number, y2: number, color: RGB, dash = [1.6, 1.4]) {
  doc.setDrawColor(...color);
  doc.setLineDashPattern(dash, 0);
  doc.line(x1, y1, x2, y2);
  doc.setLineDashPattern([], 0);
}

/** Texto con espaciado entre letras; centra a mano porque jsPDF no lo hace con charSpace. */
function spaced(doc: JsPDF, text: string, x: number, y: number, spacing: number, align: 'left' | 'center' = 'left') {
  doc.setCharSpace(spacing);
  let xx = x;
  if (align === 'center') xx = x - (doc.getTextWidth(text) + spacing * (text.length - 1)) / 2;
  doc.text(text, xx, y);
  doc.setCharSpace(0);
}

function drawPage(doc: JsPDF, w: Wallet, t: Dict['pdf'], lang: string, page: number, total: number) {
  const W = 210;
  const date = new Date(w.createdAt).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  /* Cabecera */
  doc.setFillColor(...INK);
  doc.rect(0, 0, W, 30, 'F');
  doc.setFillColor(...ORANGE);
  doc.rect(0, 30, W, 1.2, 'F');
  doc.addImage(markImage(), 'PNG', 15, 8, 14, 14);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('direcciones', 33, 15.2);
  const wDir = doc.getTextWidth('direcciones');
  doc.setTextColor(...ORANGE);
  doc.text('bitcoin', 33 + wDir, 15.2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(200, 200, 200);
  spaced(doc, t.title.toUpperCase(), 33, 21.5, 0.6);
  doc.setFontSize(8);
  doc.setTextColor(170, 170, 170);
  doc.text(`${t.created}: ${date}`, W - 15, 13.5, { align: 'right' });
  doc.setTextColor(...ORANGE);
  doc.text(`SegWit bc1q · BIP84 · ${w.words.length} ${lang === 'es' ? 'palabras' : 'words'}`, W - 15, 19.5, { align: 'right' });

  /* Aviso importes pequeños */
  const ay = 37;
  doc.setFillColor(...SOFT);
  doc.setDrawColor(...ORANGE);
  doc.setLineWidth(0.35);
  doc.roundedRect(15, ay, 180, 15, 2.5, 2.5, 'FD');
  doc.setFillColor(...ORANGE);
  doc.triangle(21, ay + 11, 25.5, ay + 3.4, 30, ay + 11, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('!', 25.5, ay + 10.2, { align: 'center' });
  doc.setTextColor(...INK);
  doc.setFontSize(9);
  doc.text(t.warnTitle, 34, ay + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(70, 70, 70);
  doc.text(doc.splitTextToSize(t.warn, 155), 34, ay + 10.2);

  /* Tarjeta */
  const cx = 15;
  const cw = 180;
  const top = 62;
  const ph = 80;
  const fold = top + ph;
  const bottom = fold + ph;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...GREY);
  doc.text(t.cut, cx + 8, top - 2.5);
  if (total > 1) doc.text(`#${page}`, cx + cw - 8, top - 2.5, { align: 'right' });

  /* --- Cara pública --- */
  doc.setFillColor(...INK);
  doc.rect(cx, top, 54, ph, 'F');
  doc.addImage(coinImage(), 'PNG', cx + 9, top + 9, 36, 36);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  spaced(doc, 'BITCOIN', cx + 27, top + 56, 1.6, 'center');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...ORANGE);
  doc.text('SegWit · bc1q', cx + 27, top + 61.5, { align: 'center' });
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(6);
  doc.text('direccionesbitcoin.com', cx + 27, top + ph - 6, { align: 'center' });

  const px = cx + 62;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...ORANGE);
  spaced(doc, t.public, px, top + 10, 0.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...GREY);
  doc.text(t.address, px, top + 20);
  doc.setFont('courier', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(...INK);
  const groups = chunk(w.address, 4);
  const lines: string[] = [];
  for (let i = 0; i < groups.length; i += 4) lines.push(groups.slice(i, i + 4).join(' '));
  lines.forEach((l, i) => doc.text(l, px, top + 28 + i * 6.2));
  const pillY = top + 28 + lines.length * 6.2 + 1;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.4);
  const pw = doc.getTextWidth(t.sendHere) + 8;
  doc.setFillColor(...ORANGE);
  doc.roundedRect(px, pillY, pw, 6.4, 3.2, 3.2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text(t.sendHere, px + 4, pillY + 4.35);

  const qs = 46;
  const qx = cx + cw - qs - 8;
  const qy = top + 12;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.roundedRect(qx - 3, qy - 3, qs + 6, qs + 6, 2.5, 2.5, 'S');
  drawQR(doc, `bitcoin:${w.address}`, qx, qy, qs);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...GREY);
  doc.text(t.scanPub, qx + qs / 2, qy + qs + 8, { align: 'center' });

  /* --- Cara secreta: trama de seguridad --- */
  const sy = fold;
  doc.setDrawColor(251, 232, 208);
  doc.setLineWidth(0.18);
  for (let k = -ph; k < cw; k += 2.4) {
    const x1 = cx + Math.max(0, k);
    const y1 = sy + Math.max(0, -k);
    const len = Math.min(cw - Math.max(0, k), ph - Math.max(0, -k));
    if (len > 0) doc.line(x1, y1, x1 + len, y1 + len);
  }

  /* --- Línea de doblez --- */
  dashedLine(doc, cx, fold, cx + cw, fold, ORANGE, [2.2, 1.4]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  const fw = doc.getTextWidth(t.fold) + 6;
  doc.setFillColor(255, 255, 255);
  doc.rect(cx + cw / 2 - fw / 2, fold - 2, fw, 4, 'F');
  doc.setTextColor(...ORANGE);
  doc.text(t.fold, cx + cw / 2, fold + 0.9, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...RED);
  spaced(doc, t.secret, cx + 8, sy + 9, 0.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GREY);
  doc.text(`${t.seed} · ${w.words.length}`, cx + 8, sy + 14.5);

  const cols = w.words.length === 24 ? 4 : 3;
  const rows = w.words.length / cols;
  const gx = cx + 8;
  const gy = sy + 18;
  const gw = 118;
  const cellW = gw / cols;
  const gap = 1.2;
  const cellH = Math.min(8, (38 - gap * (rows - 1)) / rows);
  w.words.forEach((word, i) => {
    const c = Math.floor(i / rows);
    const r = i % rows;
    const x = gx + c * cellW;
    const y = gy + r * (cellH + gap);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.25);
    doc.roundedRect(x, y, cellW - 2, cellH, 1.4, 1.4, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(...ORANGE);
    doc.text(String(i + 1).padStart(2, '0'), x + 2.2, y + cellH / 2 + 1.05);
    doc.setFontSize(w.words.length === 24 ? 8.2 : 9.6);
    doc.setTextColor(...INK);
    doc.text(word, x + 7.6, y + cellH / 2 + 1.3);
  });

  const wy = gy + rows * (cellH + gap) + 3.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...GREY);
  doc.text(t.wif, gx, wy);
  doc.setFont('courier', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(...INK);
  doc.text(w.wif, gx, wy + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...GREY);
  doc.text(`${t.path}: ${w.path}`, gx, wy + 8.2);

  const ks = 36;
  const kx = cx + cw - ks - 13;
  const ky = sy + 14;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...RED);
  doc.setLineWidth(0.35);
  doc.roundedRect(kx - 3, ky - 3, ks + 6, ks + 6, 2.5, 2.5, 'FD');
  drawQR(doc, w.wif, kx, ky, ks, [40, 20, 10]);
  doc.setFontSize(6.5);
  doc.setTextColor(...RED);
  doc.setFont('helvetica', 'bold');
  doc.text(t.scanPriv.toUpperCase(), kx + ks / 2, ky + ks + 7, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  let nx = cx + 8;
  const ny = sy + ph - 6;
  for (const n of t.never) {
    const nw = doc.getTextWidth(n) + 9;
    doc.setFillColor(...INK);
    doc.roundedRect(nx, ny - 3.6, nw, 5.4, 2.7, 2.7, 'F');
    doc.setDrawColor(...ORANGE);
    doc.setLineWidth(0.4);
    doc.circle(nx + 3, ny - 0.9, 1.15, 'S');
    doc.line(nx + 2.2, ny - 0.1, nx + 3.8, ny - 1.7);
    doc.setTextColor(255, 255, 255);
    doc.text(n, nx + 5.6, ny + 0.2);
    nx += nw + 2.5;
  }

  // contorno de corte y marcas de esquina
  doc.setLineWidth(0.3);
  dashedLine(doc, cx, top, cx + cw, top, GREY);
  dashedLine(doc, cx, bottom, cx + cw, bottom, GREY);
  dashedLine(doc, cx, top, cx, bottom, GREY);
  dashedLine(doc, cx + cw, top, cx + cw, bottom, GREY);
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.25);
  for (const [x, y] of [
    [cx, top],
    [cx + cw, top],
    [cx, bottom],
    [cx + cw, bottom],
  ] as const) {
    const dx = x === cx ? -1 : 1;
    const dy = y === top ? -1 : 1;
    doc.line(x + dx * 2, y, x + dx * 6, y);
    doc.line(x, y + dy * 2, x, y + dy * 6);
  }

  /* Pasos */
  const sy2 = bottom + 12;
  const colW = 180 / 3;
  t.steps.forEach(([h, p], i) => {
    const x = 15 + i * colW;
    doc.setFillColor(...ORANGE);
    doc.circle(x + 3.5, sy2 + 0.5, 3.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(String(i + 1), x + 3.5, sy2 + 1.9, { align: 'center' });
    doc.setTextColor(...INK);
    doc.setFontSize(9);
    doc.text(h.replace(/^\d\s+/, ''), x + 9.5, sy2 + 1.9);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.6);
    doc.setTextColor(80, 80, 80);
    doc.text(doc.splitTextToSize(p, colW - 6), x, sy2 + 9);
  });

  /* Anotaciones */
  const ny2 = sy2 + 30;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.roundedRect(15, ny2, 180, 24, 2.5, 2.5, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...ORANGE);
  spaced(doc, t.note.toUpperCase(), 20, ny2 + 6.5, 0.5);
  const fw3 = 170 / 3;
  t.noteFields.forEach((f, i) => {
    const x = 20 + i * fw3;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...GREY);
    doc.text(f, x, ny2 + 13);
    doc.setDrawColor(200, 195, 188);
    doc.line(x, ny2 + 19.5, x + fw3 - 8, ny2 + 19.5);
  });

  /* Pie */
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.line(15, 284, 195, 284);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...GREY);
  doc.text('www.direccionesbitcoin.com', 15, 289);
  doc.text(`${t.page} ${page} ${t.of} ${total}`, 195, 289, { align: 'right' });
}

export async function buildPdf(wallets: Wallet[], t: Dict['pdf'], lang: string): Promise<Blob> {
  assertSealed();
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  doc.setProperties({
    title: `${t.title} · ${wallets.length === 1 ? wallets[0].address : wallets.length}`,
    subject: t.title,
    author: AUTHOR(),
    creator: `direccionesbitcoin.com · ${AUTHOR()}`,
    keywords: 'bitcoin, paper wallet, bc1q, bip39, bip84',
  });
  wallets.forEach((w, i) => {
    if (i > 0) doc.addPage();
    drawPage(doc, w, t, lang, i + 1, wallets.length);
  });
  return doc.output('blob');
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
