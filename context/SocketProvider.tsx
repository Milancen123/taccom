"use client";
import { getAllChannels } from "@/utils/database";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

// Replace with your types if needed
type Message = {
  channelName: string;
  sender: string;
  message: string;
};

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

// Dummy function – replace this with real logic
const getUserChannels = async (): Promise<string[]> => {
  const ch = await getAllChannels();
  return ch;
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize socket only once
  useEffect(() => {
    const newSocket = io("http://192.168.8.105:5000");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Join all user channels once socket is ready
  useEffect(() => {
    if (!socket) return;

    (async () => {
      const channels = await getUserChannels();
      channels.forEach((channel) => {
        socket.emit("joinChannel", channel);
      });
    })();
  }, [socket]);

  // Global listener for all incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage) => {
      toast(`New message in ${newMessage.channelName}`, {
        description: `${newMessage.sender}: ${newMessage.message}`,
        position: "top-right",
      });

      // Optionally: trigger unread logic, state updates, etc.
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [socket]);

  const value = useMemo(() => ({ socket }), [socket]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
