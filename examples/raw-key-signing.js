#!/usr/bin/env node
/**
 * Raw Key Signing Example
 * 
 * Demonstrates signing transactions with raw private keys
 * (without mnemonic derivation)
 */

import { Tx, Derivation, createRpcClient } from '../dist/index.js';

async function main() {
  console.log('🔑 Raw Key Signing Demo\n');
  console.log('='.repeat(60));

  // Example 1: Using a 64-byte secret key from mnemonic
  console.log('\n1️⃣  Sign with 64-byte secret key (from mnemonic)...\n');
  
  const mnemonic = Derivation.mnemonicGenerate();
  const keyPair = Derivation.fromMnemonic(mnemonic);
  
  console.log('   Generated keypair from mnemonic');
  console.log('   Secret key length:', keyPair.secretKey.length, 'bytes');
  console.log('   Public key:', Buffer.from(keyPair.publicKey).toString('hex'));

  const tx1 = Tx.buildTransfer({
    from: Derivation.toAddress(keyPair.publicKey),
    to: 'arcv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsj2mcx',
    amount: '1000000',
    fee: '100000',
    nonce: '0',
    memo: 'Signed with 64-byte key'
  });

  const signed1 = Tx.createSignedFromRawKey(tx1, keyPair.secretKey);
  console.log('\n   ✓ Transaction signed successfully');
  console.log('   Signature:', signed1.sig.slice(0, 32) + '...');
  console.log('   Hash:', signed1.hash);

  // Example 2: Using a 32-byte seed (private key only)
  console.log('\n2️⃣  Sign with 32-byte seed (private key only)...\n');
  
  const seed = keyPair.secretKey.slice(0, 32);  // Extract seed
  console.log('   Using 32-byte seed from previous keypair');
  console.log('   Seed length:', seed.length, 'bytes');

  const tx2 = Tx.buildTransfer({
    from: Derivation.toAddress(keyPair.publicKey),
    to: 'arcv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsj2mcx',
    amount: '2000000',
    fee: '100000',
    nonce: '1',
    memo: 'Signed with 32-byte seed'
  });

  const signed2 = Tx.createSignedFromRawKey(tx2, seed);
  console.log('\n   ✓ Transaction signed successfully');
  console.log('   Public key derived:', signed2.pubkey);
  console.log('   Signature:', signed2.sig.slice(0, 32) + '...');

  // Example 3: Using hex-encoded private key
  console.log('\n3️⃣  Sign with hex-encoded private key...\n');
  
  const hexKey = Buffer.from(keyPair.secretKey).toString('hex');
  console.log('   Hex key:', hexKey.slice(0, 32) + '...' + hexKey.slice(-32));
  console.log('   Hex key length:', hexKey.length, 'chars (128 = 64 bytes)');

  const tx3 = Tx.buildTransfer({
    from: Derivation.toAddress(keyPair.publicKey),
    to: 'arcv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsj2mcx',
    amount: '3000000',
    fee: '100000',
    nonce: '2',
    memo: 'Signed with hex key'
  });

  const signed3 = Tx.createSignedFromHexKey(tx3, hexKey);
  console.log('\n   ✓ Transaction signed successfully');
  console.log('   Hash:', signed3.hash);

  // Example 4: Random key (no mnemonic derivation)
  console.log('\n4️⃣  Sign with arbitrary raw key (no mnemonic)...\n');
  
  const randomSeed = new Uint8Array(32);
  crypto.getRandomValues(randomSeed);
  
  console.log('   Generated random 32-byte seed');
  console.log('   Seed (hex):', Buffer.from(randomSeed).toString('hex'));

  const { pubHex } = Tx.signWithRawKey(tx1, randomSeed);
  console.log('\n   ✓ Public key derived from seed:', pubHex);
  console.log('   No mnemonic derivation required!');

  // Example 5: Verify signature with RPC (optional)
  console.log('\n5️⃣  Broadcasting signed transaction (demo)...\n');
  
  console.log('   Transaction ready for broadcast:');
  console.log('   {');
  console.log('     tx:', JSON.stringify(signed1.tx));
  console.log('     pubkey:', signed1.pubkey);
  console.log('     sig:', signed1.sig.slice(0, 32) + '...');
  console.log('     hash:', signed1.hash);
  console.log('   }');
  
  console.log('\n   To broadcast:');
  console.log('   const rpc = createRpcClient();');
  console.log('   const result = await rpc.submit(signed1);');

  console.log('\n' + '='.repeat(60));
  console.log('✅ Raw key signing demo complete!\n');
  console.log('📚 Key takeaways:');
  console.log('   - Works with 32-byte or 64-byte keys');
  console.log('   - Accepts binary (Uint8Array) or hex strings');
  console.log('   - No mnemonic derivation required');
  console.log('   - Backward compatible with existing APIs\n');
}

main().catch(console.error);

