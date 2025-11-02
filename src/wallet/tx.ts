/**
 * Transaction Building, Signing, and Serialization
 */

import { canonicalJSON, estimateTxSize } from '../crypto/canonical';
import { hashTx, bytesToHex } from '../crypto/hash';
import { sign as ed25519Sign } from '../crypto/ed25519';
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
   * Sign a transaction
   * @param tx - Transaction body
   * @param secretKey - 64-byte Ed25519 secret key
   * @returns Signature, public key, and hash (all as hex strings)
   */
  static async sign(tx: TxBody, secretKey: Uint8Array): Promise<{
    sigHex: string;
    pubHex: string;
    hashHex: string;
  }> {
    if (secretKey.length !== 64) {
      throw new Error('Secret key must be 64 bytes');
    }

    // Hash the transaction
    const txHash = Tx.hash(tx);

    // Sign the hash
    const signature = await ed25519Sign(txHash, secretKey);

    // Extract public key from secret key
    const publicKey = secretKey.slice(32, 64);

    return {
      sigHex: bytesToHex(signature),
      pubHex: bytesToHex(publicKey),
      hashHex: bytesToHex(txHash)
    };
  }

  /**
   * Create a signed transaction ready for broadcast
   * @param tx - Transaction body
   * @param secretKey - 64-byte Ed25519 secret key
   * @returns Signed transaction object
   */
  static async createSigned(tx: TxBody, secretKey: Uint8Array): Promise<SignedTx> {
    const { sigHex, pubHex, hashHex } = await Tx.sign(tx, secretKey);

    return {
      tx,
      pubkey: pubHex,
      sig: sigHex,
      hash: hashHex
    };
  }

  /**
   * Estimate transaction size
   * @param tx - Transaction body
   * @returns Size in bytes
   */
  static estimateSize(tx: TxBody): number {
    return estimateTxSize(tx);
  }
}

