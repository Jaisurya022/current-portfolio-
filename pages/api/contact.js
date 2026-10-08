import nodemailer from "nodemailer";

// Simple in-memory rate limit: 5 messages per IP per 10 minutes.
const hits = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_HITS;
}

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST to send a message." });
  }

  const { name = "", email = "", message = "", company = "" } = req.body || {};

  // Honeypot: real people never see or fill the "company" field.
  if (company) return res.status(200).json({ ok: true });

  const n = String(name).trim();
  const e = String(email).trim();
  const m = String(message).trim();

  if (n.length < 2 || n.length > 100) return res.status(400).json({ error: "Enter your name (2–100 characters)." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) || e.length > 200)
    return res.status(400).json({ error: "Enter a valid email address so I can reply." });
  if (m.length < 10 || m.length > 5000)
    return res.status(400).json({ error: "Write a message between 10 and 5,000 characters." });

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket.remoteAddress || "unknown";
  if (rateLimited(ip)) return res.status(429).json({ error: "Too many messages. Try again in 10 minutes." });

  const { GMAIL_USER, GMAIL_APP_PASSWORD, CONTACT_TO } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.error("Contact form: GMAIL_USER or GMAIL_APP_PASSWORD is not set.");
    return res.status(500).json({ error: "Email isn't set up on the server yet. Email me directly instead." });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    // Google shows App Passwords as "abcd efgh ijkl mnop"; the spaces aren't part of it.
    auth: { user: GMAIL_USER.trim(), pass: GMAIL_APP_PASSWORD.replace(/\s+/g, "") },
  });

  try {
    await transporter.sendMail({
      from: `"Portfolio contact" <${GMAIL_USER}>`,
      to: CONTACT_TO || GMAIL_USER,
      replyTo: `"${n.replace(/"/g, "")}" <${e}>`,
      subject: `New portfolio message from ${n}`,
      text: `Name: ${n}\nEmail: ${e}\n\n${m}`,
      html: `
        <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#101935">
          <h2 style="margin:0 0 12px">New message from your portfolio</h2>
          <p style="margin:0"><strong>Name:</strong> ${escapeHtml(n)}</p>
          <p style="margin:0 0 16px"><strong>Email:</strong> <a href="mailto:${escapeHtml(e)}">${escapeHtml(e)}</a></p>
          <div style="padding:16px;border-left:4px solid #ffc94a;background:#f4f5fc;white-space:pre-wrap">${escapeHtml(m)}</div>
          <p style="color:#6b7280;font-size:13px;margin-top:16px">Hit reply to answer ${escapeHtml(n)} directly.</p>
        </div>`,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Contact form send failed:", err);
    return res.status(502).json({ error: "The message couldn't be sent right now. Email me directly instead." });
  }
}
