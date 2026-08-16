import { describe, it, expect } from 'vitest';
import { DogTranslationResult, PersonalityId } from '../../types';
import { PERSONALITIES } from '../../data/personalities';

describe('Translation Workflow & Data Contract', () => {
  it('should validate complete structure of a DogTranslationResult', () => {
    const mockResult: DogTranslationResult = {
      id: 'trans_123456789',
      imageUrl: 'data:image/jpeg;base64,/9j/mock',
      personality: 'excited-puppy',
      personalityName: PERSONALITIES['excited-puppy'].name,
      monologue: 'OMG THE BALL! CAN WE THROW THE BALL?! I AM READY FOR MAXIMUM ZOOMIES!',
      detectedMood: 'Maximum Zoomie Velocity',
      visualClues: [
        'Pupils dilated to absolute maximum excitement',
        'Mouth open in high-speed panting grin',
        'Paws poised for immediate warp-speed launch',
      ],
      canineIqScore: '200 (Pure Enthusiast)',
      suggestedAction: 'Throw the tennis ball without hesitation.',
      audioSource: 'webspeech',
      timestamp: Date.now(),
    };

    expect(mockResult.id).toMatch(/^trans_/);
    expect(mockResult.imageUrl).toBeTruthy();
    expect(mockResult.monologue.length).toBeGreaterThan(10);
    expect(mockResult.visualClues.length).toBe(3);
    expect(mockResult.canineIqScore).toContain('200');
    expect(mockResult.suggestedAction).toBeTruthy();
  });

  it('should format social share captions accurately', () => {
    const personality: PersonalityId = 'regal-aristocrat';
    const monologue = 'The staff has brought the rectangle again.';
    const mood = 'Judging Your Lineage';

    const caption = `🐾 Translate My Dog: "${monologue}"\nMood: ${mood}\nArchetype: ${PERSONALITIES[personality].name}\n#TranslateMyDog #GoogleAI #ElevenLabs`;

    expect(caption).toContain(monologue);
    expect(caption).toContain(mood);
    expect(caption).toContain('Regal Aristocrat');
    expect(caption).toContain('#TranslateMyDog');
  });
});
