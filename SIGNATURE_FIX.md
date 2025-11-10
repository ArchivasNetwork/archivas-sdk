# Signature Encoding Fix - v1.3.0

## 🐛 Issue Fixed

### Problem
The Archivas API was rejecting signed transactions with the error:
```
"Verification error: invalid signature: signature must be 64 bytes, got 96"
```

### Root Cause
**Encoding Mismatch:**
- SDK was sending signatures as **HEX strings** (128 characters)
- API expected signatures as **BASE64 strings** (88 characters)
- When the API decoded the hex string as base64, it produced 96 bytes instead of 64 bytes

### The Math
```
Correct (BASE64):
  64 bytes → 88 base64 chars → decodes to 64 bytes ✅

Incorrect (HEX):
  64 bytes → 128 hex chars → decoded as base64 → 96 bytes ❌
```

## ✅ Solution

### Changes Made

1. **Updated `Tx.createSigned()`** to encode signatures and public keys as base64
2. **Updated `Tx.createSignedFromRawKey()`** to use base64 encoding
3. **Updated `Tx.createSignedFromHexKey()`** to use base64 encoding
4. **Added helper functions**:
   - `bytesToBase64()` - browser and Node.js compatible
   - `base64ToBytes()` - for reverse conversion
   - `Tx.base64ToHex()` - debugging helper

### Example Output

**Before (v1.2.1):**
```json
{
  "pubkey": "e96b1c6b8769fdb0b34fbecfdf85c33b053cecad9517e1ab88cba614335775c1",
  "sig": "d0704dc81c0a1a47fcdbffbb31792913c0c7d475550668d09285cf8b49d5cc7f0e07852b5f4ae7f18c9bba70dbb618b76596101cdc5583748a48c8430da71d06"
}
```

**After (v1.3.0):**
```json
{
  "pubkey": "6Wsca4dp/bCzT77P34XDOwU87K2VF+GriMumFDNXdcE=",
  "sig": "0HBNyBwKGkf82/+7MXkpE8DH1HVVBmjQkoXPi0nVzH8OB4UrX0rn8YybunDbthi3ZZYQHNxVg3SKSMhDDacdBg=="
}
```

## 🔧 Migration Guide

### For SDK Users

If you're upgrading from v1.2.1 to v1.3.0:

**No code changes needed!** The API is the same, only the internal encoding changed.

```typescript
import { Derivation, Tx, createRpcClient } from '@archivasnetwork/sdk';

// Everything works the same
const keyPair = Derivation.fromMnemonic(mnemonic);
const tx = Tx.buildTransfer({ ... });
const signedTx = Tx.createSigned(tx, keyPair.secretKey);

// Now this will work!
const client = createRpcClient();
const result = await client.submit(signedTx); // ✅ No more signature errors!
```

### For Debugging

If you need to convert signatures between formats:

```typescript
import { Tx } from '@archivasnetwork/sdk';

// Convert base64 signature to hex (for inspection)
const hexSig = Tx.base64ToHex(signedTx.sig);
console.log('Signature (hex):', hexSig);
```

## 📝 Updated Tests

All tests have been updated to expect base64-encoded outputs:

- ✅ `test/tx.spec.ts` - Core transaction tests
- ✅ `test/raw-key-signing.spec.ts` - Raw key signing tests
- ✅ `test/derivation.spec.ts` - Derivation tests
- ✅ `test/explorer.spec.ts` - Explorer API tests

## 🚀 Release Notes

### Version 1.3.0 (November 8, 2025)

**Breaking Change (Internal):**
- Signatures and public keys are now base64-encoded instead of hex-encoded
- This fixes API compatibility issues
- The change is transparent to most users

**Fixed:**
- ✅ Signature verification errors when submitting transactions
- ✅ "signature must be 64 bytes, got 96" API error

**Added:**
- `Tx.base64ToHex()` helper for debugging
- Browser-compatible base64 encoding/decoding

## 🧪 Verification

To verify signatures are correctly encoded:

```bash
npm test  # All tests should pass
```

To test with live API:

```bash
npm run verify  # Connects to seed.archivas.ai
```

## 📚 References

- [Base64 Encoding](https://en.wikipedia.org/wiki/Base64)
- [Ed25519 Signature Format](https://ed25519.cr.yp.to/)
- [Archivas API Documentation](https://github.com/ArchivasNetwork/archivas)

---

**Date**: November 8, 2025  
**Issue**: Signature encoding mismatch  
**Status**: ✅ Fixed in v1.3.0

