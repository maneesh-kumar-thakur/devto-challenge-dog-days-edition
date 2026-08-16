import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Download, Sparkles, Volume2, Loader2 } from 'lucide-react';
import { PersonalityId } from '../types';
import { PERSONALITY_LIST, PERSONALITIES } from '../data/personalities';
import { requestDogVoiceAudio, playWebSpeechSynthesis } from '../utils/audioEngine';

interface AudioVisualizerPlayerProps {
  monologue: string;
  initialPersonality: PersonalityId;
  initialAudioUrl?: string;
  initialSource?: 'elevenlabs' | 'webspeech';
}

export const AudioVisualizerPlayer: React.FC<AudioVisualizerPlayerProps> = ({
  monologue,
  initialPersonality,
  initialAudioUrl,
  initialSource,
}) => {
  const [currentPersonality, setCurrentPersonality] = useState<PersonalityId>(initialPersonality);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(initialAudioUrl);
  const [source, setSource] = useState<'elevenlabs' | 'webspeech'>(initialSource || 'webspeech');
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopWebSpeechRef = useRef<(() => void) | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize or fetch audio on personality change
  const loadAudioForPersonality = async (personality: PersonalityId) => {
    setIsSynthesizing(true);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (stopWebSpeechRef.current) {
      stopWebSpeechRef.current();
    }
    setIsPlaying(false);

    const result = await requestDogVoiceAudio(monologue, personality);
    setSource(result.source);
    setAudioUrl(result.audioUrl);
    setIsSynthesizing(false);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      if (source === 'elevenlabs' && audioRef.current) {
        audioRef.current.pause();
      } else if (stopWebSpeechRef.current) {
        stopWebSpeechRef.current();
      }
      setIsPlaying(false);
    } else {
      if (source === 'elevenlabs' && audioUrl) {
        if (!audioRef.current) {
          audioRef.current = new Audio(audioUrl);
        } else if (audioRef.current.src !== audioUrl) {
          audioRef.current.src = audioUrl;
        }

        audioRef.current.onended = () => {
          setIsPlaying(false);
          setCurrentTime(0);
        };
        audioRef.current.ontimeupdate = () => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
          }
        };

        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn('Audio play failed, falling back to speech synthesis:', err);
          fallbackPlay();
        });
      } else {
        fallbackPlay();
      }
    }
  };

  const fallbackPlay = () => {
    setIsPlaying(true);
    stopWebSpeechRef.current = playWebSpeechSynthesis(
      monologue,
      currentPersonality,
      () => setIsPlaying(false),
      () => setIsPlaying(true)
    );
  };

  const handleSwitchVoice = async (newId: PersonalityId) => {
    setCurrentPersonality(newId);
    await loadAudioForPersonality(newId);
  };

  const handleRestart = () => {
    if (audioRef.current && source === 'elevenlabs') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      handleTogglePlay();
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (stopWebSpeechRef.current) {
        stopWebSpeechRef.current();
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const personalityInfo = PERSONALITIES[currentPersonality];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
      {/* Audio Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <span>{personalityInfo.emoji}</span> {personalityInfo.voiceName}
            </div>
            <p className="text-[11px] text-slate-400">
              {source === 'elevenlabs' ? 'ElevenLabs Neural Stream' : 'Browser Neural Speech Synth'}
            </p>
          </div>
        </div>

        {/* Voice Selector Switcher */}
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] text-slate-400 font-medium hidden sm:inline">Voice:</label>
          <select
            id="voice-selector"
            value={currentPersonality}
            onChange={(e) => handleSwitchVoice(e.target.value as PersonalityId)}
            className="text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {PERSONALITY_LIST.map((p) => (
              <option key={p.id} value={p.id}>
                {p.emoji} {p.name} ({p.voiceName.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visualizer Waveform Bar */}
      <div className="h-12 bg-slate-950/80 rounded-xl px-4 flex items-center justify-center gap-1 border border-slate-800/80 overflow-hidden">
        {Array.from({ length: 28 }).map((_, idx) => {
          const isCenter = Math.abs(idx - 14) < 8;
          const baseHeight = isCenter ? 24 : 10;
          return (
            <div
              key={idx}
              className={`w-1.5 rounded-full transition-all duration-150 ${
                isPlaying
                  ? 'bg-gradient-to-t from-indigo-500 via-rose-500 to-amber-400 animate-pulse'
                  : 'bg-slate-700'
              }`}
              style={{
                height: isPlaying
                  ? `${Math.max(6, Math.sin(idx * 0.4 + Date.now() * 0.005) * 20 + baseHeight)}px`
                  : `${Math.max(4, baseHeight * 0.4)}px`,
                animationDelay: `${idx * 45}ms`,
              }}
            />
          );
        })}
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          {/* Main Play Button */}
          <button
            id="audio-play-toggle-btn"
            onClick={handleTogglePlay}
            disabled={isSynthesizing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-500 hover:opacity-95 text-white font-semibold text-xs shadow-md shadow-amber-500/10 transition-transform active:scale-95 disabled:opacity-50"
          >
            {isSynthesizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Synthesizing Voice...
              </>
            ) : isPlaying ? (
              <>
                <Pause className="w-4 h-4" /> Pause Voice
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" /> Hear Dog's Voice 🐾
              </>
            )}
          </button>

          {/* Replay */}
          <button
            id="audio-replay-btn"
            onClick={handleRestart}
            title="Replay from start"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Download MP3 (if ElevenLabs binary audio is present) */}
        {audioUrl && source === 'elevenlabs' && (
          <a
            id="download-audio-btn"
            href={audioUrl}
            download={`dog-monologue-${currentPersonality}.mp3`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download MP3</span>
          </a>
        )}
      </div>
    </div>
  );
};
