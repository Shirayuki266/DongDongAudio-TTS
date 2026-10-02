export type VoiceCategory = 'all' | 'saved' | 'bing' | 'google_cloud' | 'chi_google' | 'tiktok' | 'browser';

export interface SavedCustomVoice {
  id: string;
  name: string;
  basePresetId: string;
  basePresetName: string;
  basePresetIcon: string;
  pitch: number;
  speed: number;
  formantBoost: number;
  bassCut: number;
  trebleCrisp: number;
  volume: number;
  customPrompt?: string;
  createdAt: number;
}

export interface VoicePreset {
  id: string;
  name: string;
  shortDesc: string;
  gender: 'female' | 'male' | 'child';
  category: VoiceCategory;
  provider: string; // 'Bing' | 'Google Cloud' | 'Chị Google' | 'TikTok' | 'Trình duyệt'
  icon: string;
  tag: string;
  geminiVoice: 'Puck' | 'Kore' | 'Zephyr' | 'Fenrir' | 'Charon';
  defaultPitch: number; // in semitones (-12 to +12)
  defaultSpeed: number; // 0.5 to 2.5
  defaultFormant: number; // 0 to 10
  stylePrompt: string;
  isBrowserVoice?: boolean;
}

export interface EqualizerBands {
  f60: number; // Sub-bass: -12 to +12 dB
  f250: number; // Low-mid warmth: -12 to +12 dB
  f1k: number; // Mid vocal body: -12 to +12 dB
  f4k: number; // Presence / baby clarity: -12 to +12 dB
  f12k: number; // Air / sparkle: -12 to +12 dB
}

export type ReverbType = 'none' | 'room' | 'hall' | 'plate' | 'dreamy';

export interface ReverbSettings {
  type: ReverbType;
  decay: number; // 0.5 to 5.0 seconds
  preDelay: number; // 0 to 60 ms
  wet: number; // 0 to 100%
  highDamp: number; // 0 to 10 (frequency damping)
}

export interface BgmTrack {
  id: string;
  name: string;
  category: string;
  icon: string;
  duration: number;
}

export interface BgmSettings {
  enabled: boolean;
  trackId: string;
  volume: number; // 0 to 100%
  autoDucking: boolean; // lowers BGM when baby voice speaks
  duckingAmount: number; // 0.1 to 0.7 (volume factor during speech)
  loop: boolean;
  customTrackName?: string;
  customBuffer?: AudioBuffer | null;
}

export interface NormalizationSettings {
  enabled: boolean;
  targetPeakDb: number; // -3.0 to 0.0 dBFS (default -1.0 dBFS)
  compressorRatio: number; // 1 to 12
  deEsser: boolean; // Tames harsh high-frequency sibilance
  limiter: boolean; // Prevents any inter-sample clipping
}

export interface AudioSettings {
  speed: number; // 0.5 to 2.5 (1.0 default)
  pitch: number; // -12 to +12 semitones (0 default, +5 is baby)
  formantBoost: number; // 0 to 10 (boost around 2.8kHz for baby resonance)
  bassCut: number; // 0 to 10 (cuts heavy adult bass frequencies)
  trebleCrisp: number; // 0 to 10 (high shelf crispness)
  reverbAmount: number; // 0 to 10 (legacy slider mapped to reverb)
  echoDelay: number; // 0 to 10 (delay echo effect)
  volume: number; // 0 to 200 (100 is normal)

  // Advanced Suite Settings
  equalizer: EqualizerBands;
  reverb: ReverbSettings;
  bgm: BgmSettings;
  normalization: NormalizationSettings;
  exportWithBgm: boolean;
}

export type TtsEngine = 'gemini' | 'gemini-voice-design' | 'google-fast' | 'web-speech';

export interface HistoryItem {
  id: string;
  text: string;
  presetName: string;
  audioUrl: string;
  audioBlob: Blob;
  duration: number;
  createdAt: number;
  settings: AudioSettings;
  fileSize: number;
  engine: string;
  hasBgm: boolean;
}
