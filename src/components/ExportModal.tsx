import React, { useState } from 'react';
import {
  X,
  Download,
  FileAudio,
  CheckCircle2,
  Sparkles,
  Loader2,
  Sliders,
  Check,
  HardDrive,
} from 'lucide-react';
import { AudioSettings } from '../types/tts';
import { renderProcessedAudioWav } from '../utils/audioDsp';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioBuffer: AudioBuffer | null;
  settings: AudioSettings;
  presetName: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  audioBuffer,
  settings,
  presetName,
}) => {
  const [sampleRate, setSampleRate] = useState<number>(48000);
  const [fileName, setFileName] = useState<string>(() => {
    const dateStr = new Date().toISOString().slice(0, 10);
    return `tiktok-em-be-${dateStr}`;
  });
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen || !audioBuffer) return null;

  const rate = Math.max(0.2, Math.min(4.0, settings.speed * Math.pow(2, settings.pitch / 12)));
  const effectiveDuration = audioBuffer.duration / rate;

  // Approximate WAV file size: (sampleRate * 2 channels * 2 bytesPerSample * seconds) + 44 bytes
  const estimatedBytes = Math.round(sampleRate * 2 * 2 * effectiveDuration) + 44;
  const estimatedMb = (estimatedBytes / (1024 * 1024)).toFixed(2);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setDownloadSuccess(false);

      // Render audio with OfflineAudioContext applying all DSP parameters
      const blob = await renderProcessedAudioWav(audioBuffer, settings, sampleRate);

      // Trigger browser download
      const cleanName = fileName.trim().replace(/[^\w\d-_]/gi, '_') || 'tiktok-em-be';
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${cleanName}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Release object URL after small timeout
      setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
      }, 5000);

      setDownloadSuccess(true);
    } catch (err) {
      console.error('Lỗi khi xuất âm thanh:', err);
      alert('Không thể xuất file âm thanh. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileAudio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Xuất File Âm Thanh Chất Lượng Cao
              </h3>
              <p className="text-xs text-slate-400">
                Lossless WAV • Tương thích 100% với CapCut, Premiere, TikTok
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-5 space-y-4 text-xs">
          {/* File Name */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center justify-between">
              <span>Tên file âm thanh tải về:</span>
              <span className="text-slate-500 text-[11px]">Định dạng: .WAV Lossless</span>
            </label>
            <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-slate-100 focus-within:border-cyan-500">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="tiktok-em-be"
                className="w-full bg-transparent focus:outline-none font-mono text-xs"
              />
              <span className="text-cyan-400 font-mono font-bold">.wav</span>
            </div>
          </div>

          {/* Quality selection */}
          <div className="space-y-2">
            <label className="text-slate-300 font-semibold">Chọn chất lượng âm thanh xuất:</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSampleRate(48000)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  sampleRate === 48000
                    ? 'bg-cyan-950/40 border-cyan-500 text-cyan-100 ring-1 ring-cyan-500/50'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-white">48,000 Hz (48kHz)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-semibold">
                    Studio Master
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Chuẩn tối ưu nhất cho video CapCut, Premiere, TikTok HD.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSampleRate(44100)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  sampleRate === 44100
                    ? 'bg-cyan-950/40 border-cyan-500 text-cyan-100 ring-1 ring-cyan-500/50'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-white">44,100 Hz (44.1kHz)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-semibold">
                    CD Standard
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Chuẩn âm thanh đĩa CD phổ biến, tương thích mọi thiết bị.
                </p>
              </button>
            </div>
          </div>

          {/* BGM Mix Option */}
          {settings.bgm.enabled && (
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block text-xs">Hòa âm cùng nhạc nền (BGM Mix):</span>
                <span className="text-[11px] text-slate-400">
                  {settings.exportWithBgm ? 'Bật: Xuất file gồm giọng em bé hòa âm nhạc nền Auto-Ducking' : 'Tắt: Chỉ xuất riêng giọng nói (Vocal Stem)'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  settings.exportWithBgm = !settings.exportWithBgm;
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  settings.exportWithBgm
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {settings.exportWithBgm ? 'Hòa âm BGM (Đang Bật)' : 'Chỉ Giọng (Tắt BGM)'}
              </button>
            </div>
          )}

          {/* Audio Specs Summary Box */}
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800/80 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Thông số kỹ thuật file xuất:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Thời lượng:</span>
                <span className="font-mono text-cyan-300 font-bold">
                  {formatDuration(effectiveDuration)}
                </span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Định dạng:</span>
                <span className="font-mono text-slate-200 font-bold">WAV 16-bit PCM</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Kênh âm thanh:</span>
                <span className="font-mono text-slate-200 font-bold">2 Kênh (Stereo)</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Dung lượng ước tính:</span>
                <span className="font-mono text-pink-400 font-bold">~{estimatedMb} MB</span>
              </div>
            </div>

            <div className="pt-1 flex flex-col gap-1 text-[11px] text-emerald-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>EQ 5 Băng tần + Giọng mộc chuẩn phòng thu (Dry Voice, Không vang vọng) + De-Esser.</span>
              </div>
              {settings.normalization.enabled && (
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Chuẩn hóa âm lượng True-Peak: {settings.normalization.targetPeakDb} dBFS (Chống vỡ tiếng tuyệt đối).</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Đóng
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 via-blue-600 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white shadow-xl shadow-cyan-500/25 transition-all active:scale-95 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang render âm thanh HD...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Đã Tải Xuống! (Nhấn để tải lại)</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Tải File Âm Thanh (.WAV)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
