// Test the pubkey from the wallet
const pubkey = "DRJnAwrnroHP6zDIxwsVoSzhcuegzpnNHx19SBQKwNA=";

// Decode from base64
const decoded = Buffer.from(pubkey, 'base64');

console.log('Pubkey (base64):', pubkey);
console.log('Length (base64 string):', pubkey.length);
console.log('Decoded length (bytes):', decoded.length);
console.log('Decoded (hex):', decoded.toString('hex'));

if (decoded.length !== 32) {
  console.error('❌ PROBLEM: Pubkey is', decoded.length, 'bytes, should be 32!');
} else {
  console.log('✅ Pubkey is exactly 32 bytes');
}
