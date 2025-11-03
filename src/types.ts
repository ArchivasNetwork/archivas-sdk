/**
 * Archivas SDK Type Definitions (v1.1.0 API)
 */

/** Archivas Bech32 address with 'arcv' prefix */
export type Address = `arcv${string}`;

/** Ed25519 keypair */
export interface KeyPair {
  publicKey: Uint8Array;  // 32 bytes
  secretKey: Uint8Array;  // 64 bytes (includes public key)
}

/** Chain tip information */
export interface ChainTip {
  height: string;      // u64 as string
  hash: string;        // hex string
  difficulty: string;  // u64 as string
}

/** Account state */
export interface Account {
  address: string;
  balance: string;  // u64 as string (base units, 8 decimals)
  nonce: string;    // u64 as string
}

/** Transaction v1 body */
export interface TxBody {
  type: "transfer";
  from: Address;
  to: Address;
  amount: string;  // u64 as string
  fee: string;     // u64 as string
  nonce: string;   // u64 as string
  memo?: string;   // optional, max 256 bytes UTF-8
}

/** Signed transaction for broadcast */
export interface SignedTx {
  tx: TxBody;
  pubkey: string;  // hex or base64
  sig: string;     // hex or base64
  hash: string;    // hex (32 bytes)
}

/** RPC submit response */
export interface SubmitResponse {
  ok: boolean;
  hash?: string;
  error?: string;
}

/** Fee estimation response */
export interface FeeEstimate {
  fee: string;  // u64 as string
}

/** Mempool response */
export type MempoolResponse = readonly string[];  // Array of tx hashes

/** Transaction details */
export interface TxDetails {
  hash: string;
  tx: TxBody;
  block?: {
    height: number;
    hash: string;
    timestamp: number;
  };
}

/** RPC client configuration */
export interface RpcConfig {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/** Explorer/Block API types */

/** Block summary for explorer listings */
export interface ArchivasBlockSummary {
  height: string;
  hash: string;
  timestamp?: string;
  miner?: string;
  txCount?: number;
  difficulty?: string;
}

/** Transaction summary for explorer listings */
export interface ArchivasTxSummary {
  hash: string;
  from: string;
  to: string;
  amount: string;
  fee: string;
  nonce: string;
  height?: string;
  timestamp?: string;
}

/** Full block details */
export interface ArchivasBlock {
  height: string;
  hash: string;
  prevHash?: string;
  timestamp?: string;
  difficulty?: string;
  miner?: string;
  txs?: ArchivasTxSummary[];
}

/** Recent blocks response */
export interface RecentBlocksResponse {
  blocks: ArchivasBlockSummary[];
}

/** Recent transactions response */
export interface RecentTxsResponse {
  txs: ArchivasTxSummary[];
}

/** Constants */
export const ARCHIVAS_CONSTANTS = {
  COIN_TYPE: 734,                           // SLIP-0044
  DERIVATION_PATH: "m/734'/0'/0'/0/0",      // Default path
  ADDRESS_PREFIX: "arcv",                   // Bech32 HRP
  DECIMALS: 8,                              // RCHV decimals
  MAX_MEMO_LENGTH: 256,                     // Max memo bytes
  DOMAIN_SEPARATOR: "Archivas-TxV1",        // For hashing
  DEFAULT_RPC: "https://seed.archivas.ai",  // Default endpoint
} as const;

