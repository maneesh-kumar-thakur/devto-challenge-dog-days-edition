import { describe, it, expect } from 'vitest';
import { DogTranslationResult } from '../../types';

describe('Breed Insight & Heritage Data Layer', () => {
  it('should correctly store identifiedBreed and breedInsight on translation results', () => {
    const translationWithBreed: DogTranslationResult = {
      id: 'test-1',
      imageUrl: 'https://example.com/corgi.jpg',
      personality: 'excited-puppy',
      personalityName: 'Excited Puppy',
      identifiedBreed: 'Pembroke Welsh Corgi',
      breedInsight:
        'Cattle herding instincts cause low-center-of-gravity speed bursts and alert upright ear tracking.',
      monologue: 'LOOK AT MY SHORT LEGS GO ZOOM!',
      detectedMood: '98% Zoomie Velocity',
      visualClues: ['Ears perpendicular to gravity', 'Smiley open jaw'],
      canineIqScore: '142 (Galaxy Good Boy)',
      suggestedAction: 'Deploy tennis ball at once.',
      timestamp: Date.now(),
    };

    expect(translationWithBreed.identifiedBreed).toBe('Pembroke Welsh Corgi');
    expect(translationWithBreed.breedInsight).toContain('herding instincts');
    expect(translationWithBreed.visualClues.length).toBe(2);
  });

  it('should handle optional breed fields gracefully for backward compatibility', () => {
    const legacyTranslation: DogTranslationResult = {
      id: 'legacy-1',
      imageUrl: 'https://example.com/dog.jpg',
      personality: 'chill-bro',
      personalityName: 'Chill Bro',
      monologue: 'Vibing in the sunbeam, dude.',
      detectedMood: '100% Zen Alignment',
      visualClues: ['Limp paws', 'Half-closed eyelids'],
      canineIqScore: '130 (Chill Sage)',
      suggestedAction: 'Do not disturb.',
      timestamp: Date.now(),
    };

    expect(legacyTranslation.identifiedBreed).toBeUndefined();
    expect(legacyTranslation.breedInsight).toBeUndefined();

    // Fallback accessor verification
    const displayBreed = legacyTranslation.identifiedBreed || 'Good Boy / Girl';
    const displayInsight =
      legacyTranslation.breedInsight ||
      'Natural companion heritage inspires unconditional loyalty and snack surveillance.';

    expect(displayBreed).toBe('Good Boy / Girl');
    expect(displayInsight).toContain('loyalty and snack surveillance');
  });
});
