import { DogTranslationResult } from '../types';
import { STANDARD_MOOD_TAXONOMY } from './moodAnalytics';

export interface DiaryFilterOptions {
  searchQuery?: string;
  moodFilter?: string; // 'all' | 'happy_excited' | 'hungry_treat_seeking' | etc.
  personalityFilter?: string; // 'all' | PersonalityId
  breedFilter?: string; // 'all' | specific breed name
  favoritesOnly?: boolean;
}

/**
 * Checks whether an entry's detectedMood matches a mood taxonomy category key.
 */
export function matchesMoodCategory(detectedMood: string, moodCategoryKey: string): boolean {
  if (!moodCategoryKey || moodCategoryKey === 'all') return true;
  if (!detectedMood) return false;

  const lower = detectedMood.toLowerCase();
  const taxonomy = STANDARD_MOOD_TAXONOMY.find((t) => t.key === moodCategoryKey);

  if (taxonomy) {
    return taxonomy.keywords.some((kw) => lower.includes(kw));
  }

  // Fallback direct substring comparison
  return lower.includes(moodCategoryKey.toLowerCase());
}

/**
 * Extracts a sorted list of unique identified breeds present in diary entries.
 */
export function extractUniqueBreeds(entries: DogTranslationResult[]): string[] {
  const breedSet = new Set<string>();
  entries.forEach((entry) => {
    if (entry.identifiedBreed && entry.identifiedBreed.trim()) {
      breedSet.add(entry.identifiedBreed.trim());
    }
  });
  return Array.from(breedSet).sort((a, b) => a.localeCompare(b));
}

/**
 * Filters a list of canine diary entries based on query, mood category, personality archetype, breed, and favorite status.
 */
export function filterDiaryEntries(
  entries: DogTranslationResult[],
  options: DiaryFilterOptions
): DogTranslationResult[] {
  const {
    searchQuery = '',
    moodFilter = 'all',
    personalityFilter = 'all',
    breedFilter = 'all',
    favoritesOnly = false,
  } = options;

  const normalizedQuery = searchQuery.trim().toLowerCase();

  return entries.filter((item) => {
    // 1. Favorites Filter
    if (favoritesOnly && !item.isFavorite) {
      return false;
    }

    // 2. Personality Archetype Filter
    if (personalityFilter !== 'all' && item.personality !== personalityFilter) {
      return false;
    }

    // 3. Mood Category Filter
    if (moodFilter !== 'all' && !matchesMoodCategory(item.detectedMood, moodFilter)) {
      return false;
    }

    // 4. Breed Filter
    if (breedFilter !== 'all') {
      if (!item.identifiedBreed) return false;
      const entryBreed = item.identifiedBreed.toLowerCase();
      const targetBreed = breedFilter.toLowerCase();
      if (!entryBreed.includes(targetBreed) && !targetBreed.includes(entryBreed)) {
        return false;
      }
    }

    // 5. Search Query across multiple metadata fields
    if (normalizedQuery) {
      const matchesMonologue = item.monologue.toLowerCase().includes(normalizedQuery);
      const matchesMood = item.detectedMood.toLowerCase().includes(normalizedQuery);
      const matchesName = item.dogName?.toLowerCase().includes(normalizedQuery);
      const matchesBreed = item.identifiedBreed?.toLowerCase().includes(normalizedQuery);
      const matchesBreedInsight = item.breedInsight?.toLowerCase().includes(normalizedQuery);
      const matchesPersonalityName = item.personalityName?.toLowerCase().includes(normalizedQuery);
      const matchesPersonalityKey = item.personality?.toLowerCase().includes(normalizedQuery);
      const matchesNotes = item.ownerNotes?.toLowerCase().includes(normalizedQuery);
      const matchesAction = item.suggestedAction?.toLowerCase().includes(normalizedQuery);
      const matchesClues = item.visualClues?.some((c) => c.toLowerCase().includes(normalizedQuery));

      if (
        !matchesMonologue &&
        !matchesMood &&
        !matchesName &&
        !matchesBreed &&
        !matchesBreedInsight &&
        !matchesPersonalityName &&
        !matchesPersonalityKey &&
        !matchesNotes &&
        !matchesAction &&
        !matchesClues
      ) {
        return false;
      }
    }

    return true;
  });
}
