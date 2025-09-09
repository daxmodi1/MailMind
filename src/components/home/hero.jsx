'use client'

import React from "react";
import { ChevronRight} from "lucide-react";
import StartBtn from "./start-btn";
import Image from "next/image";

export default function Hero() {
  return (
    <div className={`flex flex-col items-center justify-center space-y-5`}>
      <div className="bg-white shadow-md rounded-full p-1">
        <div className="inline-flex items-center bg-[#F1F5F9] rounded-full p-1 gap-2 border">
          <div className="bg-[#DEE3F9] text-[#5B71F9] rounded-full px-3 py-1 text-sm font-bold shadow-sm">
            New
          </div>
          <div className="text-zinc-600 text-sm font-semibold">
            Upgrade your workflow today
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-600 mr-1 mt-0.5" />
        </div>
      </div>
      <div className="text-6xl font-main font-bold text-primary">
        Effertless Email Managment
      </div>
      <div className="text-6xl font-linotype text-primary">
        Maximum Efficiency
      </div>
      <div className="text-primary text-xl">
        Streamline your emails with a smart, intutive, and clutter-free experience
      </div>

      <div className="flex gap-x-6">
        <div>
          <StartBtn />
        </div>
        <div className="p-3 text-lg text-muted">
          Learn more
        </div>
      </div>

      <div className="relative border-2 border-white p-2 rounded-2xl mt-7 overflow-hidden">
        <Image src="/mockup.png" alt="Mockup" width={1200} height={300} />
        {/* Smooth gradient blur effect like the email interface */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="h-full w-full bg-gradient-to-t from-white/70 via-white/50 to-white/30" 
               style={{
                 maskImage: 'linear-gradient(to top, black 0%, black 20%, transparent 60%)',
                 backdropFilter: 'blur(3px)'
               }}>
          </div>
        </div>
      </div>
    </div>
  );
}