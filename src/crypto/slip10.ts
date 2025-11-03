/**
 * SLIP-0010 Hierarchical Deterministic Key Derivation for Ed25519 (Synchronous)
 */

import { hmac } from '@noble/hashes/hmac';
import { sha512 } from '@noble/hashes/sha512';
import { getPublicKeySync } from './ed25519';

const ED25519_CURVE = 'ed25519 seed';

/**
 * Derive Ed25519 keypair from seed using SLIP-0010
 * @param seed - 64-byte BIP39 seed
 * @returns Ed25519 keypair with 32-byte public key and 64-byte secret key
 */
export function deriveKeyPair(seed: Uint8Array): { publicKey: Uint8Array; secretKey: Uint8Array } {
  if (seed.length !== 64) {
    throw new Error('Seed must be 64 bytes');
  }

  // SLIP-0010 master key derivation
  const masterKey = hmac(sha512, ED25519_CURVE, seed);
  const IL = masterKey.slice(0, 32);  // Left 32 bytes = master secret key
  // const IR = masterKey.slice(32);  // Right 32 bytes = chain code (for future BIP32 path derivation)

  // Generate Ed25519 public key from the derived seed
  const secretKey = IL;
  const publicKey = getPublicKeySync(secretKey);

  // Ed25519 secret key format: 64 bytes (32-byte seed || 32-byte pubkey)
  // This matches common Ed25519 implementations
  const fullSecretKey = new Uint8Array(64);
  fullSecretKey.set(secretKey, 0);
  fullSecretKey.set(publicKey, 32);

  return {
    publicKey,
    secretKey: fullSecretKey
  };
}

/**
 * Async wrapper for backward compatibility
 */
export async function deriveKeyPairAsync(seed: Uint8Array): Promise<{ publicKey: Uint8Array; secretKey: Uint8Array }> {
  return deriveKeyPair(seed);
}
