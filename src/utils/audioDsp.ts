import { AudioSettings, ReverbType } from '../types/tts';
import { getOrGenerateBgmBuffer } from './bgmSynthesizer';

// Audio Context Singleton
let sharedAudioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!sharedAudioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    sharedAudioCtx = new AudioCtxClass();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

// Convert ArrayBuffer or Base64 into AudioBuffer
export async function decodeAudio(data: ArrayBuffer | string): Promise<AudioBuffer> {
  const ctx = getAudioContext();
  let arrayBuffer: ArrayBuffer;

  if (typeof data === 'string') {
    const binary = window.atob(data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    arrayBuffer = bytes.buffer;
  } else {
    arrayBuffer = data;
  }

  // Clone arrayBuffer because decodeAudioData detaches the buffer
  const bufferCopy = arrayBuffer.slice(0);
  return await ctx.decodeAudioData(bufferCopy);
}

// Generate specialized synthetic impulse response buffers for varied spaces
export function createReverbBuffer(
  ctx: BaseAudioContext,
  type: ReverbType = 'room',
  duration = 1.4,
  decay = 2.2,
  highDamp = 3
): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  let dur = duration;
  let dec = decay;

  switch (type) {
    case 'room':
      dur = Math.max(0.6, Math.min(2.0, duration));
      dec = 2.5;
      break;
    case 'hall':
      dur = Math.max(1.5, Math.min(4.0, duration * 1.5));
      dec = 1.8;
      break;
    case 'plate':
      dur = Math.max(1.0, Math.min(3.0, duration * 1.2));
      dec = 2.0;
      break;
    case 'dreamy':
      dur = Math.max(2.5, Math.min(6.0, duration * 2.2));
      dec = 1.2;
      break;
    default:
      dur = 1.0;
      dec = 2.5;
  }

  const length = Math.floor(sampleRate * dur);
  const impulse = ctx.createBuffer(2, length, sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);

  const dampCoeff = 1.0 - (highDamp / 10) * 0.45;

  let lastL = 0;
  let lastR = 0;

  for (let i = 0; i < length; i++) {
    const n = i / length;
    const factor = Math.exp(-n * dec);

    let rawL = (Math.random() * 2 - 1) * factor;
    let rawR = (Math.random() * 2 - 1) * factor;

    // High damping lowpass simulation
    lastL = lastL * (1 - dampCoeff) + rawL * dampCoeff;
    lastR = lastR * (1 - dampCoeff) + rawR * dampCoeff;

    left[i] = lastL;
    right[i] = lastR;
  }

  return impulse;
}

// Build standard 16-bit stereo/mono WAV file from AudioBuffer
export function audioBufferToWav(buffer: AudioBuffer): Uint8Array {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const dataLength = buffer.length * blockAlign;
  const wavBuffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(wavBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // 1. RIFF
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, 'WAVE');

  // 2. fmt
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // 3. data
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(buffer.getChannelData(ch));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = channels[ch][i];
      sample = Math.max(-1, Math.min(1, sample));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Uint8Array(wavBuffer);
}

// Extract waveform peaks for visualization
export function extractWaveformData(buffer: AudioBuffer, pointsCount = 120): number[] {
  const channelData = buffer.getChannelData(0);
  const totalSamples = channelData.length;
  const blockSize = Math.floor(totalSamples / pointsCount);
  const peaks: number[] = [];

  for (let i = 0; i < pointsCount; i++) {
    const start = i * blockSize;
    let sum = 0;
    for (let j = 0; j < blockSize; j++) {
      sum += Math.abs(channelData[start + j] || 0);
    }
    const avg = sum / (blockSize || 1);
    peaks.push(Math.min(1.0, Math.max(0.08, avg * 3.5)));
  }

  return peaks;
}

// Master Class to manage real-time multi-track playback with full DSP suite & BGM ducking
export class VoicePlayer {
  private ctx: AudioContext;
  private currentVoiceSource: AudioBufferSourceNode | null = null;
  private currentBgmSource: AudioBufferSourceNode | null = null;
  private bgmGainNode: GainNode | null = null;
  private isPlaying = false;
  private startTime = 0;
  private pausedAt = 0;
  private originalBuffer: AudioBuffer | null = null;
  private currentBgmBuffer: AudioBuffer | null = null;
  private onEndedCallback?: () => void;
  private onTimeUpdateCallback?: (currentTime: number, duration: number) => void;
  private timerId: number | null = null;

  constructor() {
    this.ctx = getAudioContext();
  }

  public setBuffer(buffer: AudioBuffer) {
    this.stop();
    this.originalBuffer = buffer;
    this.pausedAt = 0;
  }

  public setBgmBuffer(buffer: AudioBuffer | null) {
    this.currentBgmBuffer = buffer;
  }

  public getDuration(settings: AudioSettings): number {
    if (!this.originalBuffer) return 0;
    const rate = this.calculateCombinedRate(settings);
    return this.originalBuffer.duration / (rate || 1);
  }

  public getCurrentTime(): number {
    if (!this.isPlaying) return this.pausedAt;
    return this.pausedAt + (this.ctx.currentTime - this.startTime);
  }

  private calculateCombinedRate(settings: AudioSettings): number {
    const pitchRatio = Math.pow(2, settings.pitch / 12);
    return Math.max(0.2, Math.min(4.0, settings.speed * pitchRatio));
  }

  public async play(settings: AudioSettings, offset = this.pausedAt) {
    if (!this.originalBuffer) return;
    this.stopSources();

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    const rate = this.calculateCombinedRate(settings);
    const effectiveDuration = this.originalBuffer.duration / rate;

    if (offset >= effectiveDuration) {
      offset = 0;
    }

    // 1. Voice Source Node
    const voiceSource = this.ctx.createBufferSource();
    voiceSource.buffer = this.originalBuffer;
    voiceSource.playbackRate.value = rate;

    // 2. Highpass Filter (Cuts adult chest resonance)
    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 80 + settings.bassCut * 30;
    highpass.Q.value = 0.7;

    // 3. Baby Formant Resonance Filter (~2.6kHz peak)
    const formantFilter = this.ctx.createBiquadFilter();
    formantFilter.type = 'peaking';
    formantFilter.frequency.value = 2600 + (settings.pitch > 0 ? settings.pitch * 60 : 0);
    formantFilter.Q.value = 1.6;
    formantFilter.gain.value = (settings.formantBoost / 10) * 14;

    // 4. Professional 5-Band Parametric Equalizer
    const eq = settings.equalizer;

    const eq60 = this.ctx.createBiquadFilter();
    eq60.type = 'lowshelf';
    eq60.frequency.value = 60;
    eq60.gain.value = eq.f60;

    const eq250 = this.ctx.createBiquadFilter();
    eq250.type = 'peaking';
    eq250.frequency.value = 250;
    eq250.Q.value = 1.0;
    eq250.gain.value = eq.f250;

    const eq1k = this.ctx.createBiquadFilter();
    eq1k.type = 'peaking';
    eq1k.frequency.value = 1000;
    eq1k.Q.value = 1.1;
    eq1k.gain.value = eq.f1k;

    const eq4k = this.ctx.createBiquadFilter();
    eq4k.type = 'peaking';
    eq4k.frequency.value = 4000;
    eq4k.Q.value = 1.2;
    eq4k.gain.value = eq.f4k;

    const eq12k = this.ctx.createBiquadFilter();
    eq12k.type = 'highshelf';
    eq12k.frequency.value = 12000;
    eq12k.gain.value = eq.f12k;

    // 5. De-Esser (Notch / High band tamer)
    const deEsser = this.ctx.createBiquadFilter();
    deEsser.type = 'peaking';
    deEsser.frequency.value = 7200;
    deEsser.Q.value = 2.4;
    deEsser.gain.value = settings.normalization.deEsser ? -4.5 : 0;

    // 6. Treble Crisp Filter
    const trebleFilter = this.ctx.createBiquadFilter();
    trebleFilter.type = 'highshelf';
    trebleFilter.frequency.value = 5000;
    trebleFilter.gain.value = (settings.trebleCrisp / 10) * 8;

    // 7. Master Compressor / Limiter / Normalization Gain
    const compressor = this.ctx.createDynamicsCompressor();
    compressor.threshold.value = settings.normalization.enabled ? -14 : -10;
    compressor.knee.value = 6;
    compressor.ratio.value = settings.normalization.compressorRatio || 3.0;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.12;

    const masterGain = this.ctx.createGain();
    // Auto makeup gain if normalizer is on
    const normMakeup = settings.normalization.enabled
      ? Math.pow(10, (settings.normalization.targetPeakDb + 1.0) / 20)
      : 1.0;
    masterGain.gain.value = (settings.volume / 100) * normMakeup;

    // Assemble Voice DSP Chain (Direct, Clean, Dry Speech - No Reverb or Echo)
    voiceSource.connect(highpass);
    highpass.connect(formantFilter);
    formantFilter.connect(eq60);
    eq60.connect(eq250);
    eq250.connect(eq1k);
    eq1k.connect(eq4k);
    eq4k.connect(eq12k);
    eq12k.connect(deEsser);
    deEsser.connect(trebleFilter);

    // Direct clean dry signal
    trebleFilter.connect(compressor);

    compressor.connect(masterGain);
    masterGain.connect(this.ctx.destination);

    // 10. Background Music Track (BGM) with Auto-Ducking
    if (settings.bgm.enabled) {
      try {
        let bgmBuf = settings.bgm.customBuffer || this.currentBgmBuffer;
        if (!bgmBuf) {
          bgmBuf = await getOrGenerateBgmBuffer(settings.bgm.trackId);
          this.currentBgmBuffer = bgmBuf;
        }

        const bgmSource = this.ctx.createBufferSource();
        bgmSource.buffer = bgmBuf;
        bgmSource.loop = settings.bgm.loop !== false;

        const bgmGain = this.ctx.createGain();
        const baseBgmGain = (settings.bgm.volume / 100) * 0.65;

        // Auto Ducking: duck when voice is playing
        if (settings.bgm.autoDucking) {
          const duckedLevel = baseBgmGain * settings.bgm.duckingAmount;
          bgmGain.gain.setValueAtTime(baseBgmGain, this.ctx.currentTime);
          bgmGain.gain.linearRampToValueAtTime(duckedLevel, this.ctx.currentTime + 0.1);
        } else {
          bgmGain.gain.setValueAtTime(baseBgmGain, this.ctx.currentTime);
        }

        bgmSource.connect(bgmGain);
        bgmGain.connect(this.ctx.destination);

        const bgmOffset = offset % (bgmBuf.duration || 1);
        bgmSource.start(0, bgmOffset);

        this.currentBgmSource = bgmSource;
        this.bgmGainNode = bgmGain;
      } catch (err) {
        console.error('Không thể kích hoạt BGM:', err);
      }
    }

    // Start voice playback
    const sourceOffset = Math.max(0, offset * rate);
    voiceSource.start(0, sourceOffset);

    this.currentVoiceSource = voiceSource;
    this.isPlaying = true;
    this.startTime = this.ctx.currentTime;
    this.pausedAt = offset;

    voiceSource.onended = () => {
      if (this.isPlaying) {
        // If BGM is playing with auto-ducking, smoothly restore BGM volume
        if (this.bgmGainNode && settings.bgm.enabled && settings.bgm.autoDucking) {
          const baseBgmGain = (settings.bgm.volume / 100) * 0.65;
          this.bgmGainNode.gain.linearRampToValueAtTime(baseBgmGain, this.ctx.currentTime + 0.35);
        }

        this.isPlaying = false;
        this.pausedAt = 0;
        this.clearTimer();
        if (this.onEndedCallback) this.onEndedCallback();
      }
    };

    this.startTimer(rate, effectiveDuration);
  }

  private startTimer(rate: number, effectiveDuration: number) {
    this.clearTimer();
    this.timerId = window.setInterval(() => {
      if (!this.isPlaying) return;
      const current = this.getCurrentTime();
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(Math.min(current, effectiveDuration), effectiveDuration);
      }
    }, 45);
  }

  private clearTimer() {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public pause() {
    if (!this.isPlaying) return;
    this.pausedAt = this.getCurrentTime();
    this.stopSources();
    this.isPlaying = false;
    this.clearTimer();
  }

  public seek(positionSeconds: number, settings: AudioSettings) {
    const wasPlaying = this.isPlaying;
    this.pause();
    this.pausedAt = positionSeconds;
    if (wasPlaying) {
      this.play(settings, positionSeconds);
    }
  }

  public stop() {
    this.stopSources();
    this.isPlaying = false;
    this.pausedAt = 0;
    this.clearTimer();
  }

  private stopSources() {
    if (this.currentVoiceSource) {
      try {
        this.currentVoiceSource.stop();
        this.currentVoiceSource.disconnect();
      } catch (e) {
        // Ignored
      }
      this.currentVoiceSource = null;
    }

    if (this.currentBgmSource) {
      try {
        this.currentBgmSource.stop();
        this.currentBgmSource.disconnect();
      } catch (e) {
        // Ignored
      }
      this.currentBgmSource = null;
    }
    this.bgmGainNode = null;
  }

  public onEnded(callback: () => void) {
    this.onEndedCallback = callback;
  }

  public onTimeUpdate(callback: (currentTime: number, duration: number) => void) {
    this.onTimeUpdateCallback = callback;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

// High-Definition Offline Mastering & Export (WAV 44.1kHz or 48kHz Stereo)
// Renders: Clean Dry Voice + 5-Band EQ + De-Esser + BGM + Auto-Ducking + True Peak Normalization
export async function renderProcessedAudioWav(
  inputBuffer: AudioBuffer,
  settings: AudioSettings,
  targetSampleRate = 48000
): Promise<Blob> {
  const rate = Math.max(0.2, Math.min(4.0, settings.speed * Math.pow(2, settings.pitch / 12)));
  const voiceDuration = inputBuffer.duration / rate;
  const numChannels = 2; // High-fidelity stereo
  const tailDuration = 0.05; // Tight clean dry end, no reverb overhang
  const totalDuration = voiceDuration + tailDuration;
  const totalLength = Math.ceil(totalDuration * targetSampleRate);

  const offlineCtx = new OfflineAudioContext(numChannels, totalLength, targetSampleRate);

  // 1. Voice Source
  const voiceSource = offlineCtx.createBufferSource();
  voiceSource.buffer = inputBuffer;
  voiceSource.playbackRate.value = rate;

  // 2. Highpass Filter
  const highpass = offlineCtx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 80 + settings.bassCut * 30;
  highpass.Q.value = 0.7;

  // 3. Baby Formant Filter
  const formantFilter = offlineCtx.createBiquadFilter();
  formantFilter.type = 'peaking';
  formantFilter.frequency.value = 2600 + (settings.pitch > 0 ? settings.pitch * 60 : 0);
  formantFilter.Q.value = 1.6;
  formantFilter.gain.value = (settings.formantBoost / 10) * 14;

  // 4. 5-Band Equalizer
  const eq = settings.equalizer;

  const eq60 = offlineCtx.createBiquadFilter();
  eq60.type = 'lowshelf';
  eq60.frequency.value = 60;
  eq60.gain.value = eq.f60;

  const eq250 = offlineCtx.createBiquadFilter();
  eq250.type = 'peaking';
  eq250.frequency.value = 250;
  eq250.Q.value = 1.0;
  eq250.gain.value = eq.f250;

  const eq1k = offlineCtx.createBiquadFilter();
  eq1k.type = 'peaking';
  eq1k.frequency.value = 1000;
  eq1k.Q.value = 1.1;
  eq1k.gain.value = eq.f1k;

  const eq4k = offlineCtx.createBiquadFilter();
  eq4k.type = 'peaking';
  eq4k.frequency.value = 4000;
  eq4k.Q.value = 1.2;
  eq4k.gain.value = eq.f4k;

  const eq12k = offlineCtx.createBiquadFilter();
  eq12k.type = 'highshelf';
  eq12k.frequency.value = 12000;
  eq12k.gain.value = eq.f12k;

  // 5. De-Esser
  const deEsser = offlineCtx.createBiquadFilter();
  deEsser.type = 'peaking';
  deEsser.frequency.value = 7200;
  deEsser.Q.value = 2.4;
  deEsser.gain.value = settings.normalization.deEsser ? -4.5 : 0;

  // 6. Treble Crisp
  const trebleFilter = offlineCtx.createBiquadFilter();
  trebleFilter.type = 'highshelf';
  trebleFilter.frequency.value = 5000;
  trebleFilter.gain.value = (settings.trebleCrisp / 10) * 8;

  // 7. Voice Submix Compressor / Limiter / Normalization
  const compressor = offlineCtx.createDynamicsCompressor();
  compressor.threshold.value = settings.normalization.enabled ? -14 : -10;
  compressor.knee.value = 6;
  compressor.ratio.value = settings.normalization.compressorRatio || 3.0;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.12;

  const voiceGain = offlineCtx.createGain();
  voiceGain.gain.value = (settings.volume / 100) * 1.0;

  // Connect Voice DSP graph (Direct, Clean, Dry Speech - No Reverb or Echo)
  voiceSource.connect(highpass);
  highpass.connect(formantFilter);
  formantFilter.connect(eq60);
  eq60.connect(eq250);
  eq250.connect(eq1k);
  eq1k.connect(eq4k);
  eq4k.connect(eq12k);
  eq12k.connect(deEsser);
  deEsser.connect(trebleFilter);

  // Direct clean connection
  trebleFilter.connect(compressor);
  compressor.connect(voiceGain);
  voiceGain.connect(offlineCtx.destination);

  // 10. Background Music integration in render
  if (settings.bgm.enabled && settings.exportWithBgm) {
    try {
      let bgmBuf = settings.bgm.customBuffer;
      if (!bgmBuf) {
        bgmBuf = await getOrGenerateBgmBuffer(settings.bgm.trackId);
      }

      const bgmSource = offlineCtx.createBufferSource();
      bgmSource.buffer = bgmBuf;
      bgmSource.loop = true;

      const bgmGain = offlineCtx.createGain();
      const baseBgmGain = (settings.bgm.volume / 100) * 0.65;

      if (settings.bgm.autoDucking) {
        const ducked = baseBgmGain * settings.bgm.duckingAmount;
        // Duck during voice
        bgmGain.gain.setValueAtTime(ducked, 0);
        // Release back after voice finishes
        bgmGain.gain.setValueAtTime(ducked, voiceDuration);
        bgmGain.gain.linearRampToValueAtTime(baseBgmGain, voiceDuration + 0.4);
      } else {
        bgmGain.gain.setValueAtTime(baseBgmGain, 0);
      }

      bgmSource.connect(bgmGain);
      bgmGain.connect(offlineCtx.destination);

      bgmSource.start(0);
      bgmSource.stop(totalDuration);
    } catch (e) {
      console.error('Lỗi tích hợp BGM khi render:', e);
    }
  }

  voiceSource.start(0);

  const renderedBuffer = await offlineCtx.startRendering();

  // 11. Normalization & True-Peak Mastering Pass
  if (settings.normalization.enabled) {
    const targetLinear = Math.pow(10, settings.normalization.targetPeakDb / 20); // e.g. -1.0 dB = 0.891
    let maxPeak = 0.0001;

    for (let ch = 0; ch < renderedBuffer.numberOfChannels; ch++) {
      const chData = renderedBuffer.getChannelData(ch);
      for (let i = 0; i < chData.length; i++) {
        const absVal = Math.abs(chData[i]);
        if (absVal > maxPeak) maxPeak = absVal;
      }
    }

    const scale = Math.min(4.0, targetLinear / maxPeak);

    for (let ch = 0; ch < renderedBuffer.numberOfChannels; ch++) {
      const chData = renderedBuffer.getChannelData(ch);
      for (let i = 0; i < chData.length; i++) {
        let val = chData[i] * scale;
        // Soft-knee limiter
        if (val > 0.98) val = 0.98 + (val - 0.98) * 0.1;
        if (val < -0.98) val = -0.98 + (val + 0.98) * 0.1;
        chData[i] = Math.max(-0.999, Math.min(0.999, val));
      }
    }
  }

  const wavBytes = audioBufferToWav(renderedBuffer);
  return new Blob([wavBytes as any], { type: 'audio/wav' });
}
