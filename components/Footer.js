import { profile } from "@/data/profile";

export default function Footer() {
  return (
    <footer className="border-t border-line/60">
      <div className="container-x flex flex-col gap-4 py-10 text-sm text-mist sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {profile.name}. Built with Next.js, Three.js, Motion and GSAP.
        </p>
        <div className="flex gap-6">
          <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-paper">LinkedIn</a>
          <a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-paper">GitHub</a>
          <a href={profile.resume} target="_blank" rel="noreferrer" className="hover:text-paper">Résumé</a>
        </div>
      </div>
    </footer>
  );
}
