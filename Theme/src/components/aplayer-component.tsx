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
 * Convert LyricLine[] to LRC format string for APlayer.
 *
 * APlayer scrolls so the *last* <p> with `aplayer-lrc-current` is
 * vertically centered.  When both an original and its translation share
 * the exact same timestamp, whichever appears last in the DOM gets
 * centered.
 *
 * Strategy: output the **translation first**, then the **original** —
 * both at the **same timestamp**.  APlayer marks both as current, but
 * the original (being the last `.aplayer-lrc-current` in DOM order)
 * is the element that gets scrolled to the center.
 */
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
        // Translation at exact time, then original at same time (original is last → centered)
        return `${fmtTime(line.time)}${line.translation}\n${fmtTime(line.time)}${line.text}`;
      }
      return `${fmtTime(line.time)}${line.text}`;
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
    let processedLrc: string = "";
    // On mobile (< 640px), disable lyrics entirely to avoid overlap/crowding
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

    if (!isMobile && tlyric) {
      const merged = lrctran(lyric, tlyric);
      processedLrc = lyricsToLrc(merged);
    } else if (!isMobile) {
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
          // On mobile, use lrcType 0 to completely disable lyrics panel structure
          lrcType: isMobile ? 0 : 1,
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
