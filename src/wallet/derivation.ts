/**
 * Wallet Derivation (Mnemonic → KeyPair → Address)
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
   * Derive Ed25519 keypair from mnemonic
   * @param mnemonic - 24-word BIP39 mnemonic
   * @param passphrase - Optional BIP39 passphrase
   * @returns Ed25519 keypair
   */
  static async fromMnemonic(mnemonic: string, passphrase: string = ''): Promise<KeyPair> {
    const seed = mnemonicToSeed(mnemonic, passphrase);
    return await deriveKeyPair(seed);
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
   * Derive address directly from mnemonic (convenience)
   * @param mnemonic - 24-word BIP39 mnemonic
   * @param passphrase - Optional BIP39 passphrase
   * @returns Bech32 address
   */
  static async mnemonicToAddress(mnemonic: string, passphrase: string = ''): Promise<Address> {
    const kp = await Derivation.fromMnemonic(mnemonic, passphrase);
    return Derivation.toAddress(kp.publicKey);
  }
}

