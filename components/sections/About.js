import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { animate, useInView } from "motion/react";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import { education, profile } from "@/data/profile";

const ParticlePortrait = dynamic(() => import("@/components/visuals/ParticlePortrait"), { ssr: false });

const ease = [0.16, 1, 0.3, 1];

function CountUp({ value }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const match = value.match(/^(\D*)(\d+)(.*)$/);
  const [prefix, num, suffix] = match ? [match[1], Number(match[2]), match[3]] : ["", 0, value];
  const [display, setDisplay] = useState(num);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const controls = animate(0, num, { duration: 1.4, ease, onUpdate: (v) => setDisplay(Math.round(v)) });
    return () => controls.stop();
  }, [inView, num]);

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

export default function About() {
  return (
    <section id="about" className="scroll-mt-20 py-24 sm:py-32">
      <div className="container-x grid items-start gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <div className="lg:sticky lg:top-24">
          <div className="relative mx-auto aspect-[11/10] w-full max-w-[380px] sm:max-w-[460px] lg:max-w-[520px]">
            {/* orbit rings behind the portrait */}
            <div aria-hidden className="absolute inset-[6%] rounded-full border border-line/70" />
            <div aria-hidden className="absolute inset-[18%] rounded-full border border-dashed border-line/60" />
            <div
              aria-hidden
              className="absolute inset-0 rounded-full opacity-60 blur-3xl"
              style={{ background: "radial-gradient(circle at 50% 45%, rgba(92,124,255,0.28), transparent 62%)" }}
            />
            <div className="relative h-full w-full">
              <ParticlePortrait />
            </div>
            {/* real photo for screen readers and as the image search engines see */}
            <img src={profile.photo} alt={`Portrait of ${profile.name}`} className="sr-only" />
          </div>
          <p className="mt-4 text-center text-sm text-mist">
            <span className="hidden [@media(hover:hover)]:inline">Move your cursor over the portrait, or click it.</span>
            <span className="[@media(hover:hover)]:hidden">Tap the portrait to scatter it.</span>
          </p>
        </div>

        <div>
          <SectionHeading id="about-title">About me</SectionHeading>

          <Reveal
            as="p"
            from={{ opacity: 0, y: 24 }}
            to={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="font-display text-[clamp(1.2rem,2.3vw,1.75rem)] leading-snug font-medium"
          >
            {profile.summary}
          </Reveal>

          <Reveal
            as="p"
            from={{ opacity: 0, y: 24 }}
            to={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.1 }}
            className="mt-6 max-w-[38rem] text-mist"
          >
            {profile.approach}
          </Reveal>

          <dl className="mt-10 grid grid-cols-3 gap-3 border-t border-line pt-8 sm:gap-6">
            {profile.facts.map((f) => (
              <div key={f.label}>
                <dt className="sr-only">{f.label}</dt>
                <dd className="font-display text-[clamp(1.75rem,7vw,3.25rem)] font-bold leading-none text-marigold">
                  <CountUp value={f.value} />
                </dd>
                <dd className="mt-2 text-xs leading-snug text-mist sm:text-sm">{f.label}</dd>
              </div>
            ))}
          </dl>

          <Reveal
            from={{ opacity: 0, y: 24 }}
            to={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="mt-10 rounded-2xl border border-line bg-ink-2/60 p-5 sm:p-6"
          >
            <p className="text-sm text-mist">Education</p>
            <p className="mt-1 font-display text-lg font-semibold">{education.degree}</p>
            <p className="text-mist">
              {education.school}, {education.period}. {education.grade}.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
