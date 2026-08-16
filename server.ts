import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Allow JSON body up to 25MB for base64 photos
app.use(express.json({ limit: '25mb' }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Map personality archetype to ElevenLabs voice ID
const PERSONALITY_VOICE_MAP: Record<string, string> = {
  'dramatic-diva': '21m00Tcm4TlvDq8ikWAM', // Rachel
  'chill-bro': 'pNInz6obpgDQGcFmaJgB', // Adam
  'anxious-overthinker': 'AZnzlk1XvdvUeBnXmlld', // Domi
  'regal-aristocrat': 'JBFqnCBsd6RMkjVDRZzb', // George
  'excited-puppy': 'TxGEqnHWrfWFTfGW9XjX', // Josh
  'undercover-detective': 'ErXwobaYiN019PkySvjV', // Antoni
};

// 1. Health check & configuration status
app.get('/api/health', (req, res) => {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const hasElevenLabs = Boolean(process.env.ELEVENLABS_API_KEY);

  res.json({
    status: 'ok',
    geminiConfigured: hasGemini,
    elevenLabsConfigured: hasElevenLabs,
    timestamp: new Date().toISOString(),
    challenge: 'DEV Weekend Challenge: Dog Days Edition',
  });
});

// 2. Gemini Dog Vision Translation
app.post('/api/translate-dog', async (req, res) => {
  try {
    const { imageBase64, imageUrl, personality = 'dramatic-diva', customContext = '' } = req.body;

    if (!imageBase64 && !imageUrl) {
      return res.status(400).json({ error: 'Please provide a dog image (base64 or URL).' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in server environment.',
      });
    }

    // Determine personality description
    const personalityPrompts: Record<string, string> = {
      'dramatic-diva': 'Dramatic Diva (theatrical, self-important, everything is a crisis or a red-carpet triumph, speaks with dramatic sighs and indignation)',
      'chill-bro': 'Chill Bro (relaxed, slangy, unbothered, says dude/bro/vibe, couch philosopher seeking sunny floor spots)',
      'anxious-overthinker': 'Anxious Overthinker (nervous, spiraling, second-guessing every noise and human movement, suspicious of the vacuum)',
      'regal-aristocrat': 'Regal Aristocrat (posh, condescending, strictly refers to humans as "the household staff", expects luxury on a velvet cushion)',
      'excited-puppy': 'Excited Puppy (hyper, ALL CAPS bursts, easily distracted by arbitrary objects, loves everything and everyone with 1000% intensity)',
      'undercover-detective': 'Undercover Detective (gritty noir gumshoe investigating the conspiracy of the missing treat jar and backyard squirrels)',
    };

    const chosenPersona = personalityPrompts[personality] || personalityPrompts['dramatic-diva'];

    const promptText = `
You are the inner voice and mind-reader of the dog in this photograph.
Carefully examine the dog's facial expression, eye focus, head tilt, ear positioning, mouth tension, posture, and surrounding environment.

Write a hilarious first-person inner monologue (2-3 punchy sentences, 30-50 words) capturing what this specific dog is thinking RIGHT NOW.

Personality to embody: ${chosenPersona}.
${customContext ? `Extra context provided by owner: "${customContext}".` : ''}

Rules:
1. Speak ONLY as the dog in first person ("I", "my human", "my staff"). No narration, no "The dog thinks".
2. Anchor the monologue in REAL visual details you see in the photo (what they are looking at, their ear position, facial expression, items nearby).
3. Be witty, creative, and wholesome.

Respond in valid strict JSON matching this exact structure:
{
  "monologue": "The monologue string here",
  "detectedMood": "Short funny mood title (e.g., 94% Betrayed By Diet Kibble)",
  "visualClues": [
    "Specific observation 1 about ears/eyes/face",
    "Specific observation 2 about posture/setting",
    "Specific observation 3 about gaze/intent"
  ],
  "canineIqScore": "A funny IQ rating (e.g. 138 - Strategic Treat Tactician)",
  "suggestedAction": "Humorous immediate advice for the human (e.g. Relinquish bacon immediately)"
}
`;

    // Process image parts
    let imagePart: any;

    if (imageBase64) {
      const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let mimeType = 'image/jpeg';
      let data = imageBase64;

      if (matches && matches.length === 3) {
        mimeType = matches[1];
        data = matches[2];
      }

      imagePart = {
        inlineData: {
          mimeType,
          data,
        },
      };
    } else if (imageUrl) {
      // Fetch external image buffer to inlineData
      const imgRes = await fetch(imageUrl);
      const arrayBuffer = await imgRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';

      imagePart = {
        inlineData: {
          mimeType,
          data: buffer.toString('base64'),
        },
      };
    }

    // Supported models in priority order
    const candidateModels = [
      'gemini-2.0-flash',
      'gemini-2.0-flash-001',
      'gemini-flash-latest',
      'gemini-2.0-pro-exp-02-05',
      'gemini-1.5-flash-latest',
    ];

    let responseText = '{}';
    let lastErr: any = null;

    // Retry loop with model fallback and exponential backoff for 503 spikes
    for (const modelName of candidateModels) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          if (attempt > 0) {
            await new Promise((r) => setTimeout(r, 1000));
          }
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [imagePart, promptText],
            config: {
              responseMimeType: 'application/json',
              temperature: 0.85,
            },
          });
          responseText = response.text || '{}';
          lastErr = null;
          break;
        } catch (err: any) {
          lastErr = err;
          console.warn(`Model ${modelName} (attempt ${attempt + 1}) failed:`, err.message);
          // If not 503/429, don't retry same model
          if (!err.message?.includes('503') && !err.message?.includes('429')) {
            break;
          }
        }
      }
      if (responseText !== '{}') {
        break;
      }
    }

    if (lastErr && responseText === '{}') {
      throw lastErr;
    }
    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      // Fallback if formatting was loose
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(cleaned);
    }

    res.json({
      success: true,
      data: {
        monologue: parsedResult.monologue || "I demand to speak to whoever is in charge of treat distribution immediately.",
        detectedMood: parsedResult.detectedMood || "Vigilant Treat Surveillance",
        visualClues: parsedResult.visualClues || ["Direct ocular lock-on", "Ears primed for snack wrappers"],
        canineIqScore: parsedResult.canineIqScore || "140 (Snack Strategist)",
        suggestedAction: parsedResult.suggestedAction || "Administer ear scritches at once.",
        personality,
      },
    });
  } catch (err: any) {
    console.error('Error translating dog:', err);
    res.status(500).json({
      error: err.message || 'Failed to translate dog with Gemini Vision.',
    });
  }
});

// 3. ElevenLabs Voice Synthesis Endpoint
app.post('/api/synthesize-voice', async (req, res) => {
  try {
    const { text, personality = 'dramatic-diva', customVoiceId } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text string is required for speech synthesis.' });
    }

    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;

    // If key not configured, inform client to use high-quality Web Speech API fallback
    if (!elevenLabsApiKey) {
      return res.status(200).json({
        fallback: true,
        reason: 'ELEVENLABS_API_KEY_NOT_CONFIGURED',
        message: 'Using in-browser high-fidelity speech synthesizer.',
      });
    }

    const voiceId = customVoiceId || PERSONALITY_VOICE_MAP[personality] || '21m00Tcm4TlvDq8ikWAM';

    const elevenResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsApiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.25,
          use_speaker_boost: true,
        },
      }),
    });

    if (!elevenResponse.ok) {
      const errorText = await elevenResponse.text();
      console.warn('ElevenLabs API returned non-200:', elevenResponse.status, errorText);
      return res.status(200).json({
        fallback: true,
        reason: 'ELEVENLABS_API_ERROR',
        status: elevenResponse.status,
        message: 'ElevenLabs quota or key error, smoothly falling back to Web Speech.',
      });
    }

    const audioArrayBuffer = await elevenResponse.arrayBuffer();
    const audioBuffer = Buffer.from(audioArrayBuffer);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.length);
    res.send(audioBuffer);
  } catch (err: any) {
    console.error('Error synthesizing voice with ElevenLabs:', err);
    res.status(200).json({
      fallback: true,
      reason: 'EXCEPTION',
      message: err.message,
    });
  }
});

// Vite & Static Asset Handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Translate My Dog server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
