"use client"
import SignedIn from "@/components/authentication/SignedIn";
import MessageScreen from "@/components/MessageScreen";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";


export default function Home() {
  const [activeChannel, setActiveChannel] = useState({
    channelName: "Command Center",
    messages: 0,
    url_path: "commandcenter",
  });


  //! make the user logic so that each screen is defined for that one user specifically
  


  return (
    <SignedIn>
      <div className="w-full h-screen overflow-hidden">
        <Navbar/>
        <div className="flex h-full w-screen">
          <Sidebar activeChannel={activeChannel} setActiveChannel={setActiveChannel}/> 
          <MessageScreen activeChannel={activeChannel}/>
        </div>

      </div>
    </SignedIn>
  );
}
