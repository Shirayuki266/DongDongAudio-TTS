import React, { useState } from 'react';
import { VOICE_PRESETS } from '../utils/presets';
import { VoicePreset, VoiceCategory, TtsEngine, SavedCustomVoice } from '../types/tts';
import {
  Sparkles,
  Radio,
  Zap,
  Settings2,
  Check,
  Star,
  Trash2,
  BookmarkPlus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface VoiceSelectorProps {
  selectedPreset: VoicePreset;
  onSelectPreset: (preset: VoicePreset) => void;
  selectedEngine: TtsEngine;
  onChangeEngine: (engine: TtsEngine) => void;
  customPrompt: string;
  onChangeCustomPrompt: (prompt: string) => void;
  isCustomActive: boolean;
  onToggleCustom: (active: boolean) => void;
  savedVoices: SavedCustomVoice[];
  activeSavedVoiceId: string | null;
  onSelectSavedVoice: (voice: SavedCustomVoice) => void;
  onDeleteSavedVoice: (id: string) => void;
  onOpenSaveModal: () => void;
  onOpenReverseAnalysis: () => void;
}

const PROVIDER_SECTIONS: {
  key: VoiceCategory;
  title: string;
}[] = [
  { key: 'tiktok', title: 'Giọng TikTok & Em Bé' },
  { key: 'bing', title: 'Dịch vụ Bing' },
  { key: 'google_cloud', title: 'Google Cloud' },
  { key: 'chi_google', title: 'Giọng Chị Google' },
  { key: 'browser', title: 'Giọng Trình Duyệt' },
];

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedPreset,
  onSelectPreset,
  selectedEngine,
  onChangeEngine,
  customPrompt,
  onChangeCustomPrompt,
  isCustomActive,
  onToggleCustom,
  savedVoices,
  activeSavedVoiceId,
  onSelectSavedVoice,
  onDeleteSavedVoice,
  onOpenSaveModal,
  onOpenReverseAnalysis,
}) => {
  const [activeCategory, setActiveCategory] = useState<VoiceCategory>('all');
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);

  const visibleSections =
    activeCategory === 'all'
      ? PROVIDER_SECTIONS
      : PROVIDER_SECTIONS.filter((s) => s.key === activeCategory);

  return (
    <div className="space-y-3">
      {/* Header & Engine Toggle (Compact) */}
      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-500 dark:text-pink-400 flex-shrink-0" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            1. Chọn Giọng Đọc
          </h2>
        </div>

        {/* Engine switcher & Reverse Clone button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenReverseAnalysis}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 dark:bg-gradient-to-r dark:from-purple-900/60 dark:to-pink-900/60 dark:hover:from-purple-800/80 dark:hover:to-pink-800/80 dark:text-purple-200 dark:hover:text-white dark:border-purple-500/40 text-xs font-semibold transition-all active:scale-95 shadow-sm"
            title="Tải file âm thanh để AI phân tích ngược và trích xuất giọng tương tự"
          >
            <Radio className="w-3 h-3 text-pink-500 dark:text-pink-400 animate-pulse" />
            <span className="hidden xs:inline">Phân tích Audio</span>
            <span className="xs:hidden">Clone</span>
          </button>

          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px]">
            <button
              onClick={() => onChangeEngine('gemini')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                selectedEngine === 'gemini'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-sm font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Gemini
            </button>
            <button
              onClick={() => onChangeEngine('google-fast')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                selectedEngine === 'google-fast'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Fast HD
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs (Compact) */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs no-scrollbar">
        {[
          { key: 'all', label: 'Tất cả' },
          {
            key: 'saved',
            label: `Đã lưu (${savedVoices.length})`,
            icon: '⭐',
            highlight: savedVoices.length > 0,
          },
          { key: 'tiktok', label: 'TikTok & Bé' },
          { key: 'bing', label: 'Bing' },
          { key: 'google_cloud', label: 'Google Cloud' },
          { key: 'chi_google', label: 'Chị Google' },
          { key: 'browser', label: 'Trình duyệt' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveCategory(tab.key as VoiceCategory)}
            className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium text-[11px] sm:text-xs transition-all border ${
              activeCategory === tab.key
                ? 'bg-slate-200 text-slate-950 border-slate-300 font-bold shadow-sm'
                : tab.highlight
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
            }`}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* COMPACT VOICE LIST CONTAINER */}
      <div className="max-h-[160px] sm:max-h-[175px] overflow-y-auto pr-1 space-y-2.5 rounded-xl border voice-selector-box p-2.5">
        {/* SAVED CUSTOM VOICES SECTION */}
        {(activeCategory === 'saved' || (activeCategory === 'all' && savedVoices.length > 0)) && (
          <div className="space-y-1.5 pb-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-500 dark:text-amber-300 px-1">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                Giọng đã lưu ({savedVoices.length})
              </span>
              <button
                onClick={onOpenSaveModal}
                className="text-[10px] text-pink-600 dark:text-pink-400 hover:text-pink-500 font-semibold"
              >
                + Lưu hiện tại
              </button>
            </div>

            {savedVoices.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic px-1">
                Chưa có giọng tùy chỉnh nào được lưu.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {savedVoices.map((voice) => {
                  const isSelected = activeSavedVoiceId === voice.id;
                  return (
                    <div
                      key={voice.id}
                      onClick={() => onSelectSavedVoice(voice)}
                      className={`cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all border ${
                        isSelected
                          ? 'bg-amber-100 dark:bg-amber-950/70 border-amber-400 text-amber-950 dark:text-white font-bold ring-1 ring-amber-400/50 shadow-sm'
                          : 'voice-chip-btn'
                      }`}
                    >
                      <span>{voice.basePresetIcon}</span>
                      <span className="truncate max-w-[120px]">{voice.name}</span>
                      <span className="text-[10px] text-pink-600 dark:text-pink-400 font-mono">
                        {voice.pitch >= 0 ? `+${voice.pitch}` : voice.pitch}st
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Xóa giọng "${voice.name}"?`)) {
                            onDeleteSavedVoice(voice.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-500 p-0.5 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PROVIDER SECTIONS (COMPACT ROWS) */}
        {activeCategory !== 'saved' &&
          visibleSections.map((section) => {
            const sectionPresets = VOICE_PRESETS.filter((p) => p.category === section.key);
            if (sectionPresets.length === 0) return null;

            return (
              <div key={section.key} className="space-y-1">
                {activeCategory === 'all' && (
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
                    {section.title} ({sectionPresets.length})
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {sectionPresets.map((preset) => {
                    const isSelected =
                      !isCustomActive && !activeSavedVoiceId && selectedPreset.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => {
                          onToggleCustom(false);
                          onSelectPreset(preset);
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all border ${
                          isSelected
                            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-bold border-slate-900 dark:border-slate-100 shadow-md ring-2 ring-pink-500/40'
                            : 'voice-chip-btn'
                        }`}
                        title={`${preset.name}: ${preset.shortDesc}`}
                      >
                        <span className="text-xs">{preset.icon}</span>
                        <span>{preset.name}</span>
                        {isSelected && (
                          <Check className="w-3 h-3 text-pink-400 dark:text-pink-600 stroke-[3]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>

      {/* SELECTED VOICE COMPACT STATUS BAR */}
      <div className="p-2.5 rounded-xl voice-status-bar border flex items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl flex-shrink-0">{selectedPreset.icon}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
                {selectedPreset.name}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-500/30">
                {selectedPreset.tag}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">
                {selectedPreset.provider}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {selectedPreset.shortDesc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={onOpenSaveModal}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-pink-100 hover:bg-pink-200 dark:bg-pink-600/20 dark:hover:bg-pink-600/30 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-500/40 text-[11px] font-semibold transition-all active:scale-95"
            title="Lưu lại cấu hình giọng hiện tại"
          >
            <BookmarkPlus className="w-3 h-3 text-pink-500 dark:text-pink-400" />
            <span className="hidden sm:inline">Lưu Giọng</span>
          </button>
        </div>
      </div>

      {/* MINIMALIST AI PROMPTING COLLAPSIBLE */}
      <div className="rounded-xl voice-prompt-box border overflow-hidden">
        <button
          type="button"
          onClick={() => setIsPromptExpanded(!isPromptExpanded)}
          className="w-full px-3 py-1.5 flex items-center justify-between text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Settings2 className="w-3 h-3 text-cyan-400" />
            <span>Tùy biến phong cách AI Prompt (Tùy chọn)</span>
            {isCustomActive && (
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold uppercase">
                Bật
              </span>
            )}
          </div>
          {isPromptExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {isPromptExpanded && (
          <div className="p-2.5 pt-0 space-y-1.5 border-t border-slate-800/60">
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-500">
                Mô tả chi tiết cảm xúc và biểu cảm cho Gemini AI
              </span>
              <button
                type="button"
                onClick={() => onToggleCustom(!isCustomActive)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  isCustomActive ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isCustomActive ? 'Đang kích hoạt' : 'Bật tính năng'}
              </button>
            </div>
            <textarea
              rows={2}
              value={customPrompt}
              onChange={(e) => {
                onChangeCustomPrompt(e.target.value);
                if (!isCustomActive && e.target.value) onToggleCustom(true);
              }}
              placeholder="Ví dụ: Giọng bé gái 4 tuổi ngọt ngào, nói chậm rãi, nũng nịu..."
              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        )}
      </div>
    </div>
  );
};
