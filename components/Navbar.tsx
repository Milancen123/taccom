"use client"
import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Logout from './authentication/Logout'
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"


const Navbar = ({currentUser}:any) => {


  return (
    <div className='w-screen border-2 border-gray-200  p-4 flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <h1 className='text-2xl font-bold '>TACCOM</h1>
        <Badge variant="outline" className="text-xs rounded-2xl  border-2 px-4 border-gray-200">SECURE</Badge>
      </div>
      <div className='flex gap-9'>
      <Popover>
        <PopoverTrigger>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </PopoverTrigger>
        <PopoverContent className='w-[250px] bg-white p-4 drop-shadow-md rounded-md border-[1px] border-slate-100 flex flex-col gap-2'>

          <div className='flex flex-col gap-0 border-b-[1px] border-slate-300'>
            <h1 className='text-base font-semibold'>{currentUser.full_name}</h1>
            <h2 className='text-sm text-slate-600'>{currentUser.rank}</h2>
          </div>
  
          <div className='flex justify-between hover:bg-slate-100 rounded-md'>
            <h1>Status</h1>
            <Badge className='bg-green-200 text-green-700 hover:bg-green-300'>Active</Badge>
          </div>
          <div className='flex justify-between hover:bg-slate-100 rounded-md'>
            <h1>Jedinica</h1>
            <h1>{currentUser.unit}</h1>
          </div>
          <div className='flex justify-between hover:bg-slate-100 rounded-md'>
            <h1>Pozicija</h1>
            <h1>{currentUser.positionInTheUnit}</h1>
          </div>
          <Logout/>
        </PopoverContent>
      </Popover>


        <Logout/>
      </div>
    </div>
  )
}

export default Navbar;