# Archivas SDK

> Official TypeScript SDK for Archivas blockchain (v1.1.0 API)

[![npm version](https://badge.fury.io/js/%40archivas%2Fsdk.svg)](https://www.npmjs.com/package/@archivas/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

✅ **Ed25519 Keypairs** - BIP39 + SLIP-0010 derivation  
✅ **Bech32 Addresses** - `arcv` prefix  
✅ **Transaction Signing** - RFC 8785 canonical JSON + Blake2b hashing  
✅ **RPC Client** - Full v1.1.0 API support  
✅ **Browser & Node.js** - Universal compatibility  
✅ **TypeScript** - Full type safety  

---

## Installation

```bash
npm install @archivas/sdk
# or
yarn add @archivas/sdk
# or
pnpm add @archivas/sdk
```

---

## Quick Start

### Generate Wallet

```typescript
import { Derivation } from '@archivas/sdk';

// Generate new mnemonic
const mnemonic = Derivation.mnemonicGenerate();
console.log('Mnemonic:', mnemonic);

// Derive keypair
const keyPair = await Derivation.fromMnemonic(mnemonic);
console.log('Public Key:', Buffer.from(keyPair.publicKey).toString('hex'));

// Get address
const address = Derivation.toAddress(keyPair.publicKey);
console.log('Address:', address);  // arcv1...
```

### Send Transaction

```typescript
import { Derivation, Tx, createRpcClient } from '@archivas/sdk';

// Setup
const mnemonic = "your 24 word mnemonic here";
const keyPair = await Derivation.fromMnemonic(mnemonic);
const address = Derivation.toAddress(keyPair.publicKey);

// Connect to RPC
const rpc = createRpcClient({ baseUrl: 'https://seed.archivas.ai' });

// Get current nonce
const account = await rpc.getAccount(address);

// Build transaction
const tx = Tx.buildTransfer({
  from: address,
  to: 'arcv1recipient...',
  amount: '100000000',  // 1 RCHV (8 decimals)
  fee: '100000',        // 0.001 RCHV
  nonce: account.nonce,
  memo: 'Hello Archivas!'  // optional
});

// Sign transaction
const signedTx = await Tx.createSigned(tx, keyPair.secretKey);

// Submit to network
const result = await rpc.submit(signedTx);
console.log('Transaction hash:', result.hash);
```

### Query Chain

```typescript
import { createRpcClient } from '@archivas/sdk';

const rpc = createRpcClient();

// Get chain tip
const tip = await rpc.getChainTip();
console.log('Height:', tip.height);
console.log('Hash:', tip.hash);

// Get balance
const balance = await rpc.getBalance('arcv1...');
console.log('Balance:', balance.toString(), 'base units');

// Get mempool
const pending = await rpc.getMempool();
console.log('Pending transactions:', pending.length);
```

---

## API Reference

### Derivation

**`Derivation.mnemonicGenerate(): string`**
- Generates a new 24-word BIP39 mnemonic

**`Derivation.fromMnemonic(mnemonic: string, passphrase?: string): Promise<KeyPair>`**
- Derives Ed25519 keypair from mnemonic using SLIP-0010 (path: m/734'/0'/0'/0/0)

**`Derivation.toAddress(publicKey: Uint8Array): Address`**
- Converts 32-byte public key to Bech32 address (`arcv` prefix)

**`Derivation.mnemonicToAddress(mnemonic: string, passphrase?: string): Promise<Address>`**
- Convenience: mnemonic → address in one call

### Tx

**`Tx.buildTransfer(params): TxBody`**
- Builds a transfer transaction body
- Validates memo length (max 256 bytes UTF-8)

**`Tx.canonicalBytes(tx: TxBody): Uint8Array`**
- Serializes transaction to RFC 8785 canonical JSON

**`Tx.hash(tx: TxBody): Uint8Array`**
- Computes transaction hash: `blake2b-256("Archivas-TxV1" || canonical bytes)`

**`Tx.sign(tx: TxBody, secretKey: Uint8Array): Promise<{sigHex, pubHex, hashHex}>`**
- Signs transaction with Ed25519
- Returns signature, public key, and hash as hex strings

**`Tx.createSigned(tx: TxBody, secretKey: Uint8Array): Promise<SignedTx>`**
- Convenience: builds complete SignedTx object for broadcast

**`Tx.estimateSize(tx: TxBody): number`**
- Returns transaction size in bytes (for fee estimation)

### RpcClient

**`new RpcClient(config?: RpcConfig)`**
- Creates RPC client
- Config: `{ baseUrl?, timeout?, headers? }`
- Default: `https://seed.archivas.ai`

**`rpc.getAccount(address: Address): Promise<Account>`**
- Returns `{ address, balance, nonce }` (all strings)

**`rpc.getChainTip(): Promise<ChainTip>`**
- Returns `{ height, hash, difficulty }` (all strings)

**`rpc.getMempool(): Promise<readonly string[]>`**
- Returns array of pending transaction hashes

**`rpc.getTx(hash: string): Promise<TxDetails>`**
- Returns transaction details

**`rpc.estimateFee(bytes: number): Promise<FeeEstimate>`**
- Returns `{ fee: string }` for given transaction size

**`rpc.submit(stx: SignedTx): Promise<SubmitResponse>`**
- Submits signed transaction
- Returns `{ ok: boolean, hash?: string, error?: string }`

**Convenience methods:**
- `rpc.getBalance(address): Promise<bigint>` - Balance as bigint
- `rpc.getNonce(address): Promise<bigint>` - Nonce as bigint

---

## Types

```typescript
type Address = `arcv${string}`;

interface KeyPair {
  publicKey: Uint8Array;   // 32 bytes
  secretKey: Uint8Array;   // 64 bytes
}

interface TxBody {
  type: "transfer";
  from: Address;
  to: Address;
  amount: string;   // u64 as string
  fee: string;      // u64 as string
  nonce: string;    // u64 as string
  memo?: string;    // optional, max 256 bytes
}

interface SignedTx {
  tx: TxBody;
  pubkey: string;  // hex
  sig: string;     // hex
  hash: string;    // hex
}
```

---

## Constants

```typescript
import { ARCHIVAS_CONSTANTS } from '@archivas/sdk';

ARCHIVAS_CONSTANTS.COIN_TYPE          // 734
ARCHIVAS_CONSTANTS.DERIVATION_PATH    // "m/734'/0'/0'/0/0"
ARCHIVAS_CONSTANTS.ADDRESS_PREFIX     // "arcv"
ARCHIVAS_CONSTANTS.DECIMALS           // 8
ARCHIVAS_CONSTANTS.MAX_MEMO_LENGTH    // 256
ARCHIVAS_CONSTANTS.DOMAIN_SEPARATOR   // "Archivas-TxV1"
ARCHIVAS_CONSTANTS.DEFAULT_RPC        // "https://seed.archivas.ai"
```

---

## Advanced Usage

### Custom RPC Endpoint

```typescript
const rpc = createRpcClient({
  baseUrl: 'http://localhost:8080',
  timeout: 60000,
  headers: { 'X-Custom-Header': 'value' }
});
```

### Transaction with Memo

```typescript
const tx = Tx.buildTransfer({
  from: myAddress,
  to: recipientAddress,
  amount: '500000000',  // 5 RCHV
  fee: '100000',
  nonce: '0',
  memo: 'Payment for services'
});
```

### Manual Signing

```typescript
const txHash = Tx.hash(tx);
const { sigHex, pubHex } = await Tx.sign(tx, secretKey);

// Use sigHex, pubHex, and bytesToHex(txHash) for broadcast
```

---

## Security

- 🔒 **Never log secret keys** - SDK does not log sensitive data
- 🔒 **No key persistence** - Keys exist only in memory
- 🔒 **Deterministic signing** - RFC 8785 canonical JSON ensures reproducible hashes
- 🔒 **Audited dependencies** - Uses `@noble/*` (audited crypto libraries)

**Best practices:**
- Store mnemonics encrypted (use WebCrypto `SubtleCrypto` for encryption)
- Wipe secret key buffers after use: `secretKey.fill(0)`
- Validate addresses before sending
- Always verify transaction details before signing

---

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Lint
npm run lint
```

---

## Compatibility

- ✅ Node.js >= 18.0.0
- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ React, Vue, Angular, Svelte
- ✅ React Native (with polyfills)

---

## License

MIT © 2025 Archivas Network

---

## Links

- [GitHub Repository](https://github.com/ArchivasNetwork/archivas-sdk)
- [Archivas Documentation](https://github.com/ArchivasNetwork/archivas)
- [API Specification](https://github.com/ArchivasNetwork/archivas/blob/main/specs/api-wallet-v1.md)
- [NPM Package](https://www.npmjs.com/package/@archivas/sdk)

---

## Support

- Issues: https://github.com/ArchivasNetwork/archivas-sdk/issues
- Discord: [Join our community](#)
- Email: support@archivas.ai

