import { Derivation, Tx, createRpcClient } from './dist/index.js';

async function test() {
  const mnemonic = "sea enact useless pill defy offer palace joy cinnamon swift entire fork deny denial deal shaft life method depart toss menu defense effort flip";
  
  const kp = Derivation.fromMnemonic(mnemonic);
  const address = Derivation.toAddress(kp.publicKey);
  
  const rpc = createRpcClient({ baseUrl: 'https://seed.archivas.ai' });
  const account = await rpc.getAccount(address);
  
  console.log('Submitting transaction...');
  
  const tx = Tx.buildTransfer({
    from: address,
    to: "arcv15jc7kzyakdy56edrh8aw6v3frzmhntecere2p7",
    amount: 100000000,
    fee: 100000,
    nonce: parseInt(account.nonce)
  });
  
  const signed = Tx.createSigned(tx, kp.secretKey);
  const result = await rpc.submit(signed);
  
  console.log('Submit result:', result);
  
  // Check mempool IMMEDIATELY
  console.log('\nChecking mempool...');
  const mempool = await rpc.getMempool();
  console.log('Mempool:', mempool);
  
  // Check if transaction exists
  console.log('\nChecking transaction...');
  const txDetails = await rpc.getTx(result.hash);
  console.log('Transaction:', txDetails);
}

test().catch(console.error);
