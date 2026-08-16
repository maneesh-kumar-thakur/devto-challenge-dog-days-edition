import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  Sparkles,
  Image as ImageIcon,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Users,
  User,
  MessageSquare,
  Flame,
} from 'lucide-react';
import { PersonalityId, PresetDog } from '../types';
import { PERSONALITY_LIST, PERSONALITIES } from '../data/personalities';
import { PRESET_DOGS, PRESET_PACKS, PresetPackScenario } from '../data/presets';
import { optimizeImageFile, isValidImageFile } from '../utils/imageOptimizer';

export type AppMode = 'solo' | 'pack';

interface HeroUploaderProps {
  onStartTranslation: (
    imageData: { imageBase64?: string; imageUrl?: string },
    personality: PersonalityId,
    customContext: string
  ) => void;
  onStartPackDebate: (
    imageData: { imageBase64?: string; imageUrl?: string },
    disputeTopic: string
  ) => void;
  isLoading: boolean;
}

export const HeroUploader: React.FC<HeroUploaderProps> = ({
  onStartTranslation,
  onStartPackDebate,
  isLoading,
}) => {
  const [mode, setMode] = useState<AppMode>('solo');

  // Solo State
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedPresetUrl, setSelectedPresetUrl] = useState<string | null>(PRESET_DOGS[0].imageUrl);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(PRESET_DOGS[0].id);
  const [personality, setPersonality] = useState<PersonalityId>('dramatic-diva');
  const [customContext, setCustomContext] = useState<string>('');

  // Pack Debate State
  const [packImageBase64, setPackImageBase64] = useState<string | null>(null);
  const [packPresetUrl, setPackPresetUrl] = useState<string | null>(PRESET_PACKS[0].imageUrl);
  const [packPresetId, setPackPresetId] = useState<string | null>(PRESET_PACKS[0].id);
  const [disputeTopic, setDisputeTopic] = useState<string>('');

  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setImageError(null);
    const validation = isValidImageFile(file);
    if (!validation.valid) {
      setImageError(validation.error || 'Please select a valid image file.');
      return;
    }

    try {
      const optimized = await optimizeImageFile(file);
      if (mode === 'solo') {
        setSelectedImageBase64(optimized.dataUrl);
        setSelectedPresetUrl(null);
        setSelectedPresetId(null);
      } else {
        setPackImageBase64(optimized.dataUrl);
        setPackPresetUrl(null);
        setPackPresetId(null);
      }
    } catch (err: any) {
      console.warn('Image optimization notice, falling back to direct reader:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (mode === 'solo') {
          setSelectedImageBase64(base64);
          setSelectedPresetUrl(null);
          setSelectedPresetId(null);
        } else {
          setPackImageBase64(base64);
          setPackPresetUrl(null);
          setPackPresetId(null);
        }
      };
      reader.onerror = () => {
        setImageError('Failed to read image file.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectPreset = (preset: PresetDog) => {
    setSelectedPresetUrl(preset.imageUrl);
    setSelectedPresetId(preset.id);
    setSelectedImageBase64(null);
    setPersonality(preset.suggestedPersonality);
  };

  const handleSelectPackPreset = (pack: PresetPackScenario) => {
    setPackPresetUrl(pack.imageUrl);
    setPackPresetId(pack.id);
    setPackImageBase64(null);
    setDisputeTopic(pack.description);
  };

  const handleSubmit = () => {
    if (mode === 'solo') {
      if (!selectedImageBase64 && !selectedPresetUrl) {
        setImageError('Please select or upload a dog photo.');
        return;
      }

      onStartTranslation(
        {
          imageBase64: selectedImageBase64 || undefined,
          imageUrl: selectedPresetUrl || undefined,
        },
        personality,
        customContext
      );
    } else {
      if (!packImageBase64 && !packPresetUrl) {
        setImageError('Please select or upload a pack photo.');
        return;
      }

      onStartPackDebate(
        {
          imageBase64: packImageBase64 || undefined,
          imageUrl: packPresetUrl || undefined,
        },
        disputeTopic
      );
    }
  };

  const currentPreview =
    mode === 'solo'
      ? selectedImageBase64 || selectedPresetUrl
      : packImageBase64 || packPresetUrl;
  const currentPersonalityConfig = PERSONALITIES[personality];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Headline */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-amber-300 shadow-sm">
          <span>🐾</span> AI Canine Micro-Expression & Pack Reasoning
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          What is your dog{' '}
          <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent">
            actually thinking?
          </span>
        </h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Google Gemini reads canine micro-expressions, posture, and pack dynamics, while ElevenLabs speaks their inner monologue in character.
        </p>

        {/* Mode Switcher Pills */}
        <div className="pt-2 flex justify-center">
          <div className="p-1.5 rounded-2xl bg-slate-900 border border-slate-800 inline-flex items-center gap-2 shadow-xl">
            <button
              type="button"
              onClick={() => {
                setMode('solo');
                setImageError(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                mode === 'solo'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Solo Dog Inner Voice</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('pack');
                setImageError(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all relative ${
                mode === 'pack'
                  ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Multi-Dog "Pack Debate"</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                NEW
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Workspace Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-8">
        {mode === 'solo' ? (
          /* =================== SOLO MODE =================== */
          <>
            {/* Section 1: Choose Photo */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">
                    1
                  </span>
                  Upload Dog Photo or Pick Sample Dog
                </h3>
                {currentPreview && (
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Dog Photo Ready
                  </span>
                )}
              </div>

              {/* Quick Preset Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Quick 1-Click Test Dogs:</span>
                  <span className="text-[11px] text-slate-500">Pick any dog to try immediately</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {PRESET_DOGS.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`group relative rounded-xl overflow-hidden border transition-all text-left ${
                          isSelected
                            ? 'border-indigo-500 ring-2 ring-indigo-500/50 scale-105 shadow-md shadow-indigo-500/20'
                            : 'border-slate-800 hover:border-slate-600 opacity-85 hover:opacity-100'
                        }`}
                      >
                        <div className="aspect-square w-full bg-slate-950 relative">
                          <img
                            src={preset.imageUrl}
                            alt={preset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex flex-col justify-end p-1.5">
                            <span className="text-[11px] font-bold text-white truncate">
                              {preset.name}
                            </span>
                            <span className="text-[9px] text-slate-300 truncate">
                              {preset.breed}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload Dropzone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative rounded-2xl border-2 border-dashed p-6 transition-all ${
                  dragActive
                    ? 'border-indigo-400 bg-indigo-950/20'
                    : 'border-slate-700/80 hover:border-slate-600 bg-slate-950/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-center sm:text-left">
                    {currentPreview ? (
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-indigo-500 shadow-md shrink-0">
                        <img
                          src={currentPreview}
                          alt="Selected preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {selectedImageBase64
                          ? 'Custom Photo Uploaded'
                          : "Drag & drop your dog's photo here"}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Supports JPG, PNG, WEBP • Works best with clear canine facial expressions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" /> Take Snap
                    </button>
                  </div>
                </div>
              </div>

              {imageError && (
                <div className="text-xs text-rose-400 flex items-center gap-1.5 pt-1">
                  <AlertCircle className="w-4 h-4" /> {imageError}
                </div>
              )}
            </div>

            {/* Section 2: Choose Personality Archetype */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs">
                    2
                  </span>
                  Select Dog Personality Voice
                </h3>
                <span className="text-xs text-slate-400">6 Distinct Vocal Archetypes</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {PERSONALITY_LIST.map((p) => {
                  const isSelected = personality === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setPersonality(p.id)}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all text-left relative space-y-2 ${
                        isSelected
                          ? 'bg-slate-800/90 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/10'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{p.emoji}</span>
                          <div>
                            <h4 className="text-xs font-bold text-white">{p.name}</h4>
                            <span className="text-[10px] text-indigo-300/90 font-medium">
                              {p.archetype}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                        )}
                      </div>

                      <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                        {p.tagline}
                      </p>

                      <div className="pt-1 text-[10px] text-slate-400 italic bg-slate-900/80 rounded-lg p-2 border border-slate-800/80">
                        "{p.sampleQuote.slice(0, 75)}..."
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Optional Extra Context */}
            <div className="border-t border-slate-800/80 pt-4 space-y-2">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                <span>Optional Context / Setting Clues</span>
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showAdvanced && (
                <div className="pt-2 animate-in fade-in">
                  <input
                    type="text"
                    value={customContext}
                    onChange={(e) => setCustomContext(e.target.value)}
                    placeholder="e.g., 'He just saw a squirrel through the window', or 'Dinner is 10 minutes late'"
                    className="w-full text-xs bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500 pt-1">
                    Gemini Vision will blend this background detail into the dog's inner monologue.
                  </p>
                </div>
              )}
            </div>

            {/* Solo Action Button */}
            <div className="pt-2">
              <button
                id="translate-dog-btn"
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || (!selectedImageBase64 && !selectedPresetUrl)}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:opacity-95 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-rose-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
              >
                <Sparkles className="w-5 h-5 text-amber-200 animate-spin" />
                <span>Translate {currentPersonalityConfig.name} Thoughts & Voicemail 🐾</span>
              </button>
            </div>
          </>
        ) : (
          /* =================== PACK DEBATE MODE =================== */
          <>
            {/* Section 1: Choose Multi-Dog Photo */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">
                    1
                  </span>
                  Upload Multi-Dog Photo or Pick Sample Pack
                </h3>
                {currentPreview && (
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Pack Photo Ready
                  </span>
                )}
              </div>

              {/* Pack Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Quick 1-Click Multi-Dog Test Packs:</span>
                  <span className="text-[11px] text-slate-500">
                    Pre-selected multi-pet standoff photos
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESET_PACKS.map((pack) => {
                    const isSelected = packPresetId === pack.id;
                    return (
                      <button
                        key={pack.id}
                        type="button"
                        onClick={() => handleSelectPackPreset(pack)}
                        className={`group relative rounded-2xl overflow-hidden border transition-all text-left ${
                          isSelected
                            ? 'border-indigo-500 ring-2 ring-indigo-500/50 scale-105 shadow-lg shadow-indigo-500/20'
                            : 'border-slate-800 hover:border-slate-600 opacity-85 hover:opacity-100'
                        }`}
                      >
                        <div className="aspect-[4/3] w-full bg-slate-950 relative">
                          <img
                            src={pack.imageUrl}
                            alt={pack.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent flex flex-col justify-end p-2.5">
                            <span className="text-xs font-bold text-white truncate">
                              {pack.title}
                            </span>
                            <span className="text-[10px] text-amber-300 font-medium truncate">
                              {pack.dogs}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload Dropzone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative rounded-2xl border-2 border-dashed p-6 transition-all ${
                  dragActive
                    ? 'border-indigo-400 bg-indigo-950/20'
                    : 'border-slate-700/80 hover:border-slate-600 bg-slate-950/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-center sm:text-left">
                    {currentPreview ? (
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-indigo-500 shadow-md shrink-0">
                        <img
                          src={currentPreview}
                          alt="Selected pack preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                        <Users className="w-8 h-8" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {packImageBase64
                          ? 'Custom Pack Photo Uploaded'
                          : 'Drag & drop a photo with 2+ dogs (or pets)'}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Gemini automatically detects every dog in the photo, assigns archetypes, and crafts a hilarious debate script.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" /> Take Snap
                    </button>
                  </div>
                </div>
              </div>

              {imageError && (
                <div className="text-xs text-rose-400 flex items-center gap-1.5 pt-1">
                  <AlertCircle className="w-4 h-4" /> {imageError}
                </div>
              )}
            </div>

            {/* Section 2: Optional Debate Dispute Topic */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs">
                    2
                  </span>
                  Debate Topic / Dispute Premise (Optional)
                </h3>
                <span className="text-xs text-slate-400">AI will infer from photo if empty</span>
              </div>

              <input
                type="text"
                value={disputeTopic}
                onChange={(e) => setDisputeTopic(e.target.value)}
                placeholder="e.g. 'Who gets to sleep in the single patch of sunlight on the rug?'"
                className="w-full text-xs sm:text-sm bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Pack Action Button */}
            <div className="pt-2">
              <button
                id="translate-pack-btn"
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || (!packImageBase64 && !packPresetUrl)}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-600 hover:opacity-95 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
              >
                <Sparkles className="w-5 h-5 text-amber-200 animate-spin" />
                <span>Simulate & Voice Multi-Dog Pack Debate 🎭</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
