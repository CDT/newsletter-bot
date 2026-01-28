**Polished wording (English):**

## Goal (Phase 1)

A Node.js script that:

1. calls **Gemini** to generate a demo “news abstract” email (HTML + text), then
2. sends it to demo recipients via **Resend**, and
3. can be triggered locally and later by **GitHub Actions cron**.

---

## Step 0 — Prereqs

* Node.js 18+ (or 20+)
* A **Gemini API key** (Google AI Studio)
* A **Resend API key**
* A verified **From** email/domain in Resend (for deliverability)

---

## Step 1 — Create the project

```bash
mkdir newsletter-bot
cd newsletter-bot
npm init -y
```

Install dependencies:

```bash
npm i resend @google/generative-ai dotenv zod
npm i -D typescript tsx @types/node
```

Initialize TypeScript:

```bash
npx tsc --init
```

(Optional but recommended) update `tsconfig.json` key options:

* `"target": "ES2022"`
* `"module": "ES2022"`
* `"moduleResolution": "Bundler"` (or `"NodeNext"`)
* `"outDir": "dist"`
* `"rootDir": "src"`

---

## Step 2 — Add scripts to package.json

Edit `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

---

## Step 3 — Add environment variables

Create `.env`:

```bash
touch .env
```

Put this in `.env`:

```env
GEMINI_API_KEY=YOUR_GEMINI_KEY
RESEND_API_KEY=YOUR_RESEND_KEY
FROM_EMAIL=Newsletter <no-reply@chendongtian.top>
TO_EMAILS=you@example.com,friend@example.com
```

Notes:

* `FROM_EMAIL`: use a verified sender on Resend. For quick demo, Resend provides onboarding domains (depends on your Resend setup).
* `TO_EMAILS`: keep it ≤10 for MVP.

---

## Step 4 — Create the folder structure

```bash
mkdir -p src/providers src/llm src/render src/config
touch src/index.ts src/config/env.ts src/llm/gemini.ts src/render/templates.ts src/providers/resend.ts
```

---

## Step 5 — Implement config/env loader

Create `src/config/env.ts`:

```ts
import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  GEMINI_API_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  FROM_EMAIL: z.string().min(3),
  TO_EMAILS: z.string().min(3),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  GEMINI_API_KEY: parsed.data.GEMINI_API_KEY,
  RESEND_API_KEY: parsed.data.RESEND_API_KEY,
  FROM_EMAIL: parsed.data.FROM_EMAIL,
  TO_EMAILS: parsed.data.TO_EMAILS.split(",").map(s => s.trim()).filter(Boolean),
};
```

---

## Step 6 — Gemini: generate demo digest content

Create `src/llm/gemini.ts`:

```ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";

export type DigestContent = {
  subject: string;
  intro: string;
  items: Array<{
    title: string;
    tldr: string;
    bullets: string[];
    link?: string;
  }>;
  outro: string;
};

export async function generateDemoDigest(): Promise<DigestContent> {
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-x.x-flash" });

  // Keep output deterministic + easy to render: force JSON only.
  const prompt = `
Create a simple demo news abstract email.

Return ONLY valid JSON (no markdown) with this schema:
{
  "subject": string,
  "intro": string,
  "items": [
    {"title": string, "tldr": string, "bullets": string[], "link"?: string}
  ],
  "outro": string
}

Rules:
- subject <= 60 characters
- intro <= 40 words
- 5 items
- each tldr <= 25 words
- bullets: exactly 3 bullets per item, each <= 12 words
- links can be placeholder like "https://example.com/x"
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Basic JSON parse guard
  try {
    return JSON.parse(text) as DigestContent;
  } catch {
    // If the model returns extra text, try to salvage first JSON block.
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Gemini did not return JSON.");
    return JSON.parse(match[0]) as DigestContent;
  }
}
```

---

## Step 7 — Render HTML + text email

Create `src/render/templates.ts`:

```ts
import type { DigestContent } from "../llm/gemini.js";

export function renderText(d: DigestContent): string {
  const lines: string[] = [];
  lines.push(d.intro, "");
  d.items.forEach((it, idx) => {
    lines.push(`${idx + 1}. ${it.title}`);
    lines.push(`   TL;DR: ${it.tldr}`);
    it.bullets.forEach(b => lines.push(`   - ${b}`));
    if (it.link) lines.push(`   Link: ${it.link}`);
    lines.push("");
  });
  lines.push(d.outro);
  lines.push("");
  lines.push("—");
  lines.push("Demo email. Reply STOP to unsubscribe (placeholder).");
  return lines.join("\n");
}

export function renderHtml(d: DigestContent): string {
  const itemsHtml = d.items.map(it => {
    const bullets = it.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join("");
    const link = it.link ? `<p><a href="${escapeHtml(it.link)}">Read more</a></p>` : "";
    return `
      <div style="padding:12px 0;border-bottom:1px solid #eee;">
        <h3 style="margin:0 0 6px 0;">${escapeHtml(it.title)}</h3>
        <p style="margin:0 0 8px 0;"><b>TL;DR:</b> ${escapeHtml(it.tldr)}</p>
        <ul style="margin:0 0 8px 18px;">${bullets}</ul>
        ${link}
      </div>
    `;
  }).join("");

  return `
  <div style="font-family:Arial, sans-serif; max-width:680px; margin:0 auto; line-height:1.5;">
    <h2 style="margin:16px 0;">${escapeHtml(d.subject)}</h2>
    <p>${escapeHtml(d.intro)}</p>
    ${itemsHtml}
    <p style="margin-top:14px;">${escapeHtml(d.outro)}</p>
    <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
    <p style="font-size:12px;color:#666;">
      Demo email. Reply STOP to unsubscribe (placeholder).
    </p>
  </div>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
```

---

## Step 8 — Resend provider: send email

Create `src/providers/resend.ts`:

```ts
import { Resend } from "resend";
import { env } from "../config/env.js";

export async function sendEmail(params: {
  to: string[];
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const resend = new Resend(env.RESEND_API_KEY);

  // For MVP, send one message with multiple recipients (or loop per recipient).
  // If you want privacy, use BCC or send individually. We'll keep it simple:
  const { error } = await resend.emails.send({
    from: env.FROM_EMAIL,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });

  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);
}
```

---

## Step 9 — Wire it together (entry point)

Create `src/index.ts`:

```ts
import { env } from "./config/env.js";
import { generateDemoDigest } from "./llm/gemini.js";
import { renderHtml, renderText } from "./render/templates.js";
import { sendEmail } from "./providers/resend.js";

async function main() {
  console.log("Generating demo digest with Gemini...");
  const digest = await generateDemoDigest();

  console.log("Rendering email...");
  const html = renderHtml(digest);
  const text = renderText(digest);

  console.log(`Sending to: ${env.TO_EMAILS.join(", ")}`);
  await sendEmail({
    to: env.TO_EMAILS,
    subject: digest.subject,
    html,
    text,
  });

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

---

## Step 10 — Run locally

```bash
npm run dev
```

If everything is set correctly, you should receive the demo digest email.

---

## Step 11 — Add GitHub Actions (scheduled run, no server)

Create `.github/workflows/digest.yml`:

```bash
mkdir -p .github/workflows
```

`.github/workflows/digest.yml`:

```yml
name: Demo Digest

on:
  workflow_dispatch:
  schedule:
    # Runs at 00:00 UTC daily (08:00 Asia/Taipei)
    - cron: "0 0 * * *"

jobs:
  run-digest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - run: npm ci

      - run: npm run build

      - run: npm start
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          FROM_EMAIL: ${{ secrets.FROM_EMAIL }}
          TO_EMAILS: ${{ secrets.TO_EMAILS }}
```

Then in GitHub:

* Settings → Secrets and variables → Actions → add:

  * `GEMINI_API_KEY`
  * `RESEND_API_KEY`
  * `FROM_EMAIL`
  * `TO_EMAILS`

Trigger it:

* Actions → “Demo Digest” → Run workflow (manual)

---

## Step 12 — Quick “MVP hardening” (still Phase 1)

Add these after it works once:

* **Retry** Gemini call 2–3 times on transient errors
* **Timeouts** (so Actions doesn’t hang)
* **Logging**: print the generated subject + item titles
* **Send individually** (optional): loop over recipients if you want privacy

---

When you’re ready for Phase 2 (real sources), we’ll add `collectors/rss.ts` and feed Gemini with titles+snippets instead of “generate from scratch,” so the digest is grounded in actual items.
