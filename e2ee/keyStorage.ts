// utils/db.ts
import { openDB } from "idb";

const DB_NAME = "SecureKeysDB";
const STORE_NAME = "keys";

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "username" });
      }
    },
  });
}

export async function storeEncryptedPrivateKey({
  username,
  ciphertext,
  salt,
  iv,
}: {
  username: string; // usually user's ID or username
  ciphertext: string;
  salt: string;
  iv: string;
}) {
  const db = await getDB();
  await db.put(STORE_NAME, {
    username,
    ciphertext,
    salt,
    iv,
  });
}

export async function getEncryptedPrivateKey(username: string) {
  const db = await getDB();
  return await db.get(STORE_NAME, username);
}

export async function deleteEncryptedPrivateKey(username: string) {
  const db = await getDB();
  await db.delete(STORE_NAME, username);
}


interface AESKeyRecord {
  id: string; // fixed ID like "aesKey"
  encryptedKey: string; // base64 or stringified key
}

export async function storeAESKey(encryptedKey: string): Promise<void> {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });

  const record: AESKeyRecord = {
    id: "aesKey",
    encryptedKey,
  };

  await db.put(STORE_NAME, record);
  console.log("AES key stored successfully in IndexedDB.");
}


export async function getAESKey(): Promise<string | null> {
  const db = await openDB(DB_NAME, 1);

  const record = await db.get(STORE_NAME, "aesKey");

  if (!record) {
    console.warn("No AES key found in IndexedDB.");
    return null;
  }

  return record.encryptedKey; // this is your base64 or stringified encrypted AES key
}