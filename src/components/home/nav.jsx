'use client'

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import NavButton from "./nav-button-server";

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

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
          <button onClick={() => scrollToSection('home')} className="hover:text-gray-900 transition-colors">
            Home
          </button>
          <button onClick={() => scrollToSection('features')} className="hover:text-gray-900 transition-colors">
            Features
          </button>
          <button onClick={() => scrollToSection('pricing')} className="hover:text-gray-900 transition-colors">
            Pricing
          </button>
          <button onClick={() => scrollToSection('faq')} className="hover:text-gray-900 transition-colors">
            FAQ
          </button>
          <Link href="/blog" className="hover:text-gray-900 transition-colors">
            Blog
          </Link>
        </div>

        {/* Desktop Get Started Button */}
        <div className="hidden md:flex justify-center items-center gap-12 h-full">
          <NavButton />
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
              <button
                onClick={() => scrollToSection('home')}
                className="hover:text-gray-900 transition-colors py-2 text-left"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="hover:text-gray-900 transition-colors py-2 text-left"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="hover:text-gray-900 transition-colors py-2 text-left"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="hover:text-gray-900 transition-colors py-2 text-left"
              >
                FAQ
              </button>
              <Link
                href="/blog"
                className="hover:text-gray-900 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>

              {/* Mobile Get Started Button */}
              <div className="pt-2">
                <NavButton />
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}