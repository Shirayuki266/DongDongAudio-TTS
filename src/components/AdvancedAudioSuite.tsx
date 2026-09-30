import React, { useState, useRef } from 'react';
import {
  AudioSettings,
  EqualizerBands,
  ReverbType,
  ReverbSettings,
  BgmSettings,
  NormalizationSettings,
} from '../types/tts';
import { BUILT_IN_BGM_TRACKS, decodeCustomBgmFile } from '../utils/bgmSynthesizer';
import {
  SlidersHorizontal,
  Music,
  Maximize2,
  Volume2,
  VolumeX,
  Upload,
  Sparkles,
  Check,
  RotateCcw,
  ShieldCheck,
  Disc,
  Radio,
  FileAudio,
  CheckCircle2,
} from 'lucide-react';

interface AdvancedAudioSuiteProps {
  settings: AudioSettings;
  onChangeSettings: (settings: AudioSettings) => void;
  onApplyChanges: () => void;
}

type SuiteTab = 'eq' | 'bgm' | 'normalization';

export const AdvancedAudioSuite: React.FC<AdvancedAudioSuiteProps> = ({
  settings,
  onChangeSettings,
  onApplyChanges,
}) => {
  const [activeTab, setActiveTab] = useState<SuiteTab>('eq');
  const [isUploadingBgm, setIsUploadingBgm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // EQ Helpers
  const updateEqBand = (band: keyof EqualizerBands, value: number) => {
    const updated = {
      ...settings,
      equalizer: {
        ...settings.equalizer,
        [band]: value,
      },
    };
    onChangeSettings(updated);
  };

  const applyEqPreset = (preset: EqualizerBands) => {
    onChangeSettings({
      ...settings,
      equalizer: { ...preset },
    });
  };

  // BGM Helpers
  const updateBgm = (fields: Partial<BgmSettings>) => {
    onChangeSettings({
      ...settings,
      bgm: {
        ...settings.bgm,
        ...fields,
      },
    });
  };

  // Normalization Helpers
  const updateNormalization = (fields: Partial<NormalizationSettings>) => {
    onChangeSettings({
      ...settings,
      normalization: {
        ...settings.normalization,
        ...fields,
      },
    });
  };

  // Custom BGM file handler
  const handleCustomBgmUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingBgm(true);
      const decoded = await decodeCustomBgmFile(file);
      updateBgm({
        enabled: true,
        trackId: 'custom',
        customTrackName: file.name,
        customBuffer: decoded,
      });
    } catch (err) {
      console.error('Lỗi giải mã file nhạc:', err);
      alert('Không thể đọc file nhạc này. Vui lòng chọn file MP3 hoặc WAV khác.');
    } finally {
      setIsUploadingBgm(false);
    }
  };

  // Visual EQ Curve representation
  const renderEqCurve = () => {
    const { f60, f250, f1k, f4k, f12k } = settings.equalizer;
    const width = 360;
    const height = 90;
    const zeroY = height / 2;
    const scale = (height / 2) / 14; // 14dB max

    const p1 = { x: 30, y: zeroY - f60 * scale };
    const p2 = { x: 105, y: zeroY - f250 * scale };
    const p3 = { x: 180, y: zeroY - f1k * scale };
    const p4 = { x: 255, y: zeroY - f4k * scale };
    const p5 = { x: 330, y: zeroY - f12k * scale };

    const pathData = `M 0,${p1.y} C ${p1.x},${p1.y} ${p2.x - 30},${p2.y} ${p2.x},${p2.y} C ${p2.x + 30},${p2.y} ${p3.x - 30},${p3.y} ${p3.x},${p3.y} C ${p3.x + 30},${p3.y} ${p4.x - 30},${p4.y} ${p4.x},${p4.y} C ${p4.x + 30},${p4.y} ${p5.x},${p5.y} ${width},${p5.y}`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 rounded-xl bg-slate-950/80 border border-slate-800">
        <line x1="0" y1={zeroY} x2={width} y2={zeroY} stroke="rgba(100, 116, 139, 0.3)" strokeDasharray="3 3" />
        <path d={pathData} fill="none" stroke="url(#eq-gradient)" strokeWidth="3" />
        <path d={`${pathData} L ${width},${height} L 0,${height} Z`} fill="url(#eq-area-gradient)" opacity="0.25" />

        {[p1, p2, p3, p4, p5].map((pt, i) => (
          <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
        ))}

        <defs>
          <linearGradient id="eq-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="eq-area-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-2xl space-y-5">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30">
            <SlidersHorizontal className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Bộ Xử Lý Âm Thanh Nâng Cao (Audio Studio Suite)
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold font-mono">
                PRO DSP
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Equalizer 5 băng tần, Giọng mộc rõ chữ (Không vang), Lồng nhạc nền Auto-Ducking & Chuẩn hóa âm lượng
            </p>
          </div>
        </div>

        {/* Global Save / Preview Button */}
        <button
          onClick={onApplyChanges}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 active:scale-95 self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Nghe Thử Hòa Âm</span>
        </button>
      </div>

      {/* Navigation Tabs (EQ, BGM, Normalization) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          onClick={() => setActiveTab('eq')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'eq'
              ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white border-pink-500 shadow-md'
              : 'bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Equalizer (EQ 5 Băng Tần)</span>
        </button>

        <button
          onClick={() => setActiveTab('bgm')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border relative ${
            activeTab === 'bgm'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-500 shadow-md'
              : 'bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Nhạc Nền (BGM & Auto-Ducking)</span>
          {settings.bgm.enabled && (
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse absolute top-2 right-2"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('normalization')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'normalization'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-md'
              : 'bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Chuẩn Hóa Âm (Mastering)</span>
        </button>
      </div>

      {/* TAB 1: 5-BAND EQUALIZER */}
      {activeTab === 'eq' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Biểu Đồ Đáp Tuyến Tần Số (Frequency Response):</span>
            <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
              <span>60Hz</span> • <span>250Hz</span> • <span>1kHz</span> • <span>4kHz</span> • <span>12kHz</span>
            </div>
          </div>

          {/* Interactive visual SVG curve */}
          {renderEqCurve()}

          {/* 5 Band Sliders */}
          <div className="grid grid-cols-5 gap-2 sm:gap-3 pt-2">
            {[
              { key: 'f60', label: '60 Hz', role: 'Sub Bass', desc: 'Âm siêu trầm' },
              { key: 'f250', label: '250 Hz', role: 'Low-Mid', desc: 'Độ ấm dày' },
              { key: 'f1k', label: '1 kHz', role: 'Mid', desc: 'Thân giọng' },
              { key: 'f4k', label: '4 kHz', role: 'Presence', desc: 'Sáng em bé' },
              { key: 'f12k', label: '12 kHz', role: 'Air', desc: 'Bén & long lanh' },
            ].map((band) => {
              const val = settings.equalizer[band.key as keyof EqualizerBands];
              return (
                <div key={band.key} className="flex flex-col items-center p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-center">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">
                    {val > 0 ? `+${val}` : val} dB
                  </span>

                  <input
                    type="range"
                    min={-12}
                    max={12}
                    step={1}
                    value={val}
                    onChange={(e) => updateEqBand(band.key as keyof EqualizerBands, parseInt(e.target.value, 10))}
                    className="w-full h-24 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 [writing-mode:bt-lr] [-webkit-appearance:slider-vertical]"
                  />

                  <div className="pt-1">
                    <span className="text-xs font-bold text-slate-200 block">{band.label}</span>
                    <span className="text-[9px] text-slate-500 block leading-tight">{band.role}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick EQ Presets */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-xs font-semibold text-slate-400 block mb-2">Preset EQ chuẩn sẵn có:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { name: '👶 Em Bé Sáng Rõ', preset: { f60: -4, f250: -1, f1k: 2, f4k: 4, f12k: 3 } },
                { name: '🧚‍♀️ Kể Chuyện Ấm Áp', preset: { f60: -2, f250: 3, f1k: 1, f4k: 2, f12k: 1 } },
                { name: '🔥 TikTok Viral Boost', preset: { f60: -6, f250: -2, f1k: 3, f4k: 5, f12k: 4 } },
                { name: '📻 Lo-Fi Radio', preset: { f60: -10, f250: 2, f1k: 4, f4k: -2, f12k: -8 } },
                { name: '⚖️ Cân Bằng (Flat 0dB)', preset: { f60: 0, f250: 0, f1k: 0, f4k: 0, f12k: 0 } },
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => applyEqPreset(p.preset)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-all"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BACKGROUND MUSIC (BGM) & AUTO-DUCKING */}
      {activeTab === 'bgm' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Main BGM Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/40">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-white block">Lồng Nhạc Nền Khi Phát & Xuất File</span>
                <span className="text-xs text-slate-400">
                  Tự động hòa âm bản nhạc nền phù hợp với giọng em bé
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.bgm.enabled}
                onChange={(e) => updateBgm({ enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          {/* Built-in Tracks Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Bộ nhạc nền bản quyền miễn phí tích hợp:</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploadingBgm ? 'Đang đọc file...' : 'Tải nhạc từ máy của bạn (.mp3/.wav)'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleCustomBgmUpload}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {BUILT_IN_BGM_TRACKS.map((track) => {
                const isSelected = settings.bgm.trackId === track.id && settings.bgm.enabled;
                return (
                  <button
                    key={track.id}
                    onClick={() => updateBgm({ enabled: true, trackId: track.id })}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-lg ring-1 ring-cyan-500/50'
                        : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="text-2xl">{track.icon}</span>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-xs text-slate-200 block truncate">{track.name}</span>
                      <span className="text-[10px] text-slate-500 block">{track.category}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                  </button>
                );
              })}

              {/* Custom Track Card if present */}
              {settings.bgm.customTrackName && (
                <button
                  onClick={() => updateBgm({ enabled: true, trackId: 'custom' })}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                    settings.bgm.trackId === 'custom' && settings.bgm.enabled
                      ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-lg'
                      : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-2xl">🎵</span>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-xs text-cyan-300 block truncate">
                      {settings.bgm.customTrackName}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Nhạc người dùng tải lên</span>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Volume & Auto-Ducking controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* BGM Volume */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  Âm lượng nhạc nền:
                </span>
                <span className="font-mono text-cyan-400 font-bold">{settings.bgm.volume}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={2}
                value={settings.bgm.volume}
                onChange={(e) => updateBgm({ volume: parseInt(e.target.value, 10) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[10px] text-slate-500 block">Khuyến nghị 18% - 25% để lời đọc rõ ràng</span>
            </div>

            {/* Auto Ducking Sidechain */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Tự động giảm nhạc khi em bé nói (Auto-Ducking):</span>
                <input
                  type="checkbox"
                  checked={settings.bgm.autoDucking}
                  onChange={(e) => updateBgm({ autoDucking: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-0 w-4 h-4 accent-cyan-500 cursor-pointer"
                />
              </div>

              {settings.bgm.autoDucking && (
                <div className="pt-1 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Mức hạ âm lượng khi đọc:</span>
                    <span className="font-mono text-cyan-300 font-bold">
                      {Math.round((1 - settings.bgm.duckingAmount) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={0.6}
                    step={0.05}
                    value={settings.bgm.duckingAmount}
                    onChange={(e) => updateBgm({ duckingAmount: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Chuẩn âm thanh TikTok: Nhạc tự động nhỏ lại khi em bé cất giọng!
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NORMALIZATION & MASTERING */}
      {activeTab === 'normalization' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Main Normalizer Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-white block">Chuẩn Hóa Âm Lượng Tối Đa (True-Peak Normalization)</span>
                <span className="text-xs text-slate-400">
                  Tự động căn chỉnh âm lượng to rõ nhất, tuyệt đối không bị rè hay vỡ tiếng
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.normalization.enabled}
                onChange={(e) => updateNormalization({ enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Target Peak */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Đỉnh Âm Thanh Đích (Target Peak):</span>
                <span className="font-mono text-emerald-400 font-bold">{settings.normalization.targetPeakDb} dBFS</span>
              </div>
              <input
                type="range"
                min={-3.0}
                max={-0.1}
                step={0.1}
                value={settings.normalization.targetPeakDb}
                onChange={(e) => updateNormalization({ targetPeakDb: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="text-[10px] text-slate-500 block">-1.0 dBFS là chuẩn phát hành quốc tế cho TikTok & YouTube</span>
            </div>

            {/* Compressor Ratio */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Tỷ Lệ Nén (Compressor Ratio):</span>
                <span className="font-mono text-emerald-400 font-bold">{settings.normalization.compressorRatio}:1</span>
              </div>
              <input
                type="range"
                min={1.5}
                max={6.0}
                step={0.5}
                value={settings.normalization.compressorRatio}
                onChange={(e) => updateNormalization({ compressorRatio: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="text-[10px] text-slate-500 block">Kiểm soát khoảng cách giữa câu nói to và câu nói nhỏ</span>
            </div>

            {/* De-Esser & Limiter */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer">
                <span>Khử Âm Chói Tai (De-Esser):</span>
                <input
                  type="checkbox"
                  checked={settings.normalization.deEsser}
                  onChange={(e) => updateNormalization({ deEsser: e.target.checked })}
                  className="rounded text-emerald-500 w-4 h-4 accent-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer">
                <span>Chống Vỡ Tiếng (Brickwall Limiter):</span>
                <input
                  type="checkbox"
                  checked={settings.normalization.limiter}
                  onChange={(e) => updateNormalization({ limiter: e.target.checked })}
                  className="rounded text-emerald-500 w-4 h-4 accent-emerald-500"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
