'use client';
import { RainbowButton } from "../magicui/rainbow-button";
import { PointerHighlight } from "../ui/pointer-highlight";
import Image from "next/image";

export default function Features() {
  return (
    <div className="pt-20 md:pt-50 lg:pt-60 flex flex-col items-center w-full relative z-20 min-h-screen pb-20 px-4 md:px-8 lg:px-16">
      <RainbowButton className="rounded-full px-6 py-2">
        Features
      </RainbowButton>

      <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold md:font-semibold text-center mt-4 text-primary leading-tight">
        Powerful{' '}
        <PointerHighlight
          rectangleClassName="bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 leading-loose"
          pointerClassName="text-blue-500"
          containerClassName="inline-block mx-1"
        >
          <span className="relative z-10 font-bold italic md:not-italic">features</span>
        </PointerHighlight>{' '}
        to Elevate
      </h1>

      <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold md:font-semibold text-center mt-1 mb-5 text-primary leading-tight">
        Your Email Experience
      </h1>

      <p className="text-muted-foreground font-semibold text-center text-lg mb-10 w-99 md:w-150 lg:w-170">
        MailMind supercharges your Gmail with AI-powered features that save hours every week.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto w-full">
        
        {[
          {
            src: '/Mail.svg',
            title: 'AI Email Summaries',
            desc: 'Get instant AI-generated summaries of long emails. Understand the key points in seconds without reading walls of text.',
            alt: 'AI Email Summaries',
          },
          {
            src: '/calander.svg',
            title: 'Smart Search & Filters',
            desc: [
              'Find any email instantly with intelligent search that',
              'understands context, not just keywords.',
            ],
            alt: 'Smart Search',
          },
          {
            src: '/file.svg',
            title: 'Seamless Gmail Integration',
            desc: [
              'One-click connection to your Gmail account.',
              'All your emails, labels, and folders sync automatically.',
            ],
            alt: 'Gmail Integration',
          },
          {
            src: '/Security.svg',
            title: 'Privacy-First Design',
            desc: [
              'Your emails stay private. We use secure OAuth and',
              'never store your email content on our servers.',
            ],
            alt: 'Privacy & Security',
          },
        ].map((feature, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center bg-gradient-to-b from-white/70 via-white/30 to-white/10 border border-white/50 rounded-2xl p-6 transition-transform duration-300 ease-in-out hover:scale-105"
          >
            <Image
              src={feature.src}
              alt={feature.alt}
              width={200}
              height={200}
              className="mb-4 transition-all duration-300 ease-in-out hover:scale-110"
            />
            <h2 className="text-xl font-semibold text-center text-neutral-700 mb-2">
              {feature.title}
            </h2>
              <p className="text-md text-center text-muted-foreground">
                {feature.desc}
              </p>
          </div>
        ))}

      </div>
    </div>
  );
}
