import React from 'react';
import { X, History, Volume2, Trash2, Calendar, Sparkles } from 'lucide-react';
import { DogTranslationResult } from '../types';
import { PERSONALITIES } from '../data/personalities';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: DogTranslationResult[];
  onSelectTranslation: (item: DogTranslationResult) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectTranslation,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col p-6 text-white shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">Pack Translation History</h3>
              <p className="text-[11px] text-slate-400">{history.length} saved translations</p>
            </div>
          </div>
          <button
            id="close-history-drawer-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {history.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 p-6 space-y-2">
              <span className="text-4xl">🐾</span>
              <p className="text-sm font-medium">No dog thoughts yet!</p>
              <p className="text-xs text-slate-500">
                Upload a photo or pick a sample dog to start translating inner thoughts.
              </p>
            </div>
          ) : (
            history.map((item) => {
              const personalityInfo = PERSONALITIES[item.personality];
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectTranslation(item);
                    onClose();
                  }}
                  className="group cursor-pointer bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 space-y-2.5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt="Dog"
                      className="w-14 h-14 rounded-lg object-cover border border-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-white truncate">
                          {personalityInfo ? `${personalityInfo.emoji} ${personalityInfo.name}` : item.personalityName}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-400/90 font-medium truncate">
                        {item.detectedMood}
                      </p>
                      <p className="text-xs text-slate-300 line-clamp-2 italic pt-0.5">
                        "{item.monologue}"
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
            <button
              id="clear-history-btn"
              onClick={onClearHistory}
              className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear History
            </button>
            <span className="text-[11px] text-slate-500">Stored locally in browser</span>
          </div>
        )}
      </div>
    </div>
  );
};
