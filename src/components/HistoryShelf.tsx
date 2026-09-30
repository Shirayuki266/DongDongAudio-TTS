import React from 'react';
import { HistoryItem, AudioSettings } from '../types/tts';
import {
  Music2,
  Play,
  Pause,
  Download,
  Trash2,
  RotateCcw,
  Sparkles,
  Clock,
  Layers,
  FileAudio,
} from 'lucide-react';

interface HistoryShelfProps {
  history: HistoryItem[];
  onPlayItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  onLoadIntoEditor: (item: HistoryItem) => void;
  activePlayingId: string | null;
}

export const HistoryShelf: React.FC<HistoryShelfProps> = ({
  history,
  onPlayItem,
  onDeleteItem,
  onClearAll,
  onLoadIntoEditor,
  activePlayingId,
}) => {
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.getHours()}:${d.getMinutes() < 10 ? '0' : ''}${d.getMinutes()} - ${d.getDate()}/${d.getMonth() + 1}`;
  };

  const downloadDirect = (item: HistoryItem) => {
    const a = document.createElement('a');
    a.href = item.audioUrl;
    a.download = `tiktok-baby-${item.id.slice(0, 6)}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (history.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 mx-auto flex items-center justify-center text-slate-500">
          <Music2 className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-300">Kho Audio Trống</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Mỗi khi bạn tạo giọng em bé mới, file âm thanh sẽ được tự động lưu vào đây để nghe lại và tải về bất cứ lúc nào!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Music2 className="w-4 h-4 text-pink-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Kho Audio Đã Tạo ({history.length})
          </h3>
        </div>

        <button
          onClick={onClearAll}
          className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
        >
          Xóa toàn bộ
        </button>
      </div>

      <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
        {history.map((item) => {
          const isItemPlaying = activePlayingId === item.id;
          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isItemPlaying
                  ? 'bg-pink-950/30 border-pink-500/60 shadow-md'
                  : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800'
              }`}
            >
              {/* Info snippet */}
              <div className="flex items-start gap-3 min-w-0">
                <button
                  onClick={() => onPlayItem(item)}
                  className={`p-3 rounded-xl flex-shrink-0 transition-all active:scale-95 ${
                    isItemPlaying
                      ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
                  }`}
                  title={isItemPlaying ? 'Dừng' : 'Nghe thử'}
                >
                  {isItemPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-xs text-white truncate">
                      {item.presetName}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      {formatTime(item.duration)}
                    </span>
                    {item.hasBgm && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                        +BGM
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-1 italic">
                    "{item.text}"
                  </p>

                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-mono">
                    <span className="text-pink-400">
                      Tông: {item.settings.pitch > 0 ? `+${item.settings.pitch}` : item.settings.pitch}st
                    </span>
                    <span>•</span>
                    <span className="text-cyan-400">Tốc độ: {item.settings.speed}x</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <button
                  onClick={() => onLoadIntoEditor(item)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
                  title="Tải lại nội dung và thông số vào bộ chỉnh sửa"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sửa tiếp</span>
                </button>

                <button
                  onClick={() => downloadDirect(item)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Tải file WAV này ngay"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Xóa đoạn này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
