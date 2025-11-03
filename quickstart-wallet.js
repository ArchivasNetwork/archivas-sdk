#!/usr/bin/env node
/**
 * Archivas SDK Quickstart Example
 * 
 * Demonstrates basic wallet operations:
 * - Generating a new mnemonic
 * - Deriving keypair and address
 * - Querying chain info via RPC
 */

import { Derivation, createRpcClient, Tx } from './dist/index.js';

async function main() {
  console.log('🚀 Archivas SDK Quickstart\n');
  console.log('='.repeat(60));

  // 1. Generate new wallet
  console.log('\n1️⃣  Generating new wallet...');
  const mnemonic = Derivation.mnemonicGenerate();
  console.log('   Mnemonic:', mnemonic.split(' ').slice(0, 4).join(' '), '...');

  // 2. Derive keypair and address
  console.log('\n2️⃣  Deriving keypair and address...');
  const keyPair = await Derivation.fromMnemonic(mnemonic);
  const address = Derivation.toAddress(keyPair.publicKey);
  console.log('   Address:', address);
  console.log('   Public Key:', Buffer.from(keyPair.publicKey).toString('hex'));

  // 3. Connect to RPC
  console.log('\n3️⃣  Connecting to Archivas RPC...');
  const rpc = createRpcClient({ baseUrl: 'https://seed.archivas.ai' });

  try {
    // 4. Get chain tip
    console.log('\n4️⃣  Querying chain tip...');
    const chainTip = await rpc.getChainTip();
    console.log('   Height:', chainTip.height);
    console.log('   Hash:', chainTip.hash);
    console.log('   Difficulty:', chainTip.difficulty);

    // 5. Check address balance (will be 0 for new wallet)
    console.log('\n5️⃣  Checking balance...');
    const balance = await rpc.getBalance(address);
    console.log('   Balance:', balance.toString(), 'base units');
    console.log('   Balance:', (Number(balance) / 1e8).toFixed(8), 'RCHV');

    // 6. Build a dummy transaction (not submitted)
    console.log('\n6️⃣  Building example transaction...');
    const tx = Tx.buildTransfer({
      from: address,
      to: 'arcv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsj2mcx', // Burn address
      amount: '100000000', // 1 RCHV
      fee: '100000',       // 0.001 RCHV
      nonce: '0',
      memo: 'Quickstart example'
    });
    console.log('   Transaction built successfully');
    console.log('   Size:', Tx.estimateSize(tx), 'bytes');
    
    // 7. Sign the transaction
    console.log('\n7️⃣  Signing transaction...');
    const { hashHex, sigHex } = await Tx.sign(tx, keyPair.secretKey);
    console.log('   Hash:', hashHex);
    console.log('   Signature:', sigHex.slice(0, 32) + '...');

    console.log('\n' + '='.repeat(60));
    console.log('✅ Quickstart complete!\n');
    console.log('📚 Next steps:');
    console.log('   - Fund your address to send real transactions');
    console.log('   - Explore the full API in README.md');
    console.log('   - Run connectivity tests: npm run verify\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);

