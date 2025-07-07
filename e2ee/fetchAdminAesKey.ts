import axios from "axios";



export const fetchAdminAesKey = async (): Promise<any | null> => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const res = await axios.get(
        `http://localhost:5000/api/getAdminAESkey`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      return res.data;
    } catch (err) {
      console.error("Failed to fetch admin aes key: ", err);
      return null;
    }
  };
