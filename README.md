# 🐾 Translate My Dog (AI Canine Micro-Expression Reader)

**Translate My Dog** is a multimodal AI web application that reads your dog's subtle facial micro-expressions, ear positions, and body posture from photos to reveal what they are *actually* thinking. It generates witty, character-accurate inner monologues and synthesizes character voice audio.

---

## 🌟 Key Features

### 1. 🔍 Multimodal Canine Micro-Expression Vision Analysis
- Powered by **Google Gemini Vision** models (`gemini-2.5-flash`, `gemini-flash-lite-latest`, etc.).
- Evaluates canine facial cues, pupil dilation, ear angles, head tilts, tail dynamics, and environmental clues (e.g. vacuum cleaners, treat jars, tennis balls).
- Outputs a 5-part translation report:
  - **First-Person Inner Monologue**: Spoken directly in character as the dog.
  - **Detected Mood Title**: Humorous real-time emotional state (e.g., *"94% Betrayed By Diet Kibble"*).
  - **Visual Clues Breakdown**: 3 specific visual observations justifying the monologue.
  - **Canine IQ Rating**: Funny intelligence score (e.g., *"165 - Oscar Nominated Strategist"*).
  - **Recommended Action for Human**: Immediate advice for the pet parent (e.g., *"Relinquish artisan cheese immediately"*).

### 2. 🎭 6 Distinct Canine Personality Archetypes
Users can choose or auto-detect personality archetypes that shape both the AI prompt tone and vocal characteristics:
- **👑 Dramatic Diva** (*Theatrical, indignantly offended by 15% empty bowls*)
- **🛹 Chill Bro** (*Laid-back surfer vibe, seeks optimal sunspots and pizza crusts*)
- **🌀 Anxious Overthinker** (*Neurotic analyst suspicious of ceiling fans and Amazon deliveries*)
- **🎩 Regal Aristocrat** (*Victorian noble who strictly refers to humans as "the staff"*)
- **⚡ Excited Puppy** (*High-octane zoomies, ALL CAPS bursts, intense sock adoration*)
- **🕵️ Undercover Detective** (*Noir P.I. investigating missing bacon conspiracies*)

### 3. 🎙️ Dual-Engine Canine Voice Synthesis
- **ElevenLabs AI Voice Integration**: High-fidelity character voice synthesis mapped to specific voice IDs per archetype.
- **Web Speech API Fallback**: Built-in client-side speech synthesis with custom pitch, rate, and accent adjustments ensuring instant voice playback on any device without external API keys.
- **Interactive Audio Waveform Visualizer**: Real-time canvas bar visualizer with play/pause and time tracking.

### 4. 📖 Canine Thought Diary & Mood Scrapbook
- **Interactive Timeline**: Log, view, search, and manage historical translations.
- **Personal Dog Notes & Names**: Tag custom dog names and personal owner memory notes.
- **Paw Rating System**: Rate canine drama and cuteness on a 1-to-5 🐾 scale.
- **Search & Filters**: Instant full-text search across monologues, moods, clues, notes, and archetype tags, plus starred favorite bookmarks.
- **Export Diary**: Download formatted text archives of your pup's thought history.
- **Canine Mood & Treat Analytics**:
  - *Treat Deficit Index*: Computes treat urgency based on drama/anxiety frequencies.
  - *Pack Joy Rating*: Real-time happiness percentage.
  - *Personality Distribution*: Visual progress bars breaking down your pack's archetype spread.
  - *AI Behavioral Insights*: Automated observational summary.

### 5. 🎨 Viral Meme Card Generator & Social Sharing
- **Canvas-Rendered Meme Cards**: Generates high-resolution 4:5 vertical cards with photo backdrop, quote bubbles, mood pills, and archetype stamps.
- **One-Click Download & Sharing**: Download PNG cards or copy share captions with confetti celebration effects.

### 6. 📸 Client-Side Photo Optimization & Resilience
- **Pre-Upload Downscaler**: Automatically resizes high-resolution camera photos (e.g. 5–15MB) to optimal 1280px web resolution, eliminating browser memory crashes and speeding up API transfers.
- **Robust Base64 Parser**: Strips formatting artifacts and headers before sending to Gemini Vision.
- **1-Click Test Dogs**: Sample dog presets (Husky, Golden Retriever, Corgi, Pitbull, Yorkie, Beagle) for instant testing.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend**: Node.js, Express 4, Vite middleware integration
- **AI & ML**: Google GenAI SDK (`@google/genai`), ElevenLabs REST API
- **Testing**: Vitest unit test runner (31 automated unit tests across 8 test suites)
- **Deployment**: Single bundled CommonJS server (`dist/server.cjs`) compiled with `esbuild`

---

## 🚀 How the Application Works

```
[ User Uploads Dog Photo or Picks Sample ]
                 │
                 ▼
    [ Client-Side Image Optimizer ]
    (Downsamples to 1280px & validates MIME type)
                 │
                 ▼
    [ Express API: /api/translate-dog ]
                 │
                 ▼
     [ Google Gemini Vision Engine ]
   (Analyzes micro-expressions + generates JSON monologue)
                 │
                 ▼
    [ Voice Synthesis Dispatcher ]
   (ElevenLabs API ──► fallback to Browser WebSpeech)
                 │
                 ▼
    [ Translation Viewer & Visualizer ]
                 │
   ┌─────────────┴─────────────┐
   ▼                           ▼
[ Shareable Meme Card ]   [ Canine Thought Diary ]
(HTML5 Canvas Export)     (Local Scrapbook & Analytics)
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Returns server status, uptime, and Gemini/ElevenLabs integration availability |
| `POST` | `/api/translate-dog` | Accepts base64/URL dog photo + personality ID, returns structured monologue & clues |
| `POST` | `/api/synthesize-voice` | Accepts text + personality ID, returns binary MP3 audio stream from ElevenLabs |

---

## 🧪 Unit Tests & Quality Assurance

The application includes 31 unit tests covering all core workflows:

```bash
# Run all unit tests
npm test
```

### Test Suites:
- `canineDiary.test.ts` — Diary search filtering, favorite toggling, paw rating clamping, analytics calculation, export formatting.
- `imageOptimizer.test.ts` — Data URI extraction, whitespace cleaning, MIME-type validation, size limits.
- `audioEngine.test.ts` — Network fallback to Web Speech, 500 status handling, blob URL creation.
- `historyStorage.test.ts` — LocalStorage persistence, 20/30-item FIFO pruning, deduplication.
- `personalities.test.ts` — Archetype data completeness, speech pitch/rate boundaries, voice ID mappings.
- `presets.test.ts` — Sample dog configuration integrity and archetype linkage.
- `textProcessing.test.ts` — Markdown JSON code block stripping and sanitization.
- `workflow.test.ts` — Translation result contract validation and social caption formatting.

---

## ⚙️ Environment Variables

Configure optional API keys in your `.env` file:

```env
# Google Gemini API key for real-time vision analysis
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: ElevenLabs API key for studio-grade voice synthesis
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

*Note: If `ELEVENLABS_API_KEY` is not provided, the app automatically switches to the browser's built-in Web Speech API.*

---

## 💻 Development & Build Scripts

```bash
# Start development server
npm run dev

# Run TypeScript type check
npm run lint

# Run unit test suite
npm test

# Build for production
npm run build

# Start production server
npm start
```
