/**
 * Archivas SDK - Official TypeScript SDK for Archivas Blockchain
 * Compatible with v1.1.0 API
 */

// Re-export all public APIs
export { Derivation } from './wallet/derivation';
export { Tx } from './wallet/tx';
export { RpcClient, createRpcClient } from './rpc/client';

// Re-export types
export type {
  Address,
  KeyPair,
  ChainTip,
  Account,
  TxBody,
  SignedTx,
  SubmitResponse,
  FeeEstimate,
  MempoolResponse,
  TxDetails,
  RpcConfig
} from './types';

export { ARCHIVAS_CONSTANTS } from './types';

// Crypto utilities (advanced users)
export { pubKeyToAddress, isValidAddress } from './crypto/bech32';
export { bytesToHex, hexToBytes } from './crypto/hash';

