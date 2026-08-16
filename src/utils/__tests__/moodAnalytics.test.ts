import { describe, it, expect } from 'vitest';
import { calculateMoodDistribution, STANDARD_MOOD_TAXONOMY } from '../moodAnalytics';

describe('Mood Analytics & Taxonomy (calculateMoodDistribution)', () => {
  it('should categorize known detected moods into appropriate buckets', () => {
    const rawMoods = [
      '98% Zoomie Velocity & Playful Barking',
      'Suspicious Eye Squint & Mailman Alert',
      '100% Snack Deficit & Hungry Stare',
      'Cozy Sunbeam Zen Alignment',
      'Regal Outrage & Demanding Pout',
      'Deep Existential Worry About Vacuum',
    ];

    const result = calculateMoodDistribution(rawMoods);

    expect(result.totalMoods).toBe(6);
    expect(result.data.length).toBeGreaterThanOrEqual(6);

    const happyBucket = result.data.find((d) => d.category === 'happy_excited');
    const hungryBucket = result.data.find((d) => d.category === 'hungry_treat_seeking');
    const suspiciousBucket = result.data.find((d) => d.category === 'suspicious_alert');
    const chillBucket = result.data.find((d) => d.category === 'chill_zen');
    const dramaticBucket = result.data.find((d) => d.category === 'dramatic_demanding');
    const anxiousBucket = result.data.find((d) => d.category === 'anxious_overthinking');

    expect(happyBucket?.count).toBe(1);
    expect(hungryBucket?.count).toBe(1);
    expect(suspiciousBucket?.count).toBe(1);
    expect(chillBucket?.count).toBe(1);
    expect(dramaticBucket?.count).toBe(1);
    expect(anxiousBucket?.count).toBe(1);
  });

  it('should return 0% percentages gracefully when given an empty list', () => {
    const result = calculateMoodDistribution([]);
    expect(result.totalMoods).toBe(0);
    expect(result.topMoodCategory).toBeNull();
    result.data.forEach((item) => {
      expect(item.count).toBe(0);
      expect(item.percentage).toBe(0);
    });
  });

  it('should correctly identify the top mood category with highest frequency', () => {
    const rawMoods = [
      '100% Hungry Treat Audit',
      'Starving for Cheese Treats',
      'Snack Demand Protocol',
      'Happy Tail Wag',
    ];

    const result = calculateMoodDistribution(rawMoods);
    expect(result.topMoodCategory?.category).toBe('hungry_treat_seeking');
    expect(result.topMoodCategory?.count).toBe(3);
    expect(result.topMoodCategory?.percentage).toBe(75);
  });
});
