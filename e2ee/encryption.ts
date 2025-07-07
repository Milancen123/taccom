import { bufferToBase64 } from "./keys";

export async function encryptMessageWithAES(
  aesKey: CryptoKey,
  message: string
): Promise<{ ciphertext: string; iv: string }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);

  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    aesKey,
    data
  );

  return {
    ciphertext: bufferToBase64(encrypted),
    iv: bufferToBase64(iv.buffer),
  };
}