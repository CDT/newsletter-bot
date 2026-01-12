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
