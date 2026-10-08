import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import SectionHeading from "@/components/SectionHeading";
import { profile } from "@/data/profile";

const ease = [0.16, 1, 0.3, 1];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "", company: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "The message couldn't be sent. Email me directly instead.");
      setStatus("sent");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  const sentTo = form.email;

  return (
    <section id="contact" className="scroll-mt-20 py-24 sm:py-36">
      <div className="container-x grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <SectionHeading id="contact-title" sub="Hiring for a frontend role, or need a React interface built? Send me a note and I'll reply within a day.">
            Let&apos;s work together
          </SectionHeading>

          <div className="mb-8 flex items-center gap-4">
            <span className="relative">
              <img
                src={profile.photo}
                alt=""
                className="h-16 w-16 rounded-full object-cover object-[50%_25%] ring-2 ring-marigold"
              />
              <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-ink bg-emerald-400" />
            </span>
            <span>
              <span className="block font-display text-lg font-semibold">{profile.name}</span>
              <span className="block text-sm text-mist">Available now, usually replies within a day</span>
            </span>
          </div>

          <ul className="space-y-5 text-lg">
            <li>
              <p className="text-sm text-mist">Email</p>
              <a href={`mailto:${profile.email}`} className="break-all underline decoration-line underline-offset-4 hover:decoration-marigold">
                {profile.email}
              </a>
            </li>
            <li>
              <p className="text-sm text-mist">Phone</p>
              <a href={profile.phoneHref} className="underline decoration-line underline-offset-4 hover:decoration-marigold">
                {profile.phone}
              </a>
            </li>
            <li>
              <p className="text-sm text-mist">Elsewhere</p>
              <div className="flex gap-6">
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="underline decoration-line underline-offset-4 hover:decoration-marigold">
                  LinkedIn
                </a>
                <a href={profile.github} target="_blank" rel="noreferrer" className="underline decoration-line underline-offset-4 hover:decoration-marigold">
                  GitHub
                </a>
              </div>
            </li>
          </ul>
        </div>

        <div className="relative rounded-3xl border border-line bg-ink-2 p-5 sm:p-10">
          <AnimatePresence mode="wait" initial={false}>
            {status === "sent" ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease }}
                className="flex min-h-[420px] flex-col items-start justify-center"
                role="status"
              >
                <svg viewBox="0 0 52 52" className="h-16 w-16" aria-hidden>
                  <motion.circle cx="26" cy="26" r="24" fill="none" stroke="var(--color-marigold)" strokeWidth="3"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease }} />
                  <motion.path d="M15 27l7 7 15-16" fill="none" stroke="var(--color-marigold)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.5, ease }} />
                </svg>
                <h3 className="mt-6 text-3xl font-bold">Message sent</h3>
                <p className="mt-3 max-w-sm text-mist">Thanks for writing. I&apos;ll reply to {sentTo} soon.</p>
                <button
                  type="button"
                  className="btn btn-ghost mt-8"
                  onClick={() => {
                    setForm({ name: "", email: "", message: "", company: "" });
                    setStatus("idle");
                  }}
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={onSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm text-mist">Your name</label>
                  <input id="name" name="name" required minLength={2} maxLength={100} autoComplete="name"
                    className="field" value={form.name} onChange={update("name")} placeholder="Priya Raman" />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm text-mist">Email</label>
                  <input id="email" name="email" type="email" required autoComplete="email"
                    className="field" value={form.email} onChange={update("email")} placeholder="priya@company.com" />
                </div>
                <div>
                  <label htmlFor="message" className="mb-2 block text-sm text-mist">Message</label>
                  <textarea id="message" name="message" required minLength={10} maxLength={5000} rows={6}
                    className="field resize-y" value={form.message} onChange={update("message")}
                    placeholder="Tell me about the role or project." />
                </div>
                {/* honeypot */}
                <div className="hidden" aria-hidden>
                  <label htmlFor="company">Company</label>
                  <input id="company" name="company" tabIndex={-1} autoComplete="off" value={form.company} onChange={update("company")} />
                </div>

                <AnimatePresence>
                  {status === "error" && (
                    <motion.p
                      role="alert"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-200"
                    >
                      {error}{" "}
                      <a href={`mailto:${profile.email}`} className="underline">{profile.email}</a>
                    </motion.p>
                  )}
                </AnimatePresence>

                <button type="submit" disabled={status === "sending"} className="btn btn-primary w-full disabled:opacity-70 sm:w-auto">
                  {status === "sending" ? (
                    <>
                      <motion.span
                        className="h-4 w-4 rounded-full border-2 border-ink border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      />
                      Sending…
                    </>
                  ) : (
                    "Send message"
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
