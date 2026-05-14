"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, ChevronUp, Volume2, VolumeX } from "lucide-react";
import { usePlayer } from "@/lib/player-context";
import { formatTime } from "@/lib/music-utils";
import { Slider } from "@/components/ui/slider";
import type { APlayerWrapperRef } from "./aplayer-wrapper";

interface MiniPlayerProps {
  aplayerRef: React.RefObject<APlayerWrapperRef | null>;
}

export default function MiniPlayer({ aplayerRef }: MiniPlayerProps) {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    playNext,
    setShowFullPlayer,
  } = usePlayer();

  const [volume, setVolume] = React.useState(80);
  const [isMuted, setIsMuted] = React.useState(false);
  const [showVolume, setShowVolume] = React.useState(false);

  // Sync volume to APlayer
  useEffect(() => {
    if (aplayerRef.current) {
      aplayerRef.current.setVolume(isMuted ? 0 : volume / 100);
    }
  }, [volume, isMuted, aplayerRef]);

  if (!currentSong) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {currentSong && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="glass-player z-30"
        >
          {/* Thin progress bar at top of mini player */}
          <div className="h-0.5 bg-surface-3 relative">
            <div
              className="absolute left-0 top-0 h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center h-14 md:h-16 px-3 md:px-4 gap-3">
            {/* Song info - clickable to open full player */}
            <button
              onClick={() => setShowFullPlayer(true)}
              className="flex items-center gap-3 flex-1 min-w-0 text-left group"
            >
              {/* Cover */}
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 shadow-md">
                <img
                  src={currentSong.pic || ""}
                  alt={currentSong.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23333' width='100' height='100'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23666' font-size='28'%3E♪%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>

              {/* Name & artist */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {currentSong.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {currentSong.ar_name}
                </p>
              </div>
            </button>

            {/* Controls */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full flex items-center justify-center text-foreground hover:text-primary transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" fill="currentColor" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
                )}
              </button>

              {/* Next */}
              <button
                onClick={playNext}
                className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <SkipForward className="h-4 w-4" fill="currentColor" />
              </button>

              {/* Volume - desktop only */}
              <div
                className="hidden md:flex items-center gap-1 group/vol relative"
                onMouseEnter={() => setShowVolume(true)}
                onMouseLeave={() => setShowVolume(false)}
              >
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>

                <AnimatePresence>
                  {showVolume && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 80, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        max={100}
                        step={1}
                        onValueChange={(v) => {
                          setVolume(v[0]);
                          if (v[0] > 0) setIsMuted(false);
                        }}
                        className="w-20 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-primary [&_[role=slider]]:border-0"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Time - desktop only */}
              <div className="hidden md:flex items-center text-[11px] text-muted-foreground tabular-nums ml-1">
                <span>{formatTime(currentTime)}</span>
                <span className="mx-1">/</span>
                <span>{formatTime(duration)}</span>
              </div>

              {/* Expand button */}
              <button
                onClick={() => setShowFullPlayer(true)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
