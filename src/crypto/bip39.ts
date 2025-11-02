/**
 * BIP39 Mnemonic Generation and Seed Derivation
 */

import * as bip39 from 'bip39';

/**
 * Generate a new 24-word BIP39 mnemonic
 * @param strength - Entropy bits (default: 256 for 24 words)
 * @returns 24-word mnemonic phrase
 */
export function generateMnemonic(strength: number = 256): string {
  if (strength !== 256) {
    throw new Error('Only 256-bit entropy (24 words) is supported');
  }
  return bip39.generateMnemonic(strength);
}

/**
 * Validate a BIP39 mnemonic
 * @param mnemonic - Space-separated mnemonic words
 * @returns true if valid
 */
export function validateMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic);
}

/**
 * Derive BIP39 seed from mnemonic
 * @param mnemonic - 24-word mnemonic
 * @param passphrase - Optional BIP39 passphrase
 * @returns 64-byte seed
 */
export function mnemonicToSeed(mnemonic: string, passphrase: string = ''): Uint8Array {
  if (!validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic');
  }
  return bip39.mnemonicToSeedSync(mnemonic, passphrase);
}

