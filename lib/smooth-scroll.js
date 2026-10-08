import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// One shared Lenis instance for buttery smooth scrolling, driven by GSAP's ticker
// so ScrollTrigger, Motion and react-scroll-parallax all stay in sync.
let lenis = null;

export function startSmoothScroll() {
  if (typeof window === "undefined" || lenis) return lenis;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;

  lenis = new Lenis({ duration: 1.1, smoothWheel: true, autoRaf: false });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function getLenis() {
  return lenis;
}

const NAV_OFFSET = -72;

/** Scroll to an element id (or 0 for top). Falls back to native scrolling. */
export function scrollToTarget(target, { immediate = false } = {}) {
  const el = typeof target === "string" ? document.getElementById(target.replace(/^#/, "")) : null;
  if (lenis) {
    lenis.scrollTo(el ?? target, { offset: el ? NAV_OFFSET : 0, immediate, duration: 1.4 });
    return;
  }
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY + NAV_OFFSET;
    window.scrollTo({ top: y, behavior: immediate ? "instant" : "smooth" });
  } else {
    window.scrollTo({ top: typeof target === "number" ? target : 0, behavior: "instant" });
  }
}

export function lockScroll(locked) {
  if (lenis) locked ? lenis.stop() : lenis.start();
  document.documentElement.style.overflow = locked ? "hidden" : "";
}
