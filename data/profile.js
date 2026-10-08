// All portfolio content lives here. Edit this file to update the site.

export const profile = {
  name: "Jai Surya J",
  firstName: "Jai Surya",
  role: "Frontend Developer",
  stack: "React.js · Next.js",
  location: "Chennai, India",
  email: "jayasurya0713@gmail.com",
  phone: "+91 63693 91891",
  phoneHref: "tel:+916369391891",
  // TODO: replace with your real profile links
  linkedin: "https://www.linkedin.com/in/your-linkedin-id",
  github: "https://github.com/your-github-id",
  resume: "/Jai_Surya_Resume.pdf",
  photo: "/jai-surya.webp",
  siteUrl: "https://jaisurya.vercel.app",
  summary:
    "Frontend developer with 2+ years of experience building responsive, high-performance web applications with React.js, Next.js, Redux Toolkit and Material UI. I've shipped four production platforms across AI-powered hiring, real-time chat and e-commerce — wiring in REST APIs, WebSockets and payment gateways like Razorpay and Stripe.",
  approach:
    "I like taking a messy product requirement and turning it into UI architecture that the next developer can extend without fear: small reusable components, predictable state, and interfaces that stay fast as the data grows.",
  facts: [
    { value: "2+", label: "years shipping production React" },
    { value: "4+", label: "platforms delivered end to end" },
    { value: "~30%", label: "faster renders after optimisation work" },
  ],
};

export const experience = [
  {
    company: "Apzzo Technologies Private Limited",
    role: "Frontend Developer",
    place: "Chennai, India",
    period: "Mar 2024 – May 2026",
    points: [
      "Built and shipped 6+ production features with React.js, Next.js, Redux Toolkit and Material UI, owning delivery from design handoff through deployment.",
      "Improved frontend performance by about 30% — fewer re-renders and shorter load times — through better component structure, memoization and reusable UI patterns.",
      "Led code reviews for a team of three, set shared coding standards and mentored junior developers on React best practices.",
      "Delivered on time across many Agile sprints, working with UI/UX designers, tracking work in Zoho Sprints and Asana, and testing APIs in Postman.",
      "Deployed and managed applications on AWS EC2 and Hostinger, using PuTTY for server access and Git for version control.",
    ],
  },
];

export const projects = [
  {
    slug: "hiremanage",
    name: "Effect-AI HireManage",
    kind: "B2B AI hiring platform",
    visual: "workflow",
    stack: ["React.js", "Next.js", "Redux Toolkit", "Material UI", "WebSockets", "AI APIs"],
    short:
      "A multi-tenant hiring platform that turns a job description into a complete interview plan, then tracks every candidate through to an offer.",
    steps: ["JD upload", "SkillDNA generation", "Interview plan", "Interview guide"],
    points: [
      "Multi-tenant architecture with role-based access for Super Admin and Hiring Manager roles.",
      "A structured four-step hiring workflow — JD upload, SkillDNA generation, interview plan, interview guide — that removed manual hiring steps.",
      "AI APIs for resume parsing, candidate-role matching and fit scoring across 100+ candidate profiles per role.",
      "Full candidate lifecycle UI — screening, shortlisting, interview tracking and hiring — with live evaluation updates over WebSockets.",
    ],
  },
  {
    slug: "resume-fit",
    name: "Candidate Resume Fit",
    kind: "B2C AI matching platform",
    visual: "score",
    stack: ["React.js", "Next.js", "Context API", "REST APIs", "Material UI"],
    short:
      "Upload a resume, pick a target role, and get a match percentage with a clear breakdown of which skills are missing.",
    points: [
      "End-to-end flow for resume upload, job-role targeting and automated AI fit analysis.",
      "AI APIs for resume parsing, skill extraction, semantic matching and compatibility scoring.",
      "Dashboards that surface skill-gap analysis and match percentage at a glance.",
      "Responsive, performance-tuned Material UI interface built on a scalable component architecture.",
    ],
  },
  {
    slug: "ecademictube-chat",
    name: "Ecademictube Chat",
    kind: "Real-time chat application",
    visual: "chat",
    stack: ["React.js", "Redux Toolkit", "Socket.io", "JWT", "Material UI"],
    short:
      "A real-time messaging UI with typing indicators, presence and chat histories that stay smooth at thousands of messages.",
    points: [
      "Socket.io integration for real-time messaging, typing indicators and online/offline presence.",
      "JWT authentication with protected routes and session handling.",
      "Virtualised lists and lazy loading so long chat histories render without jank.",
      "A library of reusable Material UI components shared across the app.",
    ],
  },
];

export const skills = [
  {
    group: "Languages & frameworks",
    items: ["JavaScript (ES6+)", "React.js", "Next.js", "Redux Toolkit", "Context API", "HTML5", "CSS3", "Material UI"],
  },
  {
    group: "APIs & real-time",
    items: ["REST APIs", "WebSockets", "Socket.io", "Razorpay", "Stripe"],
  },
  {
    group: "Auth & security",
    items: ["JWT", "OAuth", "Protected routes", "Session management"],
  },
  {
    group: "Tools & platforms",
    items: ["Git", "GitLab", "Bitbucket", "Postman", "AWS EC2", "Hostinger", "PuTTY", "Figma", "Zoho Sprints", "Asana"],
  },
  {
    group: "Practices",
    items: ["Agile / Scrum", "Code reviews", "Performance optimisation", "Component-driven architecture"],
  },
];

export const education = {
  school: "Dhanalakshmi Srinivasan Engineering College",
  degree: "Bachelor of Engineering, Mechanical Engineering",
  period: "2020 – 2023",
  grade: "CGPA 7.05",
};

// Where each skill was used — shown when a skill is selected in the Skills section.
// `projects` are project slugs from the list above; `note` is one short line.
export const skillDetails = {
  "JavaScript (ES6+)": { note: "The language behind every feature I've shipped.", projects: ["hiremanage", "resume-fit", "ecademictube-chat"] },
  "React.js": { note: "My main tool for building interfaces, in every production project.", projects: ["hiremanage", "resume-fit", "ecademictube-chat"] },
  "Next.js": { note: "Routing, rendering and performance for the AI platforms.", projects: ["hiremanage", "resume-fit"] },
  "Redux Toolkit": { note: "Predictable state for complex, multi-role and real-time apps.", projects: ["hiremanage", "ecademictube-chat"] },
  "Context API": { note: "Lightweight shared state where Redux would be overkill.", projects: ["resume-fit"] },
  HTML5: { note: "Semantic, accessible markup across every project.", projects: [] },
  CSS3: { note: "Responsive layouts and custom styling alongside Material UI.", projects: [] },
  "Material UI": { note: "Reusable, consistent component libraries.", projects: ["hiremanage", "resume-fit", "ecademictube-chat"] },
  "REST APIs": { note: "Wiring AI parsing, matching and scoring APIs into the UI.", projects: ["hiremanage", "resume-fit"] },
  WebSockets: { note: "Live evaluation updates without refreshing the page.", projects: ["hiremanage"] },
  "Socket.io": { note: "Real-time messages, typing indicators and online presence.", projects: ["ecademictube-chat"] },
  Razorpay: { note: "Payment gateway integration for e-commerce work.", projects: [] },
  Stripe: { note: "Payment gateway integration for e-commerce work.", projects: [] },
  JWT: { note: "Token-based sign-in and session handling.", projects: ["ecademictube-chat"] },
  OAuth: { note: "Third-party sign-in flows.", projects: [] },
  "Protected routes": { note: "Pages that only the right roles can reach.", projects: ["hiremanage", "ecademictube-chat"] },
  "Session management": { note: "Keeping users signed in safely across visits.", projects: ["ecademictube-chat"] },
  Git: { note: "Version control on every project.", projects: [] },
  GitLab: { note: "Team repositories, merge requests and reviews.", projects: [] },
  Bitbucket: { note: "Team repositories, pull requests and reviews.", projects: [] },
  Postman: { note: "Testing every API before it touches the UI.", projects: [] },
  "AWS EC2": { note: "Deploying and managing production apps.", projects: [] },
  Hostinger: { note: "Deploying and managing production apps.", projects: [] },
  PuTTY: { note: "Server access for deployments.", projects: [] },
  Figma: { note: "Turning designers' handoffs into working UI.", projects: [] },
  "Zoho Sprints": { note: "Sprint planning and tracking with the team.", projects: [] },
  Asana: { note: "Task tracking across sprints.", projects: [] },
  "Agile / Scrum": { note: "Delivered features on time across many sprints at Apzzo.", projects: [] },
  "Code reviews": { note: "Led reviews for a team of three and set shared coding standards.", projects: [] },
  "Performance optimisation": { note: "About 30% faster renders through memoization and leaner components.", projects: ["ecademictube-chat"] },
  "Component-driven architecture": { note: "Small reusable components the next developer can extend.", projects: ["hiremanage", "resume-fit", "ecademictube-chat"] },
};
