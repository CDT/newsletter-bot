# Newsletter Bot Tests

This test suite provides comprehensive testing for the newsletter bot, including real API integration tests that generate content and send actual emails.

## ⚠️ Important Notice

**These tests make REAL API calls and send REAL emails.** They are designed to test the complete functionality of your newsletter bot, including:

- Real Gemini AI API calls to generate newsletter content
- Real Resend API calls to send emails
- Actual emails sent to verified email addresses (not necessarily `779888925@qq.com` due to API restrictions)

**Before running tests, ensure you have valid API keys and the target email address is correct.**

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   # Copy the example file
   cp test-env-example.txt .env.test
   ```

   Edit `.env.test` with your real API credentials:
   ```env
   GEMINI_API_KEY=your_real_gemini_api_key_here
   RESEND_API_KEY=your_real_resend_api_key_here
   FROM_EMAIL=your_verified_email@yourdomain.com
   TO_EMAILS=779888925@qq.com
   ```

## Running Tests

### All Tests
Run the complete test suite:
```bash
npm test
```

### Watch Mode
Run tests in watch mode for development:
```bash
npm run test:watch
```

### Email Tests Only
Run only the tests that send real emails:
```bash
npm run test:email
```

## Test Categories

### 🔮 Gemini API Tests (`gemini.test.ts`)
- Tests real AI content generation
- Validates digest structure and content quality
- Ensures consistent API responses
- **Makes real Gemini API calls**

### 📧 Resend API Tests (`resend.test.ts`)
- Tests real email sending functionality
- Validates HTML and text content handling
- Tests multiple recipients
- **Sends real emails to 779888925@qq.com**

### 🎨 Template Tests (`templates.test.ts`)
- Tests HTML and text template rendering
- Validates content escaping and formatting
- Ensures proper email structure

### 🚀 End-to-End Tests (`e2e.test.ts`)
- Tests the complete newsletter workflow
- Generates content → renders templates → sends email
- **Makes real API calls and sends real emails**
- Validates content quality standards

## Test Results

When tests pass, you should see:
- ✅ Digest content generated via Gemini AI
- ✅ Emails successfully sent to `779888925@qq.com`
- 📧 Check your email inbox for the test newsletters

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |
| `RESEND_API_KEY` | Your Resend API key | Yes |
| `FROM_EMAIL` | Verified sender email in Resend | Yes |
| `TO_EMAILS` | Target email addresses (includes 779888925@qq.com) | Yes |

## Troubleshooting

### API Key Issues
- Ensure your Gemini API key has sufficient quota
- Verify your Resend API key is valid and has sending permissions
- Check that `FROM_EMAIL` is verified in your Resend account

### Email Delivery
- Emails might take a few minutes to arrive
- Check spam/junk folders
- Verify the target email `779888925@qq.com` is correct

### Test Timeouts
- Tests have generous timeouts (30-180 seconds) for API calls
- Network issues may cause timeouts
- Retry failed tests if needed

### Rate Limiting
- API providers may have rate limits
- Space out test runs if you encounter limits
- Consider upgrading API plans for heavy testing

## Cost Considerations

**These tests consume real API resources:**
- Gemini API calls (~$0.001-0.005 per call)
- Resend email sends (free up to limits)
- Monitor your API usage and costs

## API Limits & Quotas

### Gemini AI API
- **Free Tier**: 20 requests per day, 5 requests per minute
- **Rate Limiting**: Tests include delays to avoid hitting limits
- **Quota Exceeded**: Tests will fail gracefully when daily limits are reached

### Resend Email API
- **Testing Restrictions**: Can only send to verified email addresses
- **Rate Limiting**: 2 requests per second maximum
- **Domain Verification**: Required for sending to external recipients

## Test Results Summary

When running with valid API keys, expect:
- ✅ **Template tests**: Always pass (no API calls required)
- ✅ **Resend tests**: Pass when using verified email addresses
- ✅ **Gemini tests**: Pass until daily quota is reached (~20 requests)
- ✅ **End-to-end tests**: Pass when all APIs are available and within quotas

### Current Status
- **Template Rendering**: ✅ Fully tested and working
- **Email Sending**: ✅ Working (uses verified emails due to API restrictions)
- **AI Content Generation**: ✅ Working (subject to API quotas)
- **End-to-End Flow**: ✅ Working (subject to API availability)

## Troubleshooting

### Common Issues

**"API key not valid" (Gemini)**
- Ensure your Gemini API key is correct and has quota remaining
- Check https://aistudio.google.com/app/apikey

**"You can only send testing emails to your own email address" (Resend)**
- This is normal - Resend restricts test emails to verified addresses
- Tests automatically use verified email when available
- For production, verify a domain at resend.com/domains

**"Quota exceeded" (Gemini/Resend)**
- Free tier limits: Gemini (20/day), Resend (varies)
- Wait for quota reset or upgrade your plan
- Tests are designed to handle rate limits gracefully

**Tests timing out**
- API calls can take 10-30 seconds
- Tests have generous timeouts (30-90 seconds)
- Network issues may cause failures

## CI/CD Integration

For automated testing, ensure your CI environment has the required environment variables set. You may want to use test-specific API keys with limited quotas for CI runs.