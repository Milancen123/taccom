"use client"
import React, { useEffect, useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Message from './Message'
import { io } from "socket.io-client";
import { fetchAllMessagesForChannel, getAllUsers, saveMessage, updateChannelReads } from '@/utils/database'
import FormattedDate from './FormattedDate'
import NewMessage from './NewMessage'
import ScrollDownArrow from './ScrollDownArrow'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import User from './User'
import MessageList from './MessageList'













const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);

  // Convert to local timezone (optional)
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  const hours = localDate.getHours();
  const minutes = localDate.getMinutes();

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};
function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();

  // Helper to zero time for accurate comparisons
  const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const target = stripTime(date);
  const today = stripTime(now);
  const diffTime = today.getTime() - target.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays <= 6) {
    const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return weekdayNames[date.getDay()];
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}



interface user{
  username:string;
  full_name:string;
  active?:boolean;
}


const MessageScreen = ({activeChannel, currentUser, socket}:any) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState(currentUser.username);
  const [shouldScrollToNewMessage, setShouldScrollToNewMessage] = useState(false);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const newMessageRef = useRef<HTMLDivElement | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[] | null>([]);
  const [allUsers, setAllUsers] = useState<user[] | null>([]);


  let lastRenderedDate: string | null = null;

    // Handle "Enter" key press
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevents new line in input
      sendMessage();
    }
  };
  
  // Scroll to bottom
  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  };

  
  const sendMessage = () => {
    if (message.trim()) {
      const timestamp = new Date().toISOString(); // Get current date & time in ISO format
      const messageData = { channelName: activeChannel.channelName, message, sender: username, timestamp };
      console.log(messageData);
      setMessage("");
      socket.emit("sendMessage", messageData);
      (async () => {
        await saveMessage(activeChannel.channelName, message);
        await updateChannelReads(activeChannel.channelName);
      })();

      setMessage(""); // Clear input
      setTimeout(scrollToBottom, 100); // Ensure DOM update before scroll
    }
  };



  useEffect(()=>{
    (async() => {
      const msgs = await fetchAllMessagesForChannel(activeChannel.channelName);
      setMessages(msgs);
    })();
  }, []);

  
  useEffect(() => {
    // Join the selected channel
    socket.emit("joinChannel", activeChannel.channelName);

    
    // Listen for new messages
    socket.on("receiveMessage", (newMessage) => {
      const formattedMessage = {
        ...newMessage,
        newMessage: true,
      };
      if(newMessage.channelName === activeChannel.channelName) setMessages((prev) => [...prev, formattedMessage]);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("chatHistory");
    };
  }, [activeChannel]); // Re-run when channel changes

  let newMessages =false;


  useEffect(()=>{
    setMessages([]);
    (async()=>{
      //! already updating that in the sidebar.tsx
      //await updateChannelReads(activeChannel.channelName);
      
      const msgs = await fetchAllMessagesForChannel(activeChannel.channelName);
      setMessages(msgs);

      const hasNew = msgs.some(
        (msg) => msg.newMessage && msg.username !== currentUser.username && msg.sender !== currentUser.username
      );
  
      if (hasNew) {
        setShouldScrollToNewMessage(true);
      }else{
        console.log("Scrokluj do dna");

      }
    })();
  }, [activeChannel])

  useEffect(() => {
    if (shouldScrollToNewMessage && newMessageRef.current) {
      newMessageRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      setShouldScrollToNewMessage(false);
      return;
    }

  }, [messages, shouldScrollToNewMessage]);

  // Scroll to bottom when there's NO new message (only if you really want it)
  useEffect(() => {
    if (!shouldScrollToNewMessage) {
      scrollToBottom();
    }
  }, [messages]);


  //tracking the number of online users
  useEffect(() => {
    if (!socket) return;
    //fetch all users
    (async() => {
      const users = await getAllUsers();
      setAllUsers(users);
    })();
    // Connect and identify the user
    socket.emit("userOnline", currentUser.username); // or currentUser.id if you prefer
  
    // Listen for the updated list of online users
    socket.on("onlineUsers", (users: string[]) => {
      setOnlineUsers(users);
    });

  
    // Clean up on unmount
    return () => {
      socket.off("onlineUsers");
      //socket.disconnect();
    };
  }, [activeChannel]);






  return (
    <div className="flex flex-col flex-1 justify-between overflow-hidden">
      {/* Message Display (Takes Full Height) */}
        <div className='p-5 border-b-2 border-slate-300'>
          <h1 className='text-2xl font-bold'>{activeChannel.channelName}</h1>
          <Sheet>
            <SheetTrigger> <p className='text-base text-slate-600'>{onlineUsers?.length} members online <span className="h-3 w-3 rounded-full bg-green-500 inline-block" /></p></SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>All users</SheetTitle>
                <div>
                  {allUsers?.map((user)=> {
                    return <User username={user.username} full_name={user.full_name} active={onlineUsers?.includes(user.username) || false} key={user.username}/>
                  })}
                </div>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex-col flex-1 border-b-2 border-slate-300 mt-5 p-2 gap-4 overflow-y-scroll" ref={messageListRef}>
          <MessageList 
           messages={messages}
           currentUser={currentUser}
           newMessageRef={newMessageRef}
           formatTime={formatTime}
          />
        </div>

        {/* Input Section (Fixed at Bottom) */}
        <div className="flex w-full gap-2 items-center p-4">
          <Input type="text" placeholder="Message" className="flex-1" onChange={(e)=> {setMessage(e.target.value)}} onKeyDown={handleKeyDown} value={message} />
          <Button type="submit" onClick={sendMessage}>Send</Button>
        </div>
    </div>
  )
}

export default MessageScreen;