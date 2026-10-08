import Link from "next/link";
import { motion } from "motion/react";
import { Parallax } from "react-scroll-parallax";
import Seo from "@/components/Seo";
import Reveal from "@/components/Reveal";
import { ProjectVisual } from "@/components/visuals/ProjectVisuals";
import { projects } from "@/data/profile";

const ease = [0.16, 1, 0.3, 1];

export default function ProjectPage({ project, next }) {
  return (
    <>
      <Seo title={project.name} description={project.short} path={`/projects/${project.slug}`} />

      <article className="pt-24 pb-20 sm:pt-40 sm:pb-24">
        <div className="container-x">
          <Link href="/#projects" className="text-mist underline decoration-line underline-offset-4 hover:text-paper">
            All projects
          </Link>

          <header className="mt-8 grid items-end gap-6 sm:mt-10 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
            <div>
              <motion.p className="text-mist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                {project.kind}
              </motion.p>
              <h1 className="mt-3 overflow-hidden text-[clamp(2.4rem,9vw,5.5rem)] font-extrabold">
                <motion.span
                  className="block"
                  initial={{ y: "105%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1, ease, delay: 0.35 }}
                >
                  {project.name}
                </motion.span>
              </h1>
            </div>
            <motion.p
              className="text-lg text-mist lg:pb-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.55 }}
            >
              {project.short}
            </motion.p>
          </header>

          <Parallax speed={-4}>
            <motion.div
              className="mx-auto mt-10 max-w-3xl sm:mt-16"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease, delay: 0.7 }}
            >
              <ProjectVisual project={project} />
            </motion.div>
          </Parallax>

          <div className="mt-16 grid gap-8 sm:mt-24 lg:grid-cols-[0.7fr_1.3fr] lg:gap-12">
            <div>
              <h2 className="text-3xl font-bold">What I built</h2>
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Tech stack">
                {project.stack.map((s) => (
                  <li key={s} className="rounded-full border border-line px-3 py-1 text-sm">{s}</li>
                ))}
              </ul>
            </div>
            <ul className="space-y-6">
              {project.points.map((p, i) => (
                <Reveal
                  as="li"
                  key={p}
                  className="border-l-2 border-marigold pl-4 text-base leading-relaxed sm:pl-5 sm:text-lg"
                  from={{ opacity: 0, x: 30 }}
                  to={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, ease, delay: i * 0.08 }}
                >
                  {p}
                </Reveal>
              ))}
            </ul>
          </div>

          <Link
            href={`/projects/${next.slug}`}
            className="group mt-20 block rounded-3xl border border-line p-6 transition-colors hover:border-marigold sm:mt-32 sm:p-12"
          >
            <p className="text-mist">Next project</p>
            <p className="mt-2 font-display text-[clamp(2rem,5vw,3.75rem)] font-bold transition-colors group-hover:text-marigold">
              {next.name}
            </p>
          </Link>
        </div>
      </article>
    </>
  );
}

export function getStaticPaths() {
  return { paths: projects.map((p) => ({ params: { slug: p.slug } })), fallback: false };
}

export function getStaticProps({ params }) {
  const i = projects.findIndex((p) => p.slug === params.slug);
  return { props: { project: projects[i], next: projects[(i + 1) % projects.length] } };
}
