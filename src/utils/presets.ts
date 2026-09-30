import { VoicePreset, AudioSettings } from '../types/tts';

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  speed: 1.05, // Slightly perky for TikTok
  pitch: 4, // +4 semitones for authentic sweet baby pitch
  formantBoost: 7, // Emphasize child oral resonance
  bassCut: 6, // Cut low frequencies
  trebleCrisp: 5, // Crisp treble
  reverbAmount: 0, // Clean dry voice (no reverb/echo)
  echoDelay: 0,
  volume: 100,

  // Advanced Equalizer Defaults (optimized for crisp clean voice)
  equalizer: {
    f60: -4, // Cut sub-rumble
    f250: -1, // Clean low-mid
    f1k: 2, // Warm speech body
    f4k: 4, // Baby oral brightness
    f12k: 3, // Sparkle air
  },

  // Dry Studio Defaults (Không vang vọng)
  reverb: {
    type: 'none',
    decay: 0,
    preDelay: 0,
    wet: 0,
    highDamp: 0,
  },

  // Background Music Defaults
  bgm: {
    enabled: false,
    trackId: 'cute_playtime',
    volume: 24, // 24% background presence
    autoDucking: true, // Auto ducking when baby voice is speaking
    duckingAmount: 0.22,
    loop: true,
  },

  // Normalization & Studio Mastering Defaults
  normalization: {
    enabled: true,
    targetPeakDb: -1.0, // Industry standard -1.0 dBFS true peak
    compressorRatio: 3.0,
    deEsser: true,
    limiter: true,
  },

  exportWithBgm: true,
};

export const VOICE_PRESETS: VoicePreset[] = [
  // GIỌNG NỮ TIKTOK (MỚI)
  {
    id: 'tiktok_female_cute',
    name: 'Nữ TikTok Ngọt Ngào',
    shortDesc: 'Giọng bạn nữ trẻ trung, ngọt ngào, tươi vui cho video unboxing, vlog',
    gender: 'female',
    category: 'female',
    icon: '👩‍🦰',
    tag: 'Trending Nữ',
    geminiVoice: 'Kore',
    defaultPitch: 1,
    defaultSpeed: 1.05,
    defaultFormant: 4,
    stylePrompt: 'Sweet young Vietnamese female TikTok creator, energetic, adorable and joyful, natural speaking tone for viral vlogs and reviews in Vietnamese.',
  },
  {
    id: 'tiktok_female_chi_google',
    name: 'Chị Google Huyền Thoại',
    shortDesc: 'Giọng đọc quốc dân huyền thoại, tròn vành rõ chữ, hài hước viral',
    gender: 'female',
    category: 'female',
    icon: '🎙️',
    tag: 'Viral Quốc Dân',
    geminiVoice: 'Kore',
    defaultPitch: 0,
    defaultSpeed: 1.0,
    defaultFormant: 2,
    stylePrompt: 'Iconic Vietnamese female voice known as Chi Google, rhythmic, clear, slightly playful and legendary TikTok narration style in Vietnamese.',
  },
  {
    id: 'tiktok_female_story_review',
    name: 'Nữ Review Phim / Kịch Bản',
    shortDesc: 'Giọng nữ truyền cảm, lôi cuốn, kịch tính cho tóm tắt phim triệu view',
    gender: 'female',
    category: 'female',
    icon: '🎬',
    tag: 'Review Phim',
    geminiVoice: 'Kore',
    defaultPitch: 0,
    defaultSpeed: 1.02,
    defaultFormant: 1,
    stylePrompt: 'Captivating Vietnamese female movie review and storytelling narrator, warm, expressive, dramatic and engaging tone in Vietnamese.',
  },
  {
    id: 'tiktok_female_genz',
    name: 'Cô Gái Gen Z Năng Động',
    shortDesc: 'Nói nhanh, hóm hỉnh, bắt trend năng động cho video ngắn',
    gender: 'female',
    category: 'female',
    icon: '✨',
    tag: 'Gen Z Trendy',
    geminiVoice: 'Zephyr',
    defaultPitch: 1,
    defaultSpeed: 1.12,
    defaultFormant: 3,
    stylePrompt: 'Trendy enthusiastic young Vietnamese Gen Z girl, fast-paced, bright, witty, cheerful viral TikTok tone in Vietnamese.',
  },
  {
    id: 'tiktok_female_mc',
    name: 'Nữ MC Dẫn Chương Trình',
    shortDesc: 'Giọng dẫn thanh lịch, chuẩn mực, lưu loát và truyền cảm hứng',
    gender: 'female',
    category: 'female',
    icon: '👑',
    tag: 'Chuyên Nghiệp',
    geminiVoice: 'Kore',
    defaultPitch: 0,
    defaultSpeed: 1.0,
    defaultFormant: 0,
    stylePrompt: 'Professional Vietnamese female presenter and news host, elegant, crystal clear articulation, confident and trustworthy in Vietnamese.',
  },
  {
    id: 'tiktok_female_sweet_asmr',
    name: 'Nữ Êm Dịu / Thư Giãn',
    shortDesc: 'Giọng thì thầm nhẹ nhàng, êm ái, chữa lành cho podcast & ru ngủ',
    gender: 'female',
    category: 'female',
    icon: '🌙',
    tag: 'Chữa Lành',
    geminiVoice: 'Kore',
    defaultPitch: -1,
    defaultSpeed: 0.92,
    defaultFormant: 2,
    stylePrompt: 'Gentle soft-spoken Vietnamese female voice, soothing, intimate, relaxing bedtime and lifestyle storyteller in Vietnamese.',
  },

  // GIỌNG EM BÉ TIKTOK
  {
    id: 'tiktok_baby_cute',
    name: 'Em Bé TikTok Cute',
    shortDesc: 'Giọng bé gái 3-4 tuổi ngọt ngào, đáng yêu viral triệu view',
    gender: 'child',
    category: 'baby',
    icon: '👶',
    tag: 'Trending Baby',
    geminiVoice: 'Puck',
    defaultPitch: 5,
    defaultSpeed: 1.08,
    defaultFormant: 8,
    stylePrompt: 'Adorable 4-year-old baby girl voice, cheerful, very high-pitched cute toddler, sweet and playful, viral TikTok cute kid sound in Vietnamese.',
  },
  {
    id: 'tiktok_baby_boy',
    name: 'Bé Trai Tinh Nghịch',
    shortDesc: 'Giọng bé trai hiếu động, lém lỉnh, đầy năng lượng',
    gender: 'child',
    category: 'baby',
    icon: '👦',
    tag: 'Vui nhộn',
    geminiVoice: 'Puck',
    defaultPitch: 4,
    defaultSpeed: 1.1,
    defaultFormant: 6,
    stylePrompt: 'Cute 4-year-old energetic baby boy voice, enthusiastic, slightly mischievous, high-pitched toddler style in Vietnamese.',
  },
  {
    id: 'tiktok_fairy_tale',
    name: 'Bé Kể Chuyện Cổ Tích',
    shortDesc: 'Giọng em bé êm dịu, ngọt lịm, ấm áp truyền cảm',
    gender: 'female',
    category: 'baby',
    icon: '🧚‍♀️',
    tag: 'Truyện ngủ',
    geminiVoice: 'Kore',
    defaultPitch: 3,
    defaultSpeed: 0.95,
    defaultFormant: 5,
    stylePrompt: 'Innocent sweet child storytelling voice, gentle, lovable, speaking clearly like a bedtime fairytale baby in Vietnamese.',
  },
  {
    id: 'tiktok_sweet_girl',
    name: 'Bé Gái Nũng Nịu',
    shortDesc: 'Em gái nhỏ xin xỏ, giọng nũng nịu tan chảy trái tim',
    gender: 'female',
    category: 'baby',
    icon: '🎀',
    tag: 'Siêu Cưng',
    geminiVoice: 'Kore',
    defaultPitch: 6,
    defaultSpeed: 1.02,
    defaultFormant: 7,
    stylePrompt: 'Sweet little preschool girl asking or explaining something adorably, affectionate and cute viral TikTok style in Vietnamese.',
  },
  {
    id: 'tiktok_smart_kid',
    name: 'MC Nhí Thông Thái',
    shortDesc: 'Giọng bé 6 tuổi dõng dạc, rõ ràng, hoạt ngôn',
    gender: 'child',
    category: 'baby',
    icon: '🎓',
    tag: 'Khám phá',
    geminiVoice: 'Zephyr',
    defaultPitch: 2,
    defaultSpeed: 1.0,
    defaultFormant: 4,
    stylePrompt: 'Bright confident 6-year-old kid narrator, energetic, clear articulation, cheerful in Vietnamese.',
  },
  {
    id: 'tiktok_chipmunk_baby',
    name: 'Sóc Chuột Chipmunk',
    shortDesc: 'Tông cực cao, hài hước, biến hóa vui nhộn cho video troll',
    gender: 'child',
    category: 'fun',
    icon: '🐿️',
    tag: 'Hài hước',
    geminiVoice: 'Puck',
    defaultPitch: 8,
    defaultSpeed: 1.15,
    defaultFormant: 9,
    stylePrompt: 'Ultra high-pitched cartoon baby chipmunk voice, bubbly, bouncy, hilarious and super cute in Vietnamese.',
  },
];
