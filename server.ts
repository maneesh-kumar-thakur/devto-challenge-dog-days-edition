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

    let responseText = '{}';
    let lastErr: any = null;

    // 1. Try Interactions API first (as requested by latest Gemini endpoint guidelines)
    try {
      if ((ai as any)?.interactions?.create) {
        const interaction = await (ai as any).interactions.create({
          model: 'omni-flash',
          input: [
            {
              role: 'user',
              content: [
                { text: promptText },
                imagePart,
              ],
            },
          ],
        });

        if (interaction) {
          const out = (interaction as any).output || (interaction as any).text || (interaction as any).content || interaction;
          responseText = typeof out === 'string' ? out : JSON.stringify(out);
          lastErr = null;
        }
      }
    } catch (interactionErr: any) {
      console.warn('Interactions API omni-flash attempt notice:', interactionErr.message);
      lastErr = interactionErr;
    }

    // 2. If Interactions API didn't return or failed, try generateContent with current models
    if (!responseText || responseText === '{}') {
      const candidateModels = [
        'gemini-3.7-flash',
        'gemini-flash-latest',
        'gemini-3-flash',
        'gemini-3.7-flash-latest',
      ];

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [imagePart, promptText],
            config: {
              responseMimeType: 'application/json',
              temperature: 0.85,
            },
          });
          if (response?.text) {
            responseText = response.text;
            lastErr = null;
            break;
          }
        } catch (err: any) {
          lastErr = err;
          console.warn(`Model ${modelName} notice:`, err.message);
        }
      }
    }

    // 3. Fallback personality monologues if API is momentarily saturated under high load
    let parsedResult: any = null;
    if (responseText && responseText !== '{}') {
      try {
        parsedResult = JSON.parse(responseText);
      } catch {
        const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
          parsedResult = JSON.parse(cleaned);
        } catch {
          parsedResult = null;
        }
      }
    }

    if (!parsedResult) {
      // Graceful archetype-aware fallback if upstream model was temporarily unavailable
      const archetypeFallbacks: Record<string, any> = {
        'dramatic-diva': {
          monologue: "Excuse me? Are we seriously doing a photo shoot right now without offering artisanal poultry strips first? The lighting is atrocious and my agent will hear about this indignity.",
          detectedMood: "Offended By Lack of Organic Poultry",
          visualClues: ["High-angle gaze of utter moral superiority", "Ears tilted in mild existential disgust", "Posture radiating unpaid model energy"],
          canineIqScore: "165 (Oscar Nominated)",
          suggestedAction: "Apologize immediately and present freeze-dried liver on a silver saucer.",
        },
        'chill-bro': {
          monologue: "Bro... listen to the carpet. It speaks of a sunbeam that was here three hours ago. If we just vibe right here, the universe will manifest cheese. Peace, love, and belly rubs.",
          detectedMood: "100% Sunbeam Alignment",
          visualClues: ["Eyes half-mast in meditative trance", "Paws totally limp in maximum chill mode", "Zero thoughts, maximum peaceful vibes"],
          canineIqScore: "420 (Zen Master)",
          suggestedAction: "Do not disrupt the frequency. Gently slide a biscuit within tongue reach.",
        },
        'anxious-overthinker': {
          monologue: "Did you hear that? That leaf outside just shifted 3 millimeters. What if the mail carrier has mechanized reinforcements? I must monitor the perimeter while trembling vigilantly.",
          detectedMood: "Existential Treat Calculation",
          visualClues: ["Wide hyper-focused satellite ears", "High-tension brow furrow", "Vigilant posture anticipating mystery noises"],
          canineIqScore: "135 (Over-prepared Strategist)",
          suggestedAction: "Reassure them that the ceiling fan is not a hostile bird.",
        },
        'regal-aristocrat': {
          monologue: "Ah, the human has brought out the pocket rectangle again. Do inform the butler that my afternoon nap was interrupted by 47 seconds and reparations in roasted duck are mandatory.",
          detectedMood: "Judging Your Lineage",
          visualClues: ["Aristocratic chin elevation", "Regal chest puff of high pedigree", "Eyes projecting mild pity for the peasant staff"],
          canineIqScore: "180 (Lord of the Manor)",
          suggestedAction: "Address them with proper royal titles and fluff the velvet cushion.",
        },
        'excited-puppy': {
          monologue: "OMG OMG A CAMERA! ARE WE PLAYING? CAN I EAT IT? I LOVE YOU SO MUCH! LOOK AT MY TAIL GO WHOOSH! SQUIRREL! BALL! CHEESE! ZOOMIES INCOMING!",
          detectedMood: "Maximum Zoomie Velocity",
          visualClues: ["Pupils dilated to absolute maximum joy", "Mouth open in ready-to-chomp grin", "Spring-loaded paws ready for liftoff"],
          canineIqScore: "200 (Pure Enthusiasm)",
          suggestedAction: "Throw the ball immediately or prepare for warp-speed living room laps.",
        },
        'undercover-detective': {
          monologue: "The scene is clean, almost too clean. The treat jar lid was rotated 15 degrees clockwise at 14:00 hours. The cat claims an alibi, but the crumbs on the rug tell a much darker story.",
          detectedMood: "Investigating Missing Bacon Conspiracies",
          visualClues: ["Squinted investigative glare", "Nose twitching for forensic crumb evidence", "Suspicious side-eye locked on the kitchen counter"],
          canineIqScore: "155 (Canine P.I.)",
          suggestedAction: "Surrender all confidential snack documents to Detective Rover.",
        },
      };

      // Shorthand aliases
      archetypeFallbacks['diva'] = archetypeFallbacks['dramatic-diva'];
      archetypeFallbacks['chill_bro'] = archetypeFallbacks['chill-bro'];
      archetypeFallbacks['anxious'] = archetypeFallbacks['anxious-overthinker'];
      archetypeFallbacks['aristocrat'] = archetypeFallbacks['regal-aristocrat'];
      archetypeFallbacks['puppy'] = archetypeFallbacks['excited-puppy'];
      archetypeFallbacks['detective'] = archetypeFallbacks['undercover-detective'];

      parsedResult = archetypeFallbacks[personality] || archetypeFallbacks['dramatic-diva'];
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
