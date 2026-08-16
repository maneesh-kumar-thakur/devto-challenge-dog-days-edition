/**
 * Utility to categorize freeform detected mood strings (e.g. "98% Zoomie Velocity", "100% Zen Alignment", "Suspicious Eye Squint")
 * into normalized, standardized mood categories for analytics visualization.
 */

export interface MoodCategoryData {
  category: string;
  displayName: string;
  count: number;
  percentage: number;
  color: string;
  emoji: string;
  description: string;
}

export const STANDARD_MOOD_TAXONOMY: {
  key: string;
  displayName: string;
  emoji: string;
  color: string;
  keywords: string[];
  description: string;
}[] = [
  {
    key: 'happy_excited',
    displayName: 'Happy & Excited',
    emoji: '🎉',
    color: '#6366f1', // indigo-500
    keywords: ['happy', 'excited', 'zoomie', 'joy', 'playful', 'bounce', 'thrilled', 'ecstatic', 'party', 'wiggle'],
    description: 'High energy, wagging tails, pure excitement, and zoomies.',
  },
  {
    key: 'hungry_treat_seeking',
    displayName: 'Hungry & Treat-Seeking',
    emoji: '🍖',
    color: '#f59e0b', // amber-500
    keywords: ['hungry', 'treat', 'snack', 'food', 'bacon', 'cheese', 'audit', 'starving', 'deficit', 'drool', 'dinner'],
    description: 'Direct focus on snacks, treat negotiations, and kitchen auditing.',
  },
  {
    key: 'suspicious_alert',
    displayName: 'Suspicious & Alert',
    emoji: '🕵️',
    color: '#8b5cf6', // purple-500
    keywords: ['suspicious', 'alert', 'investigative', 'conspiracy', 'detective', 'skeptical', 'side-eye', 'mailman', 'squirrel', 'intruder', 'watchful'],
    description: 'Sharp scrutiny, side-eye assessments, and perimeter watch.',
  },
  {
    key: 'chill_zen',
    displayName: 'Chill & Relaxed',
    emoji: '🛋️',
    color: '#10b981', // emerald-500
    keywords: ['chill', 'zen', 'relaxed', 'nap', 'sleepy', 'cozy', 'cushion', 'sunbeam', 'peaceful', 'couch', 'lazy'],
    description: 'Zen alignment, sofa lounging, sunbeam absorbing, and calmness.',
  },
  {
    key: 'dramatic_demanding',
    displayName: 'Dramatic & Demanding',
    emoji: '👑',
    color: '#ec4899', // pink-500
    keywords: ['dramatic', 'diva', 'demanding', 'outraged', 'betrayed', 'royalty', 'unacceptable', 'indignant', 'pout', 'gasp', 'courtroom'],
    description: 'High canine theatrics, righteous indignation, and regal expectations.',
  },
  {
    key: 'anxious_overthinking',
    displayName: 'Anxious & Overthinking',
    emoji: '🌀',
    color: '#06b6d4', // cyan-500
    keywords: ['anxious', 'overthinking', 'nervous', 'vacuum', 'existential', 'worry', 'thunder', 'vet', 'doorbell', 'scared', 'uncertain'],
    description: 'Philosophical brooding, appliance phobias, and deep worry.',
  },
];

/**
 * Parses an array of detected mood strings and groups them into categorized distribution buckets.
 */
export function calculateMoodDistribution(
  detectedMoods: string[]
): {
  data: MoodCategoryData[];
  topMoodCategory: MoodCategoryData | null;
  totalMoods: number;
} {
  const counts: Record<string, number> = {};
  STANDARD_MOOD_TAXONOMY.forEach((m) => {
    counts[m.key] = 0;
  });

  let otherCount = 0;

  detectedMoods.forEach((rawMood) => {
    if (!rawMood) return;
    const lower = rawMood.toLowerCase();

    let matchedKey: string | null = null;

    for (const taxonomy of STANDARD_MOOD_TAXONOMY) {
      if (taxonomy.keywords.some((kw) => lower.includes(kw))) {
        matchedKey = taxonomy.key;
        break;
      }
    }

    if (matchedKey) {
      counts[matchedKey] = (counts[matchedKey] || 0) + 1;
    } else {
      // Fallback: If it contains numbers/percentages like "90% Impatience", bucket into dramatic or happy
      if (lower.includes('impatient') || lower.includes('boss')) {
        counts['dramatic_demanding'] = (counts['dramatic_demanding'] || 0) + 1;
      } else {
        otherCount++;
      }
    }
  });

  const total = detectedMoods.length;

  const resultData: MoodCategoryData[] = STANDARD_MOOD_TAXONOMY.map((tax) => {
    const count = counts[tax.key] || 0;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return {
      category: tax.key,
      displayName: tax.displayName,
      count,
      percentage,
      color: tax.color,
      emoji: tax.emoji,
      description: tax.description,
    };
  });

  if (otherCount > 0) {
    resultData.push({
      category: 'other_curious',
      displayName: 'Curious / Other',
      count: otherCount,
      percentage: total > 0 ? Math.round((otherCount / total) * 100) : 0,
      color: '#94a3b8',
      emoji: '🐾',
      description: 'Unique micro-expressions and eccentric curiosity.',
    });
  }

  // Sort descending by count
  resultData.sort((a, b) => b.count - a.count);

  const topMoodCategory = resultData.length > 0 && resultData[0].count > 0 ? resultData[0] : null;

  return {
    data: resultData,
    topMoodCategory,
    totalMoods: total,
  };
}
