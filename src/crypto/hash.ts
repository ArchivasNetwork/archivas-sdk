/**
 * Hashing Utilities (Blake2b)
 */

import { blake2b } from '@noble/hashes/blake2b';
import { ARCHIVAS_CONSTANTS } from '../types';

/**
 * Hash transaction with domain separation
 * @param canonicalBytes - RFC 8785 canonical JSON bytes
 * @returns 32-byte blake2b hash
 */
export function hashTx(canonicalBytes: Uint8Array): Uint8Array {
  // Prepend domain separator
  const domainBytes = new TextEncoder().encode(ARCHIVAS_CONSTANTS.DOMAIN_SEPARATOR);
  const combined = new Uint8Array(domainBytes.length + canonicalBytes.length);
  combined.set(domainBytes, 0);
  combined.set(canonicalBytes, domainBytes.length);

  // Hash with blake2b-256
  return blake2b(combined, { dkLen: 32 });
}

/**
 * Convert bytes to hex string
 * @param bytes - Byte array
 * @returns Lowercase hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to bytes
 * @param hex - Hex string (with or without 0x prefix)
 * @returns Byte array
 */
export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) {
    throw new Error('Invalid hex string length');
  }
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substr(i, 2), 16);
  }
  return bytes;
}

