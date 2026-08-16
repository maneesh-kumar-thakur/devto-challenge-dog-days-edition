import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroUploader } from './components/HeroUploader';
import { TranslationViewer } from './components/TranslationViewer';
import { ScanningLoader } from './components/ScanningLoader';
import { DevSpecModal } from './components/DevSpecModal';
import { SocialShareModal } from './components/SocialShareModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { DogTranslationResult, PersonalityId, ApiStatusResponse } from './types';
import { PERSONALITIES } from './data/personalities';
import { requestDogVoiceAudio } from './utils/audioEngine';
import { AlertCircle } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'translate_my_dog_history_v1';

export default function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatusResponse | null>(null);
  const [currentTranslation, setCurrentTranslation] = useState<DogTranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scanningImage, setScanningImage] = useState<string | undefined>(undefined);
  const [activePersonality, setActivePersonality] = useState<PersonalityId>('dramatic-diva');
  const [error, setError] = useState<string | null>(null);

  // Modals & Drawers
  const [isSpecModalOpen, setIsSpecModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<DogTranslationResult[]>([]);

  // Load history & check server health on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setApiStatus(data))
      .catch((err) => console.warn('Health check failed:', err));

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not read history from localStorage:', e);
    }
  }, []);

  const saveToHistory = (item: DogTranslationResult) => {
    setHistory((prev) => {
      const updated = [item, ...prev.filter((i) => i.id !== item.id)].slice(0, 20);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save to localStorage:', e);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.warn('Could not clear localStorage:', e);
    }
  };

  const handleStartTranslation = async (
    imageData: { imageBase64?: string; imageUrl?: string },
    personality: PersonalityId,
    customContext: string
  ) => {
    setIsLoading(true);
    setError(null);
    setActivePersonality(personality);
    setScanningImage(imageData.imageBase64 || imageData.imageUrl);

    try {
      const res = await fetch('/api/translate-dog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageData.imageBase64,
          imageUrl: imageData.imageUrl,
          personality,
          customContext,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to analyze dog photo with Gemini Vision.');
      }

      const result = await res.json();
      const dogData = result.data;

      // Try initial audio synthesis
      let audioResult: { source: 'elevenlabs' | 'webspeech'; audioUrl?: string } = {
        source: 'webspeech',
      };
      try {
        audioResult = await requestDogVoiceAudio(dogData.monologue, personality);
      } catch (e) {
        console.warn('Voice pre-synthesis warning:', e);
      }

      const newTranslation: DogTranslationResult = {
        id: `trans_${Date.now()}`,
        imageUrl: imageData.imageBase64 || imageData.imageUrl || '',
        personality,
        personalityName: PERSONALITIES[personality]?.name || personality,
        monologue: dogData.monologue,
        detectedMood: dogData.detectedMood,
        visualClues: dogData.visualClues || [],
        canineIqScore: dogData.canineIqScore || '135 (Galaxy Good Boy)',
        suggestedAction: dogData.suggestedAction || 'Provide instant treat reinforcement.',
        audioUrl: audioResult.audioUrl,
        audioSource: audioResult.source,
        timestamp: Date.now(),
      };

      setCurrentTranslation(newTranslation);
      saveToHistory(newTranslation);
    } catch (err: any) {
      console.error('Translation error:', err);
      setError(err.message || 'An unexpected error occurred while translating.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentTranslation(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white font-sans">
      {/* Navigation */}
      <Navbar
        apiStatus={apiStatus}
        onOpenSpecModal={() => setIsSpecModalOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {error && (
          <div className="max-w-xl mx-auto mb-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-300 hover:text-white font-bold px-2 py-0.5"
            >
              ✕
            </button>
          </div>
        )}

        {isLoading ? (
          <ScanningLoader imageUrl={scanningImage} personality={activePersonality} />
        ) : currentTranslation ? (
          <TranslationViewer
            translation={currentTranslation}
            onReset={handleReset}
            onOpenShareModal={() => setIsShareModalOpen(true)}
          />
        ) : (
          <HeroUploader onStartTranslation={handleStartTranslation} isLoading={isLoading} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span>🐕 Built for the</span>
            <a
              href="https://dev.to/devteam/join-our-dev-weekend-challenge-dog-days-edition-1000-in-prizes-across-five-winners-submissions-1g4i"
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 hover:underline font-semibold"
            >
              DEV Weekend Challenge: Dog Days Edition
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Google Gemini Vision ✦ ElevenLabs Voice</span>
            <button
              onClick={() => setIsSpecModalOpen(true)}
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View Challenge Spec
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <DevSpecModal isOpen={isSpecModalOpen} onClose={() => setIsSpecModalOpen(false)} />
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        translation={currentTranslation}
      />
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectTranslation={(item) => setCurrentTranslation(item)}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
