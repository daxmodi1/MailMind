'use client'

import React from "react";
import { ChevronRight} from "lucide-react";
import StartBtn from "./start-btn";
import Image from "next/image";

export default function Hero() {
  return (
    <div className="flex flex-col items-center justify-center space-y-5 px-4 sm:px-6 lg:px-8">
      {/* Announcement Badge */}
      <div className="bg-white shadow-md rounded-full p-1 mt-15">
        <div className="inline-flex items-center bg-[#F1F5F9] rounded-full p-1 gap-2 border">
          <div className="bg-[#DEE3F9] text-[#5B71F9] rounded-full px-2 sm:py-0 md:py-1 text-xs sm:text-sm font-bold shadow-sm">
            AI-Powered
          </div>
          <div className="text-zinc-600 text-xs sm:text-sm font-semibold sm:block">
            Smart email summaries with one click
          </div>
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-600 mr-1 mt-0.5" />
        </div>
      </div>

      {/* Main Heading */}
      <div className="text-center text-4xl md:text-5xl lg:text-6xl">
        <h1 className="font-main font-bold text-primary leading-tight">
          Your Gmail, Supercharged
        </h1>
        <h2 className="font-linotype text-primary mt-2">
          with AI Intelligence
        </h2>
      </div>

      {/* Subtitle */}
      <div className="text-primary text-base sm:text-lg lg:text-xl text-center max-w-2xl px-4">
        MailMind connects to your Gmail and uses AI to summarize emails, highlight what matters, and help you respond faster
      </div>

      {/* CTA Buttons */}
      <div className="flex gap-5 md:gap-6 lg:gap-8 items-center text-sm md:text-lg">
        <div>
          <StartBtn />
        </div>
        <div className="text-muted cursor-pointer hover:text-gray-700 transition-colors">
          Learn more
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative border border-white sm:border-2 p-1 sm:p-2 rounded-lg sm:rounded-xl lg:rounded-2xl mt-4 sm:mt-7 overflow-hidden z-20 w-full max-w-sm xs:max-w-md sm:max-w-4xl lg:max-w-6xl mx-auto">
        <div className="relative w-full">
          <Image 
            src="/mockup.png" 
            alt="Mockup" 
            width={1200} 
            height={300}
            className="w-full h-auto rounded-md sm:rounded-lg lg:rounded-xl"
            sizes="(max-width: 475px) 100vw, (max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, 1200px"
            priority
          />
          {/* Smooth gradient blur effect like the email interface */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="h-full w-full bg-gradient-to-t from-white/70 via-white/50 to-white/30 rounded-md sm:rounded-lg lg:rounded-xl" 
                 style={{
                   maskImage: 'linear-gradient(to top, black 0%, black 20%, transparent 60%)',
                   backdropFilter: 'blur(2px) sm:blur(3px)'
                 }}>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}