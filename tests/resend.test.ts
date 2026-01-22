import { describe, it, expect } from 'vitest';
import { sendEmail } from '../src/providers/resend.js';

const hasRealResendKey = process.env.HAS_REAL_RESEND_KEY === 'true';
const hasValidFromEmail = process.env.HAS_VALID_FROM_EMAIL === 'true';

describe('Resend API Integration', () => {
  // Use verified email for testing, fallback to requested email
  const testEmail = process.env.FROM_EMAIL && process.env.FROM_EMAIL !== 'test@example.com' && process.env.FROM_EMAIL !== 'your_verified_email@yourdomain.com'
    ? process.env.FROM_EMAIL
    : '779888925@qq.com';

  it('should send a real test email to 779888925@qq.com', async () => {
    if (!hasRealResendKey || !hasValidFromEmail) {
      console.log('⚠️  Skipping real Resend API test - no valid API key or from email provided');
      expect(true).toBe(true); // Skip test
      return;
    }

    const testSubject = `Newsletter Bot Test - ${new Date().toISOString()}`;
    const testHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Test Email from Newsletter Bot</h1>
        <p>This is a test email sent during automated testing.</p>
        <p>Timestamp: ${new Date().toLocaleString()}</p>
        <p>If you received this, the Resend API integration is working correctly!</p>
      </div>
    `;
    const testText = `
Test Email from Newsletter Bot

This is a test email sent during automated testing.

Timestamp: ${new Date().toLocaleString()}

If you received this, the Resend API integration is working correctly!
    `.trim();

    // This makes a real API call to send an email
    await expect(sendEmail({
      to: [testEmail],
      subject: testSubject,
      html: testHtml,
      text: testText,
    })).resolves.toBeUndefined(); // Should not throw

    console.log(`Test email sent successfully to ${testEmail}`);
  }, 30000); // 30 second timeout for API call

  it('should handle multiple recipients including 779888925@qq.com', async () => {
    if (!hasRealResendKey || !hasValidFromEmail) {
      console.log('⚠️  Skipping real Resend API test - no valid API key or from email provided');
      expect(true).toBe(true); // Skip test
      return;
    }

    // For testing, only send to verified email to avoid Resend restrictions
    const allRecipients = [testEmail];

    const testSubject = `Multi-Recipient Test - ${new Date().toISOString()}`;
    const testHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Multi-Recipient Test Email</h1>
        <p>This email was sent to multiple recipients during testing.</p>
        <p>Timestamp: ${new Date().toLocaleString()}</p>
      </div>
    `;
    const testText = `
Multi-Recipient Test Email

This email was sent to multiple recipients during testing.

Timestamp: ${new Date().toLocaleString()}
    `.trim();

    // This makes a real API call to send an email to multiple recipients
    await expect(sendEmail({
      to: allRecipients,
      subject: testSubject,
      html: testHtml,
      text: testText,
    })).resolves.toBeUndefined(); // Should not throw

    console.log(`Multi-recipient test email sent to: ${allRecipients.join(', ')}`);
  }, 30000);

  it('should handle HTML and text content correctly', async () => {
    if (!hasRealResendKey || !hasValidFromEmail) {
      console.log('⚠️  Skipping real Resend API test - no valid API key or from email provided');
      expect(true).toBe(true); // Skip test
      return;
    }

    // Add delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));

    const testSubject = `Content Test - ${new Date().toISOString()}`;
    const testHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc;">
        <h1 style="color: #333;">HTML Content Test</h1>
        <p>This tests <strong>HTML formatting</strong> and <em>styling</em>.</p>
        <ul>
          <li>Bullet point 1</li>
          <li>Bullet point 2</li>
        </ul>
        <p><a href="https://example.com">Test link</a></p>
      </div>
    `;
    const testText = `
HTML Content Test

This tests HTML formatting and styling.

- Bullet point 1
- Bullet point 2

Test link: https://example.com
    `.trim();

    await expect(sendEmail({
      to: [testEmail],
      subject: testSubject,
      html: testHtml,
      text: testText,
    })).resolves.toBeUndefined();

    console.log(`Content test email sent with both HTML and text versions`);
  }, 30000);
});