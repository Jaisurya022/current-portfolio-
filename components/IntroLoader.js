import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { lockScroll } from "@/lib/smooth-scroll";

// "Hello" in the languages of the world, ending in Tamil — home.
const GREETINGS = ["Hello", "Bonjour", "Hola", "こんにちは", "Ciao", "Olá", "नमस्ते", "Hallo", "வணக்கம்"];
const ease = [0.76, 0, 0.24, 1];

export default function IntroLoader({ onDone }) {
  const [index, setIndex] = useState(0);
  const [words, setWords] = useState(GREETINGS);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem("intro-seen") === "1";
      sessionStorage.setItem("intro-seen", "1");
    } catch {}

    if (reduced || seen) {
      // returning visitors in the same session get a short greeting only
      setWords(["வணக்கம்"]);
      const t = setTimeout(onDone, reduced ? 50 : 550);
      return () => clearTimeout(t);
    }

    lockScroll(true);
    let i = 0;
    let timer;
    const step = () => {
      i += 1;
      if (i >= GREETINGS.length) {
        timer = setTimeout(() => {
          lockScroll(false);
          onDone();
        }, 650);
        return;
      }
      setIndex(i);
      timer = setTimeout(step, i === GREETINGS.length - 1 ? 200 : 170);
    };
    timer = setTimeout(step, 700);
    return () => {
      clearTimeout(timer);
      lockScroll(false);
    };
  }, [onDone]);

  const word = words[Math.min(index, words.length - 1)];

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink-2"
      initial={{ y: 0 }}
      exit={{ y: "-100%", transition: { duration: 0.95, ease } }}
      role="status"
      aria-label="Loading"
    >
      <motion.p
        className="flex items-center gap-4 font-display text-[clamp(2.6rem,8vw,5.5rem)] font-bold text-paper"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40, transition: { duration: 0.4, ease } }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="h-3 w-3 shrink-0 rounded-full bg-marigold sm:h-4 sm:w-4" />
        <span key={word} lang="und">{word}</span>
      </motion.p>

      <p className="absolute bottom-8 left-0 right-0 text-center text-sm text-mist">
        From Chennai, to the world
      </p>

      {/* curved bottom edge that flattens as the screen lifts */}
      <svg
        className="pointer-events-none absolute left-0 top-full h-[18vh] w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <motion.path
          className="fill-ink-2"
          initial={{ d: "M0 0 L100 0 Q50 100 0 0 Z" }}
          exit={{ d: "M0 0 L100 0 Q50 0 0 0 Z", transition: { duration: 0.95, ease } }}
        />
      </svg>
    </motion.div>
  );
}
