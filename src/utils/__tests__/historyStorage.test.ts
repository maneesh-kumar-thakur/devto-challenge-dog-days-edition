import { describe, it, expect, beforeEach } from 'vitest';
import { DogTranslationResult } from '../../types';

describe('History Storage Logic', () => {
  const LOCAL_STORAGE_KEY = 'translate_my_dog_history_v1';
  let memoryStore: Record<string, string> = {};

  beforeEach(() => {
    memoryStore = {};
    global.localStorage = {
      getItem: (key: string) => memoryStore[key] || null,
      setItem: (key: string, value: string) => {
        memoryStore[key] = value;
      },
      removeItem: (key: string) => {
        delete memoryStore[key];
      },
      clear: () => {
        memoryStore = {};
      },
      length: 0,
      key: () => null,
    };
  });

  const createSampleItem = (id: string): DogTranslationResult => ({
    id,
    imageUrl: 'https://example.com/dog.jpg',
    personality: 'chill-bro',
    personalityName: 'Chill Bro',
    monologue: 'Vibes are immaculate, dude.',
    detectedMood: '100% Sunbeam Alignment',
    visualClues: ['Totally relaxed paws', 'Half-closed eyes'],
    canineIqScore: '420 (Zen Master)',
    suggestedAction: 'Slide a treat under my snout.',
    timestamp: Date.now(),
  });

  it('should save items and cap history list to 20 items', () => {
    let history: DogTranslationResult[] = [];

    const saveToHistory = (item: DogTranslationResult) => {
      history = [item, ...history.filter((i) => i.id !== item.id)].slice(0, 20);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
    };

    // Add 25 items
    for (let i = 1; i <= 25; i++) {
      saveToHistory(createSampleItem(`trans_${i}`));
    }

    expect(history.length).toBe(20);
    // Most recent item should be at the top
    expect(history[0].id).toBe('trans_25');
    // Oldest items (1 to 5) should have been pruned
    expect(history.find((i) => i.id === 'trans_1')).toBeUndefined();
  });

  it('should deduplicate items with the same id', () => {
    let history: DogTranslationResult[] = [];

    const saveToHistory = (item: DogTranslationResult) => {
      history = [item, ...history.filter((i) => i.id !== item.id)].slice(0, 20);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
    };

    const item = createSampleItem('trans_abc');
    saveToHistory(item);
    saveToHistory(item);

    expect(history.length).toBe(1);
    expect(history[0].id).toBe('trans_abc');
  });

  it('should clear stored history on reset', () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([createSampleItem('trans_1')]));
    expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBeTruthy();

    localStorage.removeItem(LOCAL_STORAGE_KEY);
    expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBeNull();
  });
});
