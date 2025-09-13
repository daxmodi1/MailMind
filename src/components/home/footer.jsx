import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <div className="px-5 p-10">
      <footer className="relative z-10 pt-20 md:pt-30 lg:pt-50 flex flex-col md:flex-row items-center md:justify-between text-muted-foreground max-w-7xl mx-auto gap-10">
        
        {/* Logo and description */}
        <div className="flex flex-col items-center md:flex-row gap-4 text-center md:text-left max-w-xs md:max-w-sm">
          <Image
            src="/logo.png"
            alt="mailmind"
            width={45}
            height={45}
          />
          <div>
            We provide a powerful solution that makes communication effortless
          </div>
        </div>

        {/* Navigation links */}
        <div className="hidden md:flex flex-col md:flex-row gap-4 md:gap-x-10 items-center max-w-xs md:max-w-md text-center">
          <Link href="/">Home</Link>
          <Link href="/">Features</Link>
          <Link href="/">Pricing</Link>
          <Link href="/">FAQ</Link>
          <Link href="/">Blog</Link>
        </div>

        {/* Social icons */}
        <div className="flex justify-center gap-5 max-w-xs">
          <Image src="/icons/linkedin.svg" alt="linkedin" width={30} height={30} />
          <Image src="/icons/instagram.svg" alt="instagram" width={30} height={30} />
          <Image src="/icons/twitter.svg" alt="twitter" width={30} height={30} />
          <Image src="/icons/youtube.svg" alt="youtube" width={30} height={30} />
        </div>
      </footer>
    </div>
  );
}
