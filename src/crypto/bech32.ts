/**
 * Bech32 Address Encoding/Decoding
 */

import { bech32 } from 'bech32';
import { blake2b } from '@noble/hashes/blake2b';
import type { Address } from '../types';

const ADDRESS_HRP = 'arcv';
const ADDRESS_DATA_LENGTH = 20;  // blake2b-160

/**
 * Convert Ed25519 public key to Archivas Bech32 address
 * @param publicKey - 32-byte Ed25519 public key
 * @returns Bech32 address with 'arcv' prefix
 */
export function pubKeyToAddress(publicKey: Uint8Array): Address {
  if (publicKey.length !== 32) {
    throw new Error('Public key must be 32 bytes');
  }

  // Hash public key with blake2b-160
  const hash = blake2b(publicKey, { dkLen: 20 });

  // Convert to 5-bit words for Bech32
  const words = bech32.toWords(hash);

  // Encode as Bech32
  const encoded = bech32.encode(ADDRESS_HRP, words);

  return encoded as Address;
}

/**
 * Decode Archivas Bech32 address to raw bytes
 * @param address - Bech32 address string
 * @returns 20-byte address data
 */
export function parseAddress(address: string): Uint8Array {
  const decoded = bech32.decode(address);

  if (decoded.prefix !== ADDRESS_HRP) {
    throw new Error(`Invalid address prefix: expected '${ADDRESS_HRP}', got '${decoded.prefix}'`);
  }

  // Convert from 5-bit words to 8-bit bytes
  const data = bech32.fromWords(decoded.words);

  if (data.length !== ADDRESS_DATA_LENGTH) {
    throw new Error(`Invalid address data length: expected ${ADDRESS_DATA_LENGTH} bytes, got ${data.length}`);
  }

  return new Uint8Array(data);
}

/**
 * Validate an Archivas address
 * @param address - Address string to validate
 * @returns true if valid
 */
export function isValidAddress(address: string): boolean {
  try {
    parseAddress(address);
    return true;
  } catch {
    return false;
  }
}

