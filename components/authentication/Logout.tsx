"use client"
import React from 'react'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react";

const Logout = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true); // Ensure safe access to localStorage in the browser
  }, []);

  
  function handleLogout(){
    localStorage.removeItem("token");
    router.push("/login");
  }


  return (
    <Button variant="outline" onClick={handleLogout} className='bg-red-600 text-white font-bold hover:bg-red-800 hover:text-white'>Logout</Button>
  )
}

export default Logout