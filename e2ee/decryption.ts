import { base64ToBuffer } from "./keys";

export async function decryptMessageWithAES(
  aesKey: CryptoKey,
  encryptedData: { ciphertext: string; iv: string }
): Promise<string> {
  const decoder = new TextDecoder();
  const ciphertextBuffer = base64ToBuffer(encryptedData.ciphertext);
  const ivBuffer = base64ToBuffer(encryptedData.iv);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivBuffer,
    },
    aesKey,
    ciphertextBuffer
  );

  return decoder.decode(decrypted);
}

