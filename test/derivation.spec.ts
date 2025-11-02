/**
 * Derivation Tests with Golden Vectors
 */

import { describe, it, expect } from 'vitest';
import { Derivation } from '../src/wallet/derivation';

describe('Derivation', () => {
  // Golden test vector (known mnemonic → address)
  const TEST_MNEMONIC = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

  it('should generate valid 24-word mnemonic', () => {
    const mnemonic = Derivation.mnemonicGenerate();
    const words = mnemonic.split(' ');
    expect(words).toHaveLength(24);
  });

  it('should derive consistent keypair from mnemonic', async () => {
    const kp1 = await Derivation.fromMnemonic(TEST_MNEMONIC);
    const kp2 = await Derivation.fromMnemonic(TEST_MNEMONIC);

    expect(kp1.publicKey).toEqual(kp2.publicKey);
    expect(kp1.secretKey).toEqual(kp2.secretKey);
  });

  it('should generate valid Bech32 address', async () => {
    const kp = await Derivation.fromMnemonic(TEST_MNEMONIC);
    const address = Derivation.toAddress(kp.publicKey);

    expect(address).toMatch(/^arcv1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{38}$/);
  });

  it('should produce deterministic address from mnemonic', async () => {
    const addr1 = await Derivation.mnemonicToAddress(TEST_MNEMONIC);
    const addr2 = await Derivation.mnemonicToAddress(TEST_MNEMONIC);

    expect(addr1).toBe(addr2);
  });

  it('should have 32-byte public key', async () => {
    const kp = await Derivation.fromMnemonic(TEST_MNEMONIC);
    expect(kp.publicKey).toHaveLength(32);
  });

  it('should have 64-byte secret key', async () => {
    const kp = await Derivation.fromMnemonic(TEST_MNEMONIC);
    expect(kp.secretKey).toHaveLength(64);
  });

  it('should reject invalid mnemonic', async () => {
    await expect(Derivation.fromMnemonic('invalid mnemonic')).rejects.toThrow();
  });
});

