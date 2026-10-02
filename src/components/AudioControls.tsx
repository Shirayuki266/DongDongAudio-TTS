import React, { useState } from 'react';
import { AudioSettings } from '../types/tts';
import {
  Gauge,
  Music,
  Sliders,
  RotateCcw,
  Sparkles,
  Waves,
  Mic2,
  Volume2,
  ChevronDown,
  ChevronUp,
  BookmarkPlus,
} from 'lucide-react';

interface AudioControlsProps {
  settings: AudioSettings;
  onChangeSettings: (newSettings: AudioSettings) => void;
  onReset: () => void;
  onApplySettings: () => void;
  onOpenSaveVoice?: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  settings,
  onChangeSettings,
  onReset,
  onApplySettings,
  onOpenSaveVoice,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateSetting = <K extends keyof AudioSettings>(key: K, value: AudioSettings[K]) => {
    const updated = { ...settings, [key]: value };
    onChangeSettings(updated);
  };

  const getPitchLabel = (pitch: number) => {
    if (pitch >= 10) return '🐿️ Sóc Chuột Cartoon';
    if (pitch >= 7) return '👶 Em bé 2-3 tuổi (Siêu cute)';
    if (pitch >= 4) return '👧 Em bé TikTok Viral';
    if (pitch >= 2) return '🧒 Trẻ em 6-7 tuổi';
    if (pitch === 0) return '🎙️ Tông gốc chuẩn';
    if (pitch >= -4) return '👨 Người lớn nhẹ';
    return '👹 Trầm quái vật';
  };

  const getSpeedLabel = (speed: number) => {
    if (speed < 0.8) return 'Rất chậm';
    if (speed < 0.95) return 'Chậm rãi';
    if (speed <= 1.05) return 'Tự nhiên';
    if (speed <= 1.2) return 'TikTok Trending 🔥';
    if (speed <= 1.4) return 'Nhanh sôi nổi';
    return 'Siêu tốc';
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 space-y-5 shadow-xl">
      {/* Header and Actions */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-pink-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            3. Bộ Chỉnh Sửa Tông Giọng & Tốc Độ
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenSaveVoice && (
            <button
              onClick={onOpenSaveVoice}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 hover:text-white border border-pink-500/30 text-xs font-semibold transition-all active:scale-95 shadow-sm"
              title="Lưu lại các thông số tông giọng, tốc độ & bộ lọc đã chỉnh thành loại giọng riêng"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-pink-400" />
              <span>Lưu Giọng Này</span>
            </button>
          )}

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all active:scale-95"
            title="Đặt lại các thông số âm thanh về mặc định"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại chuẩn</span>
          </button>
        </div>
      </div>

      {/* CORE 1: TÔNG GIỌNG / ĐỘ CAO GIỌNG (PITCH SHIFT) */}
      <div className="space-y-2.5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
        <div className="flex items-center justify-between">
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Music className="w-4 h-4 text-pink-400" />
              <span>Tông giọng / Độ cao giọng (Pitch / Key)</span>
            </label>
            <p className="text-[10px] text-slate-500 mt-0.5">
              (Tông giọng & Độ cao giọng là một: chỉnh cao bổng hoặc trầm ấm theo bán cung Semitones)
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] text-pink-400 font-medium hidden sm:inline">
              {getPitchLabel(settings.pitch)}
            </span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30 font-bold">
              {settings.pitch > 0 ? `+${settings.pitch}` : settings.pitch} st
            </span>
          </div>
        </div>

        <input
          type="range"
          min={-12}
          max={12}
          step={1}
          value={settings.pitch}
          onChange={(e) => updateSetting('pitch', parseInt(e.target.value, 10))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
        />

        {/* Quick Pitch Presets */}
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
          {[
            { label: 'Gốc (0st)', value: 0 },
            { label: 'Bé Nhí (+3st)', value: 3 },
            { label: 'Bé TikTok (+5st)', value: 5 },
            { label: 'Siêu Cưng (+8st)', value: 8 },
            { label: 'Sóc Chuột (+11st)', value: 11 },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => updateSetting('pitch', item.value)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                settings.pitch === item.value
                  ? 'bg-pink-600 text-white border-pink-500 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* CORE 2: TỐC ĐỘ PHÁT (SPEED / PLAYBACK RATE) */}
      <div className="space-y-2.5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <span>Tốc độ đọc (Speed / Tempo)</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-cyan-400 font-medium">
              {getSpeedLabel(settings.speed)}
            </span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
              {settings.speed.toFixed(2)}x
            </span>
          </div>
        </div>

        <input
          type="range"
          min={0.5}
          max={2.2}
          step={0.05}
          value={settings.speed}
          onChange={(e) => updateSetting('speed', parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />

        {/* Quick Speed Presets */}
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
          {[
            { label: '0.85x Chậm', value: 0.85 },
            { label: '1.0x Chuẩn', value: 1.0 },
            { label: '1.1x TikTok Trend', value: 1.1 },
            { label: '1.25x Nhanh', value: 1.25 },
            { label: '1.4x Kể Vội', value: 1.4 },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => updateSetting('speed', item.value)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                Math.abs(settings.speed - item.value) < 0.02
                  ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ADVANCED DSP TOGGLE */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800/80 text-xs font-semibold text-slate-300 hover:text-white transition-all"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Bộ lọc âm thanh & Độ trong trẻo (Baby Formant, Bass Cut, Treble)</span>
          </div>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showAdvanced && (
          <div className="mt-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-4">
            {/* Formant Resonance */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">
                  Độ cộng hưởng giọng em bé (Baby Formant ~2.6kHz)
                </span>
                <span className="font-mono text-purple-300 text-[11px]">
                  {settings.formantBoost}/10
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={settings.formantBoost}
                onChange={(e) => updateSetting('formantBoost', parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <p className="text-[10px] text-slate-500">
                Tăng độ trong trẻo, mô phỏng kích thước vòm họng nhỏ của trẻ em
              </p>
            </div>

            {/* Bass Cut Filter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">
                  Bộ cắt âm trầm người lớn (Highpass Anti-Rumble)
                </span>
                <span className="font-mono text-purple-300 text-[11px]">{settings.bassCut}/10</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={settings.bassCut}
                onChange={(e) => updateSetting('bassCut', parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <p className="text-[10px] text-slate-500">
                Loại bỏ âm trầm ồm của người lớn để giọng nói thanh thoát tự nhiên, không bị ù
              </p>
            </div>

            {/* Treble Crisp */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Độ sắc nét & Bén tiếng (Treble Air)</span>
                <span className="font-mono text-purple-300 text-[11px]">
                  {settings.trebleCrisp}/10
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={settings.trebleCrisp}
                onChange={(e) => updateSetting('trebleCrisp', parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Volume Boost */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Âm lượng đầu ra (Volume Boost)</span>
                <span className="font-mono text-purple-300 text-[11px]">{settings.volume}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={180}
                step={5}
                value={settings.volume}
                onChange={(e) => updateSetting('volume', parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Dry speech confirmation */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Giọng mộc (Dry Voice) chuẩn studio, sạch sẽ 100%, không bị vang vọng
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
