/*!
 * direccionesbitcoin.com — Núcleo criptográfico
 * Autor: Félix Loureiro Etcheverría
 *
 * Genera carteras Bitcoin SegWit nativas (bc1q…) a partir de una frase
 * BIP39 de 12 o 24 palabras, derivación BIP84 m/84'/0'/0'/0/0.
 * Todo ocurre en el navegador: nada se envía a ningún servidor.
 */
import { entropyToMnemonic, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import { HDKey } from '@scure/bip32';
import { bech32, createBase58check } from '@scure/base';
import { sha256 } from '@noble/hashes/sha2.js';
import { ripemd160 } from '@noble/hashes/legacy.js';

export const DERIVATION_PATH = "m/84'/0'/0'/0/0";
export type Words = 12 | 24;

export interface Wallet {
  address: string;
  mnemonic: string;
  words: string[];
  wif: string;
  publicKey: string;
  path: string;
  createdAt: string;
}

const b58c = createBase58check(sha256);

/** Bolsa de entropía extra del usuario (movimiento de ratón/toque). */
const pool: number[] = [];
export function addUserEntropy(...values: number[]): void {
  for (const v of values) pool.push(v & 0xffff);
  if (pool.length > 4096) pool.splice(0, pool.length - 4096);
}
export function userEntropyBits(): number {
  // estimación prudente: ~2 bits por muestra
  return Math.min(256, Math.floor(pool.length * 2));
}

function getSecureRandom(n: number): Uint8Array {
  const c = globalThis.crypto;
  if (!c || typeof c.getRandomValues !== 'function') {
    throw new Error('CSPRNG no disponible: este navegador no es seguro para generar claves.');
  }
  const out = new Uint8Array(n);
  c.getRandomValues(out);
  return out;
}

/**
 * Entropía final = SHA-256(CSPRNG(32) ‖ pool de usuario ‖ marca de tiempo).
 * El CSPRNG del sistema por sí solo ya es suficiente; la entropía del
 * usuario solo puede sumar, nunca restar.
 */
function makeEntropy(bytes: 16 | 32): Uint8Array {
  const sys = getSecureRandom(32);
  const user = new Uint8Array(new Uint16Array(pool).buffer);
  const t = new TextEncoder().encode(String(performance.now()) + Date.now());
  const buf = new Uint8Array(sys.length + user.length + t.length);
  buf.set(sys, 0);
  buf.set(user, sys.length);
  buf.set(t, sys.length + user.length);
  const h1 = sha256(buf);
  if (bytes === 16) return h1.slice(0, 16);
  // 32 bytes: segundo bloque independiente del CSPRNG
  const h2 = sha256(new Uint8Array([...getSecureRandom(32), ...h1]));
  return h2;
}

export function hash160(data: Uint8Array): Uint8Array {
  return ripemd160(sha256(data));
}

export function p2wpkhAddress(pubkey: Uint8Array): string {
  const prog = hash160(pubkey);
  return bech32.encode('bc', [0, ...bech32.toWords(prog)]);
}

export function toWIF(priv: Uint8Array): string {
  // 0x80 = mainnet, 0x01 = clave pública comprimida
  return b58c.encode(new Uint8Array([0x80, ...priv, 0x01]));
}

const hex = (u: Uint8Array) => Array.from(u, (b) => b.toString(16).padStart(2, '0')).join('');

export function walletFromMnemonic(mnemonic: string): Wallet {
  const m = mnemonic.trim().toLowerCase().split(/\s+/).join(' ');
  if (!validateMnemonic(m, wordlist)) throw new Error('Frase BIP39 no válida');
  const seed = mnemonicToSeedSync(m);
  const node = HDKey.fromMasterSeed(seed).derive(DERIVATION_PATH);
  if (!node.privateKey || !node.publicKey) throw new Error('Derivación fallida');
  const w: Wallet = {
    address: p2wpkhAddress(node.publicKey),
    mnemonic: m,
    words: m.split(' '),
    wif: toWIF(node.privateKey),
    publicKey: hex(node.publicKey),
    path: DERIVATION_PATH,
    createdAt: new Date().toISOString(),
  };
  seed.fill(0);
  node.wipePrivateData();
  return w;
}

export function generateWallet(words: Words = 12): Wallet {
  const ent = makeEntropy(words === 24 ? 32 : 16);
  const mnemonic = entropyToMnemonic(ent, wordlist);
  ent.fill(0);
  return walletFromMnemonic(mnemonic);
}

/** Validación de dirección bc1q (para el comprobador). */
export function isValidBc1q(addr: string): boolean {
  try {
    const { prefix, words } = bech32.decode(addr.toLowerCase() as `${string}1${string}`);
    return prefix === 'bc' && words[0] === 0 && bech32.fromWords(words.slice(1)).length === 20;
  } catch {
    return false;
  }
}
