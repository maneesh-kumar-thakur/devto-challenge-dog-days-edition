import { describe, it, expect, vi } from 'vitest';
import { exportDiaryToPdf } from '../pdfExport';
import { DogTranslationResult } from '../../types';

describe('PDF Export Utility (exportDiaryToPdf)', () => {
  it('should throw an error when attempting to export empty entries list', async () => {
    await expect(exportDiaryToPdf([])).rejects.toThrow('No diary entries to export');
  });

  it('should generate PDF without crashing given standard diary records', async () => {
    const mockEntries: DogTranslationResult[] = [
      {
        id: 'entry-1',
        imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1',
        personality: 'dramatic-diva',
        personalityName: 'Dramatic Diva',
        identifiedBreed: 'Beagle Hound',
        breedInsight: 'Strong scent hounds fixate intensely on kitchen smells.',
        monologue: 'The turkey treats must be surrendered to me immediately!',
        detectedMood: '99% Impatient Treat Audit',
        visualClues: ['Elevated snout', 'Fixed puppy dog eyes'],
        canineIqScore: '145 (Scent Genius)',
        suggestedAction: 'Give treat immediately.',
        timestamp: 1718000000000,
        dogName: 'Daisy',
        ownerNotes: 'Daisy was looking extra cute while cooking dinner.',
      },
      {
        id: 'entry-2',
        imageUrl: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2',
        personality: 'chill-bro',
        personalityName: 'Chill Bro',
        monologue: 'Just resting my chin on the sofa cushion, human.',
        detectedMood: '100% Zen Frequency',
        visualClues: ['Relaxed jaw', 'Drooping heavy eyelids'],
        canineIqScore: '120 (Zen Master)',
        suggestedAction: 'Provide cozy blanket.',
        timestamp: 1718100000000,
      },
    ];

    // Should execute cleanly
    await expect(exportDiaryToPdf(mockEntries, 'Daisy')).resolves.not.toThrow();
  });
});
