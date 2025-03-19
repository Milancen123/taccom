"use client"
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Logout from './authentication/Logout'
import { Badge } from "@/components/ui/badge"
import Image from 'next/image'

interface MessageProps{
    img_url:string;
    name:string;
    date:string;
    time:string;
    message:string;
}

const Message = ({img_url, name, date, time, message}:MessageProps) => {
  return (
    <div className='flex items-center w-full gap-3 mt-4'>
        <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className='flex flex-col'>
            <div className='flex items-center gap-2'>
                <h1 className='text-lg font-bold'>{name}</h1>
                <p className='text-slate-600'>{time}</p>
            </div>
            <div>
                <h1>{message}</h1>
            </div>
        </div>
    </div>
  )
}

export default Message;