import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";

const ease = [0.16, 1, 0.3, 1];

function useLoop(length, ms, active) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setI((v) => (v + 1) % length), ms);
    return () => clearInterval(id);
  }, [active, length, ms]);
  return i;
}

function Frame({ title, children, className = "" }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-line bg-ink sm:rounded-3xl shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] ${className}`}>
      <div className="flex items-center justify-between border-b border-line px-4 py-3 text-xs text-mist sm:px-5 sm:text-sm">
        <span>{title}</span>
        <span className="h-2 w-2 rounded-full bg-cobalt" />
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

/* HireManage — the four-step workflow lights up in order, then candidates get scored */
export function WorkflowVisual({ steps }) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  const step = useLoop(steps.length + 1, 1300, inView);
  const candidates = [
    { name: "Candidate A", fit: 92 },
    { name: "Candidate B", fit: 78 },
    { name: "Candidate C", fit: 64 },
  ];

  return (
    <Frame title="New role: Senior React Developer">
      <ol ref={ref} className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {steps.map((s, i) => {
          const done = i < step;
          return (
            <li
              key={s}
              className={`rounded-xl border px-3 py-2.5 text-xs transition-colors duration-500 sm:py-3 sm:text-sm ${
                done ? "border-marigold bg-ink-3 text-paper" : "border-line text-mist"
              }`}
            >
              <span className={`mb-1 block font-display text-lg font-bold ${done ? "text-marigold" : ""}`}>{i + 1}</span>
              {s}
            </li>
          );
        })}
      </ol>
      <div className="mt-5 space-y-3">
        {candidates.map((c, i) => (
          <div key={c.name} className="flex items-center gap-3 text-sm">
            <span className="w-[5.5rem] shrink-0 text-mist sm:w-24">{c.name}</span>
            <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-ink-3">
              <motion.span
                className="absolute inset-y-0 left-0 rounded-full bg-cobalt"
                animate={{ width: step === steps.length ? `${c.fit}%` : "0%" }}
                transition={{ duration: 0.9, ease, delay: i * 0.12 }}
              />
            </span>
            <span className="w-9 text-right tabular-nums">{step === steps.length ? `${c.fit}%` : "—"}</span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* Resume Fit — match ring fills, matched skills and gaps are listed */
export function ScoreVisual() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const score = 86;
  const r = 52;
  const circ = 2 * Math.PI * r;
  const matched = ["React.js", "Next.js", "REST APIs", "Redux"];
  const gaps = ["TypeScript", "Jest"];

  return (
    <Frame title="Resume vs. Frontend Engineer">
      <div ref={ref} className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <div className="relative h-32 w-32 shrink-0 sm:h-36 sm:w-36">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-ink-3)" strokeWidth="10" />
            <motion.circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke="var(--color-marigold)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: inView ? circ * (1 - score / 100) : circ }}
              transition={{ duration: 1.6, ease }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="font-display text-4xl font-bold">{score}%</p>
              <p className="text-xs text-mist">match</p>
            </div>
          </div>
        </div>
        <div className="w-full space-y-4 text-sm">
          <div>
            <p className="mb-2 text-mist">Skills matched</p>
            <div className="flex flex-wrap gap-2">
              {matched.map((s, i) => (
                <motion.span
                  key={s}
                  className="rounded-full bg-cobalt/20 px-3 py-1 text-paper"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                >
                  {s}
                </motion.span>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-mist">Skill gaps</p>
            <div className="flex flex-wrap gap-2">
              {gaps.map((s, i) => (
                <motion.span
                  key={s}
                  className="rounded-full border border-dashed border-marigold/70 px-3 py-1 text-marigold"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.9 + i * 0.1, duration: 0.4 }}
                >
                  {s}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Chat — messages arrive in real time with a typing indicator */
const messages = [
  { from: "them", text: "Did the new build go out?" },
  { from: "me", text: "Yes, deployed 5 minutes ago." },
  { from: "them", text: "Chat history loads instantly now 🔥" },
  { from: "me", text: "Virtualised list. Only renders what you see." },
];

export function ChatVisual() {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  const tick = useLoop(messages.length * 2 + 2, 900, inView);
  const shown = Math.min(messages.length, Math.floor(tick / 2));
  const typing = tick % 2 === 1 && shown < messages.length;

  return (
    <Frame title="#frontend-team">
      <div ref={ref} className="flex h-56 flex-col justify-end gap-2.5 overflow-hidden sm:h-64">
        <AnimatePresence initial={false}>
          {messages.slice(0, shown).map((m) => (
            <motion.div
              key={m.text}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease }}
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                m.from === "me" ? "self-end rounded-br-md bg-marigold text-ink" : "self-start rounded-bl-md bg-ink-3 text-paper"
              }`}
            >
              {m.text}
            </motion.div>
          ))}
          {typing && (
            <motion.div
              key="typing"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`flex gap-1 rounded-2xl bg-ink-3 px-4 py-3 ${messages[shown].from === "me" ? "self-end" : "self-start"}`}
              aria-label="typing"
            >
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  className="h-1.5 w-1.5 rounded-full bg-mist"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.12 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-sm text-mist">
        <span className="h-2 w-2 rounded-full bg-emerald-400" /> 3 online
      </div>
    </Frame>
  );
}

export function ProjectVisual({ project }) {
  if (project.visual === "workflow") return <WorkflowVisual steps={project.steps} />;
  if (project.visual === "score") return <ScoreVisual />;
  return <ChatVisual />;
}
