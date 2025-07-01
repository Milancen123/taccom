import axios from "axios";

export const getChannels = async (): Promise<any | null> => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const res = await axios.get("http://192.168.8.105:5000/api/channels", {
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
        `http://192.168.8.105:5000/api/saveMessage/${channelName}`,
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
      `http://192.168.8.105:5000/api/updateChannelRead/${channelName}`,
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


export const fetchAllMessagesForChannel = async (channelName:string) : Promise<any|null> => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try{
    const resRead = await axios.post(
      `http://192.168.8.105:5000/api/readMessages/${channelName}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );


    const resUnread = await axios.post(
      `http://192.168.8.105:5000/api/unreadMessages/${channelName}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );


    const allMessages = [...resRead.data, ...resUnread.data];

    // Sort by timestamp ascending
    allMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());


    return allMessages;

  }catch(err){
      console.error("Failed to update channel read", err);
      return null;
  }
}



export const getAllUsers = async (): Promise<any | null> => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const res = await axios.get("http://192.168.8.105:5000/api/getAllUsers", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Failed to fetch users", err);
    return null;
  }
};