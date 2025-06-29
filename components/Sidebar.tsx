"use client"
import React, { useEffect, useState } from 'react'
import SidebarItem from './shared/SidebarItem'
import { getChannels } from '@/utils/database';
import Spinner from './Spiner';


interface SidebarProps{
  activeChannel:string;
  setActiveChannel:()=>void;
}


interface Channel{
  id:number;
  channelName:string;
  messages:number;
}

const Sidebar = ({activeChannel, setActiveChannel, currentUser}:any) => {
  // setting the channels, and the numb of unread messages for currentUser
  const [channels, setChannels] = useState<Channel[]>(null);

  useEffect(()=>{
    //fetch all the channels
    (async()=> {
      const response = await getChannels();
      setChannels(response);

    })();
    
  }, [])


  //! Make the current user data here, based on the JWT credential
  if(!channels){
    return <Spinner/>
  }


  return (
    <div className='w-[20%] h-full overflow-hidden border-r-2 border-gray-200 p-2'>
      {
        channels.map((channel, index) => (
          <SidebarItem
          name = {channel.channelName}
          messages = {channel.messages}
          active={activeChannel.channelName === channel.channelName}
          onClick={()=>setActiveChannel(channel)}
          key = {index}
          />
        ))
      }
    </div>
  )
}

export default Sidebar