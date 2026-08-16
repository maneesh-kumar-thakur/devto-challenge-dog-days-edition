import React from 'react';
import { Sparkles, BookOpen, Volume2, Eye, History, Award } from 'lucide-react';
import { ApiStatusResponse } from '../types';

interface NavbarProps {
  apiStatus: ApiStatusResponse | null;
  onOpenSpecModal: () => void;
  onOpenHistory: () => void;
  onOpenDiary: () => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  apiStatus,
  onOpenSpecModal,
  onOpenHistory,
  onOpenDiary,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 flex items-center justify-center text-xl shadow-md shadow-rose-500/20">
            🐶
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Translate My Dog
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                <Award className="w-3 h-3 text-amber-400" /> DEV Dog Days Challenge
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden md:block">
              Google Gemini 3.7 Vision + ElevenLabs Voice Engine
            </p>
          </div>
        </div>

        {/* Action Controls & Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Tech Badges */}
          <div className="hidden lg:flex items-center gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border font-medium ${
                apiStatus?.geminiConfigured
                  ? 'bg-blue-950/60 border-blue-800/60 text-blue-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400'
              }`}
              title="Multimodal canine visual reasoning"
            >
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              Gemini Vision
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border font-medium ${
                apiStatus?.elevenLabsConfigured
                  ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                  : 'bg-indigo-950/60 border-indigo-800/60 text-indigo-300'
              }`}
              title={
                apiStatus?.elevenLabsConfigured
                  ? 'ElevenLabs Neural Voices Active'
                  : 'Voice Synthesizer (Web Speech / ElevenLabs Ready)'
              }
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              {apiStatus?.elevenLabsConfigured ? 'ElevenLabs Voice' : 'Voice Synth'}
            </span>
          </div>

          {/* Canine Diary Button */}
          <button
            id="nav-diary-btn"
            onClick={onOpenDiary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600/90 to-rose-600/90 hover:from-amber-500 hover:to-rose-500 text-white shadow-sm text-xs font-semibold transition-all hover:shadow-rose-500/25"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Canine Diary</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-white/25 text-[10px] text-white font-extrabold">
                {historyCount}
              </span>
            )}
          </button>

          {/* History Button */}
          <button
            id="nav-history-btn"
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium transition-colors"
          >
            <History className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">History</span>
          </button>

          {/* Spec / Architecture Modal Button */}
          <button
            id="nav-spec-btn"
            onClick={onOpenSpecModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-sm text-xs font-semibold transition-all hover:shadow-indigo-500/25"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Challenge Spec</span>
          </button>
        </div>
      </div>
    </header>
  );
};
