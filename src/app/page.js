import Hero from "@/components/home/hero";
import Nav from "@/components/home/nav";
import About from "@/components/home/about";
import Image from "next/image";
export default function Home() {
  return (
    <div className="bg-[#eef2ff]">
      {/* First Section with bg.png */}
      <section
        className="flex flex-col items-center w-full h-screen bg-cover bg-center gap-y-15"
        style={{ backgroundImage: "url('/bg.png')" }}
      >
        <Nav />
        <Hero />
        <About/>
      </section>
      
      <section
        className="flex flex-col items-center w-full h-screen bg-cover bg-center"
        style={{ backgroundImage: "url('/bg2.png')" }}
      />
      <section
        className="flex flex-col items-center w-full h-screen bg-cover bg-center"
        style={{ backgroundImage: "url('/bg-3.png')" }}
      />
    </div>
  );
}