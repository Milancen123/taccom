import axios from "axios";

interface EncryptedAESKey {
  user_id: string;
  encrypted_channel_key: string;
}

export const sendEncryptedKeysToServer = async (encryptedKeys: EncryptedAESKey[]) => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
        const response = await axios.put(
        "http://localhost:5000/api/updateEncryptedKeys", 
        {
            keys: encryptedKeys,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }
        );

        console.log("Keys updated successfully:", response.data);
    } catch (error) {
        console.error("Failed to update encrypted keys:", error);
    }
}

