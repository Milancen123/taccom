import axios from "axios";

export const getChannels = async (): Promise<any | null> => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const res = await axios.get("http://localhost:5000/api/channels", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Failed to fetch user", err);
    return null;
  }
};

export const saveMessage = async (channelName: string, content: string): Promise<any | null> => {
    const token = localStorage.getItem("token");
    if (!token) return null;
  
    try {
      const res = await axios.post(
        `http://localhost:5000/api/saveMessage/${channelName}`,
        { content }, // this is the POST body
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      return res.data;
    } catch (err) {
      console.error("Failed to save message", err);
      return null;
    }
  };

export const updateChannelReads = async (channelName:string): Promise<any|null> => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try{
    const res = await axios.put(
      `http://localhost:5000/api/updateChannelRead/${channelName}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );
    return res.data;
  }catch(err){
      console.error("Failed to update channel read", err);
      return null;
  }
}