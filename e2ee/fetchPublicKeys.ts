import axios from "axios";

interface userPublicKeys {
    user_id: string;
    public_key:string;
}

export const fetchPublicKeys = async (): Promise<userPublicKeys[] | null> => {
    const token = localStorage.getItem("token");
    if (!token) return null;
  
    try {
      const res = await axios.get(
        `http://localhost:5000/api/getPublicKeys`,
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
