'use client';

import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward,
  ChevronUp, Volume2, VolumeX
} from 'lucide-react';
import { usePlayerStore } from '@/lib/stores/player-store';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { formatTime } from '@/lib/music-utils';
import { Slider } from '@/components/ui/slider';

export function MiniPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    playNext,
    playPrev,
    seek,
    setShowFullPlayer,
    setVolume,
    toggleMute,
  } = usePlayerStore();

  const progressRef = useRef<HTMLDivElement>(null);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seek(percent * duration);
  }, [duration, seek]);

  if (!currentSong) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const coverUrl = currentSong.pic || '/logo.png';

  return (
    <motion.div
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      exit={{ y: 80 }}
      className="fixed bottom-0 left-0 right-0 md:left-16 z-50 glass-gold"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Progress bar at top */}
      <div
        ref={progressRef}
        onClick={handleProgressClick}
        className="h-1 w-full cursor-pointer group relative"
      >
        <div className="absolute inset-0 bg-surface-hover" />
        <div
          className="absolute inset-y-0 left-0 bg-gold transition-[width] duration-100 group-hover:h-1.5"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center gap-3 px-3 py-2 md:px-4 md:py-2.5">
        {/* Expand button (mobile) / Cover art */}
        <button
          onClick={() => setShowFullPlayer(true)}
          className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
        >
          <img
            src={coverUrl}
            alt={currentSong.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/logo.png';
            }}
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <ChevronUp className="w-4 h-4 text-white" />
          </div>
        </button>

        {/* Song info */}
        <div className="flex-1 min-w-0 hidden sm:block">
          <h4 className="text-sm font-medium text-white truncate">
            {currentSong.name}
          </h4>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {currentSong.ar_name} · {currentSong.al_name}
          </p>
        </div>

        {/* Mobile song info (between cover and controls) */}
        <div className="flex-1 min-w-0 sm:hidden">
          <h4 className="text-xs font-medium text-white truncate">
            {currentSong.name}
          </h4>
        </div>

        {/* Time display */}
        <div className="hidden md:flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Volume toggle (desktop) */}
          <button
            onClick={toggleMute}
            className="hidden md:flex w-8 h-8 items-center justify-center rounded-full text-muted-foreground hover:text-gold transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={playPrev}
            className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-gold transition-colors"
          >
            <SkipBack className="w-4 h-4" fill="currentColor" />
          </button>

          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-black hover:bg-gold-light transition-colors gold-glow-sm"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" fill="black" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" fill="black" />
            )}
          </button>

          <button
            onClick={playNext}
            className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-gold transition-colors"
          >
            <SkipForward className="w-4 h-4" fill="currentColor" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
