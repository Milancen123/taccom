
import SignedIn from "@/components/authentication/SignedIn";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  return (
    <SignedIn>
      <div className="w-full h-screen overflow-hidden">
        <Navbar/>
        <Sidebar/> 
      </div>
    </SignedIn>
  );
}
