/**
 * Explorer API Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RpcClient } from '../src/rpc/client';
import type { ArchivasBlockSummary, ArchivasTxSummary, ArchivasBlock } from '../src/types';

describe('Explorer API', () => {
  let rpcClient: RpcClient;

  beforeEach(() => {
    rpcClient = new RpcClient({ baseUrl: 'https://test.example.com' });
  });

  describe('getRecentBlocks', () => {
    it('should fetch recent blocks with default limit', async () => {
      const mockBlocks: ArchivasBlockSummary[] = [
        {
          height: '100',
          hash: 'abc123',
          timestamp: '2025-01-01T00:00:00Z',
          difficulty: '1000000',
          txCount: 5
        },
        {
          height: '99',
          hash: 'def456',
          timestamp: '2025-01-01T00:00:00Z',
          difficulty: '1000000',
          txCount: 3
        }
      ];

      // Mock the fetch call
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ blocks: mockBlocks })
        } as Response)
      );

      const blocks = await rpcClient.getRecentBlocks();

      expect(blocks).toEqual(mockBlocks);
      expect(blocks).toHaveLength(2);
      expect(blocks[0].height).toBe('100');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.example.com/blocks/recent?limit=20',
        expect.any(Object)
      );
    });

    it('should fetch recent blocks with custom limit', async () => {
      const mockBlocks: ArchivasBlockSummary[] = [
        {
          height: '100',
          hash: 'abc123',
          difficulty: '1000000'
        }
      ];

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ blocks: mockBlocks })
        } as Response)
      );

      await rpcClient.getRecentBlocks(50);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.example.com/blocks/recent?limit=50',
        expect.any(Object)
      );
    });
  });

  describe('getRecentTxs', () => {
    it('should fetch recent transactions with default limit', async () => {
      const mockTxs: ArchivasTxSummary[] = [
        {
          hash: 'tx1',
          from: 'arcv1sender111111111111111111111111111111111111',
          to: 'arcv1receiver111111111111111111111111111111111',
          amount: '1000000000',
          fee: '100000',
          nonce: '5',
          height: '100'
        },
        {
          hash: 'tx2',
          from: 'arcv1sender222222222222222222222222222222222222',
          to: 'arcv1receiver222222222222222222222222222222222',
          amount: '2000000000',
          fee: '100000',
          nonce: '6',
          height: '100'
        }
      ];

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ txs: mockTxs })
        } as Response)
      );

      const txs = await rpcClient.getRecentTxs();

      expect(txs).toEqual(mockTxs);
      expect(txs).toHaveLength(2);
      expect(txs[0].hash).toBe('tx1');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.example.com/tx/recent?limit=50',
        expect.any(Object)
      );
    });

    it('should fetch recent transactions with custom limit', async () => {
      const mockTxs: ArchivasTxSummary[] = [];

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ txs: mockTxs })
        } as Response)
      );

      await rpcClient.getRecentTxs(100);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.example.com/tx/recent?limit=100',
        expect.any(Object)
      );
    });
  });

  describe('getBlockByHeight', () => {
    it('should fetch block by numeric height', async () => {
      const mockBlock: ArchivasBlock = {
        height: '100',
        hash: 'blockhash123',
        prevHash: 'prevhash456',
        timestamp: '2025-01-01T00:00:00Z',
        difficulty: '1000000',
        miner: 'arcv1miner111111111111111111111111111111111111',
        txs: [
          {
            hash: 'tx1',
            from: 'arcv1sender111111111111111111111111111111111111',
            to: 'arcv1receiver111111111111111111111111111111111',
            amount: '1000000000',
            fee: '100000',
            nonce: '5'
          }
        ]
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBlock)
        } as Response)
      );

      const block = await rpcClient.getBlockByHeight(100);

      expect(block).toEqual(mockBlock);
      expect(block.height).toBe('100');
      expect(block.txs).toHaveLength(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.example.com/block/100',
        expect.any(Object)
      );
    });

    it('should fetch block by string height', async () => {
      const mockBlock: ArchivasBlock = {
        height: '12345',
        hash: 'blockhash123',
        difficulty: '1000000'
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBlock)
        } as Response)
      );

      const block = await rpcClient.getBlockByHeight('12345');

      expect(block.height).toBe('12345');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.example.com/block/12345',
        expect.any(Object)
      );
    });
  });

  describe('Type validation', () => {
    it('should handle blocks with minimal fields', async () => {
      const mockBlocks: ArchivasBlockSummary[] = [
        {
          height: '100',
          hash: 'abc123'
          // Optional fields omitted
        }
      ];

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ blocks: mockBlocks })
        } as Response)
      );

      const blocks = await rpcClient.getRecentBlocks();

      expect(blocks[0].height).toBe('100');
      expect(blocks[0].hash).toBe('abc123');
      expect(blocks[0].timestamp).toBeUndefined();
    });
  });
});

// Integration test (skipped by default)
describe.skip('Explorer API - Live Integration', () => {
  it('should fetch real blocks from mainnet', async () => {
    const rpc = new RpcClient({ 
      baseUrl: process.env.ARCHIVAS_RPC_BASE || 'https://seed.archivas.ai' 
    });

    const blocks = await rpc.getRecentBlocks(5);

    expect(blocks).toBeDefined();
    expect(Array.isArray(blocks)).toBe(true);
    expect(blocks.length).toBeGreaterThan(0);
    expect(blocks.length).toBeLessThanOrEqual(5);
    
    // Validate structure
    if (blocks.length > 0) {
      const block = blocks[0];
      expect(block.height).toBeDefined();
      expect(block.hash).toBeDefined();
      expect(typeof block.height).toBe('string');
      expect(typeof block.hash).toBe('string');
    }
  });

  it('should fetch real transactions from mainnet', async () => {
    const rpc = new RpcClient({ 
      baseUrl: process.env.ARCHIVAS_RPC_BASE || 'https://seed.archivas.ai' 
    });

    const txs = await rpc.getRecentTxs(10);

    expect(txs).toBeDefined();
    expect(Array.isArray(txs)).toBe(true);
    
    // Validate structure
    if (txs.length > 0) {
      const tx = txs[0];
      expect(tx.hash).toBeDefined();
      expect(tx.from).toBeDefined();
      expect(tx.to).toBeDefined();
      expect(tx.amount).toBeDefined();
      expect(tx.fee).toBeDefined();
      expect(tx.nonce).toBeDefined();
    }
  });

  it('should fetch real block by height from mainnet', async () => {
    const rpc = new RpcClient({ 
      baseUrl: process.env.ARCHIVAS_RPC_BASE || 'https://seed.archivas.ai' 
    });

    // Get recent blocks first to find a valid height
    const blocks = await rpc.getRecentBlocks(1);
    expect(blocks.length).toBeGreaterThan(0);

    const height = blocks[0].height;
    const block = await rpc.getBlockByHeight(height);

    expect(block).toBeDefined();
    expect(block.height).toBe(height);
    expect(block.hash).toBeDefined();
  });
});

