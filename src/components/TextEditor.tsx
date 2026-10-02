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
  Type,
  Hash,
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
  // Average speaking rate ~ 130 words per minute
  const speedFactor = selectedPreset.defaultSpeed || 1.0;
  const rawSeconds = (wordCount / 130) * 60;
  const estimatedSeconds = Math.round(rawSeconds / speedFactor) || (charCount > 0 ? 3 : 0);

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            2. Nhập Nội Dung Kịch Bản (Không Giới Hạn)
          </h2>
        </div>
      </div>

      {/* 3 Styled Stat Boxes with visual effects */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Ô 1: Ký tự */}
        <div className="relative group/stat overflow-hidden p-3 rounded-2xl stat-box-1 border hover:border-cyan-400 shadow-md transition-all">
          <div className="absolute -top-4 -right-4 w-14 h-14 bg-cyan-400/20 dark:bg-cyan-500/15 rounded-full blur-xl group-hover/stat:bg-cyan-400/30 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              Ký tự
            </span>
            <span className="text-[10px] text-cyan-700 dark:text-cyan-400 font-mono px-1.5 py-0.2 rounded bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 font-bold">
              Live
            </span>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight mt-1 flex items-baseline gap-1">
            <span>{charCount.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 font-normal">ký tự</span>
          </div>
        </div>

        {/* Ô 2: Số từ */}
        <div className="relative group/stat overflow-hidden p-3 rounded-2xl stat-box-2 border hover:border-purple-400 shadow-md transition-all">
          <div className="absolute -top-4 -right-4 w-14 h-14 bg-purple-400/20 dark:bg-purple-500/15 rounded-full blur-xl group-hover/stat:bg-purple-400/30 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Số từ
            </span>
            <span className="text-[10px] text-purple-700 dark:text-purple-300 font-mono px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 font-bold">
              Words
            </span>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight mt-1 flex items-baseline gap-1">
            <span>{wordCount.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 font-normal">từ</span>
          </div>
        </div>

        {/* Ô 3: Thời gian đọc */}
        <div className="relative group/stat overflow-hidden p-3 rounded-2xl stat-box-3 border hover:border-amber-400 shadow-md transition-all">
          <div className="absolute -top-4 -right-4 w-14 h-14 bg-amber-400/20 dark:bg-amber-500/15 rounded-full blur-xl group-hover/stat:bg-amber-400/30 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
              Thời gian
            </span>
            <span className="text-[10px] text-amber-800 dark:text-amber-300 font-mono px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 font-bold">
              Ước tính
            </span>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-amber-800 dark:text-amber-300 font-mono tracking-tight mt-1 flex items-baseline gap-1">
            <span>~{formatDuration(estimatedSeconds)}</span>
            <span className="text-[10px] text-slate-500 font-normal">phút:giây</span>
          </div>
        </div>
      </div>

      {/* Main Textarea Container */}
      <div className="relative group rounded-2xl editor-box border focus-within:border-pink-500/80 focus-within:ring-2 focus-within:ring-pink-500/20 transition-all shadow-inner">
        <textarea
          rows={6}
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder="Nhập hoặc dán bất kỳ văn bản nào vào đây để chuyển thành giọng nói AI... (Hỗ trợ truyện dài, kịch bản phim, review, video ngắn không giới hạn số từ!)"
          className="w-full p-4 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm md:text-base leading-relaxed resize-y focus:outline-none min-h-[160px]"
        />

        {/* Action icons bar inside textarea */}
        <div className="flex items-center justify-between px-3 py-2 border-t editor-action-bar rounded-b-2xl">
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
              title="Xóa nội dung"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sample Scripts Carousel */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-300">
            <Wand2 className="w-3.5 h-3.5 text-pink-400" />
            Mẫu kịch bản TikTok có sẵn:
          </span>
          <span className="text-[10px] text-slate-500">Bấm để dùng nhanh</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
          {SAMPLE_TEXTS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => applySample(sample)}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-xs transition-all flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
              <span className="font-semibold">{sample.title}</span>
              <span className="text-[10px] text-slate-500 hidden sm:inline">({sample.category})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Generate Button */}
      <button
        onClick={onGenerate}
        disabled={isLoading || !text.trim()}
        className="w-full py-4 px-6 rounded-2xl font-bold text-base md:text-lg transition-all duration-200 flex items-center justify-center gap-2.5 shadow-xl disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:via-rose-600 hover:to-amber-600 text-white shadow-pink-500/25 active:scale-[0.99]"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Đang Tổng Hợp Giọng Nói AI...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-yellow-200 animate-bounce" />
            <span>Tạo Giọng Nói Ngay (Không Giới Hạn)</span>
            <Send className="w-4 h-4 ml-1 opacity-80" />
          </>
        )}
      </button>
    </div>
  );
};
