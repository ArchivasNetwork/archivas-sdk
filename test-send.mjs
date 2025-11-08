import { Derivation, Tx, createRpcClient } from './dist/index.js';

async function testSend() {
  // Use the wallet that has 100k RCHV
  const mnemonic = "fetch fury spoil churn trumpet cattle awkward dolphin fiscal valve pink filter write stumble wash safe year option angle erase coil tray iron chaos";
  
  const kp = Derivation.fromMnemonic(mnemonic);
  const address = Derivation.toAddress(kp.publicKey);
  
  console.log('From address:', address);
  
  // Connect to seed
  const rpc = createRpcClient({ baseUrl: 'https://seed.archivas.ai' });
  
  // Get account
  const account = await rpc.getAccount(address);
  console.log('Balance:', account.balance);
  console.log('Nonce:', account.nonce);
  
  // Build transaction (send 1 RCHV to Server A)
  const tx = Tx.buildTransfer({
    from: address,
    to: "arcv1t3huuyd08er3yfnmk9c935rmx3wdh5j6m2uc9d",
    amount: 100000000,  // 1 RCHV
    fee: 100000,        // 0.001 RCHV
    nonce: parseInt(account.nonce)
  });
  
  console.log('\nTransaction:', JSON.stringify(tx, null, 2));
  
  // Sign
  const signed = Tx.createSigned(tx, kp.secretKey);
  console.log('\nSigned tx:', JSON.stringify(signed, null, 2));
  
  // Submit
  console.log('\nSubmitting to seed.archivas.ai...');
  const result = await rpc.submit(signed);
  console.log('Result:', result);
  
  if (result.ok) {
    console.log('✅ Transaction submitted! Hash:', result.hash);
    
    // Wait and check balance
    console.log('\nWaiting 30 seconds for confirmation...');
    await new Promise(r => setTimeout(r, 30000));
    
    const newAccount = await rpc.getAccount(address);
    console.log('New balance:', newAccount.balance);
    console.log('New nonce:', newAccount.nonce);
  } else {
    console.log('❌ Failed:', result.error);
  }
}

testSend().catch(console.error);
