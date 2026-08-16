import { describe, it, expect } from 'vitest';
import { filterDiaryEntries, extractUniqueBreeds, matchesMoodCategory } from '../diaryFilters';
import { DogTranslationResult } from '../../types';

describe('Diary Filter and Search Utilities (filterDiaryEntries)', () => {
  const sampleEntries: DogTranslationResult[] = [
    {
      id: 'entry-1',
      imageUrl: 'data:image/jpeg;base64,sample1',
      dogName: 'Daisy',
      personality: 'dramatic-diva',
      personalityName: 'Dramatic Diva',
      identifiedBreed: 'Golden Retriever',
      breedInsight: 'Known for joyful loyalty and expressive theatrical eyes.',
      monologue: 'The peasant was 4 minutes late with my afternoon bacon snack.',
      detectedMood: '98% Offended Aristocrat & Treat Audit',
      visualClues: ['Side-eye glare', 'Folded paws'],
      canineIqScore: '142',
      suggestedAction: 'Offer high-value cheese immediately.',
      timestamp: Date.now() - 100000,
      pawRating: 5,
      isFavorite: true,
      ownerNotes: 'Happened right before morning walk.',
    },
    {
      id: 'entry-2',
      imageUrl: 'data:image/jpeg;base64,sample2',
      dogName: 'Buster',
      personality: 'excited-puppy',
      personalityName: 'Excited Puppy',
      identifiedBreed: 'Jack Russell Terrier',
      monologue: 'BALL! BALL! SQUIRREL IN PERIMETER!',
      detectedMood: '100% Zoomie Velocity & Joyful Playful Excitement',
      visualClues: ['Wagging tail blur', 'Tongue out'],
      canineIqScore: '95',
      suggestedAction: 'Throw the tennis ball now.',
      timestamp: Date.now() - 50000,
      pawRating: 4,
      isFavorite: false,
    },
    {
      id: 'entry-3',
      imageUrl: 'data:image/jpeg;base64,sample3',
      dogName: 'Sherlock Bones',
      personality: 'undercover-detective',
      personalityName: 'Undercover Detective',
      identifiedBreed: 'German Shepherd',
      monologue: 'The mail carrier left a suspicious rectangular package at 14:02 hours.',
      detectedMood: '99% Suspicious Alert & Mailman Conspiracy',
      visualClues: ['Ears perked at 45 degrees', 'Low surveillance stance'],
      canineIqScore: '160',
      suggestedAction: 'Inspect package carefully from safe perimeter.',
      timestamp: Date.now() - 20000,
      pawRating: 5,
      isFavorite: true,
    },
    {
      id: 'entry-4',
      imageUrl: 'data:image/jpeg;base64,sample4',
      dogName: 'Winston',
      personality: 'chill-bro',
      personalityName: 'Chill Bro',
      identifiedBreed: 'French Bulldog',
      monologue: 'Sunbeam moved two feet. Initiating tactical couch relocation.',
      detectedMood: '100% Cozy Zen Alignment & Nap Protocol',
      visualClues: ['Flopped flat like a pancake', 'Snoring gently'],
      canineIqScore: '110',
      suggestedAction: 'Do not disturb the sunbeam slumber.',
      timestamp: Date.now(),
      pawRating: 4,
      isFavorite: false,
    },
  ];

  it('should extract unique sorted breeds from entries', () => {
    const breeds = extractUniqueBreeds(sampleEntries);
    expect(breeds).toEqual([
      'French Bulldog',
      'German Shepherd',
      'Golden Retriever',
      'Jack Russell Terrier',
    ]);
  });

  it('should filter entries by Personality archetype', () => {
    const divaResults = filterDiaryEntries(sampleEntries, { personalityFilter: 'dramatic-diva' });
    expect(divaResults.length).toBe(1);
    expect(divaResults[0].dogName).toBe('Daisy');

    const detectiveResults = filterDiaryEntries(sampleEntries, { personalityFilter: 'undercover-detective' });
    expect(detectiveResults.length).toBe(1);
    expect(detectiveResults[0].dogName).toBe('Sherlock Bones');
  });

  it('should filter entries by Mood taxonomy category', () => {
    const happyResults = filterDiaryEntries(sampleEntries, { moodFilter: 'happy_excited' });
    expect(happyResults.length).toBe(1);
    expect(happyResults[0].dogName).toBe('Buster');

    const suspiciousResults = filterDiaryEntries(sampleEntries, { moodFilter: 'suspicious_alert' });
    expect(suspiciousResults.length).toBe(1);
    expect(suspiciousResults[0].dogName).toBe('Sherlock Bones');

    const hungryResults = filterDiaryEntries(sampleEntries, { moodFilter: 'hungry_treat_seeking' });
    expect(hungryResults.length).toBe(1);
    expect(hungryResults[0].dogName).toBe('Daisy');

    const chillResults = filterDiaryEntries(sampleEntries, { moodFilter: 'chill_zen' });
    expect(chillResults.length).toBe(1);
    expect(chillResults[0].dogName).toBe('Winston');
  });

  it('should filter entries by Breed', () => {
    const retrieverResults = filterDiaryEntries(sampleEntries, { breedFilter: 'Golden Retriever' });
    expect(retrieverResults.length).toBe(1);
    expect(retrieverResults[0].dogName).toBe('Daisy');

    const shepherdResults = filterDiaryEntries(sampleEntries, { breedFilter: 'German Shepherd' });
    expect(shepherdResults.length).toBe(1);
    expect(shepherdResults[0].dogName).toBe('Sherlock Bones');

    const nonExistentResults = filterDiaryEntries(sampleEntries, { breedFilter: 'Poodle' });
    expect(nonExistentResults.length).toBe(0);
  });

  it('should filter by Favorites/Starred only', () => {
    const favoriteResults = filterDiaryEntries(sampleEntries, { favoritesOnly: true });
    expect(favoriteResults.length).toBe(2);
    expect(favoriteResults.map((r) => r.dogName)).toEqual(['Daisy', 'Sherlock Bones']);
  });

  it('should filter by full-text Search across name, breed, monologue, mood, and clues', () => {
    expect(filterDiaryEntries(sampleEntries, { searchQuery: 'bacon' }).length).toBe(1);
    expect(filterDiaryEntries(sampleEntries, { searchQuery: 'SQUIRREL' }).length).toBe(1);
    expect(filterDiaryEntries(sampleEntries, { searchQuery: 'sunbeam' }).length).toBe(1);
    expect(filterDiaryEntries(sampleEntries, { searchQuery: 'Sherlock' }).length).toBe(1);
    expect(filterDiaryEntries(sampleEntries, { searchQuery: 'German Shepherd' }).length).toBe(1);
    expect(filterDiaryEntries(sampleEntries, { searchQuery: 'pancake' }).length).toBe(1);
    expect(filterDiaryEntries(sampleEntries, { searchQuery: 'nonexistent phrase' }).length).toBe(0);
  });

  it('should combine multiple filters simultaneously (Personality + Breed + Mood + Search)', () => {
    const combined = filterDiaryEntries(sampleEntries, {
      personalityFilter: 'dramatic-diva',
      breedFilter: 'Golden Retriever',
      moodFilter: 'hungry_treat_seeking',
      searchQuery: 'bacon',
      favoritesOnly: true,
    });
    expect(combined.length).toBe(1);
    expect(combined[0].dogName).toBe('Daisy');

    const noMatch = filterDiaryEntries(sampleEntries, {
      personalityFilter: 'chill-bro',
      breedFilter: 'Golden Retriever',
    });
    expect(noMatch.length).toBe(0);
  });
});
