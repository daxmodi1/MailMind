import React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";


const StartBtn = () => {
  return (
    <div className="inline-block">
      <Link href="/signup"
        className="relative inline-flex items-center justify-center px-6 py-3 text-lg font-semibold text-white 
        rounded-full cursor-pointer 
        bg-gradient-to-b from-gray-600 to-[#111111] 
        shadow-lg
        transition-all duration-200 
        active:translate-y-[2px] active:shadow-[0_1px_2px_rgba(0,0,0,1),0_5px_10px_rgba(0,0,0,0.4)]">
        Start for free
        <ChevronRight
          size={26}
          className="transition-all duration-300 ease-in-out 
            drop-shadow-[0_10px_20px_rgba(26,25,25,0.9)] 
            hover:drop-shadow-[0_10px_20px_rgba(50,50,50,1),0_0_20px_rgba(2,2,2,1)] 
            hover:-rotate-12 text-gray-200"
        />
      </Link>
    </div>
  );
};

export default StartBtn;
