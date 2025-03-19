"use client"
import React from 'react'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";


const SignedIn = ({children} : any) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }
    axios
      .get("http://192.168.8.105:5000/api/protected", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => setIsAuthenticated(true))
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/login");
      });
     
      
  }, [])
  
  if (!isAuthenticated) {
    return null; // Prevents flashing of content before redirect
  }

  return <>{children}</>;
}


export default SignedIn; // Change to default export