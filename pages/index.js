import { useEffect } from "react";
import Seo from "@/components/Seo";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import Contact from "@/components/sections/Contact";
import { ScrollTrigger } from "@/lib/gsap";
import { scrollToTarget } from "@/lib/smooth-scroll";

export default function Home() {
  useEffect(() => {
    // Arriving from another page with a #hash: jump to that section once layout settles.
    const t = setTimeout(() => {
      ScrollTrigger.refresh();
      const id = window.location.hash.slice(1);
      if (id) scrollToTarget(id);
    }, 350);
    // fonts change text heights, so recalc pin/scroll positions after they load
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Seo />
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Skills />
      <Contact />
    </>
  );
}
