"use client"
import SignedIn from "@/components/authentication/SignedIn";
import MessageScreen from "@/components/MessageScreen";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Spinner from "@/components/Spiner";
import { getCurrentUser } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function Home() {
  const [activeChannel, setActiveChannel] = useState({
    channelName: "Command Center",
    messages: 0,
    url_path: "commandcenter",
  });
  const router = useRouter();



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
    })();
  }, [])

  //! Make the current user data here, based on the JWT credential
  if(!user){
    return <Spinner/>
  }


  //! make the user logic so that each screen is defined for that one user specifically
  
  // const user = {
  //   id:1,
  //   username:"Milan Nikolic",
  //   fullname:"Milan Nikolic",
  //   rank:"potpukovnik",
  //   unit:"146. klasa",
  //   position:"Komandant klase"
  // }

  return (
    <SignedIn>
      <div className="w-full h-screen overflow-hidden">
        <Navbar currentUser={user}/>
        <div className="flex h-full w-screen">
          <Sidebar activeChannel={activeChannel} setActiveChannel={setActiveChannel}/> 
          <MessageScreen activeChannel={activeChannel} currentUser={user}/>
        </div>

      </div>
    </SignedIn>
  );
}
