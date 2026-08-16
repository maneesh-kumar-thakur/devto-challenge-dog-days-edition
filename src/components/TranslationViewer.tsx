import React from 'react';
import { Sparkles, Share2, RotateCcw, Brain, CheckCircle, Eye, AlertCircle, Quote, MessageSquare, BookOpen } from 'lucide-react';
import { DogTranslationResult } from '../types';
import { PERSONALITIES } from '../data/personalities';
import { AudioVisualizerPlayer } from './AudioVisualizerPlayer';

interface TranslationViewerProps {
  translation: DogTranslationResult;
  onReset: () => void;
  onOpenShareModal: () => void;
  onOpenDiary: () => void;
}

export const TranslationViewer: React.FC<TranslationViewerProps> = ({
  translation,
  onReset,
  onOpenShareModal,
  onOpenDiary,
}) => {
  const personalityInfo = PERSONALITIES[translation.personality];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          id="translate-another-btn"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Translate Another Dog
        </button>

        <div className="flex items-center gap-2">
          <button
            id="view-in-diary-btn"
            onClick={onOpenDiary}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> View in Diary
          </button>
          <button
            id="share-meme-btn"
            onClick={onOpenShareModal}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-rose-600 to-amber-500 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all hover:scale-105"
          >
            <Share2 className="w-3.5 h-3.5" /> Share Meme Card 🐾
          </button>
        </div>
      </div>

      {/* Main Dog Card with Speech Bubble */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
        {/* Left Column: Dog Photo + Mood Badge */}
        <div className="md:col-span-5 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-xl aspect-square group">
            <img
              src={translation.imageUrl}
              alt="Translated Dog"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Personality overlay badge */}
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-700 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg">
              <span>{personalityInfo?.emoji || '🐶'}</span>
              <span>{personalityInfo?.name || translation.personalityName}</span>
            </div>

            {/* Mood bottom pill */}
            <div className="absolute bottom-3 inset-x-3 p-2.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Canine Internal State:
              </span>
              <span className="text-xs font-bold text-amber-300">
                {translation.detectedMood}
              </span>
            </div>
          </div>

          {/* Quick Canine IQ Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-slate-300 font-medium">Estimated IQ:</span>
            </div>
            <span className="text-xs font-bold text-indigo-300">
              {translation.canineIqScore}
            </span>
          </div>
        </div>

        {/* Right Column: Dog's Monologue + Visual Analysis + Audio Player */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-5">
          {/* Comic Thought Bubble */}
          <div className="relative bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-amber-400" /> Dog's Translated Thoughts:
              </span>
              <span className="text-[11px] font-mono text-slate-400">Gemini 3.7 Vision</span>
            </div>

            <p className="text-base sm:text-lg font-bold text-white leading-relaxed tracking-tight">
              "{translation.monologue}"
            </p>

            {/* Immediate Human Action */}
            {translation.suggestedAction && (
              <div className="pt-2 border-t border-slate-800/80 flex items-start gap-2 text-xs text-slate-300">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Advised Human Action:</strong> {translation.suggestedAction}
                </span>
              </div>
            )}
          </div>

          {/* Visual Evidence (What Gemini Vision Saw) */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>Canine Physical Cues Detected:</span>
            </div>
            <ul className="grid grid-cols-1 gap-1.5 text-xs text-slate-300">
              {translation.visualClues.map((clue, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 text-[11px] mt-0.5 font-bold">✓</span>
                  <span>{clue}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Voice Player */}
          <AudioVisualizerPlayer
            monologue={translation.monologue}
            initialPersonality={translation.personality}
            initialAudioUrl={translation.audioUrl}
            initialSource={translation.audioSource}
          />
        </div>
      </div>
    </div>
  );
};
