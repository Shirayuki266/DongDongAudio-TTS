import React from 'react';
import { Sparkles, Wand2, Music2, BookOpen, Volume2, ShieldCheck, Flame } from 'lucide-react';

interface HeaderProps {
  onOpenTips: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenTips, onOpenHistory, historyCount }) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative w-11 h-11 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-2xl shadow-xl">
              <span className="transform -rotate-6">👶</span>
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-pink-500"></span>
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-pink-400 to-rose-300 bg-clip-text text-transparent">
                TikTok Baby TTS Studio
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                <Flame className="w-3 h-3 text-pink-400 animate-pulse" />
                Viral TikTok
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Chuyển văn bản thành giọng em bé không giới hạn • Tinh chỉnh tông & tốc độ chuyên nghiệp
            </p>
          </div>
        </div>

        {/* Status badges & Quick Actions */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-slate-200">Gemini 3.8 AI Studio</span>
            <span className="text-slate-500">•</span>
            <span className="text-cyan-400 font-mono">24kHz/48kHz WAV</span>
          </div>

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-sm active:scale-95"
            title="Xem danh sách audio đã tạo"
          >
            <Music2 className="w-3.5 h-3.5 text-pink-400" />
            <span>Kho Audio</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-pink-500 text-white text-[10px] font-bold">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenTips}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-950/80 to-slate-900 hover:from-cyan-900/60 border border-cyan-500/30 hover:border-cyan-500/50 text-xs font-semibold text-cyan-300 transition-all shadow-sm active:scale-95"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mẹo CapCut / TikTok</span>
          </button>
        </div>
      </div>
    </header>
  );
};
