"use client"
import Image from "next/image";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface UserProps{
    username:string;
    full_name:string;
    active:boolean;
}

const User = ({username, full_name, active}:UserProps) => {
  return (
    <div className="flex items-center gap-4 p-2 hover:bg-gray-100 rounded-lg transition">
        <Avatar className="w-10 h-10">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <div className="flex flex-col justify-center flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900 truncate">{username}</p>
            <p className="text-xs text-gray-500 truncate">{full_name}</p>
        </div>

        {active && (
            <span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow shadow-green-500/50 animate-pulse" />
        )}
    </div>
  );
};

export default User;
