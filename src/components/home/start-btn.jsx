import React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

const StartBtn = () => {
  return (
    <div className="inline-block">
      <Link
        href="/signup"
        className="relative inline-flex items-center justify-center w-33 md:w-38 lg:w-40 py-2.5 md:py-3 text-white 
          rounded-full cursor-pointer 
          bg-gradient-to-b from-gray-600 to-[#111111] 
          shadow-lg
          transition-all duration-200 
          active:translate-y-[2px] active:shadow-[0_1px_2px_rgba(0,0,0,1),0_5px_10px_rgba(0,0,0,0.4)]
          text-sm md:text-base"
      >
        Start for free
        <ChevronRight
          size={20}
          className="ml-1 mt-[0.5px] md:mt-0.5 transition-all duration-300 ease-in-out 
            drop-shadow-[0_10px_20px_rgba(26,25,25,0.9)] 
            hover:drop-shadow-[0_10px_20px_rgba(50,50,50,1),0_0_20px_rgba(2,2,2,1)] 
            hover:-rotate-12 text-gray-200 "
        />
      </Link>
    </div>
  );
};

export default StartBtn;
