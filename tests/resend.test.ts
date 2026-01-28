import { describe, it, expect } from 'vitest';
import { sendEmail } from '../src/providers/resend.js';

const hasRealResendKey = !!process.env.RESEND_API_KEY;
const hasValidFromEmail = !!process.env.FROM_EMAIL && process.env.FROM_EMAIL !== 'test@example.com' && process.env.FROM_EMAIL !== 'your_verified_email@yourdomain.com' && process.env.FROM_EMAIL !== 'onboarding@resend.dev';

describe('Resend API Integration', () => {

  it('should send test email to TO_EMAILS from .env', async () => {
    if (!hasRealResendKey || !hasValidFromEmail) {
      console.log('⚠️  Skipping real Resend API test - no valid API key or from email provided');
      expect(true).toBe(true); // Skip test
      return;
    }

    // Parse TO_EMAILS from environment (same as main app)
    const toEmails = process.env.TO_EMAILS?.split(',').map(s => s.trim()).filter(Boolean) || [];
    if (toEmails.length === 0) {
      console.log('⚠️  Skipping test - no TO_EMAILS configured in .env');
      expect(true).toBe(true); // Skip test
      return;
    }

    const testSubject = `Newsletter Bot Test - ${new Date().toISOString()}`;
    const testHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Test Email from Newsletter Bot</h1>
        <p>This is a test email sent during automated testing.</p>
        <p>Recipients: ${toEmails.join(', ')}</p>
        <p>Timestamp: ${new Date().toLocaleString()}</p>
        <p>If you received this, the Resend API integration is working correctly!</p>
      </div>
    `;
    const testText = `
Test Email from Newsletter Bot

This is a test email sent during automated testing.

Recipients: ${toEmails.join(', ')}

Timestamp: ${new Date().toLocaleString()}

If you received this, the Resend API integration is working correctly!
    `.trim();

    try {
      await sendEmail({
        to: toEmails,
        subject: testSubject,
        html: testHtml,
        text: testText,
      });
      console.log(`Test email sent successfully to: ${toEmails.join(', ')}`);
    } catch (error) {
      console.log(`Test email failed: ${error.message}`);
      throw error; // Re-throw to fail the test
    }
  }, 30000); // 30 second timeout for API call
});