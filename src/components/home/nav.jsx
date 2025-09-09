import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Nav() {
  return (
    <nav className="mt-8 py-0.5 px-0.5 rounded-2xl flex items-center justify-between bg-white shadow-sm w-2/5 mx-auto text-muted">

      {/* Logo */}
      <Image src="/logo.png" alt="logo" width={45} height={45} />

      {/* Navigation Links */}
      <Link href="/">
        Home
      </Link>
      <Link href="/#features">
        Features
      </Link>
      <Link href="/#pricing">
        Pricing
      </Link>
      <Link href="/#faq">
        FAQ
      </Link>
      <Link href="/blog">
        BLog
      </Link>

      {/* Login Button aligned right */}
      <div className="flex justify-center items-center gap-12 h-full">
        <div
          className="bg-gradient-to-b from-stone-300/40 to-transparent p-[4px] rounded-[16px]"
        >
          <button
            className="group p-[4px] rounded-[12px] bg-gradient-to-b from-white to-stone-200/40 shadow-[0_1px_3px_rgba(0,0,0,0.5)] active:shadow-[0_0px_1px_rgba(0,0,0,0.5)] active:scale-[0.995]"
          >
            <div
              className="bg-gradient-to-b from-stone-200/40 to-white/80 rounded-[8px] px-2 py-0.5"
            >
              <div className="flex gap-2 items-center">
                <span className="font-semibold">Get Started</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}
