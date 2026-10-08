import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { Parallax } from "react-scroll-parallax";
import SectionHeading from "@/components/SectionHeading";
import { projects, skillDetails, skills } from "@/data/profile";

const ease = [0.16, 1, 0.3, 1];
const projectBySlug = Object.fromEntries(projects.map((p) => [p.slug, p]));

const chipList = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
};
const chipItem = {
  hidden: { opacity: 0, y: 22, scale: 0.85, rotate: -4 },
  show: { opacity: 1, y: 0, scale: 1, rotate: 0, transition: { type: "spring", stiffness: 380, damping: 24 } },
};

/* ---------- category tabs ---------- */

function Tabs({ active, onChange }) {
  const refs = useRef([]);

  const onKeyDown = (e) => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const next = (active + keys[e.key] + skills.length) % skills.length;
    onChange(next);
    refs.current[next]?.focus();
    refs.current[next]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  return (
    <div
      role="tablist"
      aria-label="Skill categories"
      onKeyDown={onKeyDown}
      data-lenis-prevent-horizontal
      className="no-scrollbar -mx-5 flex [mask-image:linear-gradient(to_right,black_82%,transparent)] snap-x snap-mandatory gap-2 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0 lg:[mask-image:none]"
    >
      {skills.map((g, i) => {
        const selected = i === active;
        return (
          <button
            key={g.group}
            ref={(el) => (refs.current[i] = el)}
            id={`skill-tab-${i}`}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls="skill-panel"
            tabIndex={selected ? 0 : -1}
            onClick={(e) => {
              onChange(i);
              e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
            }}
            className={`relative shrink-0 snap-center whitespace-nowrap rounded-full px-4 py-2.5 text-left text-[0.95rem] font-medium transition-colors duration-300 lg:flex lg:items-center lg:justify-between lg:rounded-2xl lg:px-5 lg:py-4 lg:font-display lg:text-xl lg:font-semibold ${
              selected ? "text-ink lg:text-paper" : "text-mist hover:text-paper"
            } ${selected ? "" : "border border-line lg:border-transparent"}`}
          >
            {selected && (
              <motion.span
                layoutId="skill-tab-indicator"
                className="absolute inset-0 rounded-full bg-marigold lg:rounded-2xl lg:bg-ink-3"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              >
                <span className="absolute left-0 top-1/2 hidden h-8 w-1 -translate-y-1/2 rounded-full bg-marigold lg:block" />
              </motion.span>
            )}
            <span className="relative z-10">{g.group}</span>
            <span
              className={`relative z-10 ml-2 text-sm tabular-nums lg:ml-4 lg:font-sans lg:text-base lg:font-normal ${
                selected ? "text-ink/70 lg:text-marigold" : "text-mist/70"
              }`}
            >
              {g.items.length}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- detail card for the selected skill ---------- */

function SkillDetail({ name }) {
  const info = skillDetails[name] || { note: "", projects: [] };
  return (
    <motion.div layout className="mt-5 overflow-hidden rounded-2xl border border-line bg-ink-2/70 p-4 sm:mt-6 sm:p-6">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={name}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease }}
          aria-live="polite"
        >
          <p className="font-display text-2xl font-bold sm:text-3xl">{name}</p>
          <p className="mt-2 text-mist">{info.note}</p>
          {info.projects.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-mist">Used in</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {info.projects.map((slug, i) => (
                  <motion.li
                    key={slug}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 + i * 0.07, duration: 0.35, ease }}
                  >
                    <Link
                      href={`/projects/${slug}`}
                      className="inline-flex items-center gap-2 rounded-full bg-cobalt/15 px-3.5 py-1.5 text-sm text-paper transition-colors hover:bg-cobalt/30"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-marigold" />
                      {projectBySlug[slug]?.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

/* ---------- endless skill tape that speeds up with scrolling ---------- */

const wrap = (min, max, v) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

function TapeRow({ items, speed, className }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const boost = useTransform(smooth, [-1500, 0, 1500], [-4, 0, 4], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const dir = useRef(1);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useAnimationFrame((_, delta) => {
    if (!inView || reduced.current) return;
    const b = boost.get();
    if (b < -0.05) dir.current = -1;
    else if (b > 0.05) dir.current = 1;
    const move = dir.current * speed * (delta / 1000) * (1 + Math.abs(b));
    baseX.set(baseX.get() + move);
  });

  const line = [...items, ...items];
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div style={{ x }} className="flex w-max items-center whitespace-nowrap py-3 sm:py-4">
        {line.map((s, i) => (
          <span key={i} className="flex items-center font-display text-xl font-bold sm:text-3xl">
            <span className="px-4 sm:px-6">{s}</span>
            <span className="text-base sm:text-xl">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function SkillTape() {
  const all = skills.flatMap((g) => g.items);
  const half = Math.ceil(all.length / 2);
  // two tapes crossing in an X (stacked on phones); they tilt a little as you scroll past
  return (
    <div aria-hidden className="relative mt-14 h-40 sm:mt-24 sm:h-48">
      <Parallax rotate={[4, 2]} className="absolute inset-x-[-6%] top-[70%] -translate-y-1/2 sm:top-1/2">
        <TapeRow items={all.slice(half)} speed={1.8} className="border-y border-line bg-ink text-paper" />
      </Parallax>
      <Parallax rotate={[-4, -2]} className="absolute inset-x-[-6%] top-[30%] z-10 -translate-y-1/2 sm:top-1/2">
        <TapeRow items={all.slice(0, half)} speed={-2.2} className="bg-marigold text-ink shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]" />
      </Parallax>
    </div>
  );
}

/* ---------- section ---------- */

export default function Skills() {
  const [cat, setCat] = useState(0);
  const [skill, setSkill] = useState(skills[0].items[0]);
  const panelRef = useRef(null);
  const inView = useInView(panelRef, { once: true, margin: "-15% 0px" });
  const group = skills[cat];

  const changeCat = (i) => {
    setCat(i);
    setSkill(skills[i].items[0]);
  };

  return (
    <section id="skills" className="scroll-mt-20 overflow-hidden bg-ink-2 pt-24 pb-16 sm:pt-32 sm:pb-20">
      <div className="container-x">
        <SectionHeading id="skills-title" sub="The tools I reach for every day. Pick a skill to see where I've used it.">
          Skills
        </SectionHeading>

        <LayoutGroup id="skills">
          <div className="grid gap-6 lg:grid-cols-[minmax(260px,320px)_1fr] lg:gap-10">
            <Tabs active={cat} onChange={changeCat} />

            <div
              ref={panelRef}
              id="skill-panel"
              role="tabpanel"
              aria-labelledby={`skill-tab-${cat}`}
              className="relative rounded-[24px] border border-line bg-ink p-4 sm:rounded-[28px] sm:p-8"
            >
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 sm:mb-5">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.h3
                    key={group.group}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.3, ease }}
                    className="hidden text-3xl font-bold lg:block"
                  >
                    {group.group}
                  </motion.h3>
                </AnimatePresence>
                <p className="flex items-center gap-2 text-sm text-mist">
                  <span className="h-1.5 w-1.5 rounded-full bg-marigold" /> used in a featured project
                </p>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.ul
                  key={group.group}
                  variants={chipList}
                  initial="hidden"
                  animate={inView ? "show" : "hidden"}
                  exit="exit"
                  className="flex flex-wrap gap-2.5"
                  aria-label={`${group.group} skills`}
                >
                  {group.items.map((s) => {
                    const selected = s === skill;
                    const used = skillDetails[s]?.projects.length > 0;
                    return (
                      <motion.li key={s} variants={chipItem}>
                        <motion.button
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setSkill(s)}
                          whileHover={{ y: -3 }}
                          whileTap={{ scale: 0.95 }}
                          className={`relative flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-[0.95rem] font-medium transition-colors duration-300 sm:px-5 sm:py-3 sm:text-base ${
                            selected ? "border-marigold text-ink" : "border-line text-paper hover:border-mist"
                          }`}
                        >
                          {selected && (
                            <motion.span
                              layoutId="skill-chip-highlight"
                              className="absolute inset-0 rounded-full bg-marigold"
                              transition={{ type: "spring", stiffness: 450, damping: 32 }}
                            />
                          )}
                          {used && (
                            <span
                              className={`relative z-10 h-1.5 w-1.5 rounded-full ${selected ? "bg-ink" : "bg-marigold"}`}
                            />
                          )}
                          <span className="relative z-10">{s}</span>
                        </motion.button>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              </AnimatePresence>

              <SkillDetail name={skill} />
            </div>
          </div>
        </LayoutGroup>
      </div>

      <SkillTape />
    </section>
  );
}
