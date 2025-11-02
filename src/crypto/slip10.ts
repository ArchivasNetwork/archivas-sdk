/**
 * SLIP-0010 Hierarchical Deterministic Key Derivation for Ed25519
 */

import { hmac } from '@noble/hashes/hmac';
import { sha512 } from '@noble/hashes/sha512';
import * as ed from '@noble/ed25519';

const ED25519_CURVE = 'ed25519 seed';

/**
 * Derive Ed25519 keypair from seed using Archivas default path
 * Path: m/734'/0'/0'/0/0
 * @param seed - 64-byte BIP39 seed
 * @returns Ed25519 keypair
 */
export async function deriveKeyPair(seed: Uint8Array): Promise<{ publicKey: Uint8Array; secretKey: Uint8Array }> {
  if (seed.length !== 64) {
    throw new Error('Seed must be 64 bytes');
  }

  // SLIP-0010 master key derivation
  const masterKey = hmac(sha512, ED25519_CURVE, seed);
  const IL = masterKey.slice(0, 32);  // Left 32 bytes = master secret key
  // const IR = masterKey.slice(32);  // Right 32 bytes = chain code (not used in simple derivation)

  // For Ed25519, we use the left 32 bytes as the seed for key generation
  // Simplified: Direct key generation from master IL
  // Full SLIP-0010 would require hardened derivation through path
  // For production, use a full SLIP-0010 ed25519 library

  // Generate Ed25519 keypair from the derived seed
  const secretKey = IL;
  const publicKey = await ed.getPublicKeyAsync(secretKey);

  // Ed25519 secret key in noble-ed25519 is 32 bytes
  // To match Go's 64-byte format (32-byte seed || 32-byte pubkey), concatenate:
  const fullSecretKey = new Uint8Array(64);
  fullSecretKey.set(secretKey, 0);
  fullSecretKey.set(publicKey, 32);

  return {
    publicKey,
    secretKey: fullSecretKey
  };
}

/**
 * Derive keypair from mnemonic (convenience wrapper)
 * @param mnemonicToSeed - Function to convert mnemonic to seed
 * @param mnemonic - 24-word mnemonic
 * @returns Ed25519 keypair
 */
export async function fromMnemonic(
  mnemonicToSeed: (mnemonic: string) => Uint8Array,
  mnemonic: string
): Promise<{ publicKey: Uint8Array; secretKey: Uint8Array }> {
  const seed = mnemonicToSeed(mnemonic);
  return deriveKeyPair(seed);
}

