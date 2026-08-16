import { describe, it, expect } from 'vitest';
import { PERSONALITIES, PERSONALITY_LIST } from '../../data/personalities';
import { PRESET_DOGS } from '../../data/presets';
import { PersonalityId } from '../../types';

describe('Canine Personality Archetypes Configuration', () => {
  const expectedIds: PersonalityId[] = [
    'dramatic-diva',
    'chill-bro',
    'anxious-overthinker',
    'regal-aristocrat',
    'excited-puppy',
    'undercover-detective',
  ];

  it('should have all 6 core personality archetypes defined', () => {
    expect(PERSONALITY_LIST.length).toBe(6);
    expectedIds.forEach((id) => {
      expect(PERSONALITIES[id]).toBeDefined();
      expect(PERSONALITIES[id].id).toBe(id);
      expect(PERSONALITIES[id].name).toBeTruthy();
      expect(PERSONALITIES[id].voiceId).toBeTruthy();
      expect(PERSONALITIES[id].emoji).toBeTruthy();
    });
  });

  it('should define valid speech synthesis pitch and rate parameters for each personality', () => {
    expectedIds.forEach((id) => {
      const p = PERSONALITIES[id];
      expect(p.speechPitch).toBeGreaterThanOrEqual(0.5);
      expect(p.speechPitch).toBeLessThanOrEqual(2.0);
      expect(p.speechRate).toBeGreaterThanOrEqual(0.5);
      expect(p.speechRate).toBeLessThanOrEqual(2.0);
    });
  });

  it('should ensure all preset sample dogs link to existing personality profiles', () => {
    expect(PRESET_DOGS.length).toBeGreaterThan(0);
    PRESET_DOGS.forEach((preset) => {
      expect(preset.id).toBeTruthy();
      expect(preset.imageUrl).toBeTruthy();
      expect(PERSONALITIES[preset.suggestedPersonality]).toBeDefined();
    });
  });
});
