"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { parseSong, downloadSong, type SongDetail } from "@/lib/api";
import { lrctran, lrctrim } from "@/lib/music-utils";
import type { LyricLine } from "@/lib/music-utils";

// Queue item - minimal info from search results / playlist / album
export interface QueueItem {
  id: number;
  name: string;
  artists: string;
  album: string;
  picUrl: string;
}

interface PlayerState {
  // Current song
  currentSong: SongDetail | null;
  currentSongId: number | null;
  isPlaying: boolean;

  // Queue
  queue: QueueItem[];
  currentIndex: number;

  // Playback time
  currentTime: number;
  duration: number;

  // Quality
  quality: string;
  setQuality: (q: string) => void;

  // Player actions
  playSong: (song: QueueItem, queueItems?: QueueItem[], index?: number) => void;
  playNext: () => void;
  playPrev: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;

  // Full player
  showFullPlayer: boolean;
  setShowFullPlayer: (v: boolean) => void;

  // Lyrics
  lyrics: LyricLine[];
  currentLyricIndex: number;

  // APlayer ref callbacks
  onTimeUpdate: (time: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
  onLoaded: (duration: number) => void;
  onLyricUpdate: (index: number) => void;

  // Loading
  isLoading: boolean;

  // Download
  downloadCurrentSong: () => void;
  downloadSongById: (id: number, name: string, artists: string) => void;
}

const PlayerContext = createContext<PlayerState | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

declare global {
  interface Window {
    APlayer: any;
  }
}

function sanitizeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "_").trim();
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<SongDetail | null>(null);
  const [currentSongId, setCurrentSongId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [quality, setQualityState] = useState("exhigh");
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const loadingRef = useRef(false);

  const setQuality = useCallback((q: string) => {
    setQualityState(q);
  }, []);

  const playSong = useCallback(async (song: QueueItem, queueItems?: QueueItem[], index?: number) => {
    // Prevent duplicate loading of same song
    if (loadingRef.current) return;
    if (currentSongId !== null && song.id === currentSongId) {
      // Same song - just toggle play/pause
      setIsPlaying(prev => !prev);
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);

    try {
      // Set queue if provided
      if (queueItems) {
        setQueue(queueItems);
        setCurrentIndex(index ?? queueItems.findIndex(s => s.id === song.id));
      }

      const res = await parseSong(String(song.id), quality);
      if (res.success && res.data) {
        const detail = res.data;
        setCurrentSong(detail);
        setCurrentSongId(song.id);
        setIsPlaying(true); // APlayer will autoplay

        // Parse lyrics
        if (detail.lyric) {
          const parsedLyrics = detail.tlyric
            ? lrctran(detail.lyric, detail.tlyric)
            : lrctrim(detail.lyric);
          setLyrics(parsedLyrics);
        } else {
          setLyrics([]);
        }
        setCurrentLyricIndex(-1);

        if (!detail.url) {
          toast.error("版权限制，无法播放");
        }
      } else {
        toast.error(res.message || "获取歌曲信息失败");
      }
    } catch {
      toast.error("请求失败，请稍后重试");
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [quality, currentSongId]);

  const playNext = useCallback(() => {
    if (queue.length === 0) return;
    const nextIndex = currentIndex + 1 < queue.length ? currentIndex + 1 : 0;
    setCurrentIndex(nextIndex);
    playSong(queue[nextIndex]);
  }, [queue, currentIndex, playSong]);

  const playPrev = useCallback(() => {
    if (queue.length === 0) return;
    const prevIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : queue.length - 1;
    setCurrentIndex(prevIndex);
    playSong(queue[prevIndex]);
  }, [queue, currentIndex, playSong]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const seek = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  // APlayer event callbacks
  const onTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const onPlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const onPause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const onEnded = useCallback(() => {
    setIsPlaying(false);
    // Auto play next
    if (queue.length > 0 && currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      playSong(queue[nextIndex]);
    }
  }, [queue, currentIndex, playSong]);

  const onLoaded = useCallback((dur: number) => {
    setDuration(dur);
  }, []);

  const onLyricUpdate = useCallback((index: number) => {
    setCurrentLyricIndex(index);
  }, []);

  const downloadCurrentSong = useCallback(async () => {
    if (!currentSong) return;
    try {
      toast.info("开始下载...");
      const songId = currentIndex >= 0 && queue[currentIndex]
        ? String(queue[currentIndex].id)
        : "";

      if (!songId) {
        toast.error("无法获取歌曲ID");
        return;
      }

      const res = await downloadSong(songId, quality);
      if (res.success && res.data) {
        const blob = res.data as unknown as Blob;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const safeName = sanitizeFileName(currentSong.name);
        const safeArtist = sanitizeFileName(currentSong.ar_name);
        a.download = safeArtist ? `${safeName} - ${safeArtist}` : safeName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("下载成功");
      } else {
        toast.error(res.message || "下载失败");
      }
    } catch {
      toast.error("下载请求失败");
    }
  }, [currentSong, currentIndex, queue, quality]);

  const downloadSongById = useCallback(async (id: number, name: string, artists: string) => {
    try {
      toast.info("开始下载...");
      const res = await downloadSong(String(id), quality);
      if (res.success && res.data) {
        const blob = res.data as unknown as Blob;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const safeName = sanitizeFileName(name);
        const safeArtist = sanitizeFileName(artists);
        a.download = safeArtist ? `${safeName} - ${safeArtist}` : safeName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("下载成功");
      } else {
        toast.error(res.message || "下载失败");
      }
    } catch {
      toast.error("下载请求失败");
    }
  }, [quality]);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        currentSongId,
        isPlaying,
        queue,
        currentIndex,
        currentTime,
        duration,
        quality,
        setQuality,
        playSong,
        playNext,
        playPrev,
        togglePlay,
        seek,
        showFullPlayer,
        setShowFullPlayer,
        lyrics,
        currentLyricIndex,
        onTimeUpdate,
        onPlay,
        onPause,
        onEnded,
        onLoaded,
        onLyricUpdate,
        isLoading,
        downloadCurrentSong,
        downloadSongById,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
