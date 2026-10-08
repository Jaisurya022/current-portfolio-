# Jai Surya J — Portfolio

An animated personal portfolio built with **Next.js (Pages Router)** and **Tailwind CSS**.

| Feature | Library | Where |
| --- | --- | --- |
| Intro: "Hello" in world languages ending in வணக்கம், then the screen lifts away | Motion | `components/IntroLoader.js` |
| 3D dotted Earth with a glowing Chennai pin, light arcs to world cities, drag to spin | three.js + @react-three/fiber | `components/visuals/GlobeScene.js` |
| Profile animation: particles morph from a globe into your portrait; cursor/tap scatters them | three.js + @react-three/fiber | `components/visuals/ParticlePortrait.js` |
| Name letters flip up, rotating role line, magnetic buttons, page-transition curtain | Motion (motion.dev) | `Hero.js`, `Magnetic.js`, `PageTransition.js` |
| Stacking project cards, experience timeline that fills as you scroll | GSAP + ScrollTrigger | `Projects.js`, `Experience.js` |
| Skills explorer: category tabs with a sliding highlight, springy skill chips, "used in" project links, crossing skill tapes that speed up as you scroll | Motion + react-scroll-parallax | `Skills.js` |
| Smooth scrolling | Lenis | `lib/smooth-scroll.js` |
| Contact form that emails you | Nodemailer (Gmail) | `pages/api/contact.js` |

All animations respect the visitor's "reduce motion" system setting. On phones the globe never blocks scrolling, and the portrait uses fewer particles.

## Run it

```bash
npm install
cp .env.example .env.local     # then add your Gmail App Password (see DEPLOYMENT.md)
npm run dev                    # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

Requires **Node.js 20.9 or newer** (Node 22 LTS recommended).

## Edit your content

Everything you see on the site — summary, experience, projects, skills, education, links — is in **`data/profile.js`**.
Each skill's one-line note and the projects it links to are in `skillDetails` at the bottom of that file.
Replace the placeholder LinkedIn / GitHub URLs and `siteUrl` there before you deploy.

- Photo: `public/jai-surya.webp` (contact avatar) and `public/portrait-cutout.webp` (background removed, used by the particle portrait — keep a transparent background if you replace it)
- Globe land dots: `public/globe-dots.json` (regenerate with `node scripts/generate-globe-dots.mjs`)
- Résumé download: `public/Jai_Surya_Resume.pdf`
- Social share image: `public/og-image.jpg`

## Project structure

```
pages/
  _app.js              providers + route transitions
  _document.js
  index.js             home page (all sections)
  projects/[slug].js   project case-study pages (static)
  404.js
  api/contact.js       contact form → Gmail
components/
  IntroLoader.js  Layout.js  Nav.js  Footer.js  PageTransition.js  Magnetic.js  SectionHeading.js  Seo.js  Reveal.js
  sections/  Hero  About  Experience  Projects  Skills  Contact
  visuals/   GlobeScene (3D Earth)  ParticlePortrait (profile)  ProjectVisuals (mini demos)
data/profile.js        all site content
lib/gsap.js            GSAP + ScrollTrigger registration
lib/smooth-scroll.js   Lenis smooth scrolling + scrollTo helper
scripts/               one-off script that builds globe-dots.json
styles/globals.css     Tailwind v4 theme (colors, fonts)
```

Deploying? See **[DEPLOYMENT.md](./DEPLOYMENT.md)**.
