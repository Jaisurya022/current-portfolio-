import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import Magnetic from "@/components/Magnetic";
import { useIntro } from "@/lib/intro";
import { scrollToTarget } from "@/lib/smooth-scroll";
import { profile } from "@/data/profile";

const GlobeScene = dynamic(() => import("@/components/visuals/GlobeScene"), { ssr: false, loading: () => null });

const ease = [0.16, 1, 0.3, 1];
const ROLES = ["AI hiring platforms", "real-time chat apps", "fast React interfaces", "smooth checkout flows"];

function RotatingRole({ active }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setI((v) => (v + 1) % ROLES.length), 2600);
    return () => clearInterval(id);
  }, [active]);
  return (
    <span className="relative inline-flex h-[1.3em] overflow-hidden align-bottom">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={ROLES[i]}
          className="block whitespace-nowrap text-marigold"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.6, ease }}
        >
          {ROLES[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function Hero() {
  const { ready } = useIntro();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const globeY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const globeScale = useTransform(scrollYProgress, [0, 1], [1, 0.82]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  // scroll-linked parallax/fade only on large screens; on phones the hero is
  // taller than the screen and fading it would hide buttons you can still see
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const words = profile.firstName.split(" ");
  const show = (delay) => ({
    initial: { opacity: 0, y: 24 },
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    transition: { duration: 0.9, ease, delay },
  });

  return (
    <section ref={ref} className="relative overflow-hidden pt-16 sm:pt-24 lg:flex lg:min-h-[100svh] lg:items-center">
      {/* soft glow behind the globe */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-10%] top-[10%] h-[70vh] w-[70vh] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(92,124,255,0.35), transparent 65%)" }}
      />

      <div className="container-x relative grid items-center gap-2 lg:grid-cols-[1fr_1.05fr] lg:gap-6">
        <motion.div
          style={desktop ? { y: textY, opacity: fade } : undefined}
          className="relative z-10 order-2 pb-14 lg:order-1 lg:pb-0"
        >
          <motion.p {...show(0.15)} className="text-base text-mist sm:text-xl">
            Vanakkam, I&apos;m
          </motion.p>

          <h1
            aria-label={profile.firstName}
            className="mt-1 text-[clamp(3.25rem,14vw,8.5rem)] leading-[0.92] font-extrabold tracking-[-0.035em] [perspective:600px]"
          >
            {words.map((word, w) => (
              <span key={w} aria-hidden className="mr-[0.22em] inline-block whitespace-nowrap last:mr-0">
                {word.split("").map((ch, i) => (
                  <span key={i} className="inline-block overflow-hidden pb-[0.06em] align-bottom">
                    <motion.span
                      className="inline-block origin-bottom"
                      initial={{ y: "105%", rotateX: -70 }}
                      animate={ready ? { y: "0%", rotateX: 0 } : { y: "105%", rotateX: -70 }}
                      transition={{ duration: 1, ease, delay: 0.2 + (w * 4 + i) * 0.05 }}
                    >
                      {ch}
                    </motion.span>
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <motion.p {...show(0.65)} className="mt-4 text-[clamp(1.25rem,2.6vw,2rem)] font-display font-semibold leading-tight sm:mt-5">
            Frontend developer building
            <br />
            <RotatingRole active={ready} />
          </motion.p>

          <motion.p {...show(0.8)} className="mt-4 max-w-[32rem] text-base text-mist sm:mt-5 sm:text-lg">
            React.js and Next.js developer from Chennai with 2+ years shipping production apps. Open to roles in India
            and remote teams worldwide.
          </motion.p>

          <motion.div {...show(0.95)} className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
            <Magnetic className="w-full sm:w-auto">
              <Link
                href="/#projects"
                className="btn btn-primary w-full sm:w-auto"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTarget("projects");
                  history.replaceState(null, "", "/#projects");
                }}
              >
                See my projects
              </Link>
            </Magnetic>
            <Magnetic className="w-full sm:w-auto">
              <a href={profile.resume} target="_blank" rel="noreferrer" className="btn btn-ghost w-full sm:w-auto">
                Download résumé
              </a>
            </Magnetic>
          </motion.div>
        </motion.div>

        <motion.div
          style={desktop ? { y: globeY, scale: globeScale } : undefined}
          className="relative order-1 mx-auto aspect-square w-[min(74vw,300px)] sm:w-[min(60vw,440px)] lg:order-2 lg:w-full lg:max-w-none"
        >
          <motion.div
            className="h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0 }}
            transition={{ duration: 1.2 }}
          >
            <GlobeScene ready={ready} />
          </motion.div>
          <motion.p
            {...show(2.6)}
            className="pointer-events-none absolute bottom-[6%] left-0 right-0 hidden text-center text-sm text-mist lg:block"
          >
            Drag to spin the globe
          </motion.p>
        </motion.div>
      </div>

      <motion.div
        aria-hidden
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs text-mist lg:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ delay: 1.8 }}
      >
        Scroll
        <span className="relative h-10 w-px overflow-hidden bg-line">
          <motion.span
            className="absolute inset-x-0 top-0 h-1/2 bg-marigold"
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
    </section>
  );
}
