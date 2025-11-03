/**
 * Transaction Building, Signing, and Serialization
 */

import { canonicalJSON, estimateTxSize } from '../crypto/canonical';
import { hashTx, bytesToHex, hexToBytes } from '../crypto/hash';
import { signSync as ed25519SignSync, getPublicKeySync } from '../crypto/ed25519';
import type { TxBody, SignedTx, Address } from '../types';
import { ARCHIVAS_CONSTANTS } from '../types';

export class Tx {
  /**
   * Build a transfer transaction
   * @param params - Transfer parameters
   * @returns Transaction body
   */
  static buildTransfer(params: {
    from: Address;
    to: Address;
    amount: string;
    fee: string;
    nonce: string;
    memo?: string;
  }): TxBody {
    // Validate memo length
    if (params.memo && new TextEncoder().encode(params.memo).length > ARCHIVAS_CONSTANTS.MAX_MEMO_LENGTH) {
      throw new Error(`Memo exceeds maximum length of ${ARCHIVAS_CONSTANTS.MAX_MEMO_LENGTH} bytes`);
    }

    const tx: TxBody = {
      type: 'transfer',
      from: params.from,
      to: params.to,
      amount: params.amount,
      fee: params.fee,
      nonce: params.nonce
    };

    if (params.memo) {
      tx.memo = params.memo;
    }

    return tx;
  }

  /**
   * Get canonical bytes of a transaction
   * @param tx - Transaction body
   * @returns Canonical JSON bytes
   */
  static canonicalBytes(tx: TxBody): Uint8Array {
    return canonicalJSON(tx);
  }

  /**
   * Hash a transaction
   * @param tx - Transaction body
   * @returns 32-byte transaction hash
   */
  static hash(tx: TxBody): Uint8Array {
    const canonicalBytes = Tx.canonicalBytes(tx);
    return hashTx(canonicalBytes);
  }

  /**
   * Sign a transaction (synchronous)
   * @param tx - Transaction body
   * @param secretKey - 64-byte Ed25519 secret key
   * @returns Signature, public key, and hash (all as hex strings)
   */
  static sign(tx: TxBody, secretKey: Uint8Array): {
    sigHex: string;
    pubHex: string;
    hashHex: string;
  } {
    if (secretKey.length !== 64) {
      throw new Error('Secret key must be 64 bytes');
    }

    // Hash the transaction
    const txHash = Tx.hash(tx);

    // Sign the hash (synchronous)
    const signature = ed25519SignSync(txHash, secretKey);

    // Extract public key from secret key
    const publicKey = secretKey.slice(32, 64);

    return {
      sigHex: bytesToHex(signature),
      pubHex: bytesToHex(publicKey),
      hashHex: bytesToHex(txHash)
    };
  }

  /**
   * Sign a transaction (async wrapper for backward compatibility)
   * @deprecated Use synchronous sign() instead
   */
  static async signAsync(tx: TxBody, secretKey: Uint8Array): Promise<{
    sigHex: string;
    pubHex: string;
    hashHex: string;
  }> {
    return Tx.sign(tx, secretKey);
  }

  /**
   * Create a signed transaction ready for broadcast (synchronous)
   * @param tx - Transaction body
   * @param secretKey - 64-byte Ed25519 secret key
   * @returns Signed transaction object
   */
  static createSigned(tx: TxBody, secretKey: Uint8Array): SignedTx {
    const { sigHex, pubHex, hashHex } = Tx.sign(tx, secretKey);

    return {
      tx,
      pubkey: pubHex,
      sig: sigHex,
      hash: hashHex
    };
  }

  /**
   * Create a signed transaction (async wrapper for backward compatibility)
   * @deprecated Use synchronous createSigned() instead
   */
  static async createSignedAsync(tx: TxBody, secretKey: Uint8Array): Promise<SignedTx> {
    return Tx.createSigned(tx, secretKey);
  }

  /**
   * Estimate transaction size
   * @param tx - Transaction body
   * @returns Size in bytes
   */
  static estimateSize(tx: TxBody): number {
    return estimateTxSize(tx);
  }

  // Raw key signing helpers (no mnemonic derivation required)

  /**
   * Sign transaction with raw private key (synchronous)
   * Accepts either 32-byte seed or 64-byte secret key (seed || pubkey)
   * 
   * @param tx - Transaction body
   * @param privateKey - 32-byte or 64-byte Ed25519 private key
   * @returns Signature, public key, and hash (all as hex strings)
   */
  static signWithRawKey(tx: TxBody, privateKey: Uint8Array): {
    sigHex: string;
    pubHex: string;
    hashHex: string;
  } {
    let secretKey: Uint8Array;
    let publicKey: Uint8Array;

    if (privateKey.length === 32) {
      // 32-byte seed - derive public key and create 64-byte format
      publicKey = getPublicKeySync(privateKey);
      secretKey = new Uint8Array(64);
      secretKey.set(privateKey, 0);
      secretKey.set(publicKey, 32);
    } else if (privateKey.length === 64) {
      // 64-byte format (seed || pubkey)
      secretKey = privateKey;
      publicKey = privateKey.slice(32, 64);
    } else {
      throw new Error('Private key must be 32 bytes (seed) or 64 bytes (seed || pubkey)');
    }

    // Hash the transaction
    const txHash = Tx.hash(tx);

    // Sign the hash
    const signature = ed25519SignSync(txHash, secretKey);

    return {
      sigHex: bytesToHex(signature),
      pubHex: bytesToHex(publicKey),
      hashHex: bytesToHex(txHash)
    };
  }

  /**
   * Create a signed transaction with raw private key (synchronous)
   * Accepts either 32-byte seed or 64-byte secret key
   * 
   * @param tx - Transaction body
   * @param privateKey - 32-byte or 64-byte Ed25519 private key
   * @returns Signed transaction object
   */
  static createSignedFromRawKey(tx: TxBody, privateKey: Uint8Array): SignedTx {
    const { sigHex, pubHex, hashHex } = Tx.signWithRawKey(tx, privateKey);

    return {
      tx,
      pubkey: pubHex,
      sig: sigHex,
      hash: hashHex
    };
  }

  /**
   * Sign transaction with hex-encoded private key (synchronous)
   * Convenience wrapper for hex string input
   * 
   * @param tx - Transaction body
   * @param hexPrivateKey - Hex-encoded private key (64 or 128 hex chars)
   * @returns Signature, public key, and hash (all as hex strings)
   */
  static signWithHexKey(tx: TxBody, hexPrivateKey: string): {
    sigHex: string;
    pubHex: string;
    hashHex: string;
  } {
    const privateKey = hexToBytes(hexPrivateKey);
    return Tx.signWithRawKey(tx, privateKey);
  }

  /**
   * Create a signed transaction with hex-encoded private key (synchronous)
   * Convenience wrapper for hex string input
   * 
   * @param tx - Transaction body
   * @param hexPrivateKey - Hex-encoded private key (64 or 128 hex chars)
   * @returns Signed transaction object
   */
  static createSignedFromHexKey(tx: TxBody, hexPrivateKey: string): SignedTx {
    const privateKey = hexToBytes(hexPrivateKey);
    return Tx.createSignedFromRawKey(tx, privateKey);
  }
}

