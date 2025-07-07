import axios from "axios";

export const getCurrentUser = async (): Promise<any | null> => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const res = await axios.get("http://localhost:5000/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Failed to fetch user", err);
    return null;
  }
};
