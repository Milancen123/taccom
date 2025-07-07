"use client";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

import { getAESKey, getEncryptedPrivateKey, storeEncryptedPrivateKey } from "@/e2ee/keyStorage";
import { decryptAESKey, encryptAESKeyWithPublicKey, generateAESKey, importAESKey } from "@/e2ee/AES";
import { fetchPublicKeys } from "@/e2ee/fetchPublicKeys";
import { base64ToBuffer, exportPrivateKey, exportPublicKey, generateRSAKeyPair, importPublicKey } from "@/e2ee/keys";
import { sendEncryptedKeysToServer } from "@/e2ee/sendEncryptedKeysToServer";
import { decryptPrivateKeyFromStorage } from "@/e2ee/decryptPrivateKey";
import { encryptPrivateKey } from "@/e2ee/encryptPrivateKey";
import { savePublicKeyToServer } from "@/e2ee/sendPublicKeyToServer";
import { fetchEncryptedAESchannelKey } from "@/e2ee/fetchEncryptedAESchannelKey";
import router, { useRouter } from "next/navigation";



interface EncryptionContextType {
decryptedPrivateKey: CryptoKey | null;
aesKey: CryptoKey | null;
encryptMessage: (message: string) => Promise<any>;
decryptMessage: (ciphertext: string) => Promise<any>;
isReady: boolean;
}

interface userPublicKeys {
    user_id: string;
    public_key:string;
}

interface encryptedAESkeys {
    user_id: string;
    encrypted_channel_key:string;
}


const EncryptionContext = createContext<EncryptionContextType | undefined>(undefined);


export const EncryptionProvider = ({ children, currentUser, socket }: { children: React.ReactNode, currentUser:any, socket:any}) => {
const router = useRouter();
const effectRan = useRef(false);
const [decryptedPrivateKey, setDecryptedPrivateKey] = useState<CryptoKey | null>(null);
const [username, setUsername] = useState(currentUser.username);
const [aesKey, setAESKey] = useState<CryptoKey | null>(null);
const [isReady, setIsReady] = useState(false);


useEffect(() => {
    if (effectRan.current) return;
    (async () => {
        try {
            const encrypted = await getEncryptedPrivateKey(username);
            console.log(encrypted);
            let password;
            let privateKey;
            if(!encrypted) {
                //generate a key pair, and save a private key in the indexeddb and public key to the server database
                const keyPair = await generateRSAKeyPair();
                const exportedPrivateKey = await exportPrivateKey(keyPair.privateKey);
                setDecryptedPrivateKey(keyPair.privateKey);
                console.log("Private key: ", keyPair.privateKey);
                const exportedPublicKey = await exportPublicKey(keyPair.publicKey);
                console.log("Public key: ", exportedPublicKey);
                //password = prompt("Enter your password to generate a private key:")!;
                password="Vojnaakademija123#";
                const {ciphertext, salt, iv} = await encryptPrivateKey(exportedPrivateKey, password);

                //save to indexdb
                await storeEncryptedPrivateKey({username:username, ciphertext:ciphertext, salt:salt, iv:iv});
                //store public key to database
                await savePublicKeyToServer(exportedPublicKey);

            }else{
                //password = prompt("Enter your password to unlock private key:")!;
                password="Vojnaakademija123#";
                console.log("Password: ", password);
                console.log("Ovde smo sada iznad private key");
                privateKey = await decryptPrivateKeyFromStorage(encrypted.ciphertext, password, encrypted.salt, encrypted.iv);
                console.log("Ovde smo sada, ispod private key");
                setDecryptedPrivateKey(privateKey);
                if (!(privateKey instanceof CryptoKey)) {
                    throw new Error("Invalid private key: not a CryptoKey");
                }
            }

            //if(!privateKey) return;


            if(username === "admin"){
                console.log("ADMIN JEEEEE");
                const AESkey = await fetchEncryptedAESchannelKey();
                console.log("OVO DOBIJAMO ZA ADMINA SADA KADA FECUJEM");
                console.log(AESkey);


                if(AESkey.length != 0){
                    //update all users with the aes key in case someone lost it or somthing else happenede, refresh their aes key
                    console.log("Sada dekriptujemo aes kljuc");
                    let decryptedAESkey:CryptoKey;
                    try{
                        if(!(privateKey instanceof CryptoKey)) throw new Error("nije instance cryptokljuca");
                        if(!(base64ToBuffer(AESkey[0].encrypted_channel_key) instanceof ArrayBuffer)) throw new Error("nije instance array buffera");
                        
                        decryptedAESkey = await decryptAESKey(privateKey, base64ToBuffer(AESkey[0].encrypted_channel_key));
                        console.log("dekriptovali smo ga"); 
                        setAESKey(decryptedAESkey);
                    }catch(err){
                        console.error("Failed to decrypt AES key: ", err);
                    }
                    const all_users_public_keys:userPublicKeys[] | null = await fetchPublicKeys(); // {user_id, public_key}
                    console.log(all_users_public_keys);
                    console.log("ovo iznad su javni kljucevi");
                    if(!all_users_public_keys) return;

                    //encrypt AES key with each user public key
                    const encrypted_AES_keys:encryptedAESkeys[] = await Promise.all(
                        all_users_public_keys.map(async (user) => {
                        const publicKey = await importPublicKey(user.public_key);
                        const encrypted = await encryptAESKeyWithPublicKey(decryptedAESkey, publicKey);

                        return {
                            user_id: user.user_id,
                            encrypted_channel_key: encrypted
                        };
                    }));


                    await sendEncryptedKeysToServer(encrypted_AES_keys);


                }else{
                    //generate AES key
                    const AES_key:CryptoKey = await generateAESKey();
                    setAESKey(AES_key);
                    console.log("OVDE SMO SADA!");
                    //fetch all users public keys
                    const all_users_public_keys:userPublicKeys[] | null = await fetchPublicKeys(); // {user_id, public_key}
                    console.log(all_users_public_keys);
                    console.log("ovo iznad su javni kljucevi");
                    if(!all_users_public_keys) return;

                    //encrypt AES key with each user public key
                    const encrypted_AES_keys:encryptedAESkeys[] = await Promise.all(
                        all_users_public_keys.map(async (user) => {
                        const publicKey = await importPublicKey(user.public_key);
                        const encrypted = await encryptAESKeyWithPublicKey(AES_key, publicKey);

                        return {
                            user_id: user.user_id,
                            encrypted_channel_key: encrypted
                        };
                    }));

                    //update database with encrypted aes key
                    await sendEncryptedKeysToServer(encrypted_AES_keys);
                }
            }else{
                const fetchedEncryptedAESchannelKey = await fetchEncryptedAESchannelKey();
                if(fetchedEncryptedAESchannelKey.length !== 0){
                    const base64 = fetchedEncryptedAESchannelKey[0].encrypted_channel_key.trim();
                    console.log("Base64: ", base64);
                    const decryptedAESkey = await decryptAESKey(privateKey, base64ToBuffer(base64));
                    setAESKey(decryptedAESkey);
                }else{
                    alert("ADMIN Vam mora odobriti kljuc za kanal");
                    //logout-jte se
                    localStorage.removeItem("token");
                    socket.disconnect();
                    router.push("/login");
                }
            }
            
            setIsReady(true);
        } catch (err) {
            console.error("Encryption context init failed:", err);
        }
})();




    effectRan.current = true;

}, []);




// useEffect(()=>{
//     (async() => {
//         if(!aesKey) return;
//             console.log("sada enkriptujem poruku sa mojim aes kljucem");
//             let message="Ja sam Milan Nikolic zelim da je sada enkriptujem i da vidim sta cu da dobijem";
//             let enkript= await encryptMessage(message);
//             console.log(enkript);
//             console.log("sada dekriptujem poruku sa tim istim kljucem i iv");
//             let dekript = await decryptMessage(enkript);
//             console.log(dekript);

//     })();
// }, [aesKey]);



const encryptMessage = async (message: string): Promise<any> => {
    if (!aesKey) throw new Error("AES key not ready");
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    enc.encode(message)
    );

    return JSON.stringify({
    iv: Array.from(iv),
    ciphertext: Array.from(new Uint8Array(encrypted))
    });

};
const decryptMessage = async (ciphertext: string): Promise<any> => {
if (!aesKey) throw new Error("AES key not ready");
const { iv, ciphertext: data } = JSON.parse(ciphertext);
const dec = new TextDecoder();
const decrypted = await crypto.subtle.decrypt(
  { name: "AES-GCM", iv: new Uint8Array(iv) },
  aesKey,
  new Uint8Array(data)
);

return dec.decode(decrypted);

};


return (
<EncryptionContext.Provider value={{ decryptedPrivateKey, aesKey, encryptMessage, decryptMessage, isReady }}>
{children}
</EncryptionContext.Provider>
);
};



export const useEncryption = (): EncryptionContextType => {
const context = useContext(EncryptionContext);
if (!context) throw new Error("useEncryption must be used within EncryptionProvider");
return context;
};
