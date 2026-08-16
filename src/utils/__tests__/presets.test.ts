import { describe, it, expect } from 'vitest';
import { PRESET_DOGS } from '../../data/presets';
import { PERSONALITIES } from '../../data/personalities';

describe('Preset Dogs Configuration', () => {
  it('should have multiple varied preset dogs available', () => {
    expect(PRESET_DOGS.length).toBeGreaterThanOrEqual(6);
  });

  it('should ensure each preset dog has unique IDs and valid attributes', () => {
    const ids = new Set<string>();
    PRESET_DOGS.forEach((dog) => {
      expect(dog.id).toBeTruthy();
      expect(ids.has(dog.id)).toBe(false);
      ids.add(dog.id);

      expect(dog.name).toBeTruthy();
      expect(dog.breed).toBeTruthy();
      expect(dog.imageUrl).toMatch(/^https?:\/\//);
      expect(dog.description).toBeTruthy();
      expect(dog.suggestedPersonality).toBeTruthy();
      expect(PERSONALITIES[dog.suggestedPersonality]).toBeDefined();
    });
  });

  it('should include popular breeds like Husky, Golden Retriever, and Corgi', () => {
    const breeds = PRESET_DOGS.map((d) => d.breed.toLowerCase());
    expect(breeds.some((b) => b.includes('husky'))).toBe(true);
    expect(breeds.some((b) => b.includes('golden retriever'))).toBe(true);
    expect(breeds.some((b) => b.includes('corgi'))).toBe(true);
  });
});
