import React, { useState } from 'react';
import { VoicePreset, AudioSettings, SavedCustomVoice } from '../types/tts';
import { X, BookmarkPlus, Sparkles, Music, Gauge, Sliders, Check } from 'lucide-react';

interface SaveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPreset: VoicePreset;
  settings: AudioSettings;
  customPrompt?: string;
  onSaveVoice: (voice: SavedCustomVoice) => void;
}

export const SaveVoiceModal: React.FC<SaveVoiceModalProps> = ({
  isOpen,
  onClose,
  selectedPreset,
  settings,
  customPrompt,
  onSaveVoice,
}) => {
  const [name, setName] = useState(
    `${selectedPreset.name} (Tông ${settings.pitch >= 0 ? '+' : ''}${settings.pitch}st)`
  );
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên cho loại giọng này');
      return;
    }

    const newSavedVoice: SavedCustomVoice = {
      id: `custom_voice_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim(),
      basePresetId: selectedPreset.id,
      basePresetName: selectedPreset.name,
      basePresetIcon: selectedPreset.icon,
      pitch: settings.pitch,
      speed: settings.speed,
      formantBoost: settings.formantBoost,
      bassCut: settings.bassCut,
      trebleCrisp: settings.trebleCrisp,
      volume: settings.volume,
      customPrompt: customPrompt?.trim() || undefined,
      createdAt: Date.now(),
    };

    onSaveVoice(newSavedVoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 text-pink-400 border border-pink-500/30">
            <BookmarkPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Lưu Giọng Đã Chỉnh</h3>
            <p className="text-xs text-slate-400">
              Lưu lại thông số tông giọng & tốc độ để dùng lại bất kỳ lúc nào
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Đặt tên cho loại giọng của bạn:
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Ví dụ: Giọng Review Phim Yêu Thích, Em Bé Nũng Nịu Tông Cao..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 font-medium"
            />
            {error && <p className="text-xs text-rose-400">{error}</p>}
          </div>

          {/* Current Settings Summary Box */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Thông số sẽ được lưu:
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                <span className="text-lg">{selectedPreset.icon}</span>
                <div className="truncate">
                  <span className="text-[10px] text-slate-500 block">Giọng gốc</span>
                  <span className="font-bold text-slate-200 truncate block">
                    {selectedPreset.name}
                  </span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                <Music className="w-4 h-4 text-pink-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Tông giọng</span>
                  <span className="font-mono font-bold text-pink-300">
                    {settings.pitch > 0 ? `+${settings.pitch}` : settings.pitch} st
                  </span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Tốc độ</span>
                  <span className="font-mono font-bold text-cyan-300">
                    {settings.speed.toFixed(2)}x
                  </span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Bộ lọc</span>
                  <span className="font-mono font-bold text-purple-300">
                    F:{settings.formantBoost} B:{settings.bassCut} T:{settings.trebleCrisp}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-pink-600/30 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Lưu Loại Giọng Này</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
