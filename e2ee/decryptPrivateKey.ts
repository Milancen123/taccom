import { base64ToBuffer } from "./keys";

export async function decryptPrivateKeyFromStorage(
  encryptedBase64: string,
  password: string,
  saltBase64: string,
  ivBase64: string
): Promise<CryptoKey> {


    
  const encryptedBuffer = base64ToBuffer(encryptedBase64);
  const salt = base64ToBuffer(saltBase64);
  const iv = base64ToBuffer(ivBase64);

  // Step 1: Derive AES key from password using PBKDF2
  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const aesKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  // Step 2: Decrypt the encrypted private key
  const decryptedPrivateKey = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    aesKey,
    encryptedBuffer
  );

  // Step 3: Import the decrypted key into usable CryptoKey
  return await crypto.subtle.importKey(
    "pkcs8",
    decryptedPrivateKey,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"]
  );
}