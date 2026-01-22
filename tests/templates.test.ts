import { describe, it, expect } from 'vitest';
import { renderHtml, renderText } from '../src/render/templates.js';
import type { DigestContent } from '../src/llm/gemini.js';

describe('Template Rendering', () => {
  const mockDigest: DigestContent = {
    subject: 'Weekly Tech Digest #42',
    intro: 'Here are the top tech stories from this week.',
    items: [
      {
        title: 'AI Breakthrough in Quantum Computing',
        tldr: 'Scientists achieved quantum supremacy milestone.',
        bullets: [
          'New algorithm reduces computation time by 1000x',
          'Published in Nature journal',
          'Open source code released'
        ],
        link: 'https://example.com/quantum-ai'
      },
      {
        title: 'Web3 Adoption Grows',
        tldr: 'Major corporations embrace blockchain technology.',
        bullets: [
          'Walmart integrates crypto payments',
          'Microsoft launches NFT marketplace',
          'Decentralized identity gains traction'
        ],
        link: 'https://example.com/web3-adoption'
      },
      {
        title: 'Sustainable Tech Innovation',
        tldr: 'Green technology reduces carbon footprint.',
        bullets: [
          'Solar panels achieve 40% efficiency',
          'Electric vehicles hit new sales record',
          'Recycling tech processes e-waste'
        ]
      }
    ],
    outro: 'Thanks for reading! Stay tuned for next week.'
  };

  describe('renderText', () => {
  it('should render digest as plain text format', () => {
    const result = renderText(mockDigest);

    expect(typeof result).toBe('string');
    // Note: text template doesn't include subject, only HTML does
    expect(result).toContain(mockDigest.intro);
    expect(result).toContain(mockDigest.outro);

      // Check items are numbered
      expect(result).toContain('1. AI Breakthrough in Quantum Computing');
      expect(result).toContain('2. Web3 Adoption Grows');
      expect(result).toContain('3. Sustainable Tech Innovation');

      // Check TLDR format
      expect(result).toContain('TL;DR: Scientists achieved quantum supremacy milestone');

      // Check bullets
      expect(result).toContain('- New algorithm reduces computation time by 1000x');

      // Check links
      expect(result).toContain('Link: https://example.com/quantum-ai');

      // Check footer
      expect(result).toContain('Demo email. Reply STOP to unsubscribe');
    });

    it('should handle items without links', () => {
      const result = renderText(mockDigest);

      // Third item has no link, should not include link line
      expect(result).not.toContain('Link: https://example.com/sustainable-tech');
    });

    it('should escape special characters in text', () => {
      const digestWithSpecialChars: DigestContent = {
        ...mockDigest,
        items: [{
          title: 'Title with <script> & "quotes"',
          tldr: 'TLDR with special chars',
          bullets: ['Bullet with <tag> & "quotes"']
        }]
      };

      const result = renderText(digestWithSpecialChars);
      // Text rendering doesn't escape HTML, so special chars should remain
      expect(result).toContain('Title with <script> & "quotes"');
    });
  });

  describe('renderHtml', () => {
    it('should render digest as HTML format', () => {
      const result = renderHtml(mockDigest);

      expect(typeof result).toBe('string');
      expect(result).toContain('<div style="font-family:Arial, sans-serif;');
      expect(result).toContain('<h2 style="margin:16px 0;">Weekly Tech Digest #42</h2>');
      expect(result).toContain('<p>Here are the top tech stories from this week.</p>');

      // Check items are rendered as HTML
      expect(result).toContain('<h3 style="margin:0 0 6px 0;">AI Breakthrough in Quantum Computing</h3>');
      expect(result).toContain('<b>TL;DR:</b> Scientists achieved quantum supremacy milestone');

      // Check bullets are in HTML list
      expect(result).toContain('<ul style="margin:0 0 8px 18px;">');
      expect(result).toContain('<li>New algorithm reduces computation time by 1000x</li>');

      // Check links
      expect(result).toContain('<a href="https://example.com/quantum-ai">Read more</a>');

      // Check footer
      expect(result).toContain('Demo email. Reply STOP to unsubscribe');
    });

    it('should escape HTML characters', () => {
      const digestWithHtml: DigestContent = {
        ...mockDigest,
        items: [{
          title: 'Title with <script> & "quotes"',
          tldr: 'TLDR with <b>tags</b> & "quotes"',
          bullets: ['Bullet with <em>emphasis</em> & "quotes"']
        }]
      };

      const result = renderHtml(digestWithHtml);

      // HTML should be escaped
      expect(result).toContain('Title with &lt;script&gt; &amp; &quot;quotes&quot;');
      expect(result).toContain('TLDR with &lt;b&gt;tags&lt;/b&gt; &amp; &quot;quotes&quot;');
      expect(result).toContain('Bullet with &lt;em&gt;emphasis&lt;/em&gt; &amp; &quot;quotes&quot;');
    });

    it('should handle items without links', () => {
      const result = renderHtml(mockDigest);

      // Should contain link for first two items
      expect(result).toContain('https://example.com/quantum-ai');
      expect(result).toContain('https://example.com/web3-adoption');

      // Should not contain link section for third item
      const thirdItemSection = result.split('<div style="padding:12px 0;border-bottom:1px solid #eee;">')[3];
      expect(thirdItemSection).not.toContain('<a href=');
    });

    it('should include proper HTML structure', () => {
      const result = renderHtml(mockDigest);

      expect(result).toContain('<div style="font-family:Arial, sans-serif; max-width:680px; margin:0 auto; line-height:1.5;">');
      expect(result).toContain('<hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />');
      expect(result).toContain('<p style="font-size:12px;color:#666;">');
    });
  });

  it('should handle empty digest gracefully', () => {
    const emptyDigest: DigestContent = {
      subject: 'Empty Digest',
      intro: 'No content',
      items: [],
      outro: 'End'
    };

    const textResult = renderText(emptyDigest);
    const htmlResult = renderHtml(emptyDigest);

    // Text template doesn't include subject
    expect(textResult).toContain('No content');
    expect(textResult).toContain('End');
    expect(htmlResult).toContain('<h2 style="margin:16px 0;">Empty Digest</h2>');
    expect(htmlResult).toContain('No content');
  });
});