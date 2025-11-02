/**
 * RFC 8785 Canonical JSON Encoding
 */

import type { TxBody } from '../types';

/**
 * Serialize transaction to canonical JSON (RFC 8785)
 * Keys must be sorted, no whitespace, deterministic number encoding
 * @param tx - Transaction body
 * @returns Canonical JSON bytes
 */
export function canonicalJSON(tx: TxBody): Uint8Array {
  // Build canonical representation with sorted keys
  const canonical: Record<string, unknown> = {};

  // Sort keys alphabetically (RFC 8785 requirement)
  const keys = Object.keys(tx).sort();

  for (const key of keys) {
    const value = tx[key as keyof TxBody];
    // Omit undefined/null values (memo is optional)
    if (value !== undefined && value !== null) {
      canonical[key] = value;
    }
  }

  // Serialize with no whitespace
  const jsonString = JSON.stringify(canonical);

  // Convert to bytes
  return new TextEncoder().encode(jsonString);
}

/**
 * Estimate transaction size in bytes
 * @param tx - Transaction body
 * @returns Size in bytes
 */
export function estimateTxSize(tx: TxBody): number {
  return canonicalJSON(tx).length;
}

