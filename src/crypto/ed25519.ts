/**
 * Ed25519 Signing and Verification (Synchronous)
 */

import { ed25519 } from '@noble/curves/ed25519';

/**
 * Get public key from secret key (synchronous)
 * @param secretKey - 32-byte secret key seed
 * @returns 32-byte public key
 */
export function getPublicKeySync(secretKey: Uint8Array): Uint8Array {
  if (secretKey.length !== 32) {
    throw new Error('Secret key must be 32 bytes');
  }
  return ed25519.getPublicKey(secretKey);
}

/**
 * Sign a message with Ed25519 (synchronous)
 * @param message - Message bytes to sign
 * @param secretKey - 64-byte secret key (32-byte seed || 32-byte pubkey) or 32-byte seed
 * @returns 64-byte signature
 */
export function signSync(message: Uint8Array, secretKey: Uint8Array): Uint8Array {
  // Handle both 64-byte (seed || pubkey) and 32-byte (seed only) formats
  const seed = secretKey.length === 64 ? secretKey.slice(0, 32) : secretKey;
  
  if (seed.length !== 32) {
    throw new Error('Secret key must be 32 or 64 bytes');
  }

  return ed25519.sign(message, seed);
}

/**
 * Verify an Ed25519 signature (synchronous)
 * @param signature - 64-byte signature
 * @param message - Message bytes that were signed
 * @param publicKey - 32-byte public key
 * @returns true if signature is valid
 */
export function verifySync(
  signature: Uint8Array,
  message: Uint8Array,
  publicKey: Uint8Array
): boolean {
  if (publicKey.length !== 32) {
    throw new Error('Public key must be 32 bytes');
  }
  if (signature.length !== 64) {
    throw new Error('Signature must be 64 bytes');
  }

  try {
    return ed25519.verify(signature, message, publicKey);
  } catch {
    return false;
  }
}

// Async wrappers for backward compatibility (if needed)
export async function sign(message: Uint8Array, secretKey: Uint8Array): Promise<Uint8Array> {
  return signSync(message, secretKey);
}

export async function verify(
  message: Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array
): Promise<boolean> {
  return verifySync(signature, message, publicKey);
}

export async function getPublicKey(secretKey: Uint8Array): Promise<Uint8Array> {
  return getPublicKeySync(secretKey);
}
