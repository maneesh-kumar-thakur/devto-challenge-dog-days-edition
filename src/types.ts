export type PersonalityId =
  | 'dramatic-diva'
  | 'chill-bro'
  | 'anxious-overthinker'
  | 'regal-aristocrat'
  | 'excited-puppy'
  | 'undercover-detective';

export interface PersonalityConfig {
  id: PersonalityId;
  name: string;
  emoji: string;
  tagline: string;
  archetype: string;
  voiceId: string;
  voiceName: string;
  accentColor: string;
  bgGradient: string;
  sampleQuote: string;
  promptDescription: string;
  speechRate: number; // for fallback synth
  speechPitch: number; // for fallback synth
}

export interface DogTranslationResult {
  id: string;
  imageUrl: string;
  dogName?: string;
  personality: PersonalityId;
  personalityName: string;
  monologue: string;
  detectedMood: string;
  visualClues: string[];
  canineIqScore: string;
  suggestedAction: string;
  audioUrl?: string;
  audioSource?: 'elevenlabs' | 'webspeech';
  timestamp: number;
  // Diary enhancements
  ownerNotes?: string;
  pawRating?: number; // 1-5
  isFavorite?: boolean;
  tags?: string[];
}

export interface PresetDog {
  id: string;
  name: string;
  breed: string;
  imageUrl: string;
  suggestedPersonality: PersonalityId;
  description: string;
}

export interface PackDebateParticipant {
  id: string;
  name: string;
  position: 'left' | 'center' | 'right' | 'foreground' | 'background';
  breedOrAppearance: string;
  personality: PersonalityId;
  personalityName: string;
  facialClue: string;
  colorScheme: string; // Tailwind color class for avatars
}

export interface PackDebateLine {
  id: string;
  speakerId: string;
  speakerName: string;
  personality: PersonalityId;
  line: string;
  tone: string;
  audioUrl?: string;
}

export interface PackDebateResult {
  id: string;
  imageUrl: string;
  title: string;
  disputeTopic: string;
  packVerdict: string;
  participants: PackDebateParticipant[];
  dialogue: PackDebateLine[];
  timestamp: number;
}

export interface ApiStatusResponse {
  geminiConfigured: boolean;
  elevenLabsConfigured: boolean;
  status: string;
}
