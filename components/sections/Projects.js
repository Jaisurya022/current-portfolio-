import { useRef } from "react";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import Magnetic from "@/components/Magnetic";
import { ProjectVisual } from "@/components/visuals/ProjectVisuals";
import { gsap, useGSAP } from "@/lib/gsap";
import { projects } from "@/data/profile";

/*
  Normal vertical scrolling. On large screens each project card sticks near the
  top and the next one slides up over it, while the card underneath shrinks
  and dims slightly — a stack of cards. On phones they're a simple list.
*/
export default function Projects() {
  const scope = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray(".proj-card");
        cards.forEach((card, i) => {
          const next = cards[i + 1];
          if (!next) return;
          gsap.to(card.querySelector(".proj-inner"), {
            scale: 0.92,
            opacity: 0.35,
            ease: "none",
            scrollTrigger: {
              trigger: next,
              start: "top bottom",
              end: "top 20%",
              scrub: true,
            },
          });
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray(".proj-reveal").forEach((el) => {
          gsap.from(el, {
            y: 80,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });
      });
    },
    { scope }
  );

  return (
    <section id="projects" ref={scope} className="scroll-mt-20 py-24 sm:py-32">
      <div className="container-x">
        <SectionHeading id="projects-title" sub="Three platforms I built the frontend for, from first commit to production.">
          Projects
        </SectionHeading>

        <div className="flex flex-col gap-6 sm:gap-8 lg:gap-[14vh]">
          {projects.map((p, i) => (
            <article
              key={p.slug}
              className="proj-card lg:sticky"
              style={{ top: `calc(6rem + ${i * 1.75}rem)` }}
            >
              <div className="proj-reveal">
              <div className="proj-inner origin-top rounded-[24px] border border-line bg-ink-2 p-4 shadow-[0_-20px_60px_-30px_rgba(0,0,0,0.7)] sm:rounded-[28px] sm:p-8 lg:p-10">
                <div className="grid items-center gap-6 sm:gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
                  <div className="px-1 pt-1 sm:p-0">
                    <p className="text-sm text-mist sm:text-base">
                      Project {i + 1} of {projects.length}, {p.kind}
                    </p>
                    <h3 className="mt-2 text-[clamp(1.85rem,4vw,3.4rem)] font-bold sm:mt-3">{p.name}</h3>
                    <p className="mt-3 max-w-[32rem] text-base text-mist sm:mt-4 sm:text-lg">{p.short}</p>
                    <ul className="mt-5 flex flex-wrap gap-2 sm:mt-6" aria-label="Tech stack">
                      {p.stack.map((s) => (
                        <li key={s} className="rounded-full border border-line px-2.5 py-1 text-xs text-paper sm:px-3 sm:text-sm">
                          {s}
                        </li>
                      ))}
                    </ul>
                    <Magnetic className="mt-6 w-full sm:mt-8 sm:w-auto">
                      <Link href={`/projects/${p.slug}`} className="btn btn-primary w-full sm:w-auto">
                        Read the case study
                      </Link>
                    </Magnetic>
                  </div>
                  <ProjectVisual project={p} />
                </div>
              </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
