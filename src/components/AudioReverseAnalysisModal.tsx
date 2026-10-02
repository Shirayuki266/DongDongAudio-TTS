import React, { useState, useRef } from 'react';
import { analyzeAudioVoice, VoiceAnalysisResult } from '../utils/voiceAnalyzer';
import { VoicePreset, AudioSettings, SavedCustomVoice } from '../types/tts';
import {
  X,
  Upload,
  Mic,
  Square,
  Sparkles,
  Music,
  Gauge,
  Sliders,
  Check,
  Loader2,
  FileAudio,
  Radio,
  Flame,
  ArrowRight,
  BookmarkPlus,
  Play,
  Pause,
} from 'lucide-react';

interface AudioReverseAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyVoice: (preset: VoicePreset, settings: Partial<AudioSettings>) => void;
  onSaveAsCustomVoice: (voice: SavedCustomVoice) => void;
}

export const AudioReverseAnalysisModal: React.FC<AudioReverseAnalysisModalProps> = ({
  isOpen,
  onClose,
  onApplyVoice,
  onSaveAsCustomVoice,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VoiceAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Audio preview playback
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Custom name for saving
  const [customVoiceName, setCustomVoiceName] = useState('');

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    setError(null);
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setAudioUrl(url);

    runAnalysis(selectedFile);
  };

  const runAnalysis = async (audioBlob: Blob | File) => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // Simulate nice AI scanning cadence
      const result = await analyzeAudioVoice(audioBlob);
      setAnalysisResult(result);
      setCustomVoiceName(`Giọng phân tích: ${result.matchedPreset.name} (${result.suggestedPitch >= 0 ? '+' : ''}${result.suggestedPitch}st)`);
    } catch (err: unknown) {
      console.error(err);
      setError('Không thể phân tích file âm thanh này. Vui lòng thử file WAV hoặc MP3 rõ giọng nói hơn!');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Start Mic Recording
  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const recordFile = new File([blob], 'recording.webm', { type: 'audio/webm' });
        setFile(recordFile);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        runAnalysis(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 15) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      setError('Không thể truy cập Microphone. Vui lòng cấp quyền micro cho trình duyệt!');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleApply = () => {
    if (!analysisResult) return;
    onApplyVoice(analysisResult.matchedPreset, {
      pitch: analysisResult.suggestedPitch,
      speed: analysisResult.suggestedSpeed,
      formantBoost: analysisResult.suggestedFormantBoost,
      bassCut: analysisResult.suggestedBassCut,
      trebleCrisp: analysisResult.suggestedTrebleCrisp,
    });
    onClose();
  };

  const handleSaveAsVoice = () => {
    if (!analysisResult) return;
    const newSavedVoice: SavedCustomVoice = {
      id: `cloned_voice_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: customVoiceName.trim() || `Giọng Audio ${analysisResult.detectedPitchHz}Hz`,
      basePresetId: analysisResult.matchedPreset.id,
      basePresetName: analysisResult.matchedPreset.name,
      basePresetIcon: analysisResult.matchedPreset.icon,
      pitch: analysisResult.suggestedPitch,
      speed: analysisResult.suggestedSpeed,
      formantBoost: analysisResult.suggestedFormantBoost,
      bassCut: analysisResult.suggestedBassCut,
      trebleCrisp: analysisResult.suggestedTrebleCrisp,
      volume: 100,
      createdAt: Date.now(),
    };

    onSaveAsCustomVoice(newSavedVoice);
    handleApply();
  };

  const togglePlayPreview = () => {
    if (!audioUrl) return;
    if (!audioPreviewRef.current) {
      audioPreviewRef.current = new Audio(audioUrl);
      audioPreviewRef.current.onended = () => setIsPlayingPreview(false);
    }
    if (isPlayingPreview) {
      audioPreviewRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPreviewRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  const resetState = () => {
    if (audioPreviewRef.current) audioPreviewRef.current.pause();
    setFile(null);
    setAudioUrl(null);
    setAnalysisResult(null);
    setError(null);
    setIsPlayingPreview(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-900 dark:text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-cyan-500/20 text-pink-500 dark:text-pink-400 border border-pink-500/30">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Phân Tích Ngược Giọng Từ Audio</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:text-pink-300 border border-pink-500/20 dark:border-pink-500/30 font-bold">
                Reverse Clone
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tải file âm thanh mẫu để AI phân tích tông giọng, tốc độ & tìm giọng tương đồng
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* UPLOAD / RECORD BOX (When no analysis yet) */}
        {!analysisResult && !isAnalyzing && (
          <div className="space-y-3.5">
            {/* Drag & Drop Area */}
            <label className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-pink-500/80 rounded-2xl bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-950 cursor-pointer transition-all group">
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-pink-500 dark:text-pink-400" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-2.5">
                Chọn file âm thanh hoặc kéo thả vào đây
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Hỗ trợ MP3, WAV, M4A, AAC, OGG (video TikTok tách tiếng)
              </p>
            </label>

            {/* OR Mic Recording */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-cyan-600 dark:text-cyan-400">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Ghi âm trực tiếp bằng Micro
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Nói 3-5 giây để AI phân tích tông giọng của bạn
                  </span>
                </div>
              </div>

              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Bắt đầu thu</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all animate-pulse"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Dừng ({recordingSeconds}s)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* LOADING ANIMATION */}
        {isAnalyzing && (
          <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-pink-500 dark:text-pink-400 animate-spin mx-auto" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Đang Quét Phổ Tần Số & Phân Tích Giọng...</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Đo lường tần số F0 (cao - trầm), trích xuất nhịp điệu nói và độ sáng vòm họng...
            </p>
          </div>
        )}

        {/* ANALYSIS RESULTS CARD */}
        {analysisResult && (
          <div className="space-y-3.5 animate-in fade-in">
            {/* Matched Voice Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 via-purple-50 to-slate-50 dark:from-pink-950/40 dark:via-purple-950/30 dark:to-slate-950 border border-pink-200 dark:border-pink-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Kết Quả Phân Tích Khớp {analysisResult.confidence}%
                </span>

                {audioUrl && (
                  <button
                    onClick={togglePlayPreview}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold"
                  >
                    {isPlayingPreview ? (
                      <>
                        <Pause className="w-3 h-3 text-pink-500 dark:text-pink-400" />
                        <span>Tạm dừng</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 text-pink-500 dark:text-pink-400" />
                        <span>Nghe audio gốc</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  {analysisResult.matchedPreset.icon}
                </span>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Giọng gốc đề xuất phù hợp nhất:</div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{analysisResult.matchedPreset.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-500/30 font-bold">
                      {analysisResult.matchedPreset.provider}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                    {analysisResult.vocalProfileName}
                  </p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                    <Music className="w-3 h-3 text-pink-500 dark:text-pink-400" />
                    Tông giọng
                  </div>
                  <div className="font-mono font-bold text-pink-600 dark:text-pink-300 mt-0.5 text-sm">
                    {analysisResult.suggestedPitch >= 0
                      ? `+${analysisResult.suggestedPitch}`
                      : analysisResult.suggestedPitch}{' '}
                    st
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    ~{analysisResult.detectedPitchHz} Hz
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                    <Gauge className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                    Tốc độ nói
                  </div>
                  <div className="font-mono font-bold text-cyan-600 dark:text-cyan-300 mt-0.5 text-sm">
                    {analysisResult.suggestedSpeed.toFixed(2)}x
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {analysisResult.suggestedSpeed >= 1.1
                      ? 'Nhanh sôi nổi'
                      : analysisResult.suggestedSpeed <= 0.95
                      ? 'Thư giãn chậm'
                      : 'Nhịp chuẩn'}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                    <Sliders className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    Độ sáng Formant
                  </div>
                  <div className="font-mono font-bold text-purple-600 dark:text-purple-300 mt-0.5 text-sm">
                    {analysisResult.suggestedFormantBoost}/10
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {analysisResult.detectedGender === 'child'
                      ? 'Em bé vòm cao'
                      : analysisResult.detectedGender === 'female'
                      ? 'Nữ thanh mảnh'
                      : 'Nam trầm'}
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Name for Saving */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <BookmarkPlus className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400" />
                <span>Đặt tên để lưu loại giọng này:</span>
              </label>
              <input
                type="text"
                value={customVoiceName}
                onChange={(e) => setCustomVoiceName(e.target.value)}
                placeholder="Ví dụ: Giọng Sao Chép Từ Video TikTok..."
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500 font-medium"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
              <button
                type="button"
                onClick={resetState}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
              >
                Phân tích file khác
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleApply}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs transition-all border border-slate-300 dark:border-slate-700"
                >
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Áp Dụng Thử</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAsVoice}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-pink-600/30 active:scale-95"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  <span>Lưu & Sử Dụng Ngay</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
