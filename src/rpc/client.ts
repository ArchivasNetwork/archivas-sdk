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
  RpcConfig,
  ArchivasBlockSummary,
  ArchivasTxSummary,
  ArchivasBlock,
  RecentBlocksResponse,
  RecentTxsResponse
} from '../types';
import { ARCHIVAS_CONSTANTS } from '../types';

export class RpcClient {
  private baseUrl: string;
  private timeout: number;
  private headers: Record<string, string>;

  constructor(config: RpcConfig = {}) {
    // Priority: config.baseUrl > env.ARCHIVAS_RPC_BASE > default
    const defaultUrl = (typeof process !== 'undefined' && process.env?.ARCHIVAS_RPC_BASE) 
      ? process.env.ARCHIVAS_RPC_BASE 
      : ARCHIVAS_CONSTANTS.DEFAULT_RPC;
    
    this.baseUrl = (config.baseUrl || defaultUrl).replace(/\/$/, '');
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

      return await response.json() as T;
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

  // Explorer API methods

  /**
   * Get recent blocks
   * @param limit - Maximum number of blocks to return (default: 20)
   * @returns Recent blocks summary
   */
  async getRecentBlocks(limit: number = 20): Promise<ArchivasBlockSummary[]> {
    const response = await this.request<RecentBlocksResponse>('GET', `/blocks/recent?limit=${limit}`);
    return response.blocks;
  }

  /**
   * Get recent transactions
   * @param limit - Maximum number of transactions to return (default: 50)
   * @returns Recent transactions summary
   */
  async getRecentTxs(limit: number = 50): Promise<ArchivasTxSummary[]> {
    const response = await this.request<RecentTxsResponse>('GET', `/tx/recent?limit=${limit}`);
    return response.txs;
  }

  /**
   * Get block by height
   * @param height - Block height (number or string)
   * @returns Full block details
   */
  async getBlockByHeight(height: number | string): Promise<ArchivasBlock> {
    return this.request<ArchivasBlock>('GET', `/block/${height}`);
  }

  // Health & Network Info

  /**
   * Get genesis hash
   * @returns Genesis block hash
   */
  async getGenesisHash(): Promise<{ genesisHash: string }> {
    return this.request<{ genesisHash: string }>('GET', '/genesisHash');
  }

  /**
   * Check node health (quick)
   * @returns Health status
   */
  async getHealth(): Promise<{ ok: boolean; height: number; difficulty: number; peers: number }> {
    return this.request<any>('GET', '/healthz');
  }

  /**
   * Get detailed health status
   * @returns Detailed health metrics
   */
  async getHealthDetailed(): Promise<any> {
    return this.request<any>('GET', '/health');
  }

  /**
   * Get connected peers
   * @returns Peer list
   */
  async getPeers(): Promise<{ connected: string[]; known: string[] }> {
    return this.request<any>('GET', '/peers');
  }

  /**
   * Get node version and build info
   * @returns Version information
   */
  async getVersion(): Promise<{ version: string; commit: string; buildTime: string }> {
    return this.request<any>('GET', '/version');
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

