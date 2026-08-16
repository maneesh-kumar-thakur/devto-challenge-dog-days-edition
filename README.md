# 🐾 Translate My Dog (AI Canine Micro-Expression Reader)

**Translate My Dog** is a multimodal AI web application that reads your dog's subtle facial micro-expressions, ear positions, and body posture from photos to reveal what they are *actually* thinking. It generates witty, character-accurate inner monologues and synthesizes character voice audio.

---

## 🌟 Key Features

### 1. 🔍 Multimodal Canine Micro-Expression Vision Analysis
- Powered by **Google Gemini Vision** models (`gemini-2.5-flash`, `gemini-flash-lite-latest`, etc.).
- Evaluates canine facial cues, pupil dilation, ear angles, head tilts, tail dynamics, and environmental clues (e.g. vacuum cleaners, treat jars, tennis balls).
- Outputs a comprehensive translation report:
  - **First-Person Inner Monologue**: Spoken directly in character as the dog.
  - **Detected Mood Title**: Humorous real-time emotional state (e.g., *"94% Betrayed By Diet Kibble"*).
  - **Identified Breed & Heritage Insight**: Visual breed detection with evolutionary and behavioral notes.
  - **Visual Clues Breakdown**: 3 specific visual observations justifying the monologue.
  - **Canine IQ Rating**: Funny intelligence score (e.g., *"165 - Oscar Nominated Strategist"*).
  - **Recommended Action for Human**: Immediate advice for the pet parent (e.g., *"Relinquish artisan cheese immediately"*).

### 2. 🎭 8 Distinct Canine Personality Archetypes
Users can choose or auto-detect personality archetypes that shape both the AI prompt tone and vocal characteristics:
- **👑 Dramatic Diva** (*Theatrical, indignantly offended by 15% empty bowls*)
- **⚡ Excited Puppy** (*High-octane zoomies, ALL CAPS bursts, intense sock adoration*)
- **🛹 Chill Bro** (*Laid-back surfer vibe, seeks optimal sunspots and pizza crusts*)
- **🌀 Anxious Overthinker** (*Neurotic analyst suspicious of ceiling fans and Amazon deliveries*)
- **📜 Shakespearean Canine** (*Poetic iambic pentameter drama, existential balcony soliloquies*)
- **🍽️ Michelin Food Critic** (*Haute-cuisine canine reviewer assessing kibble plating and aroma*)
- **🕵️ Undercover Detective** (*Noir P.I. investigating missing bacon conspiracies*)
- **🚀 Space Explorer Pup** (*Cosmic mission commander logging treat orbital telemetry*)

### 3. 🎙️ Dual-Engine Canine Voice Synthesis
- **ElevenLabs AI Voice Integration**: High-fidelity character voice synthesis mapped to specific voice IDs per archetype.
- **Web Speech API Fallback**: Built-in client-side speech synthesis with custom pitch, rate, and accent adjustments ensuring instant voice playback on any device without external API keys.
- **Interactive Audio Waveform Visualizer**: Real-time canvas bar visualizer with play/pause and time tracking.

### 4. 📖 Canine Thought Diary & Scrapbook
- **Interactive Timeline**: Log, view, search, and manage historical translations.
- **Advanced Multi-Filter & Search Engine**:
  - **Filter by Mood Category**: Map entries to 6 standardized emotional taxonomy categories (*🎉 Happy & Excited*, *🍖 Hungry & Treat-Seeking*, *🕵️ Suspicious & Alert*, *🛋️ Chill & Relaxed*, *👑 Dramatic & Demanding*, *🌀 Anxious & Overthinking*).
  - **Filter by Personality Archetype**: Quickly isolate thoughts from specific canine personas.
  - **Filter by Breed**: Dynamically extracted from unique identified breeds in your diary.
  - **Starred / Favorites Filter**: Isolate bookmarked favorite memories.
  - **Full-Text Live Search**: Search across monologues, moods, dog names, breed notes, owner memory notes, visual clues, and actions.
  - **Active Filter Badges**: Interactive filter chips with one-click removal and a global "Clear All Filters" button.
- **Interactive Recharts Mood Distribution**: Switch between Bar and Donut chart views of your pup's emotional spectrum; clicking any mood category automatically filters the scrapbook timeline.
- **Personal Dog Notes & Names**: Tag custom dog names and personal owner memory notes inline.
- **Paw Rating System**: Rate canine drama and cuteness on a 1-to-5 🐾 scale.
- **Canine Mood & Treat Analytics**:
  - *Treat Deficit Index*: Computes treat urgency based on drama/anxiety frequencies.
  - *Pack Joy Rating*: Real-time happiness percentage.
  - *Personality Distribution*: Visual progress bars breaking down your pack's archetype spread.
  - *AI Behavioral Insights*: Automated observational summary.

### 5. 📄 Printable PDF Keepsake Book
- **Export to PDF**: Generate clean, beautifully formatted multi-page printable PDF keepsakes using jsPDF.
- **Automated Text Wrapping & Page Budgeting**: Word-wrapping with calculated line heights and margins prevents clipping on any display or print format.
- **Rich Entry Cards**: Contains entry photo previews, mood tags, archetypes, monologues, visual evidence, owner notes, and prescribed parent actions.

### 6. 🐾 Multi-Dog Pack Debate Mode
- **Group Translations**: Analyze multi-dog photos or create interactive conversations between 2-3 dogs.
- **Cross-Canine Dialogue**: Generates hilarious multi-character banter with distinct contrasting archetypes reacting to the same situation.

### 7. 🎨 Viral Meme Card Generator & Social Sharing
- **Canvas-Rendered Meme Cards**: Generates high-resolution 4:5 vertical cards with photo backdrop, quote bubbles, mood pills, and archetype stamps.
- **One-Click Download & Sharing**: Download PNG cards or copy share captions with confetti celebration effects.

### 8. 📸 Client-Side Photo Optimization & Resilience
- **Pre-Upload Downscaler**: Automatically resizes high-resolution camera photos (e.g. 5–15MB) to optimal 1280px web resolution, eliminating browser memory crashes and speeding up API transfers.
- **Robust Base64 Parser**: Strips formatting artifacts and headers before sending to Gemini Vision.
- **1-Click Test Dogs**: Sample dog presets (Husky, Golden Retriever, Corgi, Pitbull, Yorkie, Beagle) for instant testing.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts, jsPDF, Canvas Confetti
- **Backend**: Node.js, Express 4, Vite middleware integration
- **AI & ML**: Google GenAI SDK (`@google/genai`), ElevenLabs REST API
- **Testing**: Vitest unit test runner (49 automated unit tests across 13 test suites)
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
   ┌─────────────┼─────────────┬─────────────┐
   ▼             ▼             ▼             ▼
[ Meme Card ] [ Diary ]  [ PDF Book ] [ Pack Debate ]
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

The application includes 49 unit tests covering all core workflows:

```bash
# Run all unit tests
npm test
```

### Test Suites:
- `diaryFilters.test.ts` — Mood category matching, personality archetype filtering, dynamic breed extraction, full-text multi-field search, combined filters.
- `canineDiary.test.ts` — Diary search filtering, favorite toggling, paw rating clamping, analytics calculation, export formatting.
- `pdfExport.test.ts` — PDF Keepsake document generation, page budgeting, and empty record guards.
- `moodAnalytics.test.ts` — Mood taxonomy classification, distribution percentages, and emotional spectrum grouping.
- `packDebate.test.ts` — Multi-dog Pack Debate scenarios, character assignment, and dialogue continuity.
- `breedInsights.test.ts` — Breed identification, heritage notes, and backward compatibility fallbacks.
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

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

```
MIT License - Copyright (c) 2026 Translate My Dog Contributors
```

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
