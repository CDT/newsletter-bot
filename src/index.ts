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
