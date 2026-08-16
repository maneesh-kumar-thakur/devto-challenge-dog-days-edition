import { describe, it, expect } from 'vitest';
import { DogTranslationResult } from '../../types';

describe('Canine Thought Diary & Journal Workflows', () => {
  const sampleEntries: DogTranslationResult[] = [
    {
      id: 'entry-1',
      imageUrl: 'data:image/jpeg;base64,sample1',
      dogName: 'Sir Reginald',
      personality: 'dramatic-diva',
      personalityName: 'Dramatic Diva',
      monologue: 'The peasant was 4 minutes late with my breakfast.',
      detectedMood: '98% Offended Aristocrat',
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
      monologue: 'BALL! BALL! IS THAT A SQUIRREL? BALL!',
      detectedMood: '100% Unadulterated Hype',
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
      dogName: 'Milo',
      personality: 'chill-bro',
      personalityName: 'Chill Bro',
      monologue: 'Sunbeam moved 2 feet. Must migrate.',
      detectedMood: '99% Zen Nap Master',
      visualClues: ['Flopped on rug', 'Closed eyes'],
      canineIqScore: '120',
      suggestedAction: 'Do not disturb the nap.',
      timestamp: Date.now(),
      pawRating: 5,
      isFavorite: false,
    },
  ];

  it('should filter entries by search query across dog name, monologue, clues, and notes', () => {
    const searchByQuery = (entries: DogTranslationResult[], query: string) => {
      const q = query.toLowerCase();
      return entries.filter((e) => {
        return (
          e.monologue.toLowerCase().includes(q) ||
          e.detectedMood.toLowerCase().includes(q) ||
          e.dogName?.toLowerCase().includes(q) ||
          e.ownerNotes?.toLowerCase().includes(q) ||
          e.visualClues.some((c) => c.toLowerCase().includes(q))
        );
      });
    };

    expect(searchByQuery(sampleEntries, 'Reginald').length).toBe(1);
    expect(searchByQuery(sampleEntries, 'SQUIRREL').length).toBe(1);
    expect(searchByQuery(sampleEntries, 'Side-eye').length).toBe(1);
    expect(searchByQuery(sampleEntries, 'morning walk').length).toBe(1);
    expect(searchByQuery(sampleEntries, 'nonexistent').length).toBe(0);
  });

  it('should toggle favorite bookmark status on an entry', () => {
    let entry = { ...sampleEntries[1] };
    expect(entry.isFavorite).toBe(false);

    // Toggle on
    entry = { ...entry, isFavorite: !entry.isFavorite };
    expect(entry.isFavorite).toBe(true);

    // Toggle off
    entry = { ...entry, isFavorite: !entry.isFavorite };
    expect(entry.isFavorite).toBe(false);
  });

  it('should correctly update paw ratings between 1 and 5', () => {
    const updateRating = (entry: DogTranslationResult, rating: number) => {
      const clamped = Math.max(1, Math.min(5, Math.round(rating)));
      return { ...entry, pawRating: clamped };
    };

    const entry = sampleEntries[0];
    expect(updateRating(entry, 3).pawRating).toBe(3);
    expect(updateRating(entry, 7).pawRating).toBe(5);
    expect(updateRating(entry, -2).pawRating).toBe(1);
  });

  it('should calculate accurate personality counts and metrics for analytics', () => {
    const personalityCounts: Record<string, number> = {};
    sampleEntries.forEach((e) => {
      personalityCounts[e.personality] = (personalityCounts[e.personality] || 0) + 1;
    });

    expect(personalityCounts['dramatic-diva']).toBe(1);
    expect(personalityCounts['excited-puppy']).toBe(1);
    expect(personalityCounts['chill-bro']).toBe(1);
    expect(sampleEntries.length).toBe(3);
  });

  it('should generate properly formatted export text for diary archives', () => {
    const textData = sampleEntries
      .map((e, idx) => {
        const date = new Date(e.timestamp).toLocaleDateString();
        const name = e.dogName ? `Dog: ${e.dogName}` : 'Dog: Good Pup';
        return `ENTRY #${idx + 1} - ${date}\n${name} | Mood: ${e.detectedMood}\n"${e.monologue}"`;
      })
      .join('\n\n');

    expect(textData).toContain('ENTRY #1');
    expect(textData).toContain('Sir Reginald');
    expect(textData).toContain('The peasant was 4 minutes late');
    expect(textData).toContain('ENTRY #2');
    expect(textData).toContain('BALL! BALL!');
  });
});
