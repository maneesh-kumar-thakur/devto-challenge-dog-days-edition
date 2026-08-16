import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Share2,
  Bookmark,
  Check,
  Sparkles,
  Users,
  MessageSquare,
  Award,
  Flame,
  ArrowRight,
  Download,
  Copy,
} from 'lucide-react';
import { PackDebateResult, PackDebateParticipant, PackDebateLine } from '../types';
import { PERSONALITIES } from '../data/personalities';
import { playDialogueLine } from '../utils/audioEngine';

interface PackDebateViewerProps {
  debate: PackDebateResult;
  onReset: () => void;
  onSaveToDiary?: (debate: PackDebateResult) => void;
}

export const PackDebateViewer: React.FC<PackDebateViewerProps> = ({
  debate,
  onReset,
  onSaveToDiary,
}) => {
  const [isPlayingAll, setIsPlayingAll] = useState<boolean>(false);
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [selectedParticipant, setSelectedParticipant] = useState<PackDebateParticipant | null>(
    debate.participants[0] || null
  );

  const stopCurrentAudioRef = useRef<(() => void) | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanupAudio = () => {
    if (stopCurrentAudioRef.current) {
      stopCurrentAudioRef.current();
      stopCurrentAudioRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  const handlePlayLine = async (index: number) => {
    cleanupAudio();
    setIsPlayingAll(false);
    setActiveLineIndex(index);
    const lineItem = debate.dialogue[index];
    if (!lineItem) return;

    setActiveSpeakerId(lineItem.speakerId);

    const cancelFn = await playDialogueLine(
      lineItem.line,
      lineItem.personality,
      () => {
        setActiveLineIndex(null);
        setActiveSpeakerId(null);
      },
      () => {
        setActiveLineIndex(index);
        setActiveSpeakerId(lineItem.speakerId);
      }
    );
    stopCurrentAudioRef.current = cancelFn;
  };

  const handlePlayAllDebate = (startIndex = 0) => {
    cleanupAudio();
    setIsPlayingAll(true);

    const playSequence = async (idx: number) => {
      if (idx >= debate.dialogue.length) {
        setIsPlayingAll(false);
        setActiveLineIndex(null);
        setActiveSpeakerId(null);
        return;
      }

      setActiveLineIndex(idx);
      const lineItem = debate.dialogue[idx];
      setActiveSpeakerId(lineItem.speakerId);

      const cancelFn = await playDialogueLine(
        lineItem.line,
        lineItem.personality,
        () => {
          // Pause briefly between speakers for natural comedic timing
          timeoutRef.current = setTimeout(() => {
            playSequence(idx + 1);
          }, 650);
        },
        () => {
          setActiveLineIndex(idx);
          setActiveSpeakerId(lineItem.speakerId);
        }
      );
      stopCurrentAudioRef.current = cancelFn;
    };

    playSequence(startIndex);
  };

  const handleStopAll = () => {
    cleanupAudio();
    setIsPlayingAll(false);
    setActiveLineIndex(null);
    setActiveSpeakerId(null);
  };

  const handleCopyScript = () => {
    const linesText = debate.dialogue
      .map((d) => `[${d.speakerName} (${d.tone})]: "${d.line}"`)
      .join('\n\n');
    const fullText = `🐾 PACK DEBATE: ${debate.title}\nDispute: ${debate.disputeTopic}\n\n${linesText}\n\n${debate.packVerdict}\n\n— Translated by Translate My Dog AI`;

    navigator.clipboard.writeText(fullText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleSave = () => {
    if (onSaveToDiary) {
      onSaveToDiary(debate);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-500/20 rounded-3xl p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Users className="w-48 h-48 text-white" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Multi-Dog Pack Debate Court
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyScript}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
                title="Copy dialogue script"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Copied!' : 'Copy Script'}</span>
              </button>

              {onSaveToDiary && (
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
                >
                  {savedSuccess ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>{savedSuccess ? 'Saved in Diary!' : 'Save Debate'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {debate.title}
            </h2>
            <div className="flex items-start gap-2 text-slate-300 text-sm sm:text-base">
              <span className="font-bold text-amber-400 shrink-0">Dispute Topic:</span>
              <p className="italic">{debate.disputeTopic}</p>
            </div>
          </div>

          {/* Master Audio Controls */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {!isPlayingAll ? (
              <button
                type="button"
                onClick={() => handlePlayAllDebate(0)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:opacity-90 text-white font-bold text-sm shadow-lg shadow-rose-500/20 transition-all hover:scale-105"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Play Full Pack Debate Audio</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopAll}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all"
              >
                <Pause className="w-4 h-4" />
                <span>Stop Playback</span>
              </button>
            )}

            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-semibold text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Translate Another Photo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Visual Scene + Participants on Left, Comic Dialogue on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Scene & Participant Lineup */}
        <div className="lg:col-span-5 space-y-5">
          {/* Photo Frame with Overlaid Speaker Tags */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 group">
            {debate.imageUrl ? (
              <img
                src={debate.imageUrl}
                alt="Debating pack"
                className="w-full aspect-[4/3] object-cover object-center"
              />
            ) : (
              <div className="w-full aspect-[4/3] bg-slate-900 flex items-center justify-center text-slate-600">
                <Users className="w-16 h-16" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />

            {/* Active Speaker Badge on Photo */}
            {activeSpeakerId && (
              <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-rose-500/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg animate-pulse backdrop-blur-sm">
                <Volume2 className="w-3.5 h-3.5" />
                <span>
                  {debate.participants.find((p) => p.id === activeSpeakerId)?.name || 'Speaker'} Speaking...
                </span>
              </div>
            )}

            {/* Bottom Participant Overview */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90 font-medium">
              <span>{debate.participants.length} Debaters Identified</span>
              <span className="text-amber-300">Live AI Transcript</span>
            </div>
          </div>

          {/* Participant Cards */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              Debate Council Members
            </h3>

            <div className="space-y-2.5">
              {debate.participants.map((p) => {
                const pConfig = PERSONALITIES[p.personality] || PERSONALITIES['dramatic-diva'];
                const isSpeaking = activeSpeakerId === p.id;

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedParticipant(p)}
                    className={`rounded-2xl p-3.5 border transition-all cursor-pointer ${
                      isSpeaking
                        ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/30 shadow-lg shadow-rose-500/10'
                        : selectedParticipant?.id === p.id
                        ? 'bg-slate-800/90 border-indigo-500/80'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                        {pConfig?.emoji || '🐶'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white truncate">{p.name}</h4>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                            {p.personalityName || pConfig?.name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 truncate">{p.breedOrAppearance}</p>
                        <p className="text-[11px] text-amber-300/90 italic pt-1 flex items-center gap-1">
                          <span>🔍</span> {p.facialClue}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Comic Script Dialogue */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
              Interactive Debate Script
            </h3>
            <span className="text-xs text-slate-500">Tap speaker to hear line</span>
          </div>

          {/* Dialogue Bubbles */}
          <div className="space-y-4">
            {debate.dialogue.map((lineItem, index) => {
              const speaker = debate.participants.find((p) => p.id === lineItem.speakerId);
              const pConfig = PERSONALITIES[lineItem.personality] || PERSONALITIES['dramatic-diva'];
              const isActive = activeLineIndex === index;
              const isSpeakerRight = index % 2 === 1;

              return (
                <div
                  key={lineItem.id || index}
                  className={`flex gap-3 items-start transition-all ${
                    isSpeakerRight ? 'flex-row-reverse text-right' : 'flex-row text-left'
                  } ${isActive ? 'scale-[1.02]' : 'opacity-90 hover:opacity-100'}`}
                >
                  {/* Speaker Avatar */}
                  <div
                    onClick={() => handlePlayLine(index)}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 cursor-pointer shadow-md transition-all ${
                      isActive
                        ? 'bg-rose-500 text-white ring-4 ring-rose-500/30 scale-110'
                        : 'bg-slate-800 border border-slate-700 hover:border-slate-500'
                    }`}
                    title="Click to play this character's voice"
                  >
                    {pConfig?.emoji || '🐶'}
                  </div>

                  {/* Speech Bubble */}
                  <div
                    className={`max-w-[85%] rounded-3xl p-4 border transition-all relative ${
                      isActive
                        ? 'bg-slate-800 border-rose-500 ring-2 ring-rose-500/30 shadow-xl shadow-rose-500/10 text-white'
                        : isSpeakerRight
                        ? 'bg-indigo-950/40 border-indigo-900/60 text-slate-200'
                        : 'bg-slate-900/90 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 mb-1.5 text-xs ${
                        isSpeakerRight ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span className="font-extrabold text-white">
                        {lineItem.speakerName || speaker?.name || 'Pet'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 text-amber-300 font-semibold border border-slate-700">
                        {lineItem.tone}
                      </span>
                    </div>

                    <p className="text-sm sm:text-base leading-relaxed font-medium">
                      "{lineItem.line}"
                    </p>

                    <div
                      className={`mt-2 flex items-center gap-2 pt-1 border-t border-slate-800/60 ${
                        isSpeakerRight ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handlePlayLine(index)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold transition-colors"
                      >
                        {isActive ? (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                            <span className="text-rose-400">Playing voice...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-indigo-400" />
                            <span>Play Voice</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pack Verdict Banner */}
          <div className="mt-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-indigo-500/20 border border-amber-500/40 p-5 space-y-2 shadow-xl">
            <div className="flex items-center gap-2 text-amber-300 font-extrabold text-sm uppercase tracking-wider">
              <Award className="w-4 h-4" />
              Final Pack Council Verdict
            </div>
            <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
              {debate.packVerdict}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
