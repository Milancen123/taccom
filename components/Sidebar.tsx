"use client"
import React from 'react'
import SidebarItem from './shared/SidebarItem'

//! Dummy data for now, until we decide to fetch the chanels
const navbarItems = [
  {
    channelName: "Command Center",
    messages: 0,
    active:true,
    url_path:"commandcenter"
  },
  {
    channelName: "Field Operations",
    messages: 3,
    active:false,
    url_path:"fieldoperations"
  },
  {
    channelName: "Intelligence",
    messages: 0,
    active:false,
    url_path:"intelligence"
  },
  {
    channelName: "Logistics",
    messages: 1,
    active:false,
    url_path:"logisticts"
  },
  {
    channelName: "Training",
    messages: 0,
    active:false,
    url_path:"training"
  }
]

interface SidebarProps{
  activeChannel:string;
  setActiveChannel:()=>void;
}

const Sidebar = ({activeChannel, setActiveChannel}:any) => {
  return (
    <div className='w-[20%] h-full overflow-hidden border-r-2 border-gray-200 p-2'>
      {
        navbarItems.map((channel, index) => (
          <SidebarItem
          name = {channel.channelName}
          messages = {channel.messages}
          active={activeChannel.channelName === channel.channelName}
          url_path={channel.url_path}
          onClick={()=>setActiveChannel(channel)}
          key = {index}
          />
        ))
      }
    </div>
  )
}

export default Sidebar