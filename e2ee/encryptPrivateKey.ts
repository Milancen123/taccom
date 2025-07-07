
import { base64ToBuffer, bufferToBase64 } from "./keys";

export async function encryptPrivateKey(
  privateKey: ArrayBuffer,
  password: string
): Promise<{
  ciphertext: string;
  salt: string;
  iv: string;
}> {
  // 1. Generate random salt & IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // 2. Derive AES key from password using PBKDF2
  const keyMaterial = await getKeyMaterial(password);
  const aesKey = await deriveAESKey(keyMaterial, salt);

  // 3. Encrypt the private key
  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    aesKey,
    privateKey
  );

  return {
    ciphertext: bufferToBase64(encrypted),
    salt: bufferToBase64(salt.buffer),
    iv: bufferToBase64(iv.buffer),
  };
}

async function getKeyMaterial(password: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
}

async function deriveAESKey(
  keyMaterial: CryptoKey,
  salt: Uint8Array
): Promise<CryptoKey> {
  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"]
  );
}