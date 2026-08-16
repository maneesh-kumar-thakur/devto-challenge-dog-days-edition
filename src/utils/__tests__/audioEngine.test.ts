import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestDogVoiceAudio } from '../audioEngine';

describe('audioEngine - requestDogVoiceAudio', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should fallback to webspeech when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await requestDogVoiceAudio('Hello human', 'dramatic-diva');
    expect(result.source).toBe('webspeech');
    expect(result.audioUrl).toBeUndefined();
  });

  it('should fallback to webspeech when server returns non-200 status', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'ElevenLabs not configured' }),
      headers: new Headers({ 'content-type': 'application/json' }),
    });

    const result = await requestDogVoiceAudio('I demand cheese', 'regal-aristocrat');
    expect(result.source).toBe('webspeech');
  });

  it('should fallback to webspeech when server returns json fallback flag', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ fallback: true }),
    });

    const result = await requestDogVoiceAudio('Zoomies!', 'excited-puppy');
    expect(result.source).toBe('webspeech');
  });

  it('should return elevenlabs source and blob URL when audio stream is returned', async () => {
    const mockBlob = new Blob(['dummy audio bytes'], { type: 'audio/mpeg' });
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/test-audio-id');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'audio/mpeg' }),
      blob: async () => mockBlob,
    });

    const result = await requestDogVoiceAudio('Case solved.', 'undercover-detective');
    expect(result.source).toBe('elevenlabs');
    expect(result.audioUrl).toBe('blob:http://localhost/test-audio-id');
  });
});
