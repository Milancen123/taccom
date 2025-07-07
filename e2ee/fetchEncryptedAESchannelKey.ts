import axios from "axios";



export const fetchEncryptedAESchannelKey = async (): Promise<any | null> => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const res = await axios.get(
        `http://localhost:5000/api/getEncryptedAESchannelKey`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      console.log("OVO DOBIJAMO OD API ENDPOINTA: ", res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to save publicKey", err);
      return null;
    }
  };
