import Hero from "@/components/home/hero";
import Nav from "@/components/home/nav";
import About from "@/components/home/about";
import Features from "@/components/home/features";
import Features2 from "@/components/home/features-2"
import Pricing from "@/components/home/pricing";
import Faq from "@/components/home/faq";
import Footer from "@/components/home/footer";
export default function Home() {
  return (
    <div className="font-main">
      <section
        className="md:min-h-screen bg-cover repeat-0"
        style={{ backgroundImage: "url('/bg/bg.png')" }}
      >
        <Nav />
        <Hero />
      </section>
      <div
        className="w-full h-13 backdrop-blur-md bg-white/10 -my-8 relative z-10"
      />
      <section
        className="md:min-h-screen bg-center bg-cover repeat-0"
        style={{ backgroundImage: "url('/bg/bg2.png')" }}
      >
        <About />
      </section>
      <div
        className="w-full h-13 backdrop-blur-md bg-white/10 -my-8 relative z-10"
      />
      <section
        className="min-h-screen bg-cover bg-center repeat-0"
        style={{ backgroundImage: "url('/bg/bg3.png')" }}
      >
        <Features />
      </section>
      <div
        className="w-full h-13 backdrop-blur-md bg-white/10 -my-8 relative z-10"
      />
      <section
        className="min-h-screen bg-cover bg-center"
        style={{ backgroundImage: "url('/bg/bg4.png')" }}
      >
        <Features2 />
      </section>
      <div
        className="w-full h-13 backdrop-blur-md bg-white/10 -my-8 relative z-10"
      />
      <section
        className="min-h-screen bg-cover bg-center"
        style={{ backgroundImage: "url('/bg/bg4.png')" }}
      >
        <Pricing />
      </section>
      <div
        className="w-full h-13 backdrop-blur-md bg-white/10 -my-8 relative z-10"
      />
      <section
        className="min-h-screen bg-cover bg-center"
        style={{ backgroundImage: "url('/bg/bg4.png')" }}
      >
        <Faq />
      </section>
      <div
        className="w-full h-13 backdrop-blur-xl bg-white/10 -my-8 relative z-10"
      />
      <section
        className="relative bg-cover bg-center repeat-0"
        style={{ backgroundImage: "url('/bg/bg3.png')" }}
      >
        <Footer />
      </section>
    </div>
  );
}
