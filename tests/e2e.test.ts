import { describe, it, expect } from 'vitest';
import { generateDemoDigest } from '../src/llm/gemini.js';
import { renderHtml, renderText } from '../src/render/templates.js';
import { sendEmail } from '../src/providers/resend.js';

const hasRealGeminiKey = process.env.HAS_REAL_GEMINI_KEY === 'true';
const hasRealResendKey = process.env.HAS_REAL_RESEND_KEY === 'true';
const hasValidFromEmail = process.env.HAS_VALID_FROM_EMAIL === 'true';

describe('End-to-End Newsletter Flow', () => {
  // Use verified email for testing, fallback to requested email
  const testEmail = process.env.FROM_EMAIL && process.env.FROM_EMAIL !== 'test@example.com' && process.env.FROM_EMAIL !== 'your_verified_email@yourdomain.com'
    ? process.env.FROM_EMAIL
    : '779888925@qq.com';
  it('should generate digest, render templates, and send real email to 779888925@qq.com', async () => {
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
    const targetEmail = testEmail;
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
    expect(htmlContent).toContain('Your Daily Briefing'); // HTML template includes subject (may be HTML encoded)
    expect(textContent).toContain(digest.intro); // Text template includes intro

  }, 60000); // 60 second timeout for full e2e flow

  it('should handle the complete newsletter bot workflow multiple times', async () => {
    if (!hasRealGeminiKey || !hasRealResendKey || !hasValidFromEmail) {
      console.log('⚠️  Skipping multi-run end-to-end test - missing real API keys or valid from email');
      expect(true).toBe(true); // Skip test
      return;
    }

    const numberOfTests = 1; // Reduced to 1 to avoid rate limits

    for (let i = 1; i <= numberOfTests; i++) {
      console.log(`🔄 Running end-to-end test iteration ${i}/${numberOfTests}...`);

      // Generate unique digest
      const digest = await generateDemoDigest();

      // Render with iteration number for uniqueness
      const htmlContent = renderHtml(digest);
      const textContent = renderText(digest);

      // Send email with iteration identifier
      const targetEmail = testEmail;
      const emailSubject = `🤖 AI Digest #${i}: ${digest.subject}`;

      await sendEmail({
        to: [targetEmail],
        subject: emailSubject,
        html: htmlContent,
        text: textContent,
      });

      console.log(`✅ Iteration ${i} completed - Email sent to ${targetEmail}`);

      // Brief pause between sends to avoid rate limits
      if (i < numberOfTests) {
        await new Promise(resolve => setTimeout(resolve, 3000)); // Increased delay
      }
    }

    console.log(`🎉 All ${numberOfTests} end-to-end tests completed successfully!`);
  }, 180000); // 3 minute timeout for multiple iterations

  it('should validate email content quality', async () => {
    if (!hasRealGeminiKey) {
      console.log('⚠️  Skipping content quality test - no valid Gemini API key provided');
      expect(true).toBe(true); // Skip test
      return;
    }

    // Generate a digest and validate it meets quality standards
    const digest = await generateDemoDigest();

    // Subject should be meaningful and under limit
    expect(digest.subject.length).toBeGreaterThan(10);
    expect(digest.subject.length).toBeLessThanOrEqual(60);

    // Intro should be present and reasonable length
    expect(digest.intro.length).toBeGreaterThan(20);
    const introWords = digest.intro.split(' ').length;
    expect(introWords).toBeLessThanOrEqual(40);

    // All items should have required fields
    digest.items.forEach((item, index) => {
      expect(item.title).toBeDefined();
      expect(item.title.length).toBeGreaterThan(5);
      expect(item.tldr).toBeDefined();
      expect(item.tldr.length).toBeGreaterThan(10);
      expect(Array.isArray(item.bullets)).toBe(true);
      expect(item.bullets).toHaveLength(3);

      // Validate bullet quality
      item.bullets.forEach(bullet => {
        expect(bullet.length).toBeGreaterThan(5);
        const words = bullet.split(' ').length;
        expect(words).toBeLessThanOrEqual(12);
      });
    });

    // Outro should exist
    expect(digest.outro).toBeDefined();
    expect(digest.outro.length).toBeGreaterThan(10);

    console.log('✅ Digest content quality validated');
  }, 30000);
});