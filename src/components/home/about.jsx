"use client";
import { RainbowButton } from "../magicui/rainbow-button";
import { FollowerPointerCard } from "../ui/following-pointer";
import { PointerHighlight } from "../ui/pointer-highlight";
import { TypewriterEffectSmooth } from "../ui/typewriter-effect";
import { Marquee } from "@/components/magicui/marquee";
import Image from "next/image";

const blogContent = {
  author: "dax",
  authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
};

export default function About() {
  const words = [
    {
      text: "that ",
    },
    {
      text: "makes ",
    },
    {
      text: "communication ",
    },
  ];

  return (
    <section className="relative py-20 px-5 text-center">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-y-5">
        <RainbowButton className="rounded-full">
          About us
        </RainbowButton>

        {/* Add proper container with block display and padding */}
        <div className="w-full">
          <FollowerPointerCard
            className="block w-full"
            title={
              <TitleComponent title={blogContent.author} avatar={blogContent.authorAvatar} />
            }>
            <h2 className="text-6xl text-primary mb-8 leading-tight">
              <div>We provide a <PointerHighlight
                rectangleClassName="bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 leading-loose"
                pointerClassName="text-blue-500"
                containerClassName="inline-block mx-1"><span className="relative z-10">powerful </span></PointerHighlight></div>
              <div className="font-bold italic">Email management <span className="font-medium not-italic">solution</span></div>
              <div>
                <TypewriterEffectSmooth words={words} />
              </div>
              <div className="font-bold italic">
                <PointerHighlight
                  rectangleClassName="bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 leading-loose"
                  pointerClassName="text-blue-500"
                  containerClassName="inline-block mx-1">
                  <span className="relative z-10">effortless, </span>
                  <span className="not-italic relative z-10">secure</span>
                </PointerHighlight>
                <span className="font-medium not-italic"> and</span>
              </div>
              <div>optimized for <span className="font-bold italic">your</span></div>
              <div className="font-bold">workflow</div>
            </h2>
          </FollowerPointerCard>
        </div>
      </div>
      <div className="mt-10 text-lg font-semibold text-muted-foreground">
        Trusted by thousands of professionals and teams worldwide
      </div>
      
      {/* Updated marquee container with 50% width and shadow effects */}
      <div className="flex justify-center">
        <div className="relative w-1/2 overflow-hidden">
          {/* Left shadow */}
          <div className="absolute left-0 top-0 w-20 h-full  bg-gradient-to-r from-[#f6ebfb] to-transparent z-10 pointer-events-none"></div>
          
          {/* Right shadow */}
          <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-[#f6ebfb] to-transparent z-10 pointer-events-none"></div>
          
          <Marquee className="py-4">
            <Image src="/boltshift.svg" alt="boltshift" width={150} height={150} />
            <Image src="/capsule.svg" alt="capsule" width={150} height={150} />
            <Image src="/catalog.svg" alt="catalog" width={150} height={150} />
            <Image src="/epicurious.svg" alt="epicurious" width={150} height={150} />
            <Image src="/focalpoint.svg" alt="focalpoint" width={150} height={150} />
            <Image src="/layer.svg" alt="layer" width={150} height={150} />
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