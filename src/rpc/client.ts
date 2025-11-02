/**
 * Archivas RPC Client
 */

import type {
  Address,
  Account,
  ChainTip,
  MempoolResponse,
  TxDetails,
  SignedTx,
  SubmitResponse,
  FeeEstimate,
  RpcConfig
} from '../types';
import { ARCHIVAS_CONSTANTS } from '../types';

export class RpcClient {
  private baseUrl: string;
  private timeout: number;
  private headers: Record<string, string>;

  constructor(config: RpcConfig = {}) {
    this.baseUrl = (config.baseUrl || ARCHIVAS_CONSTANTS.DEFAULT_RPC).replace(/\/$/, '');
    this.timeout = config.timeout || 30000;
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers
    };
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: this.headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
        redirect: 'error'  // Don't follow redirects (POST → GET issue)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Get account information
   * @param address - Archivas address
   * @returns Account with balance and nonce
   */
  async getAccount(address: Address): Promise<Account> {
    return this.request<Account>('GET', `/account/${address}`);
  }

  /**
   * Get current chain tip
   * @returns Chain tip with height, hash, difficulty
   */
  async getChainTip(): Promise<ChainTip> {
    return this.request<ChainTip>('GET', '/chainTip');
  }

  /**
   * Get mempool (pending transactions)
   * @returns Array of transaction hashes
   */
  async getMempool(): Promise<MempoolResponse> {
    return this.request<MempoolResponse>('GET', '/mempool');
  }

  /**
   * Get transaction details
   * @param hash - Transaction hash (hex)
   * @returns Transaction details
   */
  async getTx(hash: string): Promise<TxDetails> {
    return this.request<TxDetails>('GET', `/tx/${hash}`);
  }

  /**
   * Estimate fee for a transaction
   * @param bytes - Transaction size in bytes
   * @returns Estimated fee
   */
  async estimateFee(bytes: number): Promise<FeeEstimate> {
    return this.request<FeeEstimate>('GET', `/estimateFee?bytes=${bytes}`);
  }

  /**
   * Submit a signed transaction
   * @param stx - Signed transaction
   * @returns Submit response with hash or error
   */
  async submit(stx: SignedTx): Promise<SubmitResponse> {
    return this.request<SubmitResponse>('POST', '/submit', stx);
  }

  /**
   * Get account balance (convenience)
   * @param address - Archivas address
   * @returns Balance as bigint (base units)
   */
  async getBalance(address: Address): Promise<bigint> {
    const account = await this.getAccount(address);
    return BigInt(account.balance);
  }

  /**
   * Get account nonce (convenience)
   * @param address - Archivas address
   * @returns Nonce as bigint
   */
  async getNonce(address: Address): Promise<bigint> {
    const account = await this.getAccount(address);
    return BigInt(account.nonce);
  }
}

/**
 * Create an RPC client instance
 * @param config - RPC configuration
 * @returns RPC client
 */
export function createRpcClient(config?: RpcConfig): RpcClient {
  return new RpcClient(config);
}

