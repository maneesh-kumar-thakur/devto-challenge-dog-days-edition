import React from 'react';
import { X, Award, CheckCircle2, Cpu, Mic, ExternalLink, Code2 } from 'lucide-react';
import { PERSONALITY_LIST } from '../data/personalities';

interface DevSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DevSpecModal: React.FC<DevSpecModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-slate-200 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                DEV Weekend Challenge: Dog Days Edition
              </h2>
              <p className="text-xs text-slate-400">
                Technical Specification & Prize Category Alignment
              </p>
            </div>
          </div>
          <button
            id="close-spec-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prize Alignment Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/40 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" /> Category 1: Best Use of Google AI
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Utilizes Google's <strong>Gemini 3.7 / 2.5 Flash</strong> multimodal vision model to inspect canine facial expressions, eye contact, head angles, and context clues to generate a personalized first-person inner monologue.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <Mic className="w-4 h-4" /> Category 2: Best Use of ElevenLabs
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Integrates <strong>ElevenLabs Text-to-Speech API</strong> to dynamically map dog personality archetypes (Diva, Chill Bro, Overthinker, Aristocrat) to distinct neural voice IDs with matching emotional cadence.
            </p>
          </div>
        </div>

        {/* System Architecture */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-400" /> System Architecture & Data Flow
          </h3>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 space-y-2 overflow-x-auto">
            <div>1. [User Ingestion] Photo Upload / WebRTC Snap / Sample Dog Preset</div>
            <div>2. [Vision Reasoner] POST /api/translate-dog → Gemini Vision Multimodal Inspection</div>
            <div>3. [Cognitive Model] Outputs Monologue + Mood Title + Visual Evidence + Canine IQ</div>
            <div>4. [Voice Synthesis] POST /api/synthesize-voice → ElevenLabs TTS Stream (MP3)</div>
            <div>5. [Social Generator] HTML5 Canvas generates 1080x1080 exportable meme card</div>
          </div>
        </div>

        {/* Personality Voice Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            Personality & Voice Mappings
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-slate-800 rounded-lg overflow-hidden">
              <thead className="bg-slate-800/70 text-slate-300 uppercase">
                <tr>
                  <th className="p-2.5">Archetype</th>
                  <th className="p-2.5">Voice Style</th>
                  <th className="p-2.5">ElevenLabs Voice ID</th>
                  <th className="p-2.5">Cadence / Vibe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {PERSONALITY_LIST.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30">
                    <td className="p-2.5 font-semibold text-white flex items-center gap-1.5">
                      <span>{p.emoji}</span> {p.name}
                    </td>
                    <td className="p-2.5 text-slate-300">{p.voiceName}</td>
                    <td className="p-2.5 font-mono text-indigo-400">{p.voiceId}</td>
                    <td className="p-2.5 text-slate-400">{p.tagline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dev.to Post Submission Checklist */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            DEV.to Submission Post Highlights
          </h4>
          <ul className="space-y-1 text-xs text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <strong>What I Built:</strong> Full-stack canine mind reader turning photos into voiced thoughts.
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <strong>Prize Categories:</strong> Best Use of Google AI & Best Use of ElevenLabs.
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <strong>Demo & Social Share:</strong> 1-Click test presets + exportable 1080x1080 meme cards.
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <strong>Open Source License:</strong> Released openly under the permissive MIT License.
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            id="close-spec-footer-btn"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            Got It, Let's Translate Dogs!
          </button>
        </div>
      </div>
    </div>
  );
};
