"use client"
import Link from 'next/link';
import React from 'react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"

  

interface SidebarItemProps {
    name: string;
    messages: number;
    active:boolean;
    url_path:string;
    onClick:()=>void;
  }
  

const SidebarItem = ({name, messages, active, url_path, onClick}:any) => {
  return (
        <div className={` ${active? 'bg-slate-100':'bg-white'}   flex w-full p-4 font-normal text-lg hover:bg-slate-100 hover:cursor-pointer justify-between rounded-xl `} onClick={onClick}>
          <div>
              {name}
          </div>
          {(messages > 0 && !active) && (
              <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="w-[15%]">
                  <div className='bg-red-600 px-2  text-white text-sm flex justify-center items-center font-bold rounded-full text-center'>
                      {messages}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{messages > 1 ? `${messages} new messages` : "1 new message"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
                  
          )}

        </div>
  )
}
 
export default SidebarItem;