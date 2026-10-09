# Deployment guide — Jai Surya J portfolio

This guide takes the project from the downloaded zip to a live website with a working contact form that delivers messages to **jayasurya0713@gmail.com**.

Recommended host: **Vercel** (free, made by the Next.js team, supports the contact-form API route with zero setup).
Time needed: about 20–30 minutes the first time.

---

## 1. What you need

| Item | Notes |
| --- | --- |
| Node.js 20.9+ | Node 22 LTS recommended. Check with `node -v`. Download from nodejs.org |
| Git | Check with `git --version` |
| GitHub account | To store the code |
| Vercel account | Sign up at vercel.com with your GitHub account |
| Gmail account with 2-Step Verification | Needed to create an App Password for the contact form |

---

## 2. Run it on your computer first

```bash
# unzip the download, then:
cd jai-surya-portfolio
npm install
cp .env.example .env.local        # Windows PowerShell: Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000. Every page, animation and transition should work. The contact form will show
"Email isn't set up on the server yet" until you finish step 3 — that's expected.

---

## 3. Set up the contact form email (Gmail App Password)

The form sends mail through your Gmail account. Google does not allow your normal password for this, so you create a
16-character **App Password**.

1. Go to https://myaccount.google.com/security and turn on **2-Step Verification** (if it's not already on).
2. Go to https://myaccount.google.com/apppasswords
3. App name: type `Portfolio` and click **Create**.
4. Copy the 16-character password Google shows (spaces don't matter). You won't see it again.
5. Open `.env.local` and fill it in:

```env
GMAIL_USER=jayasurya0713@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
CONTACT_TO=jayasurya0713@gmail.com
```

6. Stop the dev server (Ctrl + C), run `npm run dev` again, and send yourself a test message from the form.
   It arrives as **"New portfolio message from <name>"**. Pressing **Reply** in Gmail replies to the visitor directly.

> `.env.local` is in `.gitignore`, so your password is never uploaded to GitHub. Keep it that way.

---

## 4. Personalise before going live

Open `data/profile.js` and update:

- `linkedin` — your LinkedIn profile URL
- `github` — your GitHub profile URL
- `siteUrl` — your final website address (e.g. `https://jaisurya.vercel.app`), used for SEO and link previews

Optional: replace `public/jai-surya.webp` (photo), `public/Jai_Surya_Resume.pdf` (résumé) or `public/og-image.jpg`
(image shown when your link is shared on WhatsApp/LinkedIn). Keep the same file names.

Run `npm run build` once to make sure everything compiles.

---

## 5. Push the code to GitHub

1. On github.com click **New repository**, name it `portfolio`, keep it empty (no README), click **Create**.
2. In the project folder:

```bash
git init
git add .
git commit -m "Portfolio: initial version"
git branch -M main
git remote add origin https://github.com/<your-username>/portfolio.git
git push -u origin main
```

---

## 6. Deploy on Vercel

1. Go to https://vercel.com/new and click **Import** next to your `portfolio` repository.
2. Framework preset: **Next.js** (detected automatically). Leave build settings as they are.
3. Open **Environment Variables** and add the same three values from `.env.local`:

   | Name | Value |
   | --- | --- |
   | `GMAIL_USER` | jayasurya0713@gmail.com |
   | `GMAIL_APP_PASSWORD` | your 16-character App Password |
   | `CONTACT_TO` | jayasurya0713@gmail.com |

4. Click **Deploy**. After 1–2 minutes you get a live URL such as `https://portfolio-xxxx.vercel.app`.
5. Open the site and send a test message from the contact form.

From now on, every `git push` to `main` redeploys the site automatically.

**Changed an environment variable later?** Go to Project → Settings → Environment Variables, edit it, then
Deployments → ⋯ → **Redeploy**. Variables only apply to new deployments.

### Change the URL / add your own domain

- Free: Project → Settings → Domains → edit to something like `jaisurya.vercel.app` (if available).
- Custom domain (e.g. `jaisurya.dev` bought from Hostinger/GoDaddy/Namecheap): Settings → Domains → **Add**, then
  copy the DNS records Vercel shows into your domain provider's DNS panel. HTTPS is set up automatically.

Then update `siteUrl` in `data/profile.js` and push.

---

## 7. Other hosting options

**Netlify** — Import from GitHub at app.netlify.com, it detects Next.js automatically. Add the same 3 environment
variables under Site configuration → Environment variables.

**Your own server (AWS EC2 / Hostinger VPS)** — needs Node.js 20.9+:

```bash
git clone https://github.com/<your-username>/portfolio.git && cd portfolio
npm ci
nano .env.local          # paste the 3 variables
npm run build
npm install -g pm2
pm2 start npm --name portfolio -- start     # runs on port 3000
pm2 save && pm2 startup
```

Then point Nginx at `http://127.0.0.1:3000` and add HTTPS with Certbot.

> Hostinger **shared** web hosting (the plain PHP/HTML plan) cannot run this site because the contact form needs a
> Node.js server. Use Vercel, Netlify or a VPS instead.

---

## 8. Go-live checklist

- [ ] Intro greeting plays, then the globe spins in with the Chennai label
- [ ] In About, the particle globe turns into your portrait and scatters under the cursor
- [ ] Project cards stack as you scroll down
- [ ] In Skills, switching categories and tapping a skill shows where it was used (on a phone, swipe the category strip)
- [ ] Each "Read the case study" page opens with the page transition
- [ ] "Download résumé" opens the PDF
- [ ] Contact form shows **Message sent** and the email reaches your inbox (check Spam the first time and mark it *Not spam*)
- [ ] LinkedIn / GitHub links go to your real profiles
- [ ] Site looks right on your phone
- [ ] Share the link on WhatsApp/LinkedIn and check the preview image

---

## 9. Troubleshooting

| Problem | Fix |
| --- | --- |
| Form says "Email isn't set up on the server yet" | `GMAIL_USER` / `GMAIL_APP_PASSWORD` missing. Locally: check `.env.local` and restart `npm run dev`. On Vercel: add the variables and **Redeploy** |
| Form says "The message couldn't be sent right now" | Usually a wrong App Password. Check Vercel → Deployments → Functions logs. "535 Username and Password not accepted" means create a new App Password |
| Emails land in Spam | Mark the first one "Not spam"; Gmail learns |
| "Too many messages" | Built-in limit: 5 messages per visitor per 10 minutes, to block spam |
| Build fails with a Node version error | Install Node 20.9 or newer (Vercel uses a supported version by default) |
| Animations don't play | Your OS has "Reduce motion" turned on — the site deliberately calms animations for those visitors |
| Globe or portrait is blank | The browser has WebGL (hardware acceleration) disabled; the rest of the site still works |
| Intro greeting doesn't show again | It plays once per browser tab session; open the site in a new private window to see it again |

Gmail allows roughly 500 outgoing emails a day on a personal account, far more than a portfolio needs.
