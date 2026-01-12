import { Resend } from "resend";
import { env } from "../config/env.js";

export async function sendEmail(params: {
  to: string[];
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const resend = new Resend(env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: env.FROM_EMAIL,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });

  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);
}
