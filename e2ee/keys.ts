// keys.ts

export async function generateRSAKeyPair(): Promise<{
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048, // good balance between security and performance
      publicExponent: new Uint8Array([1, 0, 1]), // 65537
      hash: "SHA-256",
    },
    true, // extractable (so we can export later)
    ["encrypt", "decrypt"]
  );

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  };
}



// Export public key as base64-encoded string
export async function exportPublicKey(publicKey: CryptoKey): Promise<string> {
  const spki = await window.crypto.subtle.exportKey("spki", publicKey);
  return bufferToBase64(spki);
}

// Export private key (to be encrypted before storing)
export async function exportPrivateKey(privateKey: CryptoKey): Promise<ArrayBuffer> {
  return await window.crypto.subtle.exportKey("pkcs8", privateKey);
}

export async function importPublicKey(base64Key: string): Promise<CryptoKey> {
  const keyBuffer = base64ToBuffer(base64Key);

  return crypto.subtle.importKey(
    "spki",                  // format
    keyBuffer,               // key data
    {
      name: "RSA-OAEP",      // algorithm used for encryption/decryption
      hash: "SHA-256",       // must match your usage
    },
    true,                    // extractable
    ["encrypt"]              // key usages
  );
}

// Utility function: ArrayBuffer → Base64
export function bufferToBase64(buffer: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(buffer));
  return btoa(binary);
}

// Utility function: Base64 → ArrayBuffer
export function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer.buffer;
}