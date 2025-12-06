'use client';

import Link from 'next/link';
import { RainbowButton } from '@/components/magicui/rainbow-button';
import { Sparkles, ArrowLeft, Bell } from 'lucide-react';

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-sm font-bold">✨</span>
            </div>
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Bell className="w-4 h-4" />
          Pro Plan
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
          Coming Soon
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-gray-600 mb-4">
          MailMind Pro is almost ready!
        </p>

        {/* Description */}
        <p className="text-gray-500 mb-8 max-w-lg mx-auto">
          We're putting the finishing touches on our Pro features including unlimited AI summaries, 
          advanced smart search, and AI-assisted email drafting. Be the first to know when we launch.
        </p>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { title: 'Unlimited AI Summaries', desc: 'No monthly limits' },
            { title: 'AI Email Drafting', desc: 'Write emails faster' },
            { title: 'Priority Support', desc: '24/7 assistance' },
          ].map((feature, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Email Signup Form */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
          <h3 className="font-semibold text-gray-800 mb-3">Get notified when Pro launches</h3>
          <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <RainbowButton type="submit" className="px-6 py-3 rounded-lg">
              Notify Me
            </RainbowButton>
          </form>
          <p className="text-xs text-gray-400 mt-3">We'll only email you when Pro is ready. No spam.</p>
        </div>

        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
}
