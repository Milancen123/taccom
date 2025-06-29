"use client"
import React, { useEffect, useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Message from './Message'
import { io } from "socket.io-client";
import { saveMessage, updateChannelReads } from '@/utils/database'
import FormattedDate from './FormattedDate'

const socket = io("http://localhost:5000");

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



const dummyMessages = [
  // Day before yesterday
  {
    sender: "Jelena Vukovic",
    message: "Sending over the drone footage now.",
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    sender: "Milan Nikolic",
    message: "Got it. Reviewing immediately.",
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    sender: "Petar Jovanovic",
    message: "Targets are confirmed visually.",
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    sender: "Jelena Vukovic",
    message: "Requesting backup for night patrol.",
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    sender: "Milan Nikolic",
    message: "Approved. Two squads will be dispatched.",
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
  },

  // Yesterday
  {
    sender: "Milan Nikolic",
    message: "Debrief starts at 0800 sharp.",
    timestamp: new Date(Date.now() - 86400000).toISOString()
  },
  {
    sender: "Petar Jovanovic",
    message: "Understood. I’ll be ready.",
    timestamp: new Date(Date.now() - 86400000).toISOString()
  },
  {
    sender: "Jelena Vukovic",
    message: "Confirming location for the briefing?",
    timestamp: new Date(Date.now() - 86400000).toISOString()
  },
  {
    sender: "Milan Nikolic",
    message: "Same HQ room as last time.",
    timestamp: new Date(Date.now() - 86400000).toISOString()
  },
  {
    sender: "Petar Jovanovic",
    message: "Perfect, I’ll notify the rest.",
    timestamp: new Date(Date.now() - 86400000).toISOString()
  },

  // Today
  {
    sender: "Milan Nikolic",
    message: "Let's finalize the mission plan today.",
    timestamp: new Date().toISOString()
  },
  {
    sender: "Petar Jovanovic",
    message: "Copy that, updating the logistics status now.",
    timestamp: new Date().toISOString()
  },
  {
    sender: "Milan Nikolic",
    message: "Great. Let me know when it's ready.",
    timestamp: new Date().toISOString()
  },
  {
    sender: "Petar Jovanovic",
    message: "Will do. Estimated in 10 minutes.",
    timestamp: new Date().toISOString()
  },
  {
    sender: "Jelena Vukovic",
    message: "Are we including the intel from last night?",
    timestamp: new Date().toISOString()
  }
];



const MessageScreen = ({activeChannel, currentUser}:any) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState(currentUser.username);


  const messageListRef = useRef<HTMLDivElement | null>(null);
  let lastRenderedDate: string | null = null;

  // fetch messages from dataabase and display them
  

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
    setMessages(dummyMessages);
  }, []);
  useEffect(() => {
    // Join the selected channel
    socket.emit("joinChannel", activeChannel.channelName);

    
    // Listen for new messages
    socket.on("receiveMessage", (newMessage) => {
      console.log(newMessage);
      if(newMessage.channelName === activeChannel.channelName) setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("chatHistory");
    };
  }, [activeChannel]); // Re-run when channel changes

  useEffect(()=>{
    setMessages([]);
    (async()=>{
      await updateChannelReads(activeChannel.channelName);
    })();
  }, [activeChannel])



  return (
    <div className="flex flex-col flex-1 justify-between overflow-hidden">
      {/* Message Display (Takes Full Height) */}
        <div className='p-5 border-b-2 border-slate-300'>
          <h1 className='text-2xl font-bold'>{activeChannel.channelName}</h1>
          <p className='text-base text-slate-600'>3 members online</p>
        </div>
        <div className="flex-col flex-1 border-b-2 border-slate-300 mt-5 p-2 gap-4 overflow-y-scroll" ref={messageListRef}>
          {messages.map((message, index) => {
            const currentDate = new Date(message.timestamp).toDateString(); // Only the date part
            const shouldRenderDate = currentDate !== lastRenderedDate;
            lastRenderedDate = currentDate;

            return (
              <React.Fragment key={`${message.sender}-${message.timestamp}-${index}`}>
                {shouldRenderDate && (
                  <FormattedDate timestamp={message.timestamp} />
                )}
                <Message
                  img_url={'https://avatars.githubusercontent.com/u/124599?v=4'}
                  name={`${message.sender}`}
                  date={currentDate}
                  time={formatTime(message.timestamp)}
                  message={message.message}
                  sentByMe={message.sender === currentUser.username}
                />
              </React.Fragment>
            );
          })}
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