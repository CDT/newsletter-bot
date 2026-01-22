# Repository Guidelines

## Project Structure & Module Organization
- `src/index.ts` orchestrates generation, rendering, and sending.
- `src/config/env.ts` validates env; `src/llm/gemini.ts` generates content.
- `src/render/templates.ts` builds HTML/text; `src/providers/resend.ts` sends email.
- Output goes to `dist/`; CI is in `.github/workflows/digest.yml`.

## Build, Test, and Development Commands
- `npm run dev` runs the app with `tsx`.
- `npm run build` compiles TypeScript to `dist/`.
- `npm start` runs `dist/index.js`.
- `npm ci` installs exact deps (CI).

## Coding Style & Naming Conventions
- ES2022 TypeScript, ES modules, `.js` extensions in imports.
- 2-space indentation, semicolons, double quotes.
- `camelCase` for functions/vars; lower-case filenames under `src/`.
- Keep env validation in `src/config/env.ts` using Zod.

## Testing Guidelines
- No test framework or tests are configured yet.
- If adding tests, use `tests/` or `src/__tests__/` with `*.test.ts`, and add `npm test`.

## Commit & Pull Request Guidelines
- Recent commit subjects are `.`; no enforced convention.
- Prefer concise, imperative messages (e.g., "Add resend provider").
- PRs: short summary, test status, config/secret changes; add a template preview if you edit email HTML/text.

## Security & Configuration
- Secrets live in `.env`; never commit it.
- Required vars: `GEMINI_API_KEY`, `RESEND_API_KEY`, `FROM_EMAIL`, `TO_EMAILS`.
- GitHub Actions uses repo secrets with the same names.
