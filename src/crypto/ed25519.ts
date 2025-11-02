/**
 * Ed25519 Signing and Verification
 */

import * as ed from '@noble/ed25519';

/**
 * Sign a message with Ed25519
 * @param message - Message bytes to sign
 * @param secretKey - 64-byte secret key (32-byte seed || 32-byte pubkey)
 * @returns 64-byte signature
 */
export async function sign(message: Uint8Array, secretKey: Uint8Array): Promise<Uint8Array> {
  if (secretKey.length !== 64) {
    throw new Error('Secret key must be 64 bytes');
  }

  // Extract the 32-byte seed portion
  const seed = secretKey.slice(0, 32);

  // Sign the message
  const signature = await ed.signAsync(message, seed);

  return signature;
}

/**
 * Verify an Ed25519 signature
 * @param message - Message bytes that were signed
 * @param signature - 64-byte signature
 * @param publicKey - 32-byte public key
 * @returns true if signature is valid
 */
export async function verify(
  message: Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array
): Promise<boolean> {
  if (publicKey.length !== 32) {
    throw new Error('Public key must be 32 bytes');
  }
  if (signature.length !== 64) {
    throw new Error('Signature must be 64 bytes');
  }

  try {
    return await ed.verifyAsync(signature, message, publicKey);
  } catch {
    return false;
  }
}

/**
 * Get public key from secret key
 * @param secretKey - 64-byte secret key
 * @returns 32-byte public key
 */
export async function getPublicKey(secretKey: Uint8Array): Promise<Uint8Array> {
  if (secretKey.length !== 64) {
    throw new Error('Secret key must be 64 bytes');
  }

  const seed = secretKey.slice(0, 32);
  return await ed.getPublicKeyAsync(seed);
}

