#!/usr/bin/env node
/**
 * Explorer API Demo
 * 
 * Demonstrates the new explorer API endpoints for querying:
 * - Recent blocks
 * - Recent transactions
 * - Block details by height
 */

import { createRpcClient } from '../dist/index.js';

async function main() {
  console.log('🔍 Archivas Explorer API Demo\n');
  console.log('='.repeat(60));

  // Connect to RPC
  const rpc = createRpcClient({ baseUrl: 'https://seed.archivas.ai' });

  try {
    // 1. Get recent blocks
    console.log('\n1️⃣  Fetching recent blocks (limit: 5)...');
    const blocks = await rpc.getRecentBlocks(5);
    
    console.log(`   Found ${blocks.length} blocks:\n`);
    blocks.forEach((block, index) => {
      console.log(`   Block #${index + 1}:`);
      console.log(`     Height: ${block.height}`);
      console.log(`     Hash: ${block.hash}`);
      if (block.timestamp) console.log(`     Time: ${block.timestamp}`);
      if (block.farmer) console.log(`     Farmer: ${block.farmer}`);
      if (block.difficulty) console.log(`     Difficulty: ${block.difficulty}`);
      if (block.txCount !== undefined) console.log(`     Transactions: ${block.txCount}`);
      console.log();
    });

    // 2. Get recent transactions
    console.log('2️⃣  Fetching recent transactions (limit: 10)...');
    const txs = await rpc.getRecentTxs(10);
    
    console.log(`   Found ${txs.length} transactions:\n`);
    txs.slice(0, 3).forEach((tx, index) => {
      console.log(`   Transaction #${index + 1}:`);
      console.log(`     Hash: ${tx.hash}`);
      console.log(`     From: ${tx.from}`);
      console.log(`     To: ${tx.to}`);
      console.log(`     Amount: ${tx.amount} (${(Number(tx.amount) / 1e8).toFixed(8)} RCHV)`);
      console.log(`     Fee: ${tx.fee}`);
      if (tx.height) console.log(`     Block: ${tx.height}`);
      console.log();
    });
    if (txs.length > 3) {
      console.log(`   ... and ${txs.length - 3} more\n`);
    }

    // 3. Get specific block by height
    if (blocks.length > 0) {
      const latestHeight = blocks[0].height;
      console.log(`3️⃣  Fetching block details for height ${latestHeight}...`);
      const blockDetail = await rpc.getBlockByHeight(latestHeight);
      
      console.log('\n   Block Details:');
      console.log(`     Height: ${blockDetail.height}`);
      console.log(`     Hash: ${blockDetail.hash}`);
      if (blockDetail.prevHash) console.log(`     Previous Hash: ${blockDetail.prevHash}`);
      if (blockDetail.timestamp) console.log(`     Timestamp: ${blockDetail.timestamp}`);
      if (blockDetail.difficulty) console.log(`     Difficulty: ${blockDetail.difficulty}`);
      if (blockDetail.farmer) console.log(`     Farmer: ${blockDetail.farmer}`);
      if (blockDetail.txs) console.log(`     Transactions: ${blockDetail.txs.length}`);
      console.log();
    }

    console.log('='.repeat(60));
    console.log('✅ Explorer API demo complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);

