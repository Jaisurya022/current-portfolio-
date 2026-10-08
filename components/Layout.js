import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { motion, useScroll, useSpring } from "motion/react";

export default function Layout({ children }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-marigold focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <motion.div
        aria-hidden
        style={{ scaleX }}
        className="fixed inset-x-0 top-0 z-[55] h-[3px] origin-left bg-marigold"
      />
      <Nav />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
