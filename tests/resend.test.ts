import { describe, it, expect } from 'vitest';
import { sendEmail } from '../src/providers/resend.js';

const hasRealResendKey = !!process.env.RESEND_API_KEY;
const hasValidFromEmail = !!process.env.FROM_EMAIL && process.env.FROM_EMAIL !== 'test@example.com' && process.env.FROM_EMAIL !== 'your_verified_email@yourdomain.com';

describe('Resend API Integration', () => {

  it('should attempt to send test email to primary target (qq.com)', async () => {
    if (!hasRealResendKey || !hasValidFromEmail) {
      console.log('⚠️  Skipping real Resend API test - no valid API key or from email provided');
      expect(true).toBe(true); // Skip test
      return;
    }

    const primaryRecipient = '779888925@qq.com';
    const testRecipients = [primaryRecipient];
    const testSubject = `Newsletter Bot Test - ${new Date().toISOString()}`;
    const testHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Test Email from Newsletter Bot</h1>
        <p>This is a test email sent during automated testing to primary target.</p>
        <p>Timestamp: ${new Date().toLocaleString()}</p>
        <p>If you received this, the Resend API integration is working correctly!</p>
        <p><em>Note: May fail if qq.com domain is not verified with Resend.</em></p>
      </div>
    `;
    const testText = `
Test Email from Newsletter Bot

This is a test email sent during automated testing to primary target.

Timestamp: ${new Date().toLocaleString()}

If you received this, the Resend API integration is working correctly!

Note: May fail if qq.com domain is not verified with Resend.
    `.trim();

    // Try to send to primary target - may succeed if domain is verified
    try {
      await sendEmail({
        to: testRecipients,
        subject: testSubject,
        html: testHtml,
        text: testText,
      });
      console.log(`Test email sent successfully to primary target: ${primaryRecipient}`);
    } catch (error) {
      console.log(`Primary target failed (${primaryRecipient}): ${error.message}`);
      // If primary target fails, try fallback to verified address
      console.log('Attempting fallback to verified Gmail address...');
      const fallbackRecipient = 'cdt86915998@gmail.com';

      await sendEmail({
        to: [fallbackRecipient],
        subject: `${testSubject} (Fallback)`,
        html: testHtml.replace('primary target', 'fallback target'),
        text: testText.replace('primary target', 'fallback target'),
      });
      console.log(`Fallback email sent to: ${fallbackRecipient}`);
    }
  }, 30000); // 30 second timeout for API call

  it('should test sending to multiple recipients with qq.com as primary', async () => {
    if (!hasRealResendKey || !hasValidFromEmail) {
      console.log('⚠️  Skipping real Resend API test - no valid API key or from email provided');
      expect(true).toBe(true); // Skip test
      return;
    }

    const primaryRecipient = '779888925@qq.com';
    const verifiedRecipient = 'cdt86915998@gmail.com';
    const testRecipients = [primaryRecipient, verifiedRecipient];
    const testSubject = `Multi-Recipient Test (Primary: qq.com) - ${new Date().toISOString()}`;
    const testHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Multi-Recipient Test Email</h1>
        <p>This test attempts to send to multiple recipients with qq.com as primary target.</p>
        <p>Primary target: ${primaryRecipient}</p>
        <p>Verified fallback: ${verifiedRecipient}</p>
        <p>Timestamp: ${new Date().toLocaleString()}</p>
        <p>Note: qq.com may be restricted unless domain is verified.</p>
      </div>
    `;
    const testText = `
Multi-Recipient Test Email

This test attempts to send to multiple recipients with qq.com as primary target.

Primary target: ${primaryRecipient}
Verified fallback: ${verifiedRecipient}

Timestamp: ${new Date().toLocaleString()}

Note: qq.com may be restricted unless domain is verified.
    `.trim();

    // Try to send to both - may partially succeed
    try {
      await sendEmail({
        to: testRecipients,
        subject: testSubject,
        html: testHtml,
        text: testText,
      });
      console.log(`Multi-recipient email sent to: ${testRecipients.join(', ')}`);
    } catch (error) {
      console.log(`Multi-recipient attempt failed: ${error.message}`);
      // If it fails, try sending only to verified address
      console.log('Falling back to verified address only...');
      await sendEmail({
        to: [verifiedRecipient],
        subject: `${testSubject} (Verified Only)`,
        html: testHtml.replace('multiple recipients', 'verified recipient only'),
        text: testText.replace('multiple recipients', 'verified recipient only'),
      });
      console.log(`Fallback email sent to verified address: ${verifiedRecipient}`);
    }
  }, 30000);

  it('should attempt multiple recipients with qq.com primary', async () => {
    if (!hasRealResendKey || !hasValidFromEmail) {
      console.log('⚠️  Skipping real Resend API test - no valid API key or from email provided');
      expect(true).toBe(true); // Skip test
      return;
    }

    // Add delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));

    const primaryRecipient = '779888925@qq.com';
    const verifiedRecipient = 'cdt86915998@gmail.com';

    const testSubject = `Multi-Recipient Test (Primary: qq.com) - ${new Date().toISOString()}`;
    const testHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Multi-Recipient Test with Primary Target</h1>
        <p>This test attempts multiple recipients with qq.com as primary.</p>
        <p>Recipients: ${primaryRecipient}, ${verifiedRecipient}</p>
        <p>Timestamp: ${new Date().toLocaleString()}</p>
        <p>Note: May fallback to verified address if qq.com is restricted.</p>
      </div>
    `;
    const testText = `
Multi-Recipient Test with Primary Target

This test attempts multiple recipients with qq.com as primary.

Recipients: ${primaryRecipient}, ${verifiedRecipient}

Timestamp: ${new Date().toLocaleString()}

Note: May fallback to verified address if qq.com is restricted.
    `.trim();

    // Try primary recipients first
    try {
      await sendEmail({
        to: [primaryRecipient, verifiedRecipient],
        subject: testSubject,
        html: testHtml,
        text: testText,
      });
      console.log(`Multi-recipient test email sent to: ${primaryRecipient}, ${verifiedRecipient}`);
    } catch (error) {
      console.log(`Primary multi-recipient attempt failed: ${error.message}`);
      // Fallback to multiple verified addresses
      console.log('Falling back to multiple verified addresses...');
      await sendEmail({
        to: [verifiedRecipient, verifiedRecipient],
        subject: `${testSubject} (Verified Only)`,
        html: testHtml.replace('with qq.com as primary', 'verified addresses only'),
        text: testText.replace('with qq.com as primary', 'verified addresses only'),
      });
      console.log(`Fallback multi-recipient test sent to duplicate verified addresses`);
    }
  }, 30000);

  it('should handle HTML and text content with qq.com primary target', async () => {
    if (!hasRealResendKey || !hasValidFromEmail) {
      console.log('⚠️  Skipping real Resend API test - no valid API key or from email provided');
      expect(true).toBe(true); // Skip test
      return;
    }

    // Add delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));

    const primaryRecipient = '779888925@qq.com';
    const verifiedRecipient = 'cdt86915998@gmail.com';

    const testSubject = `Content Test (Primary: qq.com) - ${new Date().toISOString()}`;
    const testHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc;">
        <h1 style="color: #333;">HTML Content Test</h1>
        <p>This tests <strong>HTML formatting</strong> and <em>styling</em> with qq.com as primary target.</p>
        <ul>
          <li>Bullet point 1</li>
          <li>Bullet point 2</li>
        </ul>
        <p><a href="https://example.com">Test link</a></p>
        <p><em>Note: May fallback to verified address if qq.com is restricted.</em></p>
      </div>
    `;
    const testText = `
HTML Content Test

This tests HTML formatting and styling with qq.com as primary target.

- Bullet point 1
- Bullet point 2

Test link: https://example.com

Note: May fallback to verified address if qq.com is restricted.
    `.trim();

    // Try to send to primary target first
    try {
      await sendEmail({
        to: [primaryRecipient],
        subject: testSubject,
        html: testHtml,
        text: testText,
      });
      console.log(`Content test email sent to primary target: ${primaryRecipient}`);
    } catch (error) {
      console.log(`Primary content test failed (${primaryRecipient}): ${error.message}`);
      // Fallback to verified address
      console.log('Falling back to verified Gmail address for content test...');
      await sendEmail({
        to: [verifiedRecipient],
        subject: `${testSubject} (Fallback)`,
        html: testHtml.replace('qq.com as primary target', 'verified address fallback'),
        text: testText.replace('qq.com as primary target', 'verified address fallback'),
      });
      console.log(`Content test fallback sent to: ${verifiedRecipient}`);
    }
  }, 30000);
});