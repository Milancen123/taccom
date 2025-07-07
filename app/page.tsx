"use client"
import SignedIn from "@/components/authentication/SignedIn";
import MessageScreen from "@/components/MessageScreen";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Spinner from "@/components/Spiner";
import { EncryptionProvider } from "@/context/EncryptionProvider";
import { getCurrentUser } from "@/utils/auth";
import { updateChannelReads } from "@/utils/database";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";


export default function Home() {
  const router = useRouter();
  
  const [activeChannel, setActiveChannel] = useState({
    channelName: "Command Center",
    messages: 0,
    url_path: "commandcenter",
  });

  const [unreadCounts, setUnreadCounts] = useState<{ [channelName: string]: number }>({});




  const [user, setUser] = useState<any>(null);

  

  useEffect(()=>{
     const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
    (async ()=> {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      //await updateChannelReads(activeChannel.channelName);
    })();
  }, [])

  //! Make the current user data here, based on the JWT credential
  if(!user){
    return <Spinner/>
  }

  const socket = io("http://localhost:5000");
  
  return (
    <SignedIn>
      <EncryptionProvider currentUser={user} socket={socket}>
        <div className="flex flex-col h-screen w-screen overflow-hidden">
          {/* Navbar stays at the top */}
          <Navbar currentUser={user} socket={socket} />

          {/* Main content area fills remaining height */}
          <div className="flex flex-1 w-full overflow-hidden">
            <Sidebar 
            activeChannel={activeChannel} 
            setActiveChannel={setActiveChannel}
            currentUser={user}
            unreadCount={unreadCounts}
            setUnreadCounts={setUnreadCounts}
            />

            {/* MessageScreen handles its own layout inside */}
            <MessageScreen 
            activeChannel={activeChannel} 
            currentUser={user} 
            socket={socket}
            setUnreadCounts={(channelName:string)=>{
              if(!channelName) channelName = "Command Center";
              setUnreadCounts(prev => ({
                ...prev,
                [channelName]: (prev[channelName] || 0) + 1,
              }));
            }}


            />
          </div>
        </div>
      </EncryptionProvider>
    </SignedIn>

  );
}
