import React from 'react';
import { SAMPLE_TEXTS, SampleText } from '../utils/sampleTexts';
import { VoicePreset } from '../types/tts';
import {
  FileText,
  Clock,
  Sparkles,
  Trash2,
  Copy,
  Check,
  Send,
  Loader2,
  Wand2,
  Smile,
  Volume2,
} from 'lucide-react';

interface TextEditorProps {
  text: string;
  onChangeText: (text: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  onApplyPresetById: (presetId: string) => void;
  selectedPreset: VoicePreset;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  text,
  onChangeText,
  onGenerate,
  isLoading,
  onApplyPresetById,
  selectedPreset,
}) => {
  const [copied, setCopied] = React.useState(false);

  // Stats calculation
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  // Average speaking rate ~ 130 words per minute for playful baby voice
  const estimatedSeconds = Math.round((wordCount / 130) * 60) || (charCount > 0 ? 3 : 0);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const insertTag = (tag: string) => {
    onChangeText(text ? `${text} ${tag}` : tag);
  };

  const applySample = (sample: SampleText) => {
    onChangeText(sample.text);
    if (sample.recommendedPreset) {
      onApplyPresetById(sample.recommendedPreset);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Header and stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            2. Nhập Nội Dung Kịch Bản (Không Giới Hạn)
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
          <span>{charCount.toLocaleString()} ký tự</span>
          <span>•</span>
          <span>{wordCount} từ</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-cyan-400">
            <Clock className="w-3.5 h-3.5" />
            ~{formatDuration(estimatedSeconds)}
          </span>
        </div>
      </div>

      {/* Main Textarea Container */}
      <div className="relative group rounded-2xl bg-slate-900 border border-slate-800 focus-within:border-pink-500/80 focus-within:ring-2 focus-within:ring-pink-500/20 transition-all shadow-inner">
        <textarea
          rows={6}
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder="Nhập hoặc dán bất kỳ văn bản nào vào đây để chuyển thành giọng em bé TikTok cực đáng yêu... (Hỗ trợ truyện dài, review, video ngắn không giới hạn số từ!)"
          className="w-full p-4 bg-transparent text-slate-100 placeholder-slate-500 text-sm md:text-base leading-relaxed resize-y focus:outline-none min-h-[160px]"
        />

        {/* Action icons bar inside textarea */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-slate-800/80 bg-slate-950/40 rounded-b-2xl">
          {/* Quick Insert tags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline mr-1">
              Chèn biểu cảm:
            </span>
            <button
              type="button"
              onClick={() => insertTag('[nghỉ 0.5s]')}
              className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-white transition-colors"
            >
              ⏱️ Nghỉ 0.5s
            </button>
            <button
              type="button"
              onClick={() => insertTag('[cười]')}
              className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-white transition-colors"
            >
              😆 Cười hi hi
            </button>
            <button
              type="button"
              onClick={() => insertTag('[quao]')}
              className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-white transition-colors"
            >
              ✨ Ồ quao
            </button>
          </div>

          {/* Clear & Copy */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!text}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
              title="Sao chép kịch bản"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => onChangeText('')}
              disabled={!text}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 disabled:opacity-30 transition-colors"
              title="Xóa trắng kịch bản"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Sample Presets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-pink-400" />
            Mẫu kịch bản TikTok viral có sẵn:
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {SAMPLE_TEXTS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => applySample(sample)}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all text-xs font-medium"
            >
              <span className="text-pink-400 mr-1.5">#</span>
              {sample.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Generate Button */}
      <div className="pt-1">
        <button
          onClick={onGenerate}
          disabled={isLoading || !text.trim()}
          className="w-full relative group overflow-hidden rounded-2xl py-3.5 px-6 font-bold text-white shadow-xl transition-all duration-300 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-pink-600 via-rose-500 to-cyan-500 hover:from-pink-500 hover:to-cyan-400 shadow-pink-500/25 hover:shadow-pink-500/40 flex items-center justify-center gap-3 text-base"
        >
          {/* Shimmer animation */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span>Đang tổng hợp giọng em bé TikTok (24kHz HD)...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-yellow-300 animate-bounce" />
              <span>Tạo Giọng Nói Em Bé Ngay ({selectedPreset.name})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
