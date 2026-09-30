import React, { useState } from 'react';
import { VOICE_PRESETS } from '../utils/presets';
import { VoicePreset, TtsEngine } from '../types/tts';
import { Sparkles, Radio, Zap, Settings2, UserCheck, Flame } from 'lucide-react';

interface VoiceSelectorProps {
  selectedPreset: VoicePreset;
  onSelectPreset: (preset: VoicePreset) => void;
  selectedEngine: TtsEngine;
  onChangeEngine: (engine: TtsEngine) => void;
  customPrompt: string;
  onChangeCustomPrompt: (prompt: string) => void;
  isCustomActive: boolean;
  onToggleCustom: (active: boolean) => void;
}

type CategoryFilter = 'all' | 'female' | 'baby' | 'fun';

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedPreset,
  onSelectPreset,
  selectedEngine,
  onChangeEngine,
  customPrompt,
  onChangeCustomPrompt,
  isCustomActive,
  onToggleCustom,
}) => {
  const [filter, setFilter] = useState<CategoryFilter>('all');

  const filteredPresets = VOICE_PRESETS.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'female') return p.category === 'female';
    if (filter === 'baby') return p.category === 'baby';
    if (filter === 'fun') return p.category === 'fun';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header & Engine Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            1. Chọn Giọng Đọc TikTok (Em Bé & Giọng Nữ)
          </h2>
        </div>

        {/* Engine switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs self-start sm:self-auto">
          <button
            onClick={() => onChangeEngine('gemini')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
              selectedEngine === 'gemini'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Sử dụng Gemini 3.8 Flash Lite TTS cho chất giọng chuẩn studio, chân thực nhất"
          >
            <Zap className="w-3 h-3 text-yellow-300" />
            <span>Gemini AI Studio</span>
          </button>

          <button
            onClick={() => onChangeEngine('google-fast')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
              selectedEngine === 'google-fast'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Google Fast TTS không giới hạn, tạo âm thanh siêu tốc"
          >
            <Radio className="w-3 h-3 text-cyan-300" />
            <span>Fast HD</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        {[
          { key: 'all', label: 'Tất Cả', icon: '🌟' },
          { key: 'female', label: 'Giọng Nữ TikTok', icon: '👩‍🦰', hot: true },
          { key: 'baby', label: 'Giọng Em Bé', icon: '👶' },
          { key: 'fun', label: 'Hài Hước & Chibi', icon: '🐿️' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as CategoryFilter)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all border ${
              filter === tab.key
                ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border-pink-500/50 shadow-sm'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.hot && (
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse"></span>
            )}
          </button>
        ))}
      </div>

      {/* Preset cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredPresets.map((preset) => {
          const isSelected = !isCustomActive && selectedPreset.id === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => {
                onToggleCustom(false);
                onSelectPreset(preset);
              }}
              className={`group relative p-3 rounded-xl text-left transition-all duration-200 border flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-pink-950/60 to-slate-900 border-pink-500/80 shadow-lg shadow-pink-500/10 ring-1 ring-pink-500/50'
                  : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                </div>
              )}

              <div>
                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                  <span className="text-xl transform group-hover:scale-110 transition-transform">
                    {preset.icon}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    preset.category === 'female'
                      ? 'bg-purple-950/80 text-purple-300 border-purple-500/30'
                      : 'bg-slate-800 text-pink-300 border-pink-500/20'
                  }`}>
                    {preset.tag}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-white leading-tight">
                  {preset.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {preset.shortDesc}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                <span className="font-mono text-cyan-400/90">
                  {preset.defaultPitch >= 0 ? `+${preset.defaultPitch}` : preset.defaultPitch}st
                </span>
                <span className="font-mono text-slate-400">{preset.defaultSpeed}x</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Voice Prompt Toggle & Input */}
      <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() => onToggleCustom(!isCustomActive)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tùy biến phong cách giọng AI (Voice Prompting)</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                isCustomActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isCustomActive ? 'Đang Bật' : 'Tùy chọn'}
            </span>
          </button>
        </div>

        {isCustomActive && (
          <div className="mt-2 space-y-2">
            <textarea
              rows={2}
              value={customPrompt}
              onChange={(e) => onChangeCustomPrompt(e.target.value)}
              placeholder="Ví dụ: Giọng bạn nữ miền Bắc ngọt ngào, ấm áp, nhịp điệu nhanh dí dỏm chuẩn TikTok review mỹ phẩm..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-sans"
            />
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="text-cyan-400">💡 Gợi ý:</span>
              <span>Gemini 3.8 TTS sẽ tự động điều chỉnh biểu cảm và ngữ điệu theo mô tả của bạn.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
