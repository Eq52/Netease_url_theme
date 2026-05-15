'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/lib/stores/player-store';
import { findCurrentLyricIndex } from '@/lib/music-utils';

interface APlayerInstance {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  volume: (percent: number) => void;
  destroy: () => void;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  audio: {
    currentTime: number;
    duration: number;
  };
}

interface APlayerConstructor {
  new (options: {
    container: HTMLElement;
    audio: { url: string; name?: string; artist?: string; cover?: string };
    autoplay?: boolean;
    volume?: number;
    theme?: string;
    lrcType?: number;
  }): APlayerInstance;
}

export function APlayerWrapper() {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<APlayerInstance | null>(null);
  const updateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevUrlRef = useRef<string | null>(null);
  const prevSongIdRef = useRef<number | null>(null);

  const {
    currentSong,
    currentSongId,
    volume,
    lyrics,
    setAplayerControls,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    setCurrentLyricIndex,
  } = usePlayerStore();

  useEffect(() => {
    if (!containerRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const APlayerCtor = (window as any).APlayer as APlayerConstructor | undefined;
    if (!APlayerCtor) {
      console.warn('APlayer not loaded yet');
      return;
    }

    // Only create/update player when we have a new song with a valid URL
    const url = currentSong?.url;
    if (!url || (url === prevUrlRef.current && currentSongId === prevSongIdRef.current)) return;
    prevUrlRef.current = url;
    prevSongIdRef.current = currentSongId ?? null;

    // Destroy existing player
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch {
        // ignore
      }
      playerRef.current = null;
    }

    // Clear interval
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }

    // Clear container
    const container = containerRef.current;
    container.innerHTML = '';

    try {
      const player = new APlayerCtor({
        container,
        audio: {
          url: currentSong!.url,
          name: currentSong!.name,
          artist: currentSong!.ar_name,
          cover: currentSong!.pic,
        },
        autoplay: true,
        volume: volume * 100,
        theme: '#D4A843',
        lrcType: 0,
      });

      playerRef.current = player;

      // Set controls
      setAplayerControls({
        play: () => player.play(),
        pause: () => player.pause(),
        seek: (time) => player.seek(time),
        setVolume: (vol) => player.volume(vol * 100),
        destroy: () => {
          if (updateIntervalRef.current) {
            clearInterval(updateIntervalRef.current);
            updateIntervalRef.current = null;
          }
          try {
            player.destroy();
          } catch {
            // ignore
          }
          playerRef.current = null;
          prevUrlRef.current = null;
          prevSongIdRef.current = null;
        },
      });

      // Event: Time update
      player.on('timeupdate', () => {
        const currentTime = player.audio.currentTime;
        const duration = player.audio.duration;
        setCurrentTime(currentTime);
        if (duration > 0 && isFinite(duration)) {
          setDuration(duration);
        }
        // Update lyric index
        if (lyrics.length > 0) {
          const idx = findCurrentLyricIndex(lyrics, currentTime);
          setCurrentLyricIndex(idx);
        }
      });

      // Event: Play
      player.on('play', () => {
        setIsPlaying(true);
      });

      // Event: Pause
      player.on('pause', () => {
        setIsPlaying(false);
      });

      // Event: Ended - auto play next
      player.on('ended', () => {
        setIsPlaying(false);
        setTimeout(() => {
          usePlayerStore.getState().playNext();
        }, 500);
      });

      // Start polling for time updates as backup
      updateIntervalRef.current = setInterval(() => {
        if (playerRef.current) {
          try {
            const currentTime = playerRef.current.audio.currentTime;
            const duration = playerRef.current.audio.duration;
            setCurrentTime(currentTime);
            if (duration > 0 && isFinite(duration)) {
              setDuration(duration);
            }
            if (lyrics.length > 0) {
              const idx = findCurrentLyricIndex(lyrics, currentTime);
              setCurrentLyricIndex(idx);
            }
          } catch {
            // Player might be destroyed
          }
        }
      }, 250);
    } catch (err) {
      console.error('APlayer init error:', err);
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    };
  }, [currentSong?.url, currentSongId]);

  return (
    <div ref={containerRef} className="aplayer-hide" />
  );
}
