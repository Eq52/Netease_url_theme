"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { lrctran } from "@/lib/music-utils";
import type { LyricLine } from "@/lib/music-utils";

// Declare APlayer global type
declare global {
  interface Window {
    APlayer: any;
  }
}

interface APlayerComponentProps {
  name: string;
  artist: string;
  url: string;
  cover: string;
  lyric: string;
  tlyric?: string;
  theme?: string;
}

/**
 * Convert LyricLine[] to LRC format string for APlayer
 */
function lyricsToLrc(lines: LyricLine[]): string {
  return lines
    .map((line) => {
      const min = Math.floor(line.time / 60);
      const sec = Math.floor(line.time % 60);
      const ms = Math.round((line.time % 1) * 100);
      const timeTag = `[${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}]`;
      let result = `${timeTag}${line.text}`;
      if (line.translation) {
        result += `\n${timeTag}${line.translation}`;
      }
      return result;
    })
    .join("\n");
}

export default function APlayerComponent({
  name,
  artist,
  url,
  cover,
  lyric,
  tlyric,
  theme = "#ec4141",
}: APlayerComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<any>(null);
  const prevSrcRef = useRef<string>("");

  const destroyPlayer = useCallback(() => {
    if (instanceRef.current) {
      try {
        instanceRef.current.destroy();
      } catch {
        // ignore destroy errors
      }
      instanceRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || !url) return;

    // Skip if same song
    if (url === prevSrcRef.current && instanceRef.current) return;

    destroyPlayer();
    prevSrcRef.current = url;

    // Process lyrics
    let processedLrc: string;
    if (tlyric) {
      const merged = lrctran(lyric, tlyric);
      processedLrc = lyricsToLrc(merged);
    } else {
      // Convert raw LRC directly
      processedLrc = lyric;
    }

    // Wait for APlayer to be available
    const initPlayer = () => {
      if (!window.APlayer || !containerRef.current) {
        if (url === prevSrcRef.current) {
          requestAnimationFrame(initPlayer);
        }
        return;
      }

      // Ensure container is empty
      containerRef.current.innerHTML = "";

      try {
        instanceRef.current = new window.APlayer({
          container: containerRef.current,
          theme: theme,
          lrcType: 1,
          autoplay: false,
          audio: [{
            name: name,
            artist: artist,
            url: url,
            cover: cover,
            lrc: processedLrc,
            theme: theme,
          }],
        });
      } catch (e) {
        console.error("APlayer init error:", e);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initPlayer, 100);

    return () => {
      clearTimeout(timer);
      destroyPlayer();
    };
  }, [name, artist, url, cover, lyric, tlyric, theme, destroyPlayer]);

  return (
    <div className="aplayer-wrapper">
      <div ref={containerRef} id="aplayer" />
    </div>
  );
}
