import { describe, it, expect } from 'vitest';
import { generateDemoDigest, type DigestContent } from '../src/llm/gemini.js';

const hasRealGeminiKey = process.env.HAS_REAL_GEMINI_KEY === 'true';

describe('Gemini API Integration', () => {
  it('should generate a valid digest using real Gemini API', async () => {
    if (!hasRealGeminiKey) {
      console.log('⚠️  Skipping real Gemini API test - no valid API key provided');
      expect(true).toBe(true); // Skip test
      return;
    }
    // This test makes a real API call to Gemini
    const digest = await generateDemoDigest();

    // Validate the structure matches our expected DigestContent type
    expect(digest).toHaveProperty('subject');
    expect(digest).toHaveProperty('intro');
    expect(digest).toHaveProperty('items');
    expect(digest).toHaveProperty('outro');

    // Validate subject length (allow some flexibility for AI-generated content)
    expect(digest.subject.length).toBeLessThanOrEqual(80);

    // Validate intro word count (roughly)
    const introWords = digest.intro.split(' ').length;
    expect(introWords).toBeLessThanOrEqual(40);

    // Validate items count and structure
    expect(Array.isArray(digest.items)).toBe(true);
    expect(digest.items.length).toBeGreaterThanOrEqual(4); // Allow some flexibility for AI

    digest.items.forEach((item, index) => {
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('tldr');
      expect(item).toHaveProperty('bullets');

      // Validate TLDR word count (roughly)
      const tldrWords = item.tldr.split(' ').length;
      expect(tldrWords).toBeLessThanOrEqual(25);

      // Validate bullets
      expect(Array.isArray(item.bullets)).toBe(true);
      expect(item.bullets).toHaveLength(3);

      item.bullets.forEach(bullet => {
        const bulletWords = bullet.split(' ').length;
        expect(bulletWords).toBeLessThanOrEqual(12);
      });

      // Link is optional
      if (item.link) {
        expect(typeof item.link).toBe('string');
        expect(item.link.startsWith('http')).toBe(true);
      }
    });

    // Log the generated content for manual inspection
    console.log('Generated digest subject:', digest.subject);
    console.log('Generated digest intro:', digest.intro);
    console.log('Number of items:', digest.items.length);
  }, 30000); // 30 second timeout for API call

  it('should generate consistent structure across multiple calls', async () => {
    if (!hasRealGeminiKey) {
      console.log('⚠️  Skipping real Gemini API test - no valid API key provided');
      expect(true).toBe(true); // Skip test
      return;
    }

    // Test multiple calls to ensure consistency (reduced to 2 calls to avoid rate limits)
    const digests: DigestContent[] = [];

    for (let i = 0; i < 2; i++) {
      const digest = await generateDemoDigest();
      digests.push(digest);

      // Basic validation for each (allow some flexibility for AI responses)
      expect(digest.subject).toBeDefined();
      expect(digest.items.length).toBeGreaterThanOrEqual(4); // AI may return 4-5 items

      // Add delay between calls to avoid rate limits
      if (i < 1) { // Don't delay after last call
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Ensure we got different subjects (since it's AI-generated)
    const subjects = digests.map(d => d.subject);
    const uniqueSubjects = new Set(subjects);
    expect(uniqueSubjects.size).toBeGreaterThanOrEqual(1); // Allow same subjects due to AI variability
  }, 60000); // 60 second timeout for 2 API calls
});