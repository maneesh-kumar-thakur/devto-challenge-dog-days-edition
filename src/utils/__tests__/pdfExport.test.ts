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

  it('should cleanly wrap and paginate long monologues, notes, and mood descriptions', async () => {
    const longEntries: DogTranslationResult[] = [
      {
        id: 'entry-long-1',
        imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1',
        personality: 'undercover-detective',
        personalityName: 'Undercover Detective',
        identifiedBreed: 'Golden Retriever Mix with Welsh Corgi and German Shepherd Ancestry',
        breedInsight:
          'This heritage exhibits intense focus, pastoral vigilance, and an uncanny ability to notice slight micro-shifts in kitchen treat cabinet topography over extended periods of observation.',
        monologue:
          'I have cross-examined the evidence across three separate time zones and four room quadrants. The red laser dot is not an earthly organism, but a classified interdimensional emissary sent to test my tactical reflexes. When the human clicks the metal treat can, soundwaves reverberate at precisely 440 Hertz, establishing a psychic treaty. We cannot compromise.',
        detectedMood:
          '99.9% High Alert Sensory Vigilance & Red Dot Deep State Surveillance Assessment Protocol',
        visualClues: [
          'Ears angled at exactly 45 degrees towards kitchen threshold',
          'Snout vibrating in Morse code pattern',
          'Pupils dilated during suspicious treat jar inspection',
          'Weight shifted strategically onto left rear paw',
        ],
        canineIqScore: '180 (Deep Detective)',
        suggestedAction:
          'Maintain perimeter watch, offer dehydrated beef liver as a diplomatic peace offering, and inspect the curtains for hidden surveillance bugs.',
        timestamp: 1718200000000,
        dogName: 'Archduke Bartholomew von Fluffington the Third',
        ownerNotes:
          'Observed this deep contemplation while opening the refrigerator. He refused to look away until I surrendered a slice of provolone cheese.',
      },
    ];

    await expect(
      exportDiaryToPdf(longEntries, 'Archduke Bartholomew von Fluffington the Third')
    ).resolves.not.toThrow();
  });
});
