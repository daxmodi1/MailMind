'use client'

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  return (
    <div className="pt-10 px-4">
      <nav className="py-0.5 px-0.5 rounded-2xl flex items-center justify-between bg-white shadow-sm w-full max-w-2xl mx-auto text-muted relative">

        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="flex-shrink-0">
            <Image src="/logo.png" alt="logo" width={45} height={45} />
          </div>
          <div className="md:hidden text-lg font-bold font-sans pt-0.5 text-gray-800 select-none">
            MailMind
          </div>

        </div>


        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Home
          </Link>
          <Link href="/#features" className="hover:text-gray-900 transition-colors">
            Features
          </Link>
          <Link href="/#pricing" className="hover:text-gray-900 transition-colors">
            Pricing
          </Link>
          <Link href="/#faq" className="hover:text-gray-900 transition-colors">
            FAQ
          </Link>
          <Link href="/blog" className="hover:text-gray-900 transition-colors">
            Blog
          </Link>
        </div>

        {/* Desktop Get Started Button */}
        <div className="hidden md:flex justify-center items-center gap-12 h-full">
          <div className="bg-gradient-to-b from-stone-300/40 to-transparent p-[4px] rounded-[16px]">
            <button className="group p-[4px] rounded-[12px] bg-gradient-to-b from-white to-stone-200/40 shadow-[0_1px_3px_rgba(0,0,0,0.5)] active:shadow-[0_0px_1px_rgba(0,0,0,0.5)] active:scale-[0.995]">
              <div className="bg-gradient-to-b from-stone-200/40 to-white/80 rounded-[8px] px-2 py-0.5">
                <div className="flex gap-2 items-center">
                  <Link href="/login" className="font-semibold">Get Started</Link>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-gray-600 transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-600 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-600 transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 z-50">
            <div className="flex flex-col p-4 space-y-4">
              <Link
                href="/"
                className="hover:text-gray-900 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/#features"
                className="hover:text-gray-900 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/#pricing"
                className="hover:text-gray-900 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/#faq"
                className="hover:text-gray-900 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                FAQ
              </Link>
              <Link
                href="/blog"
                className="hover:text-gray-900 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>

              {/* Mobile Get Started Button */}
              <div className="pt-2">
                <div className="bg-gradient-to-b from-stone-300/40 to-transparent p-[4px] rounded-[16px]">
                  <button className="group p-[4px] rounded-[12px] bg-gradient-to-b from-white to-stone-200/40 shadow-[0_1px_3px_rgba(0,0,0,0.5)] active:shadow-[0_0px_1px_rgba(0,0,0,0.5)] active:scale-[0.995] w-full">
                    <Link href="/login" className="block">
                      <div className="bg-gradient-to-b from-stone-200/40 to-white/80 rounded-[8px] px-2 py-0.5">
                        <div className="flex gap-2 items-center justify-center">
                          <span className="font-semibold">Get Started</span>
                        </div>
                      </div>
                    </Link>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}