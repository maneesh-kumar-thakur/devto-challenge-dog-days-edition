import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  Calendar,
  Sparkles,
  Heart,
  Star,
  Trash2,
  Volume2,
  Search,
  Filter,
  BarChart2,
  TrendingUp,
  Award,
  Edit3,
  Check,
  Share2,
  Download,
  Smile,
  Cookie,
  AlertCircle,
  Plus
} from 'lucide-react';
import { DogTranslationResult, PersonalityId } from '../types';
import { PERSONALITIES, PERSONALITY_LIST } from '../data/personalities';
import { playWebSpeechSynthesis } from '../utils/audioEngine';

interface CanineDiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: DogTranslationResult[];
  onSelectEntry: (item: DogTranslationResult) => void;
  onUpdateEntry: (item: DogTranslationResult) => void;
  onDeleteEntry: (id: string) => void;
  onClearAll: () => void;
  onNewPhoto: () => void;
}

export const CanineDiaryModal: React.FC<CanineDiaryModalProps> = ({
  isOpen,
  onClose,
  entries,
  onSelectEntry,
  onUpdateEntry,
  onDeleteEntry,
  onClearAll,
  onNewPhoto,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'analytics'>('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPersonalityFilter, setSelectedPersonalityFilter] = useState<string>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<string>('');
  const [editDogName, setEditDogName] = useState<string>('');

  // Filtered entries
  const filteredEntries = useMemo(() => {
    if (!isOpen) return [];
    return entries.filter((item) => {
      if (favoritesOnly && !item.isFavorite) return false;
      if (selectedPersonalityFilter !== 'all' && item.personality !== selectedPersonalityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesMonologue = item.monologue.toLowerCase().includes(q);
        const matchesMood = item.detectedMood.toLowerCase().includes(q);
        const matchesName = item.dogName?.toLowerCase().includes(q);
        const matchesNotes = item.ownerNotes?.toLowerCase().includes(q);
        const matchesClues = item.visualClues?.some((c) => c.toLowerCase().includes(q));
        if (!matchesMonologue && !matchesMood && !matchesName && !matchesNotes && !matchesClues) {
          return false;
        }
      }
      return true;
    });
  }, [entries, favoritesOnly, selectedPersonalityFilter, searchQuery, isOpen]);

  // Analytics computations
  const analytics = useMemo(() => {
    const total = entries.length;
    if (!isOpen || total === 0) {
      return {
        total: 0,
        personalityCounts: {},
        topPersonality: null,
        topMood: 'None',
        averagePawRating: '0.0',
        treatDeficitIndex: '0%',
        happinessScore: '100%',
      };
    }

    const personalityCounts: Record<string, number> = {};
    let totalPaws = 0;
    let ratedCount = 0;

    entries.forEach((e) => {
      personalityCounts[e.personality] = (personalityCounts[e.personality] || 0) + 1;
      if (e.pawRating) {
        totalPaws += e.pawRating;
        ratedCount++;
      }
    });

    let topPersonality = 'dramatic-diva';
    let maxCount = 0;
    Object.entries(personalityCounts).forEach(([p, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topPersonality = p;
      }
    });

    const divaCount = personalityCounts['dramatic-diva'] || 0;
    const puppyCount = personalityCounts['excited-puppy'] || 0;
    const chillCount = personalityCounts['chill-bro'] || 0;
    const anxiousCount = personalityCounts['anxious-overthinker'] || 0;

    // Fun index calculations
    const treatDeficitNum = Math.min(100, Math.round(((divaCount * 2 + anxiousCount * 1.5) / (total * 2)) * 100));
    const happinessNum = Math.min(100, Math.max(30, Math.round(((puppyCount * 1.5 + chillCount * 1.3 + (total - anxiousCount)) / (total * 2)) * 100)));

    return {
      total,
      personalityCounts,
      topPersonality,
      topPersonalityName: PERSONALITIES[topPersonality as PersonalityId]?.name || topPersonality,
      averagePawRating: ratedCount > 0 ? (totalPaws / ratedCount).toFixed(1) : '5.0',
      treatDeficitIndex: `${treatDeficitNum}%`,
      happinessScore: `${happinessNum}%`,
    };
  }, [entries, isOpen]);

  if (!isOpen) return null;

  const handleToggleFavorite = (item: DogTranslationResult, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateEntry({
      ...item,
      isFavorite: !item.isFavorite,
    });
  };

  const handleSetPawRating = (item: DogTranslationResult, rating: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateEntry({
      ...item,
      pawRating: rating,
    });
  };

  const handleStartEdit = (item: DogTranslationResult, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(item.id);
    setEditNotes(item.ownerNotes || '');
    setEditDogName(item.dogName || '');
  };

  const handleSaveEdit = (item: DogTranslationResult, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateEntry({
      ...item,
      dogName: editDogName.trim() || undefined,
      ownerNotes: editNotes.trim() || undefined,
    });
    setEditingId(null);
  };

  const handlePlayVoice = (item: DogTranslationResult, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlayingId(item.id);

    if (item.audioUrl) {
      const audio = new Audio(item.audioUrl);
      audio.onended = () => setPlayingId(null);
      audio.onerror = () => {
        playWebSpeechSynthesis(item.monologue, item.personality, () => setPlayingId(null));
      };
      audio.play().catch(() => {
        playWebSpeechSynthesis(item.monologue, item.personality, () => setPlayingId(null));
      });
    } else {
      playWebSpeechSynthesis(item.monologue, item.personality, () => setPlayingId(null));
    }
  };

  const handleExportDiary = () => {
    const textData = entries
      .map((e, idx) => {
        const date = new Date(e.timestamp).toLocaleDateString();
        const name = e.dogName ? `Dog: ${e.dogName}` : 'Dog: Good Pup';
        return `==============================\nENTRY #${idx + 1} - ${date}\n${name} | Mood: ${e.detectedMood}\nPersonality: ${e.personalityName} (${PERSONALITIES[e.personality]?.emoji || '🐾'})\n\n"${e.monologue}"\n\nVisual Clues:\n${e.visualClues.map((c) => `  - ${c}`).join('\n')}\nCanine IQ: ${e.canineIqScore}\nAdvice for Human: ${e.suggestedAction}\n${e.ownerNotes ? `Owner Diary Notes: "${e.ownerNotes}"\n` : ''}`;
      })
      .join('\n\n');

    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `canine-thought-diary-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl h-[92vh] max-h-[900px] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/20">
              📖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">Canine Thought Diary</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-semibold">
                  {entries.length} Logged Thoughts
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Your pup's inner monologues, mood shifts, and treat demands over time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab Switcher */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-xs">
              <button
                id="diary-tab-timeline"
                onClick={() => setActiveTab('timeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'timeline'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> Scrapbook
              </button>
              <button
                id="diary-tab-analytics"
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" /> Mood Analytics
              </button>
            </div>

            {/* Close Button */}
            <button
              id="close-diary-btn"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Scrapbook Timeline */}
        {activeTab === 'timeline' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Filter & Search Bar */}
            <div className="p-4 sm:px-6 bg-slate-900/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
              {/* Search Field */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search thoughts, mood, dog name, clues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9.5 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Filter Controls */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {/* Favorites Toggle */}
                <button
                  id="filter-favorites-btn"
                  onClick={() => setFavoritesOnly(!favoritesOnly)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shrink-0 ${
                    favoritesOnly
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
                  <span>Starred</span>
                </button>

                {/* Personality Dropdown */}
                <select
                  value={selectedPersonalityFilter}
                  onChange={(e) => setSelectedPersonalityFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 shrink-0"
                >
                  <option value="all">All Archetypes</option>
                  {PERSONALITY_LIST.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.emoji} {p.name}
                    </option>
                  ))}
                </select>

                {/* Export & New Photo Action Buttons */}
                {entries.length > 0 && (
                  <button
                    id="export-diary-btn"
                    onClick={handleExportDiary}
                    title="Export Diary Entries as Text File"
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}

                <button
                  id="diary-add-entry-btn"
                  onClick={() => {
                    onClose();
                    onNewPhoto();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shrink-0 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Translate New Photo</span>
                </button>
              </div>
            </div>

            {/* Entries Scrapbook Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {filteredEntries.length === 0 ? (
                <div className="h-96 flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl">
                    🐶
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <h3 className="text-base font-bold text-white">No diary entries found</h3>
                    <p className="text-xs text-slate-400">
                      {entries.length === 0
                        ? "You haven't translated any dog thoughts yet! Upload a photo or select a test dog to create your first diary entry."
                        : 'No entries matched your current search or filter criteria.'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onNewPhoto();
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Upload First Dog Photo</span>
                  </button>
                </div>
              ) : (
                filteredEntries.map((item) => {
                  const personality = PERSONALITIES[item.personality];
                  const isEditing = editingId === item.id;
                  const dateStr = new Date(item.timestamp).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const timeStr = new Date(item.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={item.id}
                      className="bg-slate-950/70 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 transition-all space-y-4 shadow-lg"
                    >
                      {/* Entry Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-medium flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                            {dateStr} • {timeStr}
                          </span>
                          <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 font-bold flex items-center gap-1">
                            <span>{personality?.emoji || '🐾'}</span>
                            <span>{personality?.name || item.personalityName}</span>
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          {/* Star/Favorite */}
                          <button
                            onClick={(e) => handleToggleFavorite(item, e)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              item.isFavorite
                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                                : 'text-slate-500 border-transparent hover:border-slate-800 hover:text-slate-300'
                            }`}
                            title={item.isFavorite ? 'Remove Star' : 'Mark as Favorite'}
                          >
                            <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-amber-400' : ''}`} />
                          </button>

                          {/* Edit Notes */}
                          <button
                            onClick={(e) => (isEditing ? handleSaveEdit(item, e) : handleStartEdit(item, e))}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-800 transition-colors"
                            title={isEditing ? 'Save Note' : 'Add/Edit Dog Note'}
                          >
                            {isEditing ? <Check className="w-4 h-4 text-emerald-400" /> : <Edit3 className="w-4 h-4" />}
                          </button>

                          {/* Voice Readout */}
                          <button
                            onClick={(e) => handlePlayVoice(item, e)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              playingId === item.id
                                ? 'bg-indigo-600 border-indigo-500 text-white'
                                : 'text-slate-400 border-transparent hover:border-slate-800 hover:text-white'
                            }`}
                            title="Play Dog Voice Audio"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteEntry(item.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 border border-transparent hover:border-slate-800 transition-colors"
                            title="Delete Diary Entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Entry Main Content */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                        {/* Thumbnail & Paw Rating */}
                        <div className="md:col-span-4 lg:col-span-3 space-y-2">
                          <div className="relative aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-900 group">
                            <img
                              src={item.imageUrl}
                              alt="Dog entry"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                            <div className="absolute bottom-2 left-2 right-2 text-center">
                              <span className="text-[11px] font-bold text-amber-300 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm truncate block">
                                {item.detectedMood}
                              </span>
                            </div>
                          </div>

                          {/* Paw Rating Selector */}
                          <div className="bg-slate-900/90 rounded-xl p-2 border border-slate-800/80 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-medium">Drama/Cutie:</span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={(e) => handleSetPawRating(item, star, e)}
                                  className="text-xs hover:scale-125 transition-transform p-0.5"
                                  title={`Rate ${star} Paws`}
                                >
                                  {(item.pawRating || 5) >= star ? '🐾' : '⚪'}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Monologue & Details */}
                        <div className="md:col-span-8 lg:col-span-9 space-y-3">
                          {/* Dog Name & Mood Title */}
                          <div className="flex items-center justify-between gap-2">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editDogName}
                                onChange={(e) => setEditDogName(e.target.value)}
                                placeholder="Dog's Name (e.g. Barnaby)..."
                                className="px-3 py-1 bg-slate-900 border border-indigo-500 rounded-lg text-xs text-white focus:outline-none w-full max-w-xs"
                              />
                            ) : (
                              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                <span>{item.dogName ? `🐾 ${item.dogName}'s Thoughts` : '🐾 Dog Inner Monologue'}</span>
                              </h4>
                            )}
                            <span className="text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 font-semibold">
                              🧠 IQ: {item.canineIqScore}
                            </span>
                          </div>

                          {/* Quote Bubble */}
                          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 text-xs sm:text-sm italic leading-relaxed relative">
                            <span className="text-indigo-400 text-lg font-serif not-italic mr-1">“</span>
                            {item.monologue}
                            <span className="text-indigo-400 text-lg font-serif not-italic ml-1">”</span>
                          </div>

                          {/* Breed Insight (if available) */}
                          {(item.identifiedBreed || item.breedInsight) && (
                            <div className="text-[11px] text-indigo-200 bg-indigo-950/40 border border-indigo-800/40 rounded-lg p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <span className="font-semibold text-indigo-300">
                                🧬 {item.identifiedBreed ? `${item.identifiedBreed}: ` : 'Breed Insight: '}
                                <span className="font-normal text-slate-300">{item.breedInsight}</span>
                              </span>
                            </div>
                          )}

                          {/* Clues Pill Row */}
                          <div className="flex flex-wrap gap-1.5 text-[11px]">
                            {item.visualClues?.map((clue, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-medium"
                              >
                                🔍 {clue}
                              </span>
                            ))}
                          </div>

                          {/* Action Advice */}
                          <div className="text-xs text-amber-300/90 bg-amber-950/20 border border-amber-900/30 rounded-lg p-2 flex items-center gap-2">
                            <Cookie className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>
                              <strong>Recommended Human Action:</strong> {item.suggestedAction}
                            </span>
                          </div>

                          {/* Owner Diary Notes Section */}
                          <div className="pt-1">
                            {isEditing ? (
                              <div className="space-y-2">
                                <label className="text-[11px] font-semibold text-indigo-300">
                                  Personal Memory / Context Note:
                                </label>
                                <textarea
                                  value={editNotes}
                                  onChange={(e) => setEditNotes(e.target.value)}
                                  placeholder="Add what was happening: e.g. Right after I opened a bag of chips..."
                                  rows={2}
                                  className="w-full px-3 py-2 bg-slate-900 border border-indigo-500 rounded-xl text-xs text-slate-200 focus:outline-none resize-none"
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={(e) => handleSaveEdit(item, e)}
                                    className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-500 transition-colors"
                                  >
                                    Save Note
                                  </button>
                                </div>
                              </div>
                            ) : item.ownerNotes ? (
                              <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-900/40 text-xs text-indigo-200 flex items-start gap-2">
                                <span className="text-xs">📝</span>
                                <div>
                                  <strong className="text-[11px] text-indigo-300 uppercase tracking-wider block">
                                    Owner Scrapbook Note:
                                  </strong>
                                  <p className="text-slate-300 italic">{item.ownerNotes}</p>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Scrapbook Footer */}
            {entries.length > 0 && (
              <div className="p-4 px-6 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
                <button
                  id="diary-clear-all-btn"
                  onClick={onClearAll}
                  className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All Diary Entries
                </button>
                <span>Showing {filteredEntries.length} of {entries.length} memories</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Canine Mood & Treat Analytics */}
        {activeTab === 'analytics' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {/* Stat 1 */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Total Memories
                </span>
                <p className="text-2xl font-extrabold text-white">{analytics.total}</p>
                <p className="text-[10px] text-slate-500">Translations logged</p>
              </div>

              {/* Stat 2 */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                  <Cookie className="w-3.5 h-3.5 text-amber-400" /> Treat Deficit Index
                </span>
                <p className="text-2xl font-extrabold text-amber-300">{analytics.treatDeficitIndex}</p>
                <p className="text-[10px] text-amber-500/80">Calculated snack urgency</p>
              </div>

              {/* Stat 3 */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                  <Smile className="w-3.5 h-3.5 text-emerald-400" /> Pack Joy Rating
                </span>
                <p className="text-2xl font-extrabold text-emerald-300">{analytics.happinessScore}</p>
                <p className="text-[10px] text-emerald-500/80">Overall happiness metric</p>
              </div>

              {/* Stat 4 */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-rose-400" /> Top Archetype
                </span>
                <p className="text-base font-bold text-rose-300 truncate">
                  {analytics.topPersonalityName || 'None'}
                </p>
                <p className="text-[10px] text-slate-500">Most frequent persona</p>
              </div>
            </div>

            {/* Archetype Distribution Breakdown */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" /> Canine Personality Archetype Distribution
              </h3>

              <div className="space-y-3">
                {PERSONALITY_LIST.map((p) => {
                  const count = analytics.personalityCounts[p.id] || 0;
                  const percent = analytics.total > 0 ? Math.round((count / analytics.total) * 100) : 0;
                  return (
                    <div key={p.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <span>{p.emoji}</span>
                          <span>{p.name}</span>
                          <span className="text-[10px] text-slate-500 font-normal">({p.archetype})</span>
                        </span>
                        <span className="text-slate-400 font-medium">
                          {count} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${p.accentColor} transition-all duration-500`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Canine Insights Card */}
            <div className="bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-800/40 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-400" /> AI Behavioral Summary & Advice
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Based on {analytics.total} translations logged in your Canine Thought Diary, your pup exhibits a strong affinity for{' '}
                <strong className="text-white">{analytics.topPersonalityName || 'canine drama'}</strong>. Their micro-expressions suggest optimal treat response when freeze-dried liver or artisan cheese is provided after 3:00 PM.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
