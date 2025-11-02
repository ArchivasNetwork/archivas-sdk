#!/usr/bin/env tsx
/**
 * Archivas SDK Connectivity Verification Script
 * 
 * Verifies connectivity to Archivas RPC endpoint and validates SDK functionality.
 * 
 * Environment Variables:
 * - ARCHIVAS_RPC_BASE: RPC endpoint (default: https://seed.archivas.ai)
 * - ARCHIVAS_TEST_ADDRESS: Optional address to query account info
 * - ARCHIVAS_BROADCAST: Set to "1" to enable transaction broadcasting
 * - ARCHIVAS_TEST_PRIVKEY: Optional Ed25519 secret key (hex, 64 bytes) for broadcasting
 */

import { createRpcClient, Derivation, Tx, bytesToHex, hexToBytes } from '../src/index';
import type { TxBody } from '../src/types';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

function log(color: string, prefix: string, message: string) {
  console.log(`${color}[${prefix}]${RESET} ${message}`);
}

function logSuccess(message: string) {
  log(GREEN, '✓', message);
}

function logError(message: string) {
  log(RED, '✗', message);
}

function logInfo(message: string) {
  log(BLUE, 'ℹ', message);
}

function logWarning(message: string) {
  log(YELLOW, '⚠', message);
}

async function main() {
  const baseUrl = process.env.ARCHIVAS_RPC_BASE || 'https://seed.archivas.ai';
  const testAddress = process.env.ARCHIVAS_TEST_ADDRESS;
  const shouldBroadcast = process.env.ARCHIVAS_BROADCAST === '1';
  const testPrivKey = process.env.ARCHIVAS_TEST_PRIVKEY;

  console.log('\n' + '='.repeat(60));
  logInfo('Archivas SDK Connectivity Verification');
  console.log('='.repeat(60) + '\n');

  logInfo(`RPC Endpoint: ${baseUrl}`);
  console.log();

  // Initialize RPC client
  const rpc = createRpcClient({ baseUrl, timeout: 10000 });

  // Test 1: Get chain tip
  try {
    logInfo('Testing /chainTip endpoint...');
    const chainTip = await rpc.getChainTip();
    
    console.log(JSON.stringify(chainTip, null, 2));
    logSuccess(`Chain tip retrieved - Height: ${chainTip.height}`);
    console.log();
  } catch (error) {
    logError(`Failed to fetch chain tip: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  // Test 2: Get account (if address provided)
  if (testAddress) {
    try {
      logInfo(`Testing /account endpoint with ${testAddress}...`);
      const account = await rpc.getAccount(testAddress);
      
      console.log(JSON.stringify(account, null, 2));
      logSuccess(`Account retrieved - Balance: ${account.balance}, Nonce: ${account.nonce}`);
      console.log();
    } catch (error) {
      logError(`Failed to fetch account: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  } else {
    logInfo('Skipping /account test (ARCHIVAS_TEST_ADDRESS not set)');
    console.log();
  }

  // Test 3: Build and sign dummy transaction
  try {
    logInfo('Building dummy transaction (transfer)...');
    
    // Generate throwaway mnemonic for testing
    const mnemonic = Derivation.mnemonicGenerate();
    const keyPair = await Derivation.fromMnemonic(mnemonic);
    const fromAddress = Derivation.toAddress(keyPair.publicKey);
    
    // Build dummy transaction
    const tx: TxBody = Tx.buildTransfer({
      from: fromAddress,
      to: 'arcv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsj2mcx', // Burn address
      amount: '1000000', // 0.01 RCHV
      fee: '100000',     // 0.001 RCHV
      nonce: '0',
      memo: 'SDK connectivity test'
    });

    logSuccess('Transaction built');
    console.log('  From:', tx.from);
    console.log('  To:', tx.to);
    console.log('  Amount:', tx.amount);
    console.log('  Fee:', tx.fee);
    console.log();

    // Compute canonical bytes
    logInfo('Computing canonical bytes (RFC 8785)...');
    const canonicalBytes = Tx.canonicalBytes(tx);
    logSuccess(`Canonical bytes: ${canonicalBytes.length} bytes`);
    console.log();

    // Compute hash
    logInfo('Computing Blake2b hash with domain "Archivas-TxV1"...');
    const txHash = Tx.hash(tx);
    const hashHex = bytesToHex(txHash);
    logSuccess(`Transaction hash: ${hashHex}`);
    console.log();

    // Sign transaction
    logInfo('Signing transaction with Ed25519...');
    const { sigHex, pubHex } = await Tx.sign(tx, keyPair.secretKey);
    logSuccess('Transaction signed');
    console.log('  Signature:', sigHex.slice(0, 32) + '...');
    console.log('  Public Key:', pubHex);
    console.log();

    // Note: Do not log the secret key (mnemonic or private key)
    logWarning('Test transaction created with throwaway keys (not broadcasted)');
    console.log();

  } catch (error) {
    logError(`Failed to build/sign transaction: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  // Test 4: Optional broadcast (only if explicitly requested)
  if (shouldBroadcast) {
    if (!testPrivKey) {
      logError('ARCHIVAS_BROADCAST=1 but ARCHIVAS_TEST_PRIVKEY not set');
      process.exit(1);
    }

    try {
      logWarning('Broadcasting test transaction (ARCHIVAS_BROADCAST=1)...');
      
      // Parse private key (must be 64 bytes hex)
      const secretKey = hexToBytes(testPrivKey);
      if (secretKey.length !== 64) {
        throw new Error('ARCHIVAS_TEST_PRIVKEY must be 64 bytes (128 hex chars)');
      }

      const publicKey = secretKey.slice(32, 64);
      const fromAddress = Derivation.toAddress(publicKey);

      // Get current nonce
      const account = await rpc.getAccount(fromAddress);
      
      // Build real transaction (tiny amount)
      const tx = Tx.buildTransfer({
        from: fromAddress,
        to: 'arcv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsj2mcx', // Burn address
        amount: '1000',    // 0.00001 RCHV
        fee: '100000',     // 0.001 RCHV
        nonce: account.nonce,
        memo: 'SDK test broadcast'
      });

      // Sign and submit
      const signedTx = await Tx.createSigned(tx, secretKey);
      const result = await rpc.submit(signedTx);

      if (result.ok && result.hash) {
        logSuccess(`Transaction broadcast successful!`);
        console.log('  Hash:', result.hash);
      } else {
        logError(`Transaction rejected: ${result.error || 'Unknown error'}`);
        process.exit(1);
      }
      console.log();

    } catch (error) {
      logError(`Failed to broadcast transaction: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  } else {
    logInfo('Skipping broadcast test (ARCHIVAS_BROADCAST not set to "1")');
    console.log();
  }

  // All tests passed
  console.log('='.repeat(60));
  logSuccess('All connectivity tests passed!');
  console.log('='.repeat(60) + '\n');
  
  process.exit(0);
}

// Run main and handle errors
main().catch((error) => {
  logError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
  console.error(error);
  process.exit(1);
});

