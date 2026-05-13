"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/music-utils";

interface MusicPlayerProps {
  src: string;
  songName?: string;
}

export default function MusicPlayer({ src, songName }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const prevSrcRef = useRef(src);
  const isResettingRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio event listeners — set up once on mount
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (!isResettingRef.current) {
        setCurrentTime(audio.currentTime);
      }
    };
    const handleLoadedMetadata = () => {
      if (!isResettingRef.current) {
        setDuration(audio.duration);
        setIsLoaded(true);
      }
    };
    const handleEnded = () => {
      if (!isResettingRef.current) {
        setIsPlaying(false);
      }
    };
    const handleError = () => {
      if (!isResettingRef.current) {
        setError("音频加载失败");
        setIsPlaying(false);
      }
    };
    const handleCanPlay = () => {
      if (!isResettingRef.current) {
        setIsLoaded(true);
        setError(null);
      }
    };
    const handleLoadStart = () => {
      // When src changes and load starts, reset state
      if (prevSrcRef.current !== audio.src) {
        isResettingRef.current = true;
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setIsLoaded(false);
        setError(null);
        prevSrcRef.current = audio.src;
        // Allow subsequent events through after a tick
        requestAnimationFrame(() => {
          isResettingRef.current = false;
        });
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("loadstart", handleLoadStart);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("loadstart", handleLoadStart);
    };
  }, []);

  // Sync volume to audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || error) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setError("播放失败");
      });
    }
  }, [isPlaying, error]);

  const handleSeek = useCallback((value: number[]) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const newTime = (value[0] / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const handleVolumeChange = useCallback((value: number[]) => {
    setVolume(value[0] / 100);
    if (value[0] > 0) setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      {songName && (
        <p className="text-sm text-muted-foreground truncate font-medium">
          🎵 {songName}
        </p>
      )}

      <audio ref={audioRef} src={src} preload="metadata" />

      {error ? (
        <div className="flex items-center justify-center py-4 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="space-y-1">
            <Slider
              value={[progressPercent]}
              max={100}
              step={0.1}
              onValueChange={handleSeek}
              className="audio-progress [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-primary [&_[role=slider]]:border-2 [&_[role=slider]]:border-primary-foreground [&_[data-orientation=horizontal]>.bg-primary]:bg-primary/30"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground p-0 shrink-0"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </Button>

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="h-8 w-8 p-0 shrink-0 text-muted-foreground hover:text-foreground"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="flex-1 [&_[role=slider]]:h-2.5 [&_[role=slider]]:w-2.5 [&_[role=slider]]:bg-muted-foreground [&_[role=slider]]:border-0 [&_[data-orientation=horizontal]>.bg-primary]:bg-muted-foreground/30"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
