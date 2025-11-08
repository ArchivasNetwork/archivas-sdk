import { Derivation, Tx, createRpcClient } from './dist/index.js';

async function testSend() {
  const mnemonic = "sea enact useless pill defy offer palace joy cinnamon swift entire fork deny denial deal shaft life method depart toss menu defense effort flip";
  
  const kp = Derivation.fromMnemonic(mnemonic);
  const address = Derivation.toAddress(kp.publicKey);
  
  console.log('Address:', address);
  
  const rpc = createRpcClient({ baseUrl: 'https://seed.archivas.ai' });
  const account = await rpc.getAccount(address);
  console.log('Balance:', account.balance);
  console.log('Nonce:', account.nonce);
  
  // If this has funds, send 1 RCHV to Server A
  if (BigInt(account.balance) > 0) {
    console.log('\n✅ This wallet has funds! Sending 1 RCHV...\n');
    
    const tx = Tx.buildTransfer({
      from: address,
      to: "arcv1t3huuyd08er3yfnmk9c935rmx3wdh5j6m2uc9d",
      amount: 100000000,  // 1 RCHV
      fee: 100000,
      nonce: parseInt(account.nonce)
    });
    
    console.log('Transaction:', JSON.stringify(tx, null, 2));
    
    const signed = Tx.createSigned(tx, kp.secretKey);
    console.log('\nSigned tx:', JSON.stringify(signed, null, 2));
    
    const result = await rpc.submit(signed);
    console.log('\nResult:', result);
    
    if (result.ok) {
      console.log('✅ Transaction submitted! Hash:', result.hash);
      
      await new Promise(r => setTimeout(r, 30000));
      
      const newAccount = await rpc.getAccount(address);
      console.log('\nNew balance:', newAccount.balance);
      console.log('New nonce:', newAccount.nonce);
    } else {
      console.log('❌ Failed:', result.error);
    }
  } else {
    console.log('❌ This wallet has no funds');
  }
}

testSend().catch(console.error);
