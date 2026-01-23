import { describe, it, expect } from 'vitest';
import { generateDemoDigest } from '../src/llm/gemini.js';
import { renderHtml, renderText } from '../src/render/templates.js';
import { sendEmail } from '../src/providers/resend.js';

const hasRealGeminiKey = process.env.HAS_REAL_GEMINI_KEY === 'true';
const hasRealResendKey = process.env.HAS_REAL_RESEND_KEY === 'true';
const hasValidFromEmail = process.env.HAS_VALID_FROM_EMAIL === 'true';

describe('End-to-End Newsletter Flow', () => {
  it('should generate digest, render templates, and send real email to cdt86915998@gmail.com', async () => {
    if (!hasRealGeminiKey || !hasRealResendKey || !hasValidFromEmail) {
      console.log('⚠️  Skipping end-to-end test - missing real API keys or valid from email');
      expect(true).toBe(true); // Skip test
      return;
    }
    console.log('🚀 Starting end-to-end test...');

    // Step 1: Generate digest using real Gemini API
    console.log('📝 Generating digest with Gemini AI...');
    const digest = await generateDemoDigest();
    console.log(`✅ Digest generated: "${digest.subject}"`);

    // Step 2: Render templates
    console.log('🎨 Rendering email templates...');
    const htmlContent = renderHtml(digest);
    const textContent = renderText(digest);
    console.log('✅ Templates rendered successfully');

    // Step 3: Send real email via Resend API
    const targetEmail = 'cdt86915998@gmail.com';
    const emailSubject = `🤖 AI-Generated Digest: ${digest.subject}`;

    console.log(`📧 Sending real email to ${targetEmail}...`);
    await sendEmail({
      to: [targetEmail],
      subject: emailSubject,
      html: htmlContent,
      text: textContent,
    });

    console.log('✅ Email sent successfully!');
    console.log(`📬 Check ${targetEmail} for the newsletter digest`);

    // Verify the email was constructed properly
    expect(digest.subject).toBeDefined();
    expect(digest.subject.length).toBeGreaterThan(0);
    expect(digest.items).toHaveLength(5);
    expect(htmlContent).toContain('<div style="font-family:Arial');
    expect(htmlContent).toContain('Demo email. Reply STOP to unsubscribe'); // HTML template footer
    expect(textContent).toContain(digest.intro); // Text template includes intro

  }, 60000); // 60 second timeout for full e2e flow
});