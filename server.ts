import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));

// Shared Gemini GenAI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Voice style presets for authentic TikTok baby / kid voices
const VOICE_STYLE_PRESETS: Record<string, { prompt: string; defaultVoice: string }> = {
  tiktok_baby_cute: {
    prompt: 'Adorable 4-year-old baby girl voice, cheerful, very high-pitched cute toddler, sweet and playful, viral TikTok cute kid sound in Vietnamese.',
    defaultVoice: 'Puck',
  },
  tiktok_baby_boy: {
    prompt: 'Cute 4-year-old energetic baby boy voice, enthusiastic, slightly mischievous, high-pitched toddler style in Vietnamese.',
    defaultVoice: 'Puck',
  },
  tiktok_fairy_tale: {
    prompt: 'Innocent sweet child storytelling voice, gentle, lovable, speaking clearly like a bedtime fairytale baby in Vietnamese.',
    defaultVoice: 'Kore',
  },
  tiktok_chipmunk_baby: {
    prompt: 'Ultra high-pitched cartoon baby chipmunk voice, bubbly, bouncy, hilarious and super cute in Vietnamese.',
    defaultVoice: 'Puck',
  },
  tiktok_sweet_girl: {
    prompt: 'Sweet little preschool girl asking or explaining something adorably, affectionate and cute viral TikTok style in Vietnamese.',
    defaultVoice: 'Kore',
  },
  tiktok_smart_kid: {
    prompt: 'Bright confident 6-year-old kid narrator, energetic, clear articulation, cheerful in Vietnamese.',
    defaultVoice: 'Zephyr',
  },
  tiktok_female_cute: {
    prompt: 'Sweet young Vietnamese female TikTok creator, energetic, adorable and joyful, natural speaking tone for viral vlogs and reviews in Vietnamese.',
    defaultVoice: 'Kore',
  },
  tiktok_female_chi_google: {
    prompt: 'Iconic Vietnamese female voice known as Chi Google, rhythmic, clear, slightly playful and legendary TikTok narration style in Vietnamese.',
    defaultVoice: 'Kore',
  },
  tiktok_female_story_review: {
    prompt: 'Captivating Vietnamese female movie review and storytelling narrator, warm, expressive, dramatic and engaging tone in Vietnamese.',
    defaultVoice: 'Kore',
  },
  tiktok_female_genz: {
    prompt: 'Trendy enthusiastic young Vietnamese Gen Z girl, fast-paced, bright, witty, cheerful viral TikTok tone in Vietnamese.',
    defaultVoice: 'Zephyr',
  },
  tiktok_female_mc: {
    prompt: 'Professional Vietnamese female presenter and news host, elegant, crystal clear articulation, confident and trustworthy in Vietnamese.',
    defaultVoice: 'Kore',
  },
  tiktok_female_sweet_asmr: {
    prompt: 'Gentle soft-spoken Vietnamese female voice, soothing, intimate, relaxing bedtime and lifestyle storyteller in Vietnamese.',
    defaultVoice: 'Kore',
  },
};

// Quota management to prevent repeated 429 errors on free tier
let isGeminiQuotaExhausted = false;
let geminiCooldownUntil = 0;

// Health & Status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  const inCooldown = isGeminiQuotaExhausted && Date.now() < geminiCooldownUntil;
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    isGeminiQuotaExhausted: inCooldown,
    cooldownRemainingSec: inCooldown ? Math.max(0, Math.round((geminiCooldownUntil - Date.now()) / 1000)) : 0,
    activeEngine: inCooldown ? 'google-fast-tts' : 'gemini-3.8-flash-lite-tts',
    engines: ['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts', 'google-fast-tts'],
    voiceStyles: Object.keys(VOICE_STYLE_PRESETS),
  });
});

// Helper to chunk long text into sentence-aware blocks
function chunkText(text: string, maxLen = 400): string[] {
  const clean = text.trim();
  if (clean.length <= maxLen) return [clean];

  const sentences = clean.split(/(?<=[.!?。\n,;])\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const s of sentences) {
    if (!s) continue;
    if ((current + ' ' + s).trim().length <= maxLen) {
      current = (current + ' ' + s).trim();
    } else {
      if (current) chunks.push(current);
      if (s.length > maxLen) {
        // Break by words
        const words = s.split(/\s+/);
        let sub = '';
        for (const w of words) {
          if ((sub + ' ' + w).trim().length <= maxLen) {
            sub = (sub + ' ' + w).trim();
          } else {
            if (sub) chunks.push(sub);
            sub = w;
          }
        }
        if (sub) current = sub;
        else current = '';
      } else {
        current = s;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks.filter(Boolean);
}

// Strip 44-byte WAV header from a buffer to concatenate raw PCM
function stripWavHeader(buffer: Buffer): Buffer {
  if (buffer.length > 44 && buffer.toString('ascii', 0, 4) === 'RIFF') {
    return buffer.subarray(44);
  }
  return buffer;
}

// Build standard 44-byte WAV header for 24kHz mono 16-bit PCM
function createWavHeader(dataLength: number, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const buffer = Buffer.alloc(44);
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // SubChunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);

  return buffer;
}

// In-memory cache to prevent burning API quota on duplicate texts
const audioCache = new Map<string, { audioBase64: string; mimeType: string; engine: string }>();

// Helper to synthesize audio via unlimited fallback engine
async function synthesizeFallbackAudio(text: string, lang = 'vi'): Promise<{ buffer: Buffer; mimeType: string }> {
  const chunks = chunkText(text, 120);
  const audioBuffers: Buffer[] = [];

  for (const chunk of chunks) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${lang}&client=tw-ob`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Fallback TTS trả về mã lỗi: ${response.status}`);
    }

    const arrayBuf = await response.arrayBuffer();
    audioBuffers.push(Buffer.from(arrayBuf));
  }

  const mergedBuffer = Buffer.concat(audioBuffers);
  return { buffer: mergedBuffer, mimeType: 'audio/mpeg' };
}

// Fast Google TTS endpoint (great unlimited fallback)
app.post('/api/tts/fallback', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, lang = 'vi' } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Nội dung văn bản không được để trống' });
      return;
    }

    const cacheKey = `fallback:${lang}:${text.trim()}`;
    if (audioCache.has(cacheKey)) {
      const cached = audioCache.get(cacheKey)!;
      res.json({
        success: true,
        audioBase64: cached.audioBase64,
        mimeType: cached.mimeType,
        engine: cached.engine,
        cached: true,
      });
      return;
    }

    const { buffer, mimeType } = await synthesizeFallbackAudio(text.trim(), lang);
    const base64 = buffer.toString('base64');

    audioCache.set(cacheKey, { audioBase64: base64, mimeType, engine: 'google-fast-tts' });

    res.json({
      success: true,
      audioBase64: base64,
      mimeType,
      engine: 'google-fast-tts',
    });
  } catch (error: any) {
    console.error('Lỗi TTS Fallback:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi tạo âm thanh dự phòng' });
  }
});

// Gemini High-Fidelity AI TTS endpoint with seamless fallback on 429 quota exhaustion
app.post('/api/tts/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      text,
      preset = 'tiktok_baby_cute',
      voiceName,
      customStyle,
      useVoiceDesign = false,
    } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'Văn bản không được để trống' });
      return;
    }

    const trimmedText = text.trim();
    const presetConfig = VOICE_STYLE_PRESETS[preset] || VOICE_STYLE_PRESETS.tiktok_baby_cute;
    const stylePrompt = customStyle?.trim() || presetConfig.prompt;
    const selectedVoice = voiceName || presetConfig.defaultVoice;
    const model = useVoiceDesign ? 'gemini-3.8-flash-tts' : 'gemini-3.8-flash-lite-tts';

    // Check memory cache
    const cacheKey = `gemini:${model}:${selectedVoice}:${preset}:${trimmedText}`;
    if (audioCache.has(cacheKey)) {
      const cached = audioCache.get(cacheKey)!;
      res.json({
        success: true,
        audioBase64: cached.audioBase64,
        mimeType: cached.mimeType,
        sampleRate: 24000,
        modelUsed: model,
        voiceUsed: selectedVoice,
        cached: true,
      });
      return;
    }

    // If Gemini quota is currently in cooldown, directly synthesize with Fast HD
    if (isGeminiQuotaExhausted && Date.now() < geminiCooldownUntil) {
      const { buffer, mimeType } = await synthesizeFallbackAudio(trimmedText, 'vi');
      const base64 = buffer.toString('base64');
      audioCache.set(cacheKey, { audioBase64: base64, mimeType, engine: 'unlimited-fast-hd' });
      res.json({
        success: true,
        audioBase64: base64,
        mimeType: mimeType,
        isFallback: true,
        engine: 'unlimited-fast-hd',
        notice: 'Đang phát bằng Động cơ Không Giới Hạn (Fast HD).',
      });
      return;
    }

    // Try Gemini TTS
    try {
      const chunks = chunkText(trimmedText, 400);
      const wavBuffers: Buffer[] = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const response = await ai.models.generateContent({
          model: model,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: chunk,
                  speechMetadata: {
                    style: stylePrompt,
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: selectedVoice },
              },
            },
          },
        });

        const base64Data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Data) {
          throw new Error(`Không nhận được dữ liệu âm thanh từ Gemini cho đoạn ${i + 1}`);
        }

        wavBuffers.push(Buffer.from(base64Data, 'base64'));
      }

      let finalWavBuffer: Buffer;
      if (wavBuffers.length === 1) {
        finalWavBuffer = wavBuffers[0];
      } else {
        const rawPcmParts: Buffer[] = wavBuffers.map((buf) => stripWavHeader(buf));
        const totalRawPcm = Buffer.concat(rawPcmParts);
        const newHeader = createWavHeader(totalRawPcm.length, 24000, 1, 16);
        finalWavBuffer = Buffer.concat([newHeader, totalRawPcm]);
      }

      const finalBase64 = finalWavBuffer.toString('base64');
      audioCache.set(cacheKey, {
        audioBase64: finalBase64,
        mimeType: 'audio/wav',
        engine: model,
      });

      res.json({
        success: true,
        audioBase64: finalBase64,
        mimeType: 'audio/wav',
        sampleRate: 24000,
        modelUsed: model,
        voiceUsed: selectedVoice,
        chunksProcessed: chunks.length,
      });
    } catch (geminiError: any) {
      const errMsg = geminiError?.message || String(geminiError);
      const isDailyExhausted = errMsg.includes('PerDay') || errMsg.includes('Day');
      const isQuotaExceeded =
        errMsg.includes('429') ||
        errMsg.includes('quota') ||
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.includes('rate-limits');

      if (isQuotaExceeded) {
        isGeminiQuotaExhausted = true;
        const cooldownMs = isDailyExhausted ? 60 * 60 * 1000 : 60 * 1000;
        geminiCooldownUntil = Date.now() + cooldownMs;
        console.log(`[TTS Engine] Activated Fast HD engine (Gemini quota cooldown for ${Math.round(cooldownMs / 1000)}s).`);
      }

      // Synthesize using unlimited engine
      const { buffer, mimeType } = await synthesizeFallbackAudio(trimmedText, 'vi');
      const base64 = buffer.toString('base64');
      audioCache.set(cacheKey, { audioBase64: base64, mimeType, engine: 'unlimited-fast-hd' });

      res.json({
        success: true,
        audioBase64: base64,
        mimeType: mimeType,
        isFallback: true,
        engine: 'unlimited-fast-hd',
        notice: isDailyExhausted
          ? 'Hệ thống đã tự động kích hoạt Động cơ Không Giới Hạn (Fast HD) do gói miễn phí Gemini đạt giới hạn ngày (10 lượt/ngày).'
          : 'Hệ thống tự động kích hoạt chế độ Không Giới Hạn (Fast HD).',
      });
    }
  } catch (error: any) {
    console.error('Lỗi khi tạo giọng nói:', error);
    res.status(500).json({
      error: error.message || 'Lỗi khi tổng hợp giọng nói',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist folder
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TikTok Baby TTS Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
