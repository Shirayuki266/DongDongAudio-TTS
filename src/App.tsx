import React, { useState, useEffect, useRef } from 'react';
import { VoicePreset, AudioSettings, TtsEngine, HistoryItem, SavedCustomVoice } from './types/tts';
import { VOICE_PRESETS, DEFAULT_AUDIO_SETTINGS } from './utils/presets';
import {
  VoicePlayer,
  decodeAudio,
  extractWaveformData,
  audioBufferToWav,
} from './utils/audioDsp';
import { Header } from './components/Header';
import { VoiceSelector } from './components/VoiceSelector';
import { TextEditor } from './components/TextEditor';
import { AudioWaveform } from './components/AudioWaveform';
import { AudioControls } from './components/AudioControls';
import { SaveVoiceModal } from './components/SaveVoiceModal';
import { AudioReverseAnalysisModal } from './components/AudioReverseAnalysisModal';
import { ExportModal } from './components/ExportModal';
import { HistoryShelf } from './components/HistoryShelf';
import { TikTokTipsModal } from './components/TikTokTipsModal';
import { AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

const LOCAL_STORAGE_HISTORY_KEY = 'tiktok_baby_tts_history_v1';
const LOCAL_STORAGE_SAVED_VOICES_KEY = 'tiktok_tts_saved_custom_voices_v1';
const LOCAL_STORAGE_THEME_KEY = 'dong_dong_tts_theme_v1';

export default function App() {
  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Studio State
  const [text, setText] = useState<string>(
    'Hí lu cả nhà iu nha! Hôm nay em bé sẽ dẫn mọi người đi khám phá một điều siêu cấp đáng yêu luôn nè. Mọi người nhớ bấm tim và follow cho em bé đó nha, iu cả nhà nhiều lắm!'
  );
  const [selectedPreset, setSelectedPreset] = useState<VoicePreset>(VOICE_PRESETS[0]);
  const [selectedEngine, setSelectedEngine] = useState<TtsEngine>('gemini');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isCustomActive, setIsCustomActive] = useState<boolean>(false);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(DEFAULT_AUDIO_SETTINGS);

  // Custom Saved Voices & Reverse Analysis State
  const [savedVoices, setSavedVoices] = useState<SavedCustomVoice[]>([]);
  const [activeSavedVoiceId, setActiveSavedVoiceId] = useState<string | null>(null);
  const [isSaveVoiceModalOpen, setIsSaveVoiceModalOpen] = useState<boolean>(false);
  const [isReverseAnalysisModalOpen, setIsReverseAnalysisModalOpen] = useState<boolean>(false);

  // Audio Playback State
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [waveformPeaks, setWaveformPeaks] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isLoop, setIsLoop] = useState<boolean>(false);
  const [activeHistoryPlayingId, setActiveHistoryPlayingId] = useState<string | null>(null);

  // Loading & Modals
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isTipsModalOpen, setIsTipsModalOpen] = useState<boolean>(false);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Persistent Player ref
  const playerRef = useRef<VoicePlayer | null>(null);
  const historyPlayerRef = useRef<HTMLAudioElement | null>(null);
  const historyShelfRef = useRef<HTMLDivElement | null>(null);

  // Initialize Player
  useEffect(() => {
    const player = new VoicePlayer();
    playerRef.current = player;

    player.onTimeUpdate((curr, dur) => {
      setCurrentTime(curr);
      setDuration(dur);
    });

    player.onEnded(() => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (isLoop && playerRef.current) {
        playerRef.current.play(audioSettings, 0);
        setIsPlaying(true);
      }
    });

    // Load history, saved custom voices, and theme from localStorage
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
      const savedCustom = localStorage.getItem(LOCAL_STORAGE_SAVED_VOICES_KEY);
      if (savedCustom) {
        setSavedVoices(JSON.parse(savedCustom));
      }
      const savedTheme = (localStorage.getItem(LOCAL_STORAGE_THEME_KEY) as 'dark' | 'light') || 'dark';
      setTheme(savedTheme);
      if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      }
    } catch (e) {
      // Ignored
    }

    return () => {
      player.stop();
    };
  }, [isLoop, audioSettings]);

  // Toggle Theme Handler
  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  };

  // When preset changes, automatically calibrate the ideal pitch and speed
  const handleSelectPreset = (preset: VoicePreset) => {
    setSelectedPreset(preset);
    setActiveSavedVoiceId(null);
    setAudioSettings((prev) => ({
      ...prev,
      pitch: preset.defaultPitch,
      speed: preset.defaultSpeed,
      formantBoost: preset.defaultFormant,
    }));
  };

  // Custom Saved Voices Handlers
  const handleSaveCustomVoice = (newVoice: SavedCustomVoice) => {
    const updated = [newVoice, ...savedVoices];
    setSavedVoices(updated);
    setActiveSavedVoiceId(newVoice.id);
    localStorage.setItem(LOCAL_STORAGE_SAVED_VOICES_KEY, JSON.stringify(updated));
    setSuccessNotice(`Đã lưu loại giọng "${newVoice.name}" thành công! Xem lại tại tab "⭐ Giọng đã lưu".`);
  };

  const handleDeleteSavedVoice = (id: string) => {
    const updated = savedVoices.filter((v) => v.id !== id);
    setSavedVoices(updated);
    if (activeSavedVoiceId === id) {
      setActiveSavedVoiceId(null);
    }
    localStorage.setItem(LOCAL_STORAGE_SAVED_VOICES_KEY, JSON.stringify(updated));
  };

  const handleSelectSavedVoice = (voice: SavedCustomVoice) => {
    const basePreset = VOICE_PRESETS.find((p) => p.id === voice.basePresetId) || VOICE_PRESETS[0];
    setSelectedPreset(basePreset);
    setActiveSavedVoiceId(voice.id);

    const newSettings: AudioSettings = {
      ...audioSettings,
      pitch: voice.pitch,
      speed: voice.speed,
      formantBoost: voice.formantBoost,
      bassCut: voice.bassCut,
      trebleCrisp: voice.trebleCrisp,
      volume: voice.volume,
    };
    setAudioSettings(newSettings);

    if (voice.customPrompt) {
      setCustomPrompt(voice.customPrompt);
      setIsCustomActive(true);
    }

    if (audioBuffer && playerRef.current) {
      const newDur = playerRef.current.getDuration(newSettings);
      setDuration(newDur);
      if (isPlaying) {
        const curr = playerRef.current.getCurrentTime();
        playerRef.current.play(newSettings, curr);
      }
    }

    setSuccessNotice(`Đã áp dụng cấu hình giọng: "${voice.name}"`);
  };

  const handleApplyReverseVoice = (preset: VoicePreset, newPartialSettings: Partial<AudioSettings>) => {
    setSelectedPreset(preset);
    setActiveSavedVoiceId(null);
    const updated: AudioSettings = {
      ...audioSettings,
      ...newPartialSettings,
    };
    setAudioSettings(updated);

    if (audioBuffer && playerRef.current) {
      const newDur = playerRef.current.getDuration(updated);
      setDuration(newDur);
      if (isPlaying) {
        const curr = playerRef.current.getCurrentTime();
        playerRef.current.play(updated, curr);
      }
    }

    setSuccessNotice(`Đã phân tích và trích xuất đặc tính giọng vào studio!`);
  };

  // When audio settings change, recompute effective duration and update player
  const handleChangeSettings = (newSettings: AudioSettings) => {
    setAudioSettings(newSettings);
    if (audioBuffer && playerRef.current) {
      const newDur = playerRef.current.getDuration(newSettings);
      setDuration(newDur);

      // If already playing, seamlessly apply new settings
      if (isPlaying) {
        const curr = playerRef.current.getCurrentTime();
        playerRef.current.play(newSettings, curr);
      }
    }
  };

  // Reset audio settings to current preset defaults
  const handleResetSettings = () => {
    setAudioSettings({
      ...DEFAULT_AUDIO_SETTINGS,
      pitch: selectedPreset.defaultPitch,
      speed: selectedPreset.defaultSpeed,
      formantBoost: selectedPreset.defaultFormant,
    });
  };

  // Core TTS Generation
  const handleGenerate = async () => {
    if (!text.trim()) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);
      setSuccessNotice(null);

      // Stop any current audio
      if (playerRef.current) {
        playerRef.current.stop();
      }
      setIsPlaying(false);
      setCurrentTime(0);

      let audioBase64 = '';
      let mimeType = 'audio/wav';
      let engineUsed = selectedEngine;

      try {
        if (selectedEngine === 'gemini') {
          const res = await fetch('/api/tts/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: text.trim(),
              preset: selectedPreset.id,
              voiceName: selectedPreset.geminiVoice,
              customStyle: isCustomActive ? customPrompt : undefined,
            }),
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Gemini TTS trả về lỗi');
          }

          audioBase64 = data.audioBase64;
          mimeType = data.mimeType || 'audio/wav';
          if (data.isFallback) {
            engineUsed = 'google-fast';
            if (data.notice) {
              setSuccessNotice(data.notice);
            }
          }
        } else {
          // Fast Google fallback endpoint
          const res = await fetch('/api/tts/fallback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: text.trim(),
              lang: 'vi',
            }),
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Lỗi khi tạo âm thanh Fast HD');
          }

          audioBase64 = data.audioBase64;
          mimeType = data.mimeType || 'audio/mpeg';
        }
      } catch (primaryError: any) {
        console.log('Đang tự động chuyển sang chế độ Không Giới Hạn (Fast HD)...');
        // Automatic secondary fallback to guarantee 100% success
        const fallbackRes = await fetch('/api/tts/fallback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text.trim(),
            lang: 'vi',
          }),
        });

        const fallbackData = await fallbackRes.json();
        if (!fallbackRes.ok || !fallbackData.success) {
          throw new Error('Cả hai động cơ âm thanh đều không phản hồi. Vui lòng thử lại sau.');
        }

        audioBase64 = fallbackData.audioBase64;
        mimeType = fallbackData.mimeType || 'audio/mpeg';
        engineUsed = 'google-fast';
        setSuccessNotice('Đã chuyển sang chế độ Không Giới Hạn (Fast HD) để bảo đảm âm thanh phát liên tục.');
      }

      // Decode base64 to AudioBuffer
      const decodedBuffer = await decodeAudio(audioBase64);
      setAudioBuffer(decodedBuffer);

      // Extract waveform peaks
      const peaks = extractWaveformData(decodedBuffer, 100);
      setWaveformPeaks(peaks);

      // Set to player and start playback
      if (playerRef.current) {
        playerRef.current.setBuffer(decodedBuffer);
        playerRef.current.play(audioSettings, 0);
        setIsPlaying(true);
        setDuration(playerRef.current.getDuration(audioSettings));
      }

      // Convert to downloadable Blob and create history item
      const wavBytes = audioBufferToWav(decodedBuffer);
      const audioBlob = new Blob([wavBytes as any], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);

      const newItem: HistoryItem = {
        id: Date.now().toString(),
        text: text.trim(),
        presetName: selectedPreset.name,
        audioUrl: audioUrl,
        audioBlob: audioBlob,
        duration: decodedBuffer.duration,
        createdAt: Date.now(),
        settings: { ...audioSettings },
        fileSize: wavBytes.byteLength,
        engine: engineUsed,
        hasBgm: audioSettings.bgm.enabled,
      };

      setHistory((prev) => {
        const updated = [newItem, ...prev.slice(0, 24)];
        // Save metadata without binary blobs
        try {
          const serializable = updated.map((item) => ({
            ...item,
            audioBlob: null,
          }));
          localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(serializable));
        } catch (e) {
          // Ignored
        }
        return updated;
      });

      setSuccessNotice('Tạo giọng em bé TikTok thành công! Đang phát âm thanh.');
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err: any) {
      console.error('Lỗi khi tạo giọng nói:', err);
      // If Gemini fails, give option or auto-fallback
      setErrorMessage(
        err.message || 'Có lỗi xảy ra khi tạo giọng nói. Vui lòng thử lại hoặc chuyển sang Fast HD.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Play / Pause toggle
  const handlePlayPause = () => {
    if (!playerRef.current || !audioBuffer) return;
    if (isPlaying) {
      playerRef.current.pause();
      setIsPlaying(false);
    } else {
      playerRef.current.play(audioSettings);
      setIsPlaying(true);
    }
  };

  // Replay from start
  const handleReplay = () => {
    if (!playerRef.current || !audioBuffer) return;
    playerRef.current.play(audioSettings, 0);
    setIsPlaying(true);
  };

  // Seek position
  const handleSeek = (seconds: number) => {
    if (!playerRef.current || !audioBuffer) return;
    playerRef.current.seek(seconds, audioSettings);
    setCurrentTime(seconds);
  };

  // Loop toggle
  const handleToggleLoop = () => {
    setIsLoop(!isLoop);
  };

  // Load from history into editor
  const handleLoadIntoEditor = async (item: HistoryItem) => {
    setText(item.text);
    setAudioSettings(item.settings);
    // Find preset
    const matched = VOICE_PRESETS.find((p) => p.name === item.presetName);
    if (matched) {
      setSelectedPreset(matched);
    }

    if (item.audioUrl) {
      try {
        const response = await fetch(item.audioUrl);
        const arrayBuf = await response.arrayBuffer();
        const decoded = await decodeAudio(arrayBuf);
        setAudioBuffer(decoded);
        setWaveformPeaks(extractWaveformData(decoded, 100));

        if (playerRef.current) {
          playerRef.current.setBuffer(decoded);
          playerRef.current.play(item.settings, 0);
          setIsPlaying(true);
          setDuration(playerRef.current.getDuration(item.settings));
        }
      } catch (e) {
        // Fallback: just reload text
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // History play preview
  const handlePlayHistoryItem = (item: HistoryItem) => {
    if (activeHistoryPlayingId === item.id) {
      if (historyPlayerRef.current) {
        historyPlayerRef.current.pause();
      }
      setActiveHistoryPlayingId(null);
      return;
    }

    if (historyPlayerRef.current) {
      historyPlayerRef.current.pause();
    }

    const audio = new Audio(item.audioUrl);
    historyPlayerRef.current = audio;
    setActiveHistoryPlayingId(item.id);

    audio.onended = () => {
      setActiveHistoryPlayingId(null);
    };

    audio.play();
  };

  // Delete item from history
  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        const serializable = updated.map((item) => ({ ...item, audioBlob: null }));
        localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(serializable));
      } catch (e) {
        // Ignored
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
  };

  return (
    <div className="min-h-screen app-container flex flex-col font-sans transition-colors duration-200">
      {/* Global Header */}
      <Header
        onOpenTips={() => setIsTipsModalOpen(true)}
        onOpenHistory={() => {
          historyShelfRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
        historyCount={history.length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Studio Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 flex items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => {
                setSelectedEngine('google-fast');
                setErrorMessage(null);
              }}
              className="px-3 py-1 rounded-lg bg-rose-800 hover:bg-rose-700 text-white font-semibold flex-shrink-0"
            >
              Chuyển sang Fast HD
            </button>
          </div>
        )}

        {/* Success Alert */}
        {successNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 flex items-center gap-2 text-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* 2-Column Responsive Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Voice Selection & Text Input (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl studio-card border p-5 sm:p-6 shadow-xl space-y-6">
              {/* Step 1: Voice Selector */}
              <VoiceSelector
                selectedPreset={selectedPreset}
                onSelectPreset={handleSelectPreset}
                selectedEngine={selectedEngine}
                onChangeEngine={setSelectedEngine}
                customPrompt={customPrompt}
                onChangeCustomPrompt={setCustomPrompt}
                isCustomActive={isCustomActive}
                onToggleCustom={setIsCustomActive}
                savedVoices={savedVoices}
                activeSavedVoiceId={activeSavedVoiceId}
                onSelectSavedVoice={handleSelectSavedVoice}
                onDeleteSavedVoice={handleDeleteSavedVoice}
                onOpenSaveModal={() => setIsSaveVoiceModalOpen(true)}
                onOpenReverseAnalysis={() => setIsReverseAnalysisModalOpen(true)}
              />

              {/* Step 2: Text Editor & Scripting */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
                <TextEditor
                  text={text}
                  onChangeText={setText}
                  onGenerate={handleGenerate}
                  isLoading={isLoading}
                  onApplyPresetById={(presetId) => {
                    const found = VOICE_PRESETS.find((p) => p.id === presetId);
                    if (found) handleSelectPreset(found);
                  }}
                  selectedPreset={selectedPreset}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Audio Waveform & Pro Pitch/Speed Controls (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Waveform Player */}
            <AudioWaveform
              waveformPeaks={waveformPeaks}
              currentTime={currentTime}
              duration={duration}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onReplay={handleReplay}
              onSeek={handleSeek}
              isLoop={isLoop}
              onToggleLoop={handleToggleLoop}
              onOpenExport={() => setIsExportModalOpen(true)}
              hasAudio={Boolean(audioBuffer)}
              settings={audioSettings}
            />

            {/* Professional Speed, Pitch, & DSP Controls */}
            <AudioControls
              settings={audioSettings}
              onChangeSettings={handleChangeSettings}
              onReset={handleResetSettings}
              onOpenSaveVoice={() => setIsSaveVoiceModalOpen(true)}
              onApplySettings={() => {
                if (audioBuffer && playerRef.current) {
                  playerRef.current.play(audioSettings, 0);
                  setIsPlaying(true);
                }
              }}
            />
          </div>
        </div>

        {/* Bottom Section: History Shelf */}
        <div ref={historyShelfRef} className="pt-4">
          <HistoryShelf
            history={history}
            onPlayItem={handlePlayHistoryItem}
            onDeleteItem={handleDeleteHistoryItem}
            onClearAll={handleClearHistory}
            onLoadIntoEditor={handleLoadIntoEditor}
            activePlayingId={activeHistoryPlayingId}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Đồng Đồng TTS Studio • Chuyển văn bản thành giọng nói AI không giới hạn.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Độ phân giải: 24kHz / 48kHz WAV</span>
            <span>•</span>
            <button
              onClick={() => setIsTipsModalOpen(true)}
              className="hover:text-cyan-400 underline transition-colors"
            >
              Mẹo dựng video CapCut
            </button>
          </div>
        </div>
      </footer>

      {/* Save Custom Voice Modal */}
      <SaveVoiceModal
        isOpen={isSaveVoiceModalOpen}
        onClose={() => setIsSaveVoiceModalOpen(false)}
        selectedPreset={selectedPreset}
        settings={audioSettings}
        customPrompt={isCustomActive ? customPrompt : undefined}
        onSaveVoice={handleSaveCustomVoice}
      />

      {/* Audio Reverse Voice Analysis & Cloning Modal */}
      <AudioReverseAnalysisModal
        isOpen={isReverseAnalysisModalOpen}
        onClose={() => setIsReverseAnalysisModalOpen(false)}
        onApplyVoice={handleApplyReverseVoice}
        onSaveAsCustomVoice={handleSaveCustomVoice}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        audioBuffer={audioBuffer}
        settings={audioSettings}
        presetName={selectedPreset.name}
      />

      {/* Tips Modal */}
      <TikTokTipsModal
        isOpen={isTipsModalOpen}
        onClose={() => setIsTipsModalOpen(false)}
      />
    </div>
  );
}
