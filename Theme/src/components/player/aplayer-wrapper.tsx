"use client";

import React, { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { usePlayer } from "@/lib/player-context";
import { lrctran, lrctrim } from "@/lib/music-utils";
import type { LyricLine } from "@/lib/music-utils";

export interface APlayerWrapperRef {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  destroy: () => void;
}

// Convert LyricLine[] to LRC format string for APlayer
function lyricsToLrc(lines: LyricLine[]): string {
  const fmtTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    const ms = Math.round((t % 1) * 100);
    return `[${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}]`;
  };

  return lines
    .map((line) => {
      if (line.translation) {
        return `${fmtTime(line.time)}${line.translation}\n${fmtTime(line.time)}${line.text}`;
      }
      return `${fmtTime(line.time)}${line.text}`;
    })
    .join("\n");
}

const APlayerWrapper = forwardRef<APlayerWrapperRef>(function APlayerWrapper(_, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<any>(null);
  const prevUrlRef = useRef<string>("");

  const {
    currentSong,
    isPlaying,
    onTimeUpdate,
    onPlay,
    onPause,
    onEnded,
    onLoaded,
    onLyricUpdate,
    lyrics,
    seek,
  } = usePlayer();

  const destroyPlayer = useCallback(() => {
    if (instanceRef.current) {
      try {
        instanceRef.current.destroy();
      } catch {
        // ignore
      }
      instanceRef.current = null;
    }
  }, []);

  // Expose controls via ref
  useImperativeHandle(ref, () => ({
    play: () => {
      if (instanceRef.current) {
        try { instanceRef.current.play(); } catch { /* ignore */ }
      }
    },
    pause: () => {
      if (instanceRef.current) {
        try { instanceRef.current.pause(); } catch { /* ignore */ }
      }
    },
    seek: (time: number) => {
      if (instanceRef.current) {
        try { instanceRef.current.seek(time); } catch { /* ignore */ }
      }
    },
    setVolume: (vol: number) => {
      if (instanceRef.current) {
        try { instanceRef.current.volume(vol, true); } catch { /* ignore */ }
      }
    },
    destroy: () => destroyPlayer(),
  }), [destroyPlayer]);

  // Initialize/update APlayer when song changes
  useEffect(() => {
    if (!containerRef.current || !currentSong || !currentSong.url) return;

    // Skip if same song URL
    if (currentSong.url === prevUrlRef.current && instanceRef.current) {
      return;
    }

    destroyPlayer();
    prevUrlRef.current = currentSong.url;

    // Process lyrics
    let processedLrc: string = "";
    if (currentSong.tlyric && lyrics.length > 0) {
      processedLrc = lyricsToLrc(lyrics);
    } else if (currentSong.lyric) {
      processedLrc = currentSong.lyric;
    }

    const initPlayer = () => {
      if (!window.APlayer || !containerRef.current) {
        if (currentSong.url === prevUrlRef.current) {
          requestAnimationFrame(initPlayer);
        }
        return;
      }

      containerRef.current!.innerHTML = "";

      try {
        instanceRef.current = new window.APlayer({
          container: containerRef.current,
          theme: "#e05555",
          lrcType: processedLrc ? 1 : 0,
          autoplay: true,
          audio: [{
            name: currentSong.name,
            artist: currentSong.ar_name,
            url: currentSong.url,
            cover: currentSong.pic || "",
            lrc: processedLrc,
            theme: "#e05555",
          }],
        });

        // Bind events
        instanceRef.current.on("timeupdate", () => {
          if (instanceRef.current) {
            onTimeUpdate(instanceRef.current.audio.currentTime);
          }
        });

        instanceRef.current.on("loadeddata", () => {
          if (instanceRef.current) {
            onLoaded(instanceRef.current.audio.duration);
          }
        });

        instanceRef.current.on("play", () => {
          onPlay();
        });

        instanceRef.current.on("pause", () => {
          onPause();
        });

        instanceRef.current.on("ended", () => {
          onEnded();
        });

        instanceRef.current.on("lrcupdate", () => {
          // APlayer provides lrc update info
          if (instanceRef.current && instanceRef.current.lrc) {
            const lrcIndex = instanceRef.current.lrc.currentLine || 0;
            onLyricUpdate(lrcIndex);
          }
        });

      } catch (e) {
        console.error("APlayer init error:", e);
      }
    };

    const timer = setTimeout(initPlayer, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [currentSong, destroyPlayer, onTimeUpdate, onPlay, onPause, onEnded, onLoaded, onLyricUpdate, lyrics]);

  // Sync play/pause state
  useEffect(() => {
    if (!instanceRef.current) return;
    try {
      if (isPlaying) {
        instanceRef.current.play();
      } else {
        instanceRef.current.pause();
      }
    } catch {
      // ignore
    }
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      destroyPlayer();
    };
  }, [destroyPlayer]);

  return (
    <div className="aplayer-hidden" aria-hidden="true">
      <div ref={containerRef} />
    </div>
  );
});

export default APlayerWrapper;
