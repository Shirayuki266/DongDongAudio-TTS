import React from 'react';
import { X, Sparkles, Video, FileAudio, Subtitles, Flame } from 'lucide-react';

interface TikTokTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TikTokTipsModal: React.FC<TikTokTipsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-500 border border-pink-500/20">
              <Flame className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Mẹo Tạo Video Triệu View Với Giọng Em Bé TikTok
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cách nhập file WAV vào CapCut, chèn phụ đề tự động và lên xu hướng
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-cyan-700 dark:text-cyan-400">
              <FileAudio className="w-4 h-4" />
              <span>Bước 1: Tải file âm thanh WAV HD từ app</span>
            </div>
            <p>
              Nhấn <strong>"Xuất File WAV HD"</strong> ở góc trên khung sóng âm. File tải về chuẩn 48kHz hoặc 44.1kHz Lossless, đảm bảo giữ trọn vẹn độ trong trẻo và không bị nén vỡ tiếng khi đăng lên TikTok/Reels.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-pink-700 dark:text-pink-400">
              <Video className="w-4 h-4" />
              <span>Bước 2: Kéo thả vào CapCut hoặc ứng dụng dựng video</span>
            </div>
            <p>
              Mở <strong>CapCut</strong> (trên điện thoại hoặc máy tính) ➔ Chọn <strong>Âm thanh (Audio)</strong> ➔ <strong>Đã trích xuất hoặc Từ thiết bị</strong> ➔ Chọn file <code>.wav</code> bạn vừa tải về.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-700 dark:text-emerald-400">
              <Subtitles className="w-4 h-4" />
              <span>Bước 3: Tạo phụ đề tự động (Auto Captions) bắt mắt</span>
            </div>
            <p>
              Trong CapCut, chọn <strong>Văn bản ➔ Phụ đề tự động (Auto Captions)</strong>. File phát âm cực kỳ chuẩn xác và rõ chữ từ app giúp AI của CapCut nhận diện chính xác 99% câu từ tiếng Việt mà không cần gõ lại bằng tay!
            </p>
          </div>

          {/* Pro tips */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 border border-pink-200 dark:border-pink-500/30 space-y-2">
            <span className="font-bold text-pink-700 dark:text-pink-300 text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-pink-500 dark:text-pink-400" />
              Bí quyết để giọng em bé đạt viral cao nhất:
            </span>
            <ul className="space-y-1.5 list-disc list-inside text-slate-700 dark:text-slate-300">
              <li>
                <strong>Tông giọng khuyến nghị:</strong> Đặt tông từ <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-pink-200 dark:border-pink-500/30">+4st</code> đến <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-pink-200 dark:border-pink-500/30">+6st</code> để đạt chuẩn độ nhí nhảnh của em bé TikTok.
              </li>
              <li>
                <strong>Tốc độ nói:</strong> Tăng nhẹ lên <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-pink-200 dark:border-pink-500/30">1.08x - 1.15x</code> giúp video cuốn hút, giữ chân người xem không lướt qua.
              </li>
              <li>
                <strong>Chèn tiếng cười:</strong> Dùng nút chèn <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-pink-200 dark:border-pink-500/30">[cười]</code> hoặc <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-pink-200 dark:border-pink-500/30">[nghỉ 0.5s]</code> ở các đoạn hài hước để tăng độ chân thật.
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-pink-600 hover:bg-pink-500 text-white transition-all shadow-md shadow-pink-500/20 active:scale-95"
          >
            Đã Hiểu, Bắt Đầu Tạo Ngay!
          </button>
        </div>
      </div>
    </div>
  );
};
