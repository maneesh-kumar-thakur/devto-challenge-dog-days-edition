import { describe, it, expect } from 'vitest';
import { PackDebateResult, PackDebateParticipant, PackDebateLine } from '../../types';
import { PRESET_PACKS } from '../../data/presets';

describe('Pack Debate Logic & Scenarios', () => {
  it('should have valid pre-configured pack scenarios with required fields', () => {
    expect(PRESET_PACKS.length).toBeGreaterThanOrEqual(4);
    PRESET_PACKS.forEach((pack) => {
      expect(pack.id).toBeTruthy();
      expect(pack.title).toBeTruthy();
      expect(pack.dogs).toBeTruthy();
      expect(pack.imageUrl).toMatch(/^https?:\/\//);
      expect(pack.description).toBeTruthy();
    });
  });

  it('should validate structured pack debate object format', () => {
    const mockDebate: PackDebateResult = {
      id: 'debate-12345',
      imageUrl: 'https://example.com/pack.jpg',
      title: 'The Great Blanket Dispute',
      disputeTopic: 'Who gets the fluffy corner',
      packVerdict: 'Joint custody under human supervision',
      participants: [
        {
          id: 'dog-1',
          name: 'Apollo',
          position: 'left',
          breedOrAppearance: 'Siberian Husky',
          personality: 'dramatic-diva',
          personalityName: 'Dramatic Diva',
          facialClue: 'Indignant glare',
          colorScheme: 'rose',
        },
        {
          id: 'dog-2',
          name: 'Barnaby',
          position: 'right',
          breedOrAppearance: 'Golden Retriever',
          personality: 'excited-puppy',
          personalityName: 'Excited Puppy',
          facialClue: 'Wide cheerful grin',
          colorScheme: 'amber',
        },
      ],
      dialogue: [
        {
          id: 'line-1',
          speakerId: 'dog-1',
          speakerName: 'Apollo',
          personality: 'dramatic-diva',
          line: 'This blanket is legally my domain!',
          tone: 'Courtroom Outrage',
        },
        {
          id: 'line-2',
          speakerId: 'dog-2',
          speakerName: 'Barnaby',
          personality: 'excited-puppy',
          line: 'BUT IT IS SO SOFT AND WARM!',
          tone: 'Hyperactive Energy',
        },
      ],
      timestamp: Date.now(),
    };

    expect(mockDebate.participants.length).toBe(2);
    expect(mockDebate.dialogue.length).toBe(2);
    expect(mockDebate.dialogue[0].speakerId).toBe(mockDebate.participants[0].id);
    expect(mockDebate.dialogue[1].speakerId).toBe(mockDebate.participants[1].id);
    expect(mockDebate.packVerdict).toContain('custody');
  });

  it('should verify dialog turns link to valid participants', () => {
    const participantIds = ['dog-1', 'dog-2'];
    const lines: PackDebateLine[] = [
      {
        id: 'l1',
        speakerId: 'dog-1',
        speakerName: 'Apollo',
        personality: 'dramatic-diva',
        line: 'I object!',
        tone: 'Indignant',
      },
      {
        id: 'l2',
        speakerId: 'dog-2',
        speakerName: 'Barnaby',
        personality: 'excited-puppy',
        line: 'I concur with enthusiasm!',
        tone: 'Excited',
      },
    ];

    lines.forEach((l) => {
      expect(participantIds).toContain(l.speakerId);
      expect(l.line.length).toBeGreaterThan(0);
    });
  });
});
