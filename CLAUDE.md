# Newsletter Bot

A Node.js script that generates demo news digest emails using Gemini AI and sends them via Resend.

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript (ES2022)
- **AI**: Google Gemini (gemini-x.x-flash)
- **Email**: Resend
- **Validation**: Zod
- **CI/CD**: GitHub Actions

## Commands

```bash
npm run dev    # Run locally with tsx
npm run build  # Compile TypeScript to dist/
npm start      # Run compiled JavaScript
```

## Project Structure

```
src/
├── index.ts           # Entry point - orchestrates the flow
├── config/
│   └── env.ts         # Environment config with Zod validation
├── llm/
│   └── gemini.ts      # Gemini AI content generation
├── render/
│   └── templates.ts   # HTML and text email rendering
└── providers/
    └── resend.ts      # Resend email provider
```

## Environment Variables

Required in `.env` (copy from `.env.example`):

- `GEMINI_API_KEY` - Google AI Studio API key
- `GEMINI_MODEL` - Gemini model version (e.g., `gemini-2.5-flash`)
- `RESEND_API_KEY` - Resend API key
- `FROM_EMAIL` - Verified sender email (e.g., `Newsletter <no-reply@chendongtian.top>`)
- `TO_EMAILS` - Comma-separated recipient emails

## Key Patterns

- ES modules (`"type": "module"` in package.json)
- Import paths use `.js` extension (TypeScript ES module resolution)
- Zod for runtime environment validation
- Gemini returns structured JSON for email content
- HTML emails include inline styles for compatibility

## GitHub Actions

The workflow (`.github/workflows/digest.yml`) runs:
- On manual trigger (workflow_dispatch)
- Daily at 00:00 UTC via cron

Secrets required in GitHub repository settings:
- `GEMINI_API_KEY`
- `RESEND_API_KEY`
- `FROM_EMAIL`
- `TO_EMAILS`
