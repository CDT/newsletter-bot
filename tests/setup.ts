import { config } from 'dotenv';

// Load test environment variables (try multiple locations)
config({ path: '.env.test' });
config({ path: '.env' });

// Check if we have real API keys (not placeholder values)
const hasRealGeminiKey = process.env.GEMINI_API_KEY &&
  process.env.GEMINI_API_KEY !== 'test-key' &&
  process.env.GEMINI_API_KEY !== 'your_real_gemini_api_key_here' &&
  process.env.GEMINI_API_KEY.length > 10;

const hasRealResendKey = process.env.RESEND_API_KEY &&
  process.env.RESEND_API_KEY !== 'test-key' &&
  process.env.RESEND_API_KEY !== 'your_real_resend_api_key_here' &&
  process.env.RESEND_API_KEY.length > 10;

const hasValidFromEmail = process.env.FROM_EMAIL &&
  process.env.FROM_EMAIL !== 'test@example.com' &&
  process.env.FROM_EMAIL !== 'your_verified_email@yourdomain.com' &&
  process.env.FROM_EMAIL.includes('@');

// Set environment flags for tests
process.env.HAS_REAL_GEMINI_KEY = hasRealGeminiKey ? 'true' : 'false';
process.env.HAS_REAL_RESEND_KEY = hasRealResendKey ? 'true' : 'false';
process.env.HAS_VALID_FROM_EMAIL = hasValidFromEmail ? 'true' : 'false';

// Set default test values if not provided
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-key';
process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || 'test-key';
process.env.FROM_EMAIL = process.env.FROM_EMAIL || 'test@example.com';
process.env.TO_EMAILS = process.env.TO_EMAILS || '779888925@qq.com';