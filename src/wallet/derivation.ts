/**
 * Wallet Derivation (Mnemonic → KeyPair → Address) - Synchronous
 */

import { generateMnemonic as genMnemonic, mnemonicToSeed } from '../crypto/bip39';
import { deriveKeyPair } from '../crypto/slip10';
import { pubKeyToAddress } from '../crypto/bech32';
import type { KeyPair, Address } from '../types';

export class Derivation {
  /**
   * Generate a new 24-word mnemonic
   * @returns BIP39 mnemonic phrase
   */
  static mnemonicGenerate(): string {
    return genMnemonic();
  }

  /**
   * Derive Ed25519 keypair from mnemonic (synchronous)
   * @param mnemonic - 24-word BIP39 mnemonic
   * @param passphrase - Optional BIP39 passphrase
   * @returns Ed25519 keypair
   */
  static fromMnemonic(mnemonic: string, passphrase: string = ''): KeyPair {
    const seed = mnemonicToSeed(mnemonic, passphrase);
    return deriveKeyPair(seed);
  }

  /**
   * Convert public key to Archivas address
   * @param publicKey - 32-byte Ed25519 public key
   * @returns Bech32 address
   */
  static toAddress(publicKey: Uint8Array): Address {
    return pubKeyToAddress(publicKey);
  }

  /**
   * Derive address directly from mnemonic (convenience, synchronous)
   * @param mnemonic - 24-word BIP39 mnemonic
   * @param passphrase - Optional BIP39 passphrase
   * @returns Bech32 address
   */
  static mnemonicToAddress(mnemonic: string, passphrase: string = ''): Address {
    const kp = Derivation.fromMnemonic(mnemonic, passphrase);
    return Derivation.toAddress(kp.publicKey);
  }

  // Async wrappers for backward compatibility
  /**
   * @deprecated Use synchronous fromMnemonic() instead
   */
  static async fromMnemonicAsync(mnemonic: string, passphrase: string = ''): Promise<KeyPair> {
    return Derivation.fromMnemonic(mnemonic, passphrase);
  }

  /**
   * @deprecated Use synchronous mnemonicToAddress() instead
   */
  static async mnemonicToAddressAsync(mnemonic: string, passphrase: string = ''): Promise<Address> {
    return Derivation.mnemonicToAddress(mnemonic, passphrase);
  }
}
