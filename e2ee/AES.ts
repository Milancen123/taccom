import { decryptPrivateKeyFromStorage } from "./decryptPrivateKey";
import { base64ToBuffer, bufferToBase64 } from "./keys";

export async function generateAESKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256, // 256-bit key
    },
    true, // extractable (set to false if you don’t want to export it)
    ["encrypt", "decrypt"]
  );
}


export async function exportAESKey(key: CryptoKey): Promise<string> {
  const rawKey = await window.crypto.subtle.exportKey("raw", key);
  return bufferToBase64(rawKey);
}

export async function importAESKey(base64Key: string): Promise<CryptoKey> {
  const raw = base64ToBuffer(base64Key);
  return await window.crypto.subtle.importKey(
    "raw",
    raw,
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  );
}




export async function encryptAESKeyWithPublicKey(
  aesKey: CryptoKey,
  publicKey: CryptoKey
): Promise<string> {
  // Export raw AES key
  const rawAESKey = await crypto.subtle.exportKey("raw", aesKey); // ArrayBuffer

  // Encrypt AES key with recipient's RSA public key
  const encryptedAESKey = await crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    rawAESKey // What we’re encrypting
  );

  // Convert to base64 for storage or sending
  return bufferToBase64(encryptedAESKey);
}




export async function decryptAESKey(
  decryptedPrivateKey: CryptoKey,
  encryptedAESKey: ArrayBuffer | Uint8Array
): Promise<CryptoKey> {
  // 🔐 Ensure you're passing a valid BufferSource (Uint8Array)
  const encryptedBuffer =
    encryptedAESKey instanceof Uint8Array
      ? encryptedAESKey
      : new Uint8Array(encryptedAESKey); // convert ArrayBuffer to Uint8Array

  // 🧩 Decrypt the AES key
  const rawAESKey = await crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    decryptedPrivateKey,
    encryptedBuffer
  );

  // 🔐 Import usable AES CryptoKey
  const aesKey = await crypto.subtle.importKey(
    "raw",
    rawAESKey,
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  );

  return aesKey;
}






