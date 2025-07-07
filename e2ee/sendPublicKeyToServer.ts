import axios from "axios";

export const savePublicKeyToServer = async (publicKey: string): Promise<any | null> => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    console.log("saljemo zahtev za javni kljuc na server: ", publicKey);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/savePublicKey`,
        { publicKey }, // this is the POST body
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      return res.data;
    } catch (err) {
      console.error("Failed to save publicKey", err);
      return null;
    }
  };
