"use client"
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Logout from './authentication/Logout'
import { Badge } from "@/components/ui/badge"


const Navbar = () => {
  return (
    <div className='w-screen border-2 border-gray-200  p-4 flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <h1 className='text-2xl font-bold '>TACCOM</h1>
        <Badge variant="outline" className="text-xs rounded-2xl  border-2 px-4 border-gray-200">SECURE</Badge>
      </div>
      <div className='flex gap-9'>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <Logout/>
      </div>
    </div>
  )
}

export default Navbar;