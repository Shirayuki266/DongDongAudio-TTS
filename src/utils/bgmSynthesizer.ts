import { BgmTrack } from '../types/tts';
import { getAudioContext } from './audioDsp';

export const BUILT_IN_BGM_TRACKS: BgmTrack[] = [
  {
    id: 'cute_playtime',
    name: 'Em Bé Vui Chơi (Cute Marimba)',
    category: 'Vui nhộn / TikTok',
    icon: '🧸',
    duration: 16,
  },
  {
    id: 'sweet_lullaby',
    name: 'Hộp Nhạc Ru Ngủ (Music Box)',
    category: 'Êm dịu / Giấc mơ',
    icon: '✨',
    duration: 16,
  },
  {
    id: 'happy_vlog',
    name: 'Vlog Tươi Vui (Happy Acoustic)',
    category: 'Vlog / Review',
    icon: '🎈',
    duration: 16,
  },
  {
    id: 'story_piano',
    name: 'Piano Cổ Tích (Storytime Piano)',
    category: 'Kể chuyện / Cổ tích',
    icon: '🎹',
    duration: 16,
  },
  {
    id: 'funny_cartoon',
    name: 'Hoạt Hình Nhí Nhố (Cartoon Pizz)',
    category: 'Hài hước / Troll',
    icon: '🎪',
    duration: 12,
  },
];

// In-memory cache for rendered procedural BGM buffers
const bgmBufferCache = new Map<string, AudioBuffer>();

// Generate musical note frequency from MIDI note
function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Procedural BGM generator using OfflineAudioContext
export async function getOrGenerateBgmBuffer(trackId: string): Promise<AudioBuffer> {
  if (bgmBufferCache.has(trackId)) {
    return bgmBufferCache.get(trackId)!;
  }

  const sampleRate = 44100;
  let duration = 16;
  if (trackId === 'funny_cartoon') duration = 12;

  const offlineCtx = new OfflineAudioContext(2, sampleRate * duration, sampleRate);

  if (trackId === 'cute_playtime') {
    generateCutePlaytime(offlineCtx, duration);
  } else if (trackId === 'sweet_lullaby') {
    generateSweetLullaby(offlineCtx, duration);
  } else if (trackId === 'happy_vlog') {
    generateHappyVlog(offlineCtx, duration);
  } else if (trackId === 'story_piano') {
    generateStorytimePiano(offlineCtx, duration);
  } else if (trackId === 'funny_cartoon') {
    generateFunnyCartoon(offlineCtx, duration);
  } else {
    generateCutePlaytime(offlineCtx, duration);
  }

  const rendered = await offlineCtx.startRendering();
  bgmBufferCache.set(trackId, rendered);
  return rendered;
}

// 1. Cute Playtime (Marimba / Celesta + Bouncy Bass)
function generateCutePlaytime(ctx: OfflineAudioContext, totalDuration: number) {
  const bpm = 124;
  const beatSec = 60 / bpm;
  // C Major pentatonic playful melody
  const melodyNotes = [72, 74, 76, 79, 76, 74, 72, 69, 72, 76, 79, 81, 79, 76, 74, 72];
  const bassNotes = [48, 55, 53, 55, 48, 55, 53, 55];

  // Marimba melody generator
  for (let i = 0; i < totalDuration / (beatSec * 0.5); i++) {
    const time = i * (beatSec * 0.5);
    const note = melodyNotes[i % melodyNotes.length];
    const freq = midiToFreq(note);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    // Add overtone for wood marimba bar tone
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 3, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.12, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.35);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0, time);
    gain2.gain.linearRampToValueAtTime(0.04, time + 0.003);
    gain2.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);

    const pan = ctx.createStereoPanner();
    pan.pan.value = Math.sin(i * 0.8) * 0.4;

    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(pan);
    gain2.connect(pan);
    pan.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.38);
    osc2.start(time);
    osc2.stop(time + 0.15);
  }

  // Soft bouncy bass
  for (let b = 0; b < totalDuration / beatSec; b++) {
    const time = b * beatSec;
    const note = bassNotes[b % bassNotes.length];
    const freq = midiToFreq(note);

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.15, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.32);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.35);
  }
}

// 2. Sweet Lullaby (Music Box Celesta & Dreamy Chords)
function generateSweetLullaby(ctx: OfflineAudioContext, totalDuration: number) {
  const bpm = 88;
  const beatSec = 60 / bpm;
  const arpeggios = [
    [60, 64, 67, 72, 76],
    [57, 60, 64, 69, 72],
    [53, 57, 60, 65, 69],
    [55, 59, 62, 67, 71],
  ];

  let noteIdx = 0;
  for (let measure = 0; measure < totalDuration / (beatSec * 4); measure++) {
    const chord = arpeggios[measure % arpeggios.length];
    for (let step = 0; step < 8; step++) {
      const time = measure * (beatSec * 4) + step * (beatSec * 0.5);
      const note = chord[step % chord.length] + 12; // Music box high octave
      const freq = midiToFreq(note);

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.09, time + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.7);

      const pan = ctx.createStereoPanner();
      pan.pan.value = (Math.sin(noteIdx * 1.2) * 0.5);

      osc.connect(gain);
      gain.connect(pan);
      pan.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.75);
      noteIdx++;
    }
  }
}

// 3. Happy TikTok Vlog (Acoustic Pluck & Bells)
function generateHappyVlog(ctx: OfflineAudioContext, totalDuration: number) {
  const bpm = 118;
  const beatSec = 60 / bpm;
  const chords = [
    [60, 64, 67], // C
    [67, 71, 74], // G
    [69, 72, 76], // Am
    [65, 69, 72], // F
  ];

  for (let c = 0; c < totalDuration / (beatSec * 2); c++) {
    const chord = chords[c % chords.length];
    for (let s = 0; s < 4; s++) {
      const time = c * (beatSec * 2) + s * (beatSec * 0.5);
      chord.forEach((n, idx) => {
        const freq = midiToFreq(n + (s % 2 === 0 ? 0 : 12));
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time + idx * 0.015);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, time + idx * 0.015);
        gain.gain.linearRampToValueAtTime(0.05, time + idx * 0.015 + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + idx * 0.015 + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + 0.35);
      });
    }
  }
}

// 4. Storytime Piano (Warm Nostalgic Storytelling)
function generateStorytimePiano(ctx: OfflineAudioContext, totalDuration: number) {
  const bpm = 90;
  const beatSec = 60 / bpm;
  const chords = [
    [48, 60, 64, 67, 72],
    [45, 57, 60, 64, 69],
    [41, 53, 57, 60, 65],
    [43, 55, 59, 62, 67],
  ];

  for (let i = 0; i < totalDuration / (beatSec * 4); i++) {
    const time = i * (beatSec * 4);
    const chord = chords[i % chords.length];

    chord.forEach((note, nIdx) => {
      const freq = midiToFreq(note);
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time + nIdx * 0.04);

      // Lowpass filter for warm felt piano sound
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1400;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, time + nIdx * 0.04);
      gain.gain.linearRampToValueAtTime(0.07, time + nIdx * 0.04 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + nIdx * 0.04 + 2.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 2.6);
    });
  }
}

// 5. Funny Cartoon (Bouncy pizzicato for funny baby / troll clips)
function generateFunnyCartoon(ctx: OfflineAudioContext, totalDuration: number) {
  const bpm = 132;
  const beatSec = 60 / bpm;
  const pizzNotes = [60, 63, 67, 68, 67, 63, 60, 58, 60, 64, 67, 70, 72, 67, 64, 60];

  for (let i = 0; i < totalDuration / (beatSec * 0.5); i++) {
    const time = i * (beatSec * 0.5);
    const note = pizzNotes[i % pizzNotes.length];
    const freq = midiToFreq(note);

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    // Fast decay bandpass for string pluck
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 1.5, time);
    filter.Q.value = 4.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.09, time + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.2);
  }
}

// Decode custom user uploaded audio file
export async function decodeCustomBgmFile(file: File): Promise<AudioBuffer> {
  const ctx = getAudioContext();
  const arrayBuffer = await file.arrayBuffer();
  return await ctx.decodeAudioData(arrayBuffer);
}
