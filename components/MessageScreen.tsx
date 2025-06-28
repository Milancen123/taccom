"use client"
import React, { useEffect, useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Message from './Message'
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);

  // Convert to local timezone (optional)
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  const hours = localDate.getHours();
  const minutes = localDate.getMinutes();

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};


const MessageScreen = ({activeChannel, currentUser}:any) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState(currentUser.username);

    // Handle "Enter" key press
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevents new line in input
      sendMessage();
    }
  };
  
  const messageListRef = useRef<HTMLDivElement | null>(null);

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
      setMessage(""); // Clear input
      setTimeout(scrollToBottom, 100); // Ensure DOM update before scroll
    }
  };

  useEffect(() => {
    // Join the selected channel
    socket.emit("joinChannel", activeChannel.channelName);

    // Listen for chat history
    // socket.on("chatHistory", (history) => {
    //   setMessages(history);
    // });

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
  }, [activeChannel])
  return (
    <div className="flex flex-col flex-1 justify-between overflow-hidden">
      {/* Message Display (Takes Full Height) */}
        <div className='p-5 border-b-2 border-slate-300'>
          <h1 className='text-2xl font-bold'>{activeChannel.channelName}</h1>
          <p className='text-base text-slate-600'>3 members online</p>
        </div>
        <div className="flex-col flex-1 border-b-2 border-slate-300 mt-5 p-2 gap-4 overflow-y-scroll" ref={messageListRef}>
          {/* Example messages (Replace with dynamic messages) */}
          {/* <Message 
          img_url={'https://avatars.githubusercontent.com/u/124599?v=4'}
          name={"Milan Nikolic"}
          date={"2025-03-13"}
          time={"11:10am"}
          message={"Hello is everyone alright with the time we discussed earlier"}
          /> */}
          {
            messages.map((message, index) => (
              <Message
              img_url={'https://avatars.githubusercontent.com/u/124599?v=4'}
              name={`${message.sender}`}
              date={"2025-03-13"}
              time={formatTime(message.timestamp)}
              message={message.message}
              sentByMe={message.sender == currentUser.username}
              key={`${message.sender} ${message.timestamp}`}
              />
            ))
          }
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