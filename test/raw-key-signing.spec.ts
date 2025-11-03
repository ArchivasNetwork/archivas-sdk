/**
 * Raw Key Signing Tests
 */

import { describe, it, expect } from 'vitest';
import { Tx } from '../src/wallet/tx';
import { Derivation } from '../src/wallet/derivation';
import { verifySync } from '../src/crypto/ed25519';
import { bytesToHex, hexToBytes } from '../src/crypto/hash';
import type { TxBody } from '../src/types';

describe('Raw Key Signing', () => {
  const TEST_MNEMONIC = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

  describe('signWithRawKey', () => {
    it('should sign with 64-byte secret key', () => {
      const keyPair = Derivation.fromMnemonic(TEST_MNEMONIC);

      const tx: TxBody = {
        type: 'transfer',
        from: 'arcv1test000000000000000000000000000000000000' as any,
        to: 'arcv1test111111111111111111111111111111111111' as any,
        amount: '1000',
        fee: '100',
        nonce: '0'
      };

      const { sigHex, pubHex, hashHex } = Tx.signWithRawKey(tx, keyPair.secretKey);

      expect(sigHex).toHaveLength(128);  // 64 bytes as hex
      expect(pubHex).toHaveLength(64);   // 32 bytes as hex
      expect(hashHex).toHaveLength(64);  // 32 bytes as hex

      // Verify the signature
      const signature = hexToBytes(sigHex);
      const publicKey = hexToBytes(pubHex);
      const hash = hexToBytes(hashHex);
      
      const isValid = verifySync(signature, hash, publicKey);
      expect(isValid).toBe(true);
    });

    it('should sign with 32-byte seed (private key only)', () => {
      const keyPair = Derivation.fromMnemonic(TEST_MNEMONIC);
      const seed = keyPair.secretKey.slice(0, 32);  // Extract 32-byte seed

      const tx: TxBody = {
        type: 'transfer',
        from: 'arcv1test000000000000000000000000000000000000' as any,
        to: 'arcv1test111111111111111111111111111111111111' as any,
        amount: '1000',
        fee: '100',
        nonce: '0'
      };

      const { sigHex, pubHex, hashHex } = Tx.signWithRawKey(tx, seed);

      expect(sigHex).toHaveLength(128);
      expect(pubHex).toHaveLength(64);
      expect(hashHex).toHaveLength(64);

      // Public key should match the one derived from full keypair
      expect(pubHex).toBe(bytesToHex(keyPair.publicKey));

      // Verify the signature
      const signature = hexToBytes(sigHex);
      const publicKey = hexToBytes(pubHex);
      const hash = hexToBytes(hashHex);
      
      const isValid = verifySync(signature, hash, publicKey);
      expect(isValid).toBe(true);
    });

    it('should produce same signature as Tx.sign with 64-byte key', () => {
      const keyPair = Derivation.fromMnemonic(TEST_MNEMONIC);

      const tx: TxBody = {
        type: 'transfer',
        from: 'arcv1test000000000000000000000000000000000000' as any,
        to: 'arcv1test111111111111111111111111111111111111' as any,
        amount: '1000',
        fee: '100',
        nonce: '0'
      };

      const result1 = Tx.sign(tx, keyPair.secretKey);
      const result2 = Tx.signWithRawKey(tx, keyPair.secretKey);

      expect(result1).toEqual(result2);
    });

    it('should reject invalid key lengths', () => {
      const tx: TxBody = {
        type: 'transfer',
        from: 'arcv1test000000000000000000000000000000000000' as any,
        to: 'arcv1test111111111111111111111111111111111111' as any,
        amount: '1000',
        fee: '100',
        nonce: '0'
      };

      const invalidKey = new Uint8Array(16);  // Wrong length

      expect(() => Tx.signWithRawKey(tx, invalidKey)).toThrow('Private key must be 32 bytes (seed) or 64 bytes (seed || pubkey)');
    });
  });

  describe('createSignedFromRawKey', () => {
    it('should create complete signed transaction with 64-byte key', () => {
      const keyPair = Derivation.fromMnemonic(TEST_MNEMONIC);

      const tx: TxBody = {
        type: 'transfer',
        from: 'arcv1test000000000000000000000000000000000000' as any,
        to: 'arcv1test111111111111111111111111111111111111' as any,
        amount: '1000',
        fee: '100',
        nonce: '0'
      };

      const signed = Tx.createSignedFromRawKey(tx, keyPair.secretKey);

      expect(signed.tx).toEqual(tx);
      expect(signed.pubkey).toBeTruthy();
      expect(signed.sig).toBeTruthy();
      expect(signed.hash).toBeTruthy();
      expect(signed.pubkey).toHaveLength(64);
      expect(signed.sig).toHaveLength(128);
      expect(signed.hash).toHaveLength(64);
    });

    it('should create complete signed transaction with 32-byte seed', () => {
      const keyPair = Derivation.fromMnemonic(TEST_MNEMONIC);
      const seed = keyPair.secretKey.slice(0, 32);

      const tx: TxBody = {
        type: 'transfer',
        from: 'arcv1test000000000000000000000000000000000000' as any,
        to: 'arcv1test111111111111111111111111111111111111' as any,
        amount: '1000',
        fee: '100',
        nonce: '0'
      };

      const signed = Tx.createSignedFromRawKey(tx, seed);

      expect(signed.tx).toEqual(tx);
      expect(signed.pubkey).toBe(bytesToHex(keyPair.publicKey));
      expect(signed.sig).toHaveLength(128);
      expect(signed.hash).toHaveLength(64);
    });
  });

  describe('signWithHexKey', () => {
    it('should sign with hex-encoded 64-byte key', () => {
      const keyPair = Derivation.fromMnemonic(TEST_MNEMONIC);
      const hexKey = bytesToHex(keyPair.secretKey);

      const tx: TxBody = {
        type: 'transfer',
        from: 'arcv1test000000000000000000000000000000000000' as any,
        to: 'arcv1test111111111111111111111111111111111111' as any,
        amount: '1000',
        fee: '100',
        nonce: '0'
      };

      const { sigHex, pubHex, hashHex } = Tx.signWithHexKey(tx, hexKey);

      expect(sigHex).toHaveLength(128);
      expect(pubHex).toHaveLength(64);
      expect(hashHex).toHaveLength(64);

      // Should produce same result as binary key
      const binaryResult = Tx.signWithRawKey(tx, keyPair.secretKey);
      expect(sigHex).toBe(binaryResult.sigHex);
      expect(pubHex).toBe(binaryResult.pubHex);
      expect(hashHex).toBe(binaryResult.hashHex);
    });

    it('should sign with hex-encoded 32-byte seed', () => {
      const keyPair = Derivation.fromMnemonic(TEST_MNEMONIC);
      const seed = keyPair.secretKey.slice(0, 32);
      const hexSeed = bytesToHex(seed);

      const tx: TxBody = {
        type: 'transfer',
        from: 'arcv1test000000000000000000000000000000000000' as any,
        to: 'arcv1test111111111111111111111111111111111111' as any,
        amount: '1000',
        fee: '100',
        nonce: '0'
      };

      const { sigHex, pubHex } = Tx.signWithHexKey(tx, hexSeed);

      expect(sigHex).toHaveLength(128);
      expect(pubHex).toBe(bytesToHex(keyPair.publicKey));
    });
  });

  describe('createSignedFromHexKey', () => {
    it('should create signed transaction from hex key', () => {
      const keyPair = Derivation.fromMnemonic(TEST_MNEMONIC);
      const hexKey = bytesToHex(keyPair.secretKey);

      const tx: TxBody = {
        type: 'transfer',
        from: 'arcv1test000000000000000000000000000000000000' as any,
        to: 'arcv1test111111111111111111111111111111111111' as any,
        amount: '1000',
        fee: '100',
        nonce: '0'
      };

      const signed = Tx.createSignedFromHexKey(tx, hexKey);

      expect(signed.tx).toEqual(tx);
      expect(signed.pubkey).toHaveLength(64);
      expect(signed.sig).toHaveLength(128);
      expect(signed.hash).toHaveLength(64);

      // Should match binary key result
      const binaryResult = Tx.createSignedFromRawKey(tx, keyPair.secretKey);
      expect(signed).toEqual(binaryResult);
    });
  });

  describe('No mnemonic required', () => {
    it('should work with arbitrary raw keys without mnemonic derivation', () => {
      // Generate a random 32-byte seed (not from mnemonic)
      const randomSeed = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        randomSeed[i] = Math.floor(Math.random() * 256);
      }

      const tx: TxBody = {
        type: 'transfer',
        from: 'arcv1test000000000000000000000000000000000000' as any,
        to: 'arcv1test111111111111111111111111111111111111' as any,
        amount: '1000',
        fee: '100',
        nonce: '0'
      };

      // Should work without any mnemonic derivation
      const { sigHex, pubHex, hashHex } = Tx.signWithRawKey(tx, randomSeed);

      expect(sigHex).toHaveLength(128);
      expect(pubHex).toHaveLength(64);
      expect(hashHex).toHaveLength(64);

      // Verify the signature is valid
      const signature = hexToBytes(sigHex);
      const publicKey = hexToBytes(pubHex);
      const hash = hexToBytes(hashHex);
      
      const isValid = verifySync(signature, hash, publicKey);
      expect(isValid).toBe(true);
    });
  });
});

