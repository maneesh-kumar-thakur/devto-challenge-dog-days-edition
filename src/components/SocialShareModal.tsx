import React, { useState, useEffect } from 'react';
import { X, Download, Copy, Check, Share2, Sparkles, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DogTranslationResult } from '../types';
import { generateSocialCardBlob } from '../utils/canvasCard';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  translation: DogTranslationResult | null;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  translation,
}) => {
  const [cardBlob, setCardBlob] = useState<Blob | null>(null);
  const [cardDataUrl, setCardDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [copiedQuote, setCopiedQuote] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && translation) {
      setIsGenerating(true);
      // Trigger festive confetti on open
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}

      generateSocialCardBlob(translation).then((blob) => {
        if (blob) {
          setCardBlob(blob);
          setCardDataUrl(URL.createObjectURL(blob));
        }
        setIsGenerating(false);
      });
    }
  }, [isOpen, translation]);

  if (!isOpen || !translation) return null;

  const handleDownload = () => {
    if (!cardBlob) return;
    const url = URL.createObjectURL(cardBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translate-my-dog-${translation.personality}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(`"${translation.monologue}" - My Dog (Translated via Gemini & ElevenLabs) 🐾`);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Social Meme Card Generator</h3>
              <p className="text-xs text-slate-400">
                1080×1080 HD Card ready for Twitter, DEV.to, Reddit & Instagram
              </p>
            </div>
          </div>
          <button
            id="close-share-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Preview */}
        <div className="flex justify-center">
          {isGenerating ? (
            <div className="w-full aspect-square max-w-[360px] rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              <p className="text-xs font-medium">Compositing HD Card...</p>
            </div>
          ) : cardDataUrl ? (
            <div className="relative group max-w-[380px] w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
              <img
                src={cardDataUrl}
                alt="Social Meme Card"
                className="w-full h-auto rounded-2xl object-cover"
              />
            </div>
          ) : (
            <div className="text-xs text-red-400">Failed to render card preview.</div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            id="copy-quote-btn"
            onClick={handleCopyQuote}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
          >
            {copiedQuote ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" /> Copied Dog Quote!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" /> Copy Caption Text
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              id="download-meme-card-btn"
              onClick={handleDownload}
              disabled={isGenerating || !cardBlob}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-rose-600 to-amber-500 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-rose-500/20 transition-transform active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Download 1080p Image 🐾
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
