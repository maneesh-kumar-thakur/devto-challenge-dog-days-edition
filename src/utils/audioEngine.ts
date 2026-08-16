import { PersonalityId } from '../types';
import { PERSONALITIES } from '../data/personalities';

export interface PlaybackHandle {
  source: 'elevenlabs' | 'webspeech';
  audioElement?: HTMLAudioElement;
  stop: () => void;
}

export async function requestDogVoiceAudio(
  text: string,
  personality: PersonalityId
): Promise<{ source: 'elevenlabs' | 'webspeech'; audioUrl?: string }> {
  try {
    const res = await fetch('/api/synthesize-voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        personality,
        voiceId: PERSONALITIES[personality]?.voiceId,
      }),
    });

    const contentType = res.headers.get('content-type') || '';

    if (contentType.includes('audio/mpeg')) {
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      return { source: 'elevenlabs', audioUrl };
    }

    // JSON fallback response
    return { source: 'webspeech' };
  } catch (err) {
    console.warn('Voice API synthesis error, falling back to Web Speech:', err);
    return { source: 'webspeech' };
  }
}

export function playWebSpeechSynthesis(
  text: string,
  personality: PersonalityId,
  onEnd?: () => void,
  onStart?: () => void
): () => void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported on this device.');
    if (onEnd) onEnd();
    return () => {};
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const config = PERSONALITIES[personality];

  utterance.rate = config?.speechRate ?? 1.0;
  utterance.pitch = config?.speechPitch ?? 1.0;

  // Try to pick matching voice
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    if (personality === 'regal-aristocrat') {
      const ukVoice = voices.find((v) => v.lang.includes('GB') || v.name.includes('UK') || v.name.includes('British'));
      if (ukVoice) utterance.voice = ukVoice;
    } else if (personality === 'excited-puppy' || personality === 'dramatic-diva') {
      const femaleVoice = voices.find((v) => v.name.toLowerCase().includes('female') || v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Zira'));
      if (femaleVoice) utterance.voice = femaleVoice;
    } else if (personality === 'chill-bro' || personality === 'undercover-detective') {
      const maleVoice = voices.find((v) => v.name.toLowerCase().includes('male') || v.name.includes('Daniel') || v.name.includes('David') || v.name.includes('Guy'));
      if (maleVoice) utterance.voice = maleVoice;
    }
  }

  if (onStart) utterance.onstart = onStart;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = () => onEnd();
  }

  window.speechSynthesis.speak(utterance);

  return () => {
    window.speechSynthesis.cancel();
  };
}
