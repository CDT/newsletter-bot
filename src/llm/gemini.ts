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
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

  try {
    return JSON.parse(text) as DigestContent;
  } catch {
    // If the model returns extra text, try to salvage first JSON block.
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Gemini did not return JSON.");
    return JSON.parse(match[0]) as DigestContent;
  }
}
