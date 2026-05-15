'use client';

import { useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward,
  X, Download, Volume2, VolumeX,
  ChevronDown
} from 'lucide-react';
import { usePlayerStore } from '@/lib/stores/player-store';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { api } from '@/lib/api';
import { formatTime } from '@/lib/music-utils';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';

export function FullPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    lyrics,
    currentLyricIndex,
    showFullPlayer,
    isLoading,
    togglePlay,
    playNext,
    playPrev,
    seek,
    setVolume,
    toggleMute,
    setShowFullPlayer,
  } = usePlayerStore();

  const { showLyrics, lyricsFontSize } = useSettingsStore();
  const progressRef = useRef<HTMLDivElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seek(percent * duration);
  }, [duration, seek]);

  // Auto scroll lyrics
  useEffect(() => {
    if (!lyricsContainerRef.current || currentLyricIndex < 0) return;
    const container = lyricsContainerRef.current;
    const activeLine = container.querySelector(`[data-lyric-index="${currentLyricIndex}"]`);
    if (activeLine) {
      activeLine.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentLyricIndex]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const coverUrl = useMemo(() => currentSong?.pic || '/logo.png', [currentSong?.pic]);

  const handleDownload = useCallback(async () => {
    if (!currentSong) return;
    const { downloadQuality } = useSettingsStore.getState();
    try {
      await api.downloadSong(currentSong.id, downloadQuality);
    } catch (err) {
      console.error('Download failed:', err);
    }
  }, [currentSong]);

  return (
    <AnimatePresence>
      {showFullPlayer && currentSong && (
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-[100] flex flex-col"
        >
          {/* Blurred background */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center scale-150 blur-[80px] opacity-30"
              style={{ backgroundImage: `url(${coverUrl})` }}
            />
            <div className="absolute inset-0 bg-black/70" />
          </div>

          {/* Content */}
          <div className="relative flex flex-col h-full max-w-lg mx-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-12 pb-2 md:pt-8">
              <button
                onClick={() => setShowFullPlayer(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full text-white/70 hover:text-white transition-colors"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
              <div className="text-center">
                <p className="text-[11px] text-gold uppercase tracking-widest font-medium">正在播放</p>
              </div>
              <button
                onClick={handleDownload}
                className="w-10 h-10 flex items-center justify-center rounded-full text-white/70 hover:text-gold transition-colors"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>

            {/* Cover art & Lyrics area */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 overflow-hidden">
              {/* Cover Art */}
              {!showLyrics ? (
                <motion.div
                  className="relative"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className={`w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden shadow-2xl ${isPlaying ? 'animate-spin-slow' : 'animate-spin-slow paused'}`}>
                    <img
                      src={coverUrl}
                      alt={currentSong.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.png';
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 rounded-full gold-glow-lg pointer-events-none" />
                  {/* Center hole */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-black border-4 border-surface" />
                </motion.div>
              ) : (
                /* Lyrics Display */
                <div ref={lyricsContainerRef} className="w-full h-64 sm:h-72 overflow-hidden">
                  <div className="h-full flex flex-col items-center justify-center">
                    {lyrics.length === 0 ? (
                      <p className="text-muted-foreground text-sm">暂无歌词</p>
                    ) : (
                      <div className="space-y-4 py-32">
                        {lyrics.map((line, i) => (
                          <div
                            key={i}
                            data-lyric-index={i}
                            className={`text-center transition-all duration-300 ${
                              i === currentLyricIndex
                                ? 'text-white scale-105'
                                : 'text-muted-foreground/50 scale-100'
                            }`}
                            style={{ fontSize: `${lyricsFontSize}px` }}
                          >
                            <p className="leading-relaxed">{line.text}</p>
                            {line.translation && (
                              <p className="text-gold/60 mt-1" style={{ fontSize: `${Math.max(lyricsFontSize - 3, 11)}px` }}>
                                {line.translation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Song Info */}
              <div className="text-center w-full max-w-sm">
                <h2 className="text-xl font-bold text-white truncate">
                  {currentSong.name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1 truncate">
                  {currentSong.ar_name} · {currentSong.al_name}
                </p>
                {currentSong.level && (
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-gold/10 text-gold text-[11px] font-medium border border-gold/20">
                    {currentSong.level}
                  </span>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="px-6 pb-12 md:pb-8 space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <div
                  ref={progressRef}
                  onClick={handleProgressClick}
                  className="h-2 w-full cursor-pointer group relative rounded-full overflow-hidden bg-surface-hover"
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-gold rounded-full transition-[width] duration-100"
                    style={{ width: `${progress}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-gold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity gold-glow-sm"
                    style={{ left: `calc(${progress}% - 7px)` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Playback buttons */}
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={playPrev}
                  className="w-12 h-12 flex items-center justify-center rounded-full text-white/70 hover:text-gold transition-colors"
                >
                  <SkipBack className="w-6 h-6" fill="currentColor" />
                </button>

                <button
                  onClick={togglePlay}
                  disabled={isLoading}
                  className="w-16 h-16 rounded-full bg-gold flex items-center justify-center text-black hover:bg-gold-light transition-all gold-glow-lg"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-7 h-7" fill="black" />
                  ) : (
                    <Play className="w-7 h-7 ml-1" fill="black" />
                  )}
                </button>

                <button
                  onClick={playNext}
                  className="w-12 h-12 flex items-center justify-center rounded-full text-white/70 hover:text-gold transition-colors"
                >
                  <SkipForward className="w-6 h-6" fill="currentColor" />
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3 px-4">
                <button
                  onClick={toggleMute}
                  className="text-muted-foreground hover:text-gold transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  max={100}
                  step={1}
                  className="flex-1"
                  onValueChange={(val) => {
                    const v = val[0] / 100;
                    setVolume(v);
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
