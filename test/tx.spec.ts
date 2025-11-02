/**
 * Transaction Tests
 */

import { describe, it, expect } from 'vitest';
import { Tx } from '../src/wallet/tx';
import { Derivation } from '../src/wallet/derivation';
import type { TxBody } from '../src/types';

describe('Tx', () => {
  const TEST_MNEMONIC = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

  it('should build valid transfer transaction', () => {
    const tx = Tx.buildTransfer({
      from: 'arcv1test000000000000000000000000000000000000' as any,
      to: 'arcv1test111111111111111111111111111111111111' as any,
      amount: '1000000000',
      fee: '100000',
      nonce: '0'
    });

    expect(tx.type).toBe('transfer');
    expect(tx.amount).toBe('1000000000');
    expect(tx.fee).toBe('100000');
    expect(tx.nonce).toBe('0');
  });

  it('should include optional memo', () => {
    const tx = Tx.buildTransfer({
      from: 'arcv1test000000000000000000000000000000000000' as any,
      to: 'arcv1test111111111111111111111111111111111111' as any,
      amount: '1000000000',
      fee: '100000',
      nonce: '0',
      memo: 'Test memo'
    });

    expect(tx.memo).toBe('Test memo');
  });

  it('should reject memo longer than 256 bytes', () => {
    const longMemo = 'a'.repeat(257);

    expect(() => Tx.buildTransfer({
      from: 'arcv1test000000000000000000000000000000000000' as any,
      to: 'arcv1test111111111111111111111111111111111111' as any,
      amount: '1000',
      fee: '100',
      nonce: '0',
      memo: longMemo
    })).toThrow();
  });

  it('should produce deterministic canonical bytes', () => {
    const tx: TxBody = {
      type: 'transfer',
      from: 'arcv1test000000000000000000000000000000000000' as any,
      to: 'arcv1test111111111111111111111111111111111111' as any,
      amount: '1000',
      fee: '100',
      nonce: '0'
    };

    const bytes1 = Tx.canonicalBytes(tx);
    const bytes2 = Tx.canonicalBytes(tx);

    expect(bytes1).toEqual(bytes2);
  });

  it('should produce deterministic hash', () => {
    const tx: TxBody = {
      type: 'transfer',
      from: 'arcv1test000000000000000000000000000000000000' as any,
      to: 'arcv1test111111111111111111111111111111111111' as any,
      amount: '1000',
      fee: '100',
      nonce: '0'
    };

    const hash1 = Tx.hash(tx);
    const hash2 = Tx.hash(tx);

    expect(hash1).toEqual(hash2);
    expect(hash1).toHaveLength(32);
  });

  it('should sign transaction correctly', async () => {
    const kp = await Derivation.fromMnemonic(TEST_MNEMONIC);

    const tx: TxBody = {
      type: 'transfer',
      from: 'arcv1test000000000000000000000000000000000000' as any,
      to: 'arcv1test111111111111111111111111111111111111' as any,
      amount: '1000',
      fee: '100',
      nonce: '0'
    };

    const { sigHex, pubHex, hashHex } = await Tx.sign(tx, kp.secretKey);

    expect(sigHex).toHaveLength(128);  // 64 bytes as hex
    expect(pubHex).toHaveLength(64);   // 32 bytes as hex
    expect(hashHex).toHaveLength(64);  // 32 bytes as hex
  });

  it('should create complete signed transaction', async () => {
    const kp = await Derivation.fromMnemonic(TEST_MNEMONIC);

    const tx: TxBody = {
      type: 'transfer',
      from: 'arcv1test000000000000000000000000000000000000' as any,
      to: 'arcv1test111111111111111111111111111111111111' as any,
      amount: '1000',
      fee: '100',
      nonce: '0'
    };

    const signed = await Tx.createSigned(tx, kp.secretKey);

    expect(signed.tx).toEqual(tx);
    expect(signed.pubkey).toBeTruthy();
    expect(signed.sig).toBeTruthy();
    expect(signed.hash).toBeTruthy();
  });

  it('should estimate transaction size', () => {
    const tx: TxBody = {
      type: 'transfer',
      from: 'arcv1test000000000000000000000000000000000000' as any,
      to: 'arcv1test111111111111111111111111111111111111' as any,
      amount: '1000',
      fee: '100',
      nonce: '0'
    };

    const size = Tx.estimateSize(tx);
    expect(size).toBeGreaterThan(0);
    expect(size).toBeLessThan(500);  // Reasonable upper bound
  });
});

