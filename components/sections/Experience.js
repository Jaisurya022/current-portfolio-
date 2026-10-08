import { useRef } from "react";
import SectionHeading from "@/components/SectionHeading";
import { gsap, useGSAP } from "@/lib/gsap";
import { experience } from "@/data/profile";

export default function Experience() {
  const scope = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // the marigold line fills as you scroll through the role
        gsap.fromTo(
          ".exp-fill",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: ".exp-list", start: "top 70%", end: "bottom 60%", scrub: 0.6 },
          }
        );
        gsap.utils.toArray(".exp-item").forEach((item) => {
          gsap.from(item, {
            opacity: 0,
            y: 28,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 88%", once: true },
          });
          gsap.to(item.querySelector(".exp-dot"), {
            backgroundColor: "#ffc94a",
            borderColor: "#ffc94a",
            scale: 1.25,
            scrollTrigger: { trigger: item, start: "top 60%", toggleActions: "play none none reverse" },
          });
        });
      });
    },
    { scope }
  );

  return (
    <section id="work" ref={scope} className="scroll-mt-20 bg-ink-2 py-24 sm:py-36">
      <div className="container-x">
        <SectionHeading id="work-title" sub="Where I've been shipping production React.">
          Experience
        </SectionHeading>

        {experience.map((job) => (
          <div key={job.company} className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <p className="text-mist">{job.period}</p>
              <h3 className="mt-3 text-3xl font-bold sm:text-4xl">{job.role}</h3>
              <p className="mt-2 text-lg text-paper">{job.company}</p>
              <p className="text-mist">{job.place}</p>
            </div>

            <ul className="exp-list relative pl-9 sm:pl-10">
              <span aria-hidden className="absolute left-[7px] top-2 bottom-2 w-px bg-line" />
              <span aria-hidden className="exp-fill absolute left-[7px] top-2 bottom-2 w-px origin-top bg-marigold" />
              {job.points.map((p) => (
                <li key={p} className="exp-item relative pb-8 last:pb-0 sm:pb-10">
                  <span
                    aria-hidden
                    className="exp-dot absolute -left-9 top-1.5 sm:-left-10 h-[15px] w-[15px] rounded-full border-2 border-line bg-ink-2"
                  />
                  <p className="max-w-[36rem] text-base leading-relaxed sm:text-lg">{p}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
