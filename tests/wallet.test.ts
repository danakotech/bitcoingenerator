import { describe, it, expect } from 'vitest';
import { walletFromMnemonic, generateWallet, isValidBc1q, toWIF } from '../src/lib/wallet';

describe('BIP84 vectores oficiales', () => {
  it('abandon…about → bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu', () => {
    const w = walletFromMnemonic('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
    expect(w.address).toBe('bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu');
    expect(w.wif).toBe('KyZpNDKnfs94vbrwhJneDi77V6jF64PWPF8x5cdJb8ifgg2DUc9d');
    expect(w.publicKey).toBe('0330d54fd0dd420a6e5f8d3624f5f3482cae350f79d5f0753bf5beef9c2d91af3c');
  });
});

describe('generación', () => {
  it('12 y 24 palabras, direcciones válidas y únicas', () => {
    const a = generateWallet(12), b = generateWallet(24);
    expect(a.words).toHaveLength(12);
    expect(b.words).toHaveLength(24);
    expect(isValidBc1q(a.address)).toBe(true);
    expect(a.address).not.toBe(b.address);
    expect(walletFromMnemonic(b.mnemonic).address).toBe(b.address);
  });
  it('WIF comprimido empieza por K o L', () => {
    expect(toWIF(new Uint8Array(32).fill(1))[0]).toMatch(/[KL]/);
  });
});
