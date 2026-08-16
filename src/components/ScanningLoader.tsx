import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, Eye, Volume2, Brain, Users } from 'lucide-react';
import { PersonalityId } from '../types';
import { PERSONALITIES } from '../data/personalities';

interface ScanningLoaderProps {
  imageUrl?: string;
  personality?: PersonalityId;
  isPackMode?: boolean;
}

const SOLO_SCAN_STEPS = [
  { text: 'Scanning canine facial micro-expressions & eye vector...', icon: Eye },
  { text: 'Analyzing ear tilt, mouth tension & posture with Gemini Vision...', icon: Brain },
  { text: 'Drafting inner monologue based on canine body language...', icon: Sparkles },
  { text: 'Synthesizing voice personality with neural audio engine...', icon: Volume2 },
];

const PACK_SCAN_STEPS = [
  { text: 'Detecting multiple canine subjects & spatial territory hierarchy...', icon: Users },
  { text: 'Analyzing cross-pet eye contact, body angles & tension with Gemini Vision...', icon: Brain },
  { text: 'Assigning character archetypes and generating multi-dog debate script...', icon: Sparkles },
  { text: 'Preparing comic court dialogue & multi-voice speech synthesis...', icon: Volume2 },
];

export const ScanningLoader: React.FC<ScanningLoaderProps> = ({
  imageUrl,
  personality = 'dramatic-diva',
  isPackMode = false,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const personalityInfo = PERSONALITIES[personality] || PERSONALITIES['dramatic-diva'];
  const steps = isPackMode ? PACK_SCAN_STEPS : SOLO_SCAN_STEPS;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(interval);
  }, [steps.length]);

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-in fade-in">
      {/* Dog Photo with Scanning Grid */}
      <div className="relative w-48 h-48 mx-auto rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20">
        {imageUrl ? (
          <img src={imageUrl} alt="Scanning pet(s)" className="w-full h-full object-cover filter brightness-90" />
        ) : (
          <div className="w-full h-full bg-slate-950 flex items-center justify-center text-4xl">🐶</div>
        )}

        {/* Animated Scanner Laser Sweep */}
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce" />

        {/* Target Reticle */}
        <div className="absolute inset-4 border border-cyan-400/40 rounded-lg pointer-events-none flex flex-col justify-between p-2">
          <div className="flex justify-between text-[8px] font-mono text-cyan-400">
            <span>[TERRITORY: ACTIVE]</span>
            <span>[RETICLE: LOCKED]</span>
          </div>
          <div className="text-center text-[9px] font-mono text-cyan-300 font-bold bg-slate-950/70 py-0.5 rounded">
            {isPackMode ? 'PACK DYNAMICS ANALYSIS' : 'CANINE COGNITION SCAN'}
          </div>
          <div className="flex justify-between text-[8px] font-mono text-cyan-400">
            <span>[GAZE: RECORDING]</span>
            <span>[ARCHETYPE: {isPackMode ? 'MULTI-PET' : personalityInfo.archetype.toUpperCase()}]</span>
          </div>
        </div>
      </div>

      {/* Status details */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800 text-xs font-semibold text-indigo-300">
          <StepIcon className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
          <span>Step {currentStep + 1} of {steps.length}</span>
        </div>
        <h3 className="text-base font-bold text-white transition-all">
          {steps[currentStep].text}
        </h3>
        <p className="text-xs text-slate-400">
          {isPackMode
            ? 'Orchestrating multi-dog comedic debate'
            : `Embodying ${personalityInfo.emoji} ${personalityInfo.name} persona`}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
        <div
          className="bg-gradient-to-r from-indigo-500 via-rose-500 to-amber-400 h-full transition-all duration-500"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
};
