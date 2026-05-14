"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Download, Repeat
} from "lucide-react";
import { usePlayer } from "@/lib/player-context";
import { formatTime } from "@/lib/music-utils";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QUALITY_OPTIONS } from "@/lib/api";
import type { APlayerWrapperRef } from "./aplayer-wrapper";

interface FullPlayerProps {
  aplayerRef: React.RefObject<APlayerWrapperRef | null>;
}

export default function FullPlayer({ aplayerRef }: FullPlayerProps) {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    showFullPlayer,
    setShowFullPlayer,
    togglePlay,
    playNext,
    playPrev,
    quality,
    setQuality,
    lyrics,
    currentLyricIndex,
    downloadCurrentSong,
  } = usePlayer();

  const [volume, setVolume] = React.useState(80);
  const [isMuted, setIsMuted] = React.useState(false);
  const lyricsRef = useRef<HTMLDivElement>(null);

  // Sync volume
  useEffect(() => {
    if (aplayerRef.current) {
      aplayerRef.current.setVolume(isMuted ? 0 : volume / 100);
    }
  }, [volume, isMuted, aplayerRef]);

  // Auto-scroll lyrics
  useEffect(() => {
    if (!lyricsRef.current || currentLyricIndex < 0) return;
    const activeEl = lyricsRef.current.querySelector(`[data-lyric-index="${currentLyricIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentLyricIndex]);

  // Find current and nearby lyrics for display
  const displayLyrics = useMemo(() => {
    if (lyrics.length === 0) return [];
    return lyrics;
  }, [lyrics]);

  if (!currentSong) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (value: number[]) => {
    if (duration <= 0) return;
    const newTime = (value[0] / 100) * duration;
    if (aplayerRef.current) {
      aplayerRef.current.seek(newTime);
    }
  };

  return (
    <AnimatePresence>
      {showFullPlayer && currentSong && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-0 z-50 flex flex-col"
        >
          {/* Blurred background */}
          <div
            className="full-player-bg"
            style={{
              backgroundImage: currentSong.pic ? `url(${currentSong.pic})` : undefined,
            }}
          />
          <div className="absolute inset-0 bg-background/80" />

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-8 pt-4 pb-2 shrink-0">
              <button
                onClick={() => setShowFullPlayer(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronDown className="h-6 w-6" />
              </button>
              <div className="text-center">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">正在播放</p>
              </div>
              <div className="w-10" /> {/* Spacer for centering */}
            </div>

            {/* Main content - scrollable */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8">
              <div className="max-w-2xl mx-auto flex flex-col items-center">
                {/* Album art */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="relative mb-6 md:mb-8"
                >
                  <div className="w-56 h-56 md:w-72 md:h-72 rounded-2xl overflow-hidden shadow-2xl music-glow-strong">
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
                </motion.div>

                {/* Song info */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="text-center mb-6 w-full"
                >
                  <h2 className="text-xl md:text-2xl font-bold truncate">{currentSong.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1 truncate">
                    {currentSong.ar_name} · {currentSong.al_name}
                  </p>
                </motion.div>

                {/* Progress bar */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="w-full mb-4"
                >
                  <Slider
                    value={[progressPercent]}
                    max={100}
                    step={0.1}
                    onValueChange={handleSeek}
                    className="w-full [&_[role=slider]]:h-3.5 [&_[role=slider]]:w-3.5 [&_[role=slider]]:bg-primary [&_[role=slider]]:border-2 [&_[role=slider]]:border-primary-foreground [&_[role=slider]]:shadow-md"
                  />
                  <div className="flex justify-between mt-1 text-[11px] text-muted-foreground tabular-nums">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </motion.div>

                {/* Controls */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="flex items-center justify-center gap-6 mb-6"
                >
                  <button
                    onClick={playPrev}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <SkipBack className="h-5 w-5" fill="currentColor" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" fill="currentColor" />
                    ) : (
                      <Play className="h-6 w-6 ml-0.5" fill="currentColor" />
                    )}
                  </button>

                  <button
                    onClick={playNext}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <SkipForward className="h-5 w-5" fill="currentColor" />
                  </button>
                </motion.div>

                {/* Secondary controls */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-between w-full mb-8 gap-4"
                >
                  {/* Volume */}
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </button>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={100}
                      step={1}
                      onValueChange={(v) => {
                        setVolume(v[0]);
                        if (v[0] > 0) setIsMuted(false);
                      }}
                      className="flex-1 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-muted-foreground [&_[role=slider]]:border-0"
                    />
                  </div>

                  {/* Quality selector */}
                  <Select value={quality} onValueChange={setQuality}>
                    <SelectTrigger className="w-auto h-7 border-0 bg-surface-2/50 text-xs px-2 gap-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUALITY_OPTIONS.map((q) => (
                        <SelectItem key={q.value} value={q.value}>
                          {q.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Download */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={downloadCurrentSong}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground px-2"
                  >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    下载
                  </Button>
                </motion.div>

                {/* Lyrics section */}
                {displayLyrics.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="w-full"
                  >
                    <div className="text-xs uppercase tracking-wider text-muted-foreground/50 mb-3">
                      歌词
                    </div>
                    <div
                      ref={lyricsRef}
                      className="max-h-64 overflow-y-auto rounded-xl p-4 bg-surface-1/50"
                    >
                      {displayLyrics.map((line, index) => (
                        <div
                          key={index}
                          data-lyric-index={index}
                          className={`py-1.5 text-sm transition-all duration-300 ${
                            index === currentLyricIndex
                              ? "text-primary font-semibold scale-[1.02]"
                              : Math.abs(index - currentLyricIndex) <= 2
                              ? "text-muted-foreground"
                              : "text-muted-foreground/40"
                          }`}
                        >
                          <p className="truncate">{line.text}</p>
                          {line.translation && (
                            <p className={`text-xs truncate mt-0.5 ${
                              index === currentLyricIndex
                                ? "text-primary/70"
                                : "text-muted-foreground/50"
                            }`}>
                              {line.translation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Bottom spacer for mobile */}
                <div className="h-20 md:h-8" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
