'use client';
import { RainbowButton } from "../magicui/rainbow-button";
import { FollowerPointerCard } from "../ui/following-pointer";
import { PointerHighlight } from "../ui/pointer-highlight";
import { TypewriterEffectSmooth } from "../ui/typewriter-effect";
import { Marquee } from "@/components/magicui/marquee";
import Image from "next/image";
import { useEffect, useRef } from "react";

const blogContent = {
  author: "User",
  authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
};

export default function About() {
  const ref = useRef(null);
  
  useEffect(() => {
    // Trigger animation observers for better support
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
          }
        });
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const words = [
    { text: "that ", 
      className: "text-3xl md:text-5xl lg:text-6xl"
    },
    { text: "saves ",
      className: "text-3xl md:text-5xl lg:text-6xl"
     },
    { text: "hours ",
      className: "text-3xl md:text-5xl lg:text-6xl"
     },
  ];

  return (
    <section ref={ref} className="relative pt-20 md:pt-40 px-4 md:px-8 lg:px-16 text-center opacity-0 transition-opacity duration-1000">

      <div className="max-w-4xl mx-auto flex flex-col items-center gap-y-5">

        <RainbowButton className="rounded-full px-6 py-2">
          About MailMind
        </RainbowButton>

        <div className="w-full">
          <FollowerPointerCard
            className="block w-full"
            title={
              <TitleComponent title={blogContent.author} avatar={blogContent.authorAvatar} />
            }
          >
            <h2 className="text-3xl md:text-5xl lg:text-6xl text-primary leading-tight">
              <div>We built an <PointerHighlight
                rectangleClassName="bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 leading-loose"
                pointerClassName="text-blue-500"
                containerClassName="inline-block mx-1"
              >
                <span className="relative z-10">AI-powered </span>
              </PointerHighlight></div>

              <div className="font-bold italic">Gmail companion <span className="font-medium not-italic">app</span></div>

              <div>
                <TypewriterEffectSmooth words={words} />
              </div>

              <div className="font-bold italic">
                <PointerHighlight
                  rectangleClassName="bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 leading-loose"
                  pointerClassName="text-blue-500"
                  containerClassName="inline-block mx-1"
                >
                  <span className="relative z-10">every week </span>
                  <span className="not-italic relative z-10">on email</span>
                </PointerHighlight>
                <span className="font-medium not-italic"> by</span>
              </div>

              <div>summarizing what <span className="font-bold italic">matters</span></div>

              <div className="font-bold">most to you</div>
            </h2>
          </FollowerPointerCard>
        </div>

      </div>

      <div className="mt-5 md:mt-7 lg:mt-10 text-xs md:text-lg font-semibold text-muted-foreground">
        Trusted by thousands of professionals and teams worldwide
      </div>

      <div className="flex justify-center">
        <div className="relative w-full max-w-4xl overflow-hidden">

          {/* Left shadow */}
          <div className="absolute left-0 top-0 w-16 h-full bg-gradient-to-r from-[#f2f4fd] to-transparent z-10 pointer-events-none"></div>

          {/* Right shadow */}
          <div className="absolute right-0 top-0 w-16 h-full bg-gradient-to-l from-[#f2f4fd] to-transparent z-10 pointer-events-none"></div>

          <Marquee className="py-4 flex items-center gap-8 relative z-20">
            <Image src="/companies/boltshift.svg" alt="boltshift" width={120} height={120} />
            <Image src="/companies/capsule.svg" alt="capsule" width={120} height={120} />
            <Image src="/companies/catalog.svg" alt="catalog" width={120} height={120} />
            <Image src="/companies/epicurious.svg" alt="epicurious" width={120} height={120} />
            <Image src="/companies/focalpoint.svg" alt="focalpoint" width={120} height={120} />
            <Image src="/companies/layer.svg" alt="layer" width={120} height={120} />
          </Marquee>
        </div>
      </div>
    </section>
  );
}

const TitleComponent = ({ title, avatar }) => (
  <div className="flex items-center justify-center space-x-2">
    <img
      src={avatar}
      height="20"
      width="20"
      alt="thumbnail"
      className="rounded-full border-2 border-white"
    />
    <p className="text-white text-sm">{title}</p>
  </div>
);
