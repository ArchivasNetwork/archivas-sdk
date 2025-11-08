import { Derivation, Tx, createRpcClient } from './dist/index.js';

async function testSend() {
  const mnemonic = "sea enact useless pill defy offer palace joy cinnamon swift entire fork deny denial deal shaft life method depart toss menu defense effort flip";
  
  const kp = Derivation.fromMnemonic(mnemonic);
  const address = Derivation.toAddress(kp.publicKey);
  
  console.log('From address:', address);
  
  const rpc = createRpcClient({ baseUrl: 'https://seed.archivas.ai' });
  
  const account = await rpc.getAccount(address);
  console.log('Balance:', account.balance);
  console.log('Nonce:', account.nonce);
  
  if (BigInt(account.balance) === 0n) {
    console.log('❌ No balance! Cannot send.');
    return;
  }
  
  // Build transaction (send 1 RCHV to test address)
  const tx = Tx.buildTransfer({
    from: address,
    to: "arcv15jc7kzyakdy56edrh8aw6v3frzmhntecere2p7",
    amount: 100000000,  // 1 RCHV
    fee: 100000,
    nonce: parseInt(account.nonce)
  });
  
  console.log('\nTransaction:', JSON.stringify(tx, null, 2));
  
  const signed = Tx.createSigned(tx, kp.secretKey);
  console.log('\nSigned tx:', JSON.stringify(signed, null, 2));
  
  console.log('\nSubmitting...');
  const result = await rpc.submit(signed);
  console.log('Result:', result);
  
  if (result.ok) {
    console.log('\n✅ SUCCESS! Hash:', result.hash);
    
    // Wait 30s and check if it went through
    console.log('\nWaiting 30s for confirmation...');
    await new Promise(r => setTimeout(r, 30000));
    
    const newAccount = await rpc.getAccount(address);
    console.log('Old nonce:', account.nonce);
    console.log('New nonce:', newAccount.nonce);
    console.log('Old balance:', account.balance);
    console.log('New balance:', newAccount.balance);
    
    if (newAccount.nonce !== account.nonce) {
      console.log('\n🎉 TRANSACTION CONFIRMED!');
    } else {
      console.log('\n❌ Transaction accepted but not executed');
    }
  } else {
    console.log('\n❌ FAILED:', result.error);
  }
}

testSend().catch(console.error);
