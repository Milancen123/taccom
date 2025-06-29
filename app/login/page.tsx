"use client"
 
import React, { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { z } from "zod"
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from 'lucide-react'
import { useRouter } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"



const formSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(50, "Username cannot exceed 50 characters")
    .regex(/^[a-zA-Z0-9]+$/, "Username can only contain letters and numbers"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password cannot exceed 50 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[\W_]/, "Password must contain at least one special character"),

  dailyAccessCode: z
    .string()
    .length(6, "Daily access code must be exactly 6 digits")
    .regex(/^\d+$/, "Daily access code must only contain numbers"),
});




const page = () => {
  const [error, setError] = useState(false);
  const [authorizing, setAuthorizing] = useState(false);
  const router = useRouter();
  //! if the token already exists in the localstorage just push to the next page

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        username: "",
        password:"",
        dailyAccessCode:"",
      },
    })
   

    async function onSubmit(values: z.infer<typeof formSchema>) {
      //todo - send this to the server listening on port 5000, and then verify the user, if the user is legit, send back the JWT token and store 
      //todo - in the local storage
      try{
        console.log(values)
        setAuthorizing(true);
        const res = await axios.post("http://localhost:5000/api/login", values);
        localStorage.setItem("token", res.data.token); // Store JWT token
        router.push("/");
        //todo - if the token is given in response than we should push to the next stage
        setAuthorizing(false);
      }catch(error){
        setError(true);
        setAuthorizing(false);
      }

    }

  

    return (
      <div className='h-screen w-screen flex flex-col justify-center items-center gap-4'>
        <div className='w-[25%] border-2 border-slate-900 rounded-lg '>
          <div className='bg-slate-900 p-4'>
            <h1 className='text-4xl text-white font-bold'>Secure Login</h1>
            <h2 className='text-slate-400 '>Authentication required for TACCOM access</h2>
          </div>
          <div className='p-4'>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter you military ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input placeholder="" type="password" {...field} />
                      </FormControl>
                      
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dailyAccessCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Access Code</FormLabel>
                      <FormControl>
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className='w-full'>{authorizing ? ("Authenticating..."):("Authenticate")}</Button>
              </form>
            </Form>
          </div>
        </div>
        {error && (
          <Alert className='text-red-600 w-[25%] '>
            <Terminal className="h-4 w-4 text-red-600" />
            <AlertTitle>Unauthorized access!</AlertTitle>
            <AlertDescription>
              Your credential are not valid, please try again!
            </AlertDescription>
          </Alert>
        )}


      </div>
  )
  
}

export default page