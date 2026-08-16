import { describe, it, expect } from 'vitest';

/**
 * Helper to clean Markdown JSON code blocks from LLM output
 */
export function cleanJsonOutput(text: string): string {
  if (!text || !text.trim()) return '{}';
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  return cleaned || '{}';
}

describe('textProcessing - cleanJsonOutput', () => {
  it('should strip markdown code fences with json tag', () => {
    const raw = '```json\n{"monologue": "I am dog."}\n```';
    const cleaned = cleanJsonOutput(raw);
    expect(cleaned).toBe('{"monologue": "I am dog."}');
    expect(JSON.parse(cleaned)).toEqual({ monologue: 'I am dog.' });
  });

  it('should strip generic markdown code fences without language tag', () => {
    const raw = '```\n{"detectedMood": "Happy"}\n```';
    const cleaned = cleanJsonOutput(raw);
    expect(cleaned).toBe('{"detectedMood": "Happy"}');
    expect(JSON.parse(cleaned)).toEqual({ detectedMood: 'Happy' });
  });

  it('should return plain JSON unchanged', () => {
    const plain = '{"canineIqScore": "150"}';
    expect(cleanJsonOutput(plain)).toBe('{"canineIqScore": "150"}');
  });

  it('should handle empty or whitespace inputs gracefully', () => {
    expect(cleanJsonOutput('')).toBe('{}');
    expect(cleanJsonOutput('   ')).toBe('{}');
  });
});
