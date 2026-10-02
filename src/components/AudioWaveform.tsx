import React, { useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Repeat,
  Volume2,
  VolumeX,
  Download,
  Share2,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { AudioSettings } from '../types/tts';

interface AudioWaveformProps {
  waveformPeaks: number[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onReplay: () => void;
  onSeek: (seconds: number) => void;
  isLoop: boolean;
  onToggleLoop: () => void;
  onOpenExport: () => void;
  hasAudio: boolean;
  settings: AudioSettings;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  waveformPeaks,
  currentTime,
  duration,
  isPlaying,
  onPlayPause,
  onReplay,
  onSeek,
  isLoop,
  onToggleLoop,
  onOpenExport,
  hasAudio,
  settings,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00';
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    const ms = Math.floor((timeInSeconds % 1) * 10);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}.${ms}`;
  };

  // Draw waveform on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match display size with backing canvas resolution for Retina crispness
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.clearRect(0, 0, width, height);

    const peaks =
      waveformPeaks.length > 0
        ? waveformPeaks
        : Array.from({ length: 90 }, (_, i) => 0.15 + Math.sin(i * 0.25) * 0.08);

    const barCount = peaks.length;
    const barSpacing = 2.5;
    const totalSpacing = (barCount - 1) * barSpacing;
    const barWidth = Math.max(2, (width - totalSpacing) / barCount);

    const progress = duration > 0 ? Math.min(1.0, Math.max(0, currentTime / duration)) : 0;

    for (let i = 0; i < barCount; i++) {
      const x = i * (barWidth + barSpacing);
      const peakVal = peaks[i];
      const barHeight = Math.max(4, peakVal * (height * 0.78));
      const y = (height - barHeight) / 2;
      const barProgress = i / barCount;

      const isPlayed = barProgress <= progress;

      // Create rounded bar
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 2);

      if (isPlayed) {
        // Gradient for played portion (Neon Pink to Cyan)
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#f43f5e'); // rose-500
        gradient.addColorStop(1, '#ec4899'); // pink-500
        ctx.fillStyle = gradient;
        ctx.shadowColor = 'rgba(236, 72, 153, 0.4)';
        ctx.shadowBlur = isPlaying ? 6 : 2;
      } else {
        // Unplayed portion: lighter contrast in light mode
        const isDark = document.documentElement.classList.contains('dark');
        ctx.fillStyle = isDark ? 'rgba(71, 85, 105, 0.4)' : 'rgba(148, 163, 184, 0.55)';
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }

      ctx.fill();
    }

    // Draw active playhead needle
    if (duration > 0) {
      const needleX = progress * width;
      ctx.beginPath();
      ctx.moveTo(needleX, 0);
      ctx.lineTo(needleX, height);
      ctx.strokeStyle = '#06b6d4'; // cyan-500
      ctx.lineWidth = 2;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;
      ctx.stroke();

      // Top dot
      ctx.beginPath();
      ctx.arc(needleX, 4, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#22d3ee';
      ctx.fill();
    }
  }, [waveformPeaks, currentTime, duration, isPlaying]);

  // Handle clicking or dragging on waveform
  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasAudio || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * duration);
  };

  return (
    <div className="rounded-2xl waveform-card border p-4 sm:p-5 shadow-xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative space-y-4">
        {/* Top bar: title and export button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-500 dark:text-pink-400 border border-pink-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Trình Phát Sóng Âm Trực Quan
                {isPlaying && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping"></span>
                    LIVE DSP
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sóng âm biến đổi theo thời gian thực theo tông & tốc độ bạn chỉnh
              </p>
            </div>
          </div>

          {/* High Quality Export Button */}
          <button
            onClick={onOpenExport}
            disabled={!hasAudio}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất File WAV HD</span>
          </button>
        </div>

        {/* Interactive Waveform Canvas Container */}
        <div
          ref={containerRef}
          onClick={handleSeekClick}
          className={`relative h-28 rounded-xl waveform-canvas-box border p-2 cursor-pointer transition-all ${
            hasAudio ? 'hover:border-slate-400 dark:hover:border-slate-700' : 'opacity-40 pointer-events-none'
          }`}
          title={hasAudio ? 'Nhấp để tua đến vị trí bất kỳ' : 'Chưa có âm thanh'}
        >
          <canvas ref={canvasRef} className="w-full h-full block" />

          {!hasAudio && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 font-medium">
              Chưa có âm thanh. Nhấn "Tạo Giọng Nói Ngay" để phát sóng âm.
            </div>
          )}
        </div>

        {/* Playback Controls & Time display */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Time tracker */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-cyan-600 dark:text-cyan-400 font-bold">{formatTime(currentTime)}</span>
            <span className="text-slate-400 dark:text-slate-600">/</span>
            <span className="text-slate-600 dark:text-slate-400">{formatTime(duration)}</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 justify-center">
            {/* Replay */}
            <button
              onClick={onReplay}
              disabled={!hasAudio}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/80 disabled:opacity-30 transition-all active:scale-95"
              title="Phát lại từ đầu"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Main Play / Pause */}
            <button
              onClick={onPlayPause}
              disabled={!hasAudio}
              className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 hover:from-pink-400 hover:to-rose-300 text-white shadow-xl shadow-pink-500/30 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              title={isPlaying ? 'Tạm dừng' : 'Phát âm thanh'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Loop Toggle */}
            <button
              onClick={onToggleLoop}
              disabled={!hasAudio}
              className={`p-2.5 rounded-xl border transition-all active:scale-95 disabled:opacity-30 ${
                isLoop
                  ? 'bg-pink-100 dark:bg-pink-500/20 border-pink-300 dark:border-pink-500/40 text-pink-700 dark:text-pink-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/80'
              }`}
              title={isLoop ? 'Tắt lặp lại' : 'Lặp lại liên tục'}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Quick info badge */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono flex-wrap justify-end">
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-pink-700 dark:text-pink-300 border border-slate-200 dark:border-slate-700/80">
              {settings.pitch >= 0 ? `+${settings.pitch}` : settings.pitch} st
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-700/80">
              {settings.speed}x
            </span>
            {settings.bgm.enabled && (
              <span className="px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-700/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                BGM ({settings.bgm.volume}%)
              </span>
            )}
            {settings.normalization.enabled && (
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/60">
                NORM {settings.normalization.targetPeakDb}dB
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
