import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { profile } from "@/data/profile";
import { lockScroll, scrollToTarget } from "@/lib/smooth-scroll";

const links = [
  { href: "/#about", label: "About" },
  { href: "/#work", label: "Experience" },
  { href: "/#projects", label: "Projects" },
  { href: "/#skills", label: "Skills" },
];

export default function Nav() {
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setSolid(y > 40);
    setHidden(y > 400 && y > prev && !open);
  });

  useEffect(() => {
    const close = () => setOpen(false);
    router.events.on("hashChangeStart", close);
    router.events.on("routeChangeStart", close);
    return () => {
      router.events.off("hashChangeStart", close);
      router.events.off("routeChangeStart", close);
    };
  }, [router.events]);

  useEffect(() => {
    lockScroll(open);
  }, [open]);

  // On the home page, glide to the section instead of jumping.
  const go = (href) => (e) => {
    const id = href.split("#")[1];
    setOpen(false);
    if (router.pathname !== "/" || !id) return;
    e.preventDefault();
    lockScroll(false);
    scrollToTarget(id);
    history.replaceState(null, "", `/#${id}`);
  };

  return (
    <motion.header
      animate={{ y: hidden ? "-110%" : "0%" }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid || open ? "border-b border-line/60 bg-ink/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <nav className="container-x flex h-16 items-center justify-between sm:h-20" aria-label="Main">
        <Link
          href="/"
          onClick={(e) => {
            if (router.pathname === "/") {
              e.preventDefault();
              setOpen(false);
              scrollToTarget(0);
              history.replaceState(null, "", "/");
            }
          }}
          className="font-display text-xl font-bold tracking-tight"
        >
          Jai Surya<span className="text-marigold">.</span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} onClick={go(l.href)} className="group relative py-2 text-[0.95rem] text-mist transition-colors hover:text-paper">
                {l.label}
                <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-marigold transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            </li>
          ))}
          <li>
            <Link href="/#contact" onClick={go("/#contact")} className="btn btn-primary !px-5 !py-2 text-[0.95rem]">
              Get in touch
            </Link>
          </li>
        </ul>

        <button
          type="button"
          className="relative grid h-11 w-11 place-items-center rounded-full border border-line md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <motion.span
            className="absolute h-0.5 w-5 rounded bg-paper"
            animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
          />
          <motion.span
            className="absolute h-0.5 w-5 rounded bg-paper"
            animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
          />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            data-lenis-prevent
            className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line/60 bg-ink md:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="container-x flex flex-col gap-1 pt-8">
              {[...links, { href: "/#contact", label: "Contact" }].map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={l.href}
                    onClick={go(l.href)}
                    className="block py-2 font-display text-[clamp(2.25rem,11vw,3rem)] font-semibold"
                  >
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="container-x mt-10 text-mist">
              <a href={`mailto:${profile.email}`} className="block py-1 hover:text-paper">{profile.email}</a>
              <a href={profile.phoneHref} className="block py-1 hover:text-paper">{profile.phone}</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
