// Test the exact signature from the wallet
const sig = "nvtSjUmilbfZP9Se7u1GDDLHf/aXqWJQ9sJMal3iwhtLEx8dlTxrNqEkY0ov81zinnkfUK3D42Ag9YorcKdrBw==";

// Decode from base64
const decoded = Buffer.from(sig, 'base64');

console.log('Signature (base64):', sig);
console.log('Length (base64 string):', sig.length);
console.log('Decoded length (bytes):', decoded.length);
console.log('Decoded (hex):', decoded.toString('hex'));

if (decoded.length !== 64) {
  console.error('❌ PROBLEM: Signature is', decoded.length, 'bytes, should be 64!');
} else {
  console.log('✅ Signature is exactly 64 bytes');
}
