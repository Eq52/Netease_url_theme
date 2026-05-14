// Helper utilities for Netease Cloud Music Toolkit

export interface LyricLine {
  time: number;
  text: string;
  translation?: string;
}

/**
 * Parse LRC format lyrics to timestamped array
 */
export function lrctrim(lyrics: string): LyricLine[] {
  if (!lyrics) return [];
  const lines = lyrics.split("\n");
  const result: LyricLine[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Match time tags: [mm:ss.xx] or [mm:ss.xxx]
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;
    const timeMatches = [...trimmed.matchAll(timeRegex)];

    if (timeMatches.length === 0) continue;

    // Get the lyric text (after all time tags)
    const lastEnd = timeMatches[timeMatches.length - 1].index! + timeMatches[timeMatches.length - 1][0].length;
    const text = trimmed.substring(lastEnd).trim();

    if (!text) continue;

    for (const match of timeMatches) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const msStr = match[3];
      const ms = msStr.length === 2 ? parseInt(msStr, 10) * 10 : parseInt(msStr, 10);
      const time = minutes * 60 + seconds + ms / 1000;

      result.push({ time, text });
    }
  }

  // Sort by time
  result.sort((a, b) => a.time - b.time);
  return result;
}

/**
 * Merge original and translated lyrics
 */
export function lrctran(lyric: string, tlyric: string): LyricLine[] {
  const originalLines = lrctrim(lyric);
  const translationLines = lrctrim(tlyric);

  if (translationLines.length === 0) return originalLines;

  // Build a map of time -> translation
  const translationMap = new Map<number, string>();
  for (const line of translationLines) {
    // Round to nearest 0.1 second for matching
    const roundedTime = Math.round(line.time * 10) / 10;
    if (!translationMap.has(roundedTime)) {
      translationMap.set(roundedTime, line.text);
    }
  }

  // Merge
  return originalLines.map((line) => {
    const roundedTime = Math.round(line.time * 10) / 10;
    const translation = translationMap.get(roundedTime);
    return {
      ...line,
      translation: translation || undefined,
    };
  });
}

/**
 * Extract music ID from URL or plain ID
 * Supports:
 * - Plain numeric ID: "12345"
 * - Netease song URL: "https://music.163.com/#/song?id=12345"
 * - Netease song URL: "https://music.163.com/song?id=12345"
 * - Playlist URL: "https://music.163.com/#/playlist?id=12345"
 * - Album URL: "https://music.163.com/#/album?id=12345"
 * - Short link: "http://163cn.tv/xxxx"
 */
export function extractAndCheckId(text: string): { id: string; type: "song" | "playlist" | "album" } | null {
  if (!text) return null;

  const trimmed = text.trim();

  // Plain numeric ID
  if (/^\d+$/.test(trimmed)) {
    return { id: trimmed, type: "song" };
  }

  // Try to extract from URL
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);

    // Check for hash-based routes (Netease music uses hash routing)
    const hash = url.hash || "";
    const pathname = url.pathname || "";

    const fullPath = hash + pathname;

    // Playlist
    const playlistMatch = fullPath.match(/playlist[/?].*id=(\d+)/i);
    if (playlistMatch) {
      return { id: playlistMatch[1], type: "playlist" };
    }

    // Album
    const albumMatch = fullPath.match(/album[/?].*id=(\d+)/i);
    if (albumMatch) {
      return { id: albumMatch[1], type: "album" };
    }

    // Song
    const songMatch = fullPath.match(/song[/?].*id=(\d+)/i);
    if (songMatch) {
      return { id: songMatch[1], type: "song" };
    }

    // Generic id parameter
    const genericMatch = url.searchParams.get("id");
    if (genericMatch && /^\d+$/.test(genericMatch)) {
      // Try to detect type from path
      if (fullPath.includes("playlist")) return { id: genericMatch, type: "playlist" };
      if (fullPath.includes("album")) return { id: genericMatch, type: "album" };
      return { id: genericMatch, type: "song" };
    }
  } catch {
    // Not a valid URL
  }

  // Try to extract a numeric ID from the text
  const idMatch = trimmed.match(/(\d{6,})/);
  if (idMatch) {
    return { id: idMatch[1], type: "song" };
  }

  return null;
}

/**
 * Format file size from bytes to human-readable string.
 * Accepts raw bytes (number or numeric string) or already-formatted strings like "8.52MB".
 */
export function formatFileSize(bytes: string | number): string {
  if (typeof bytes === "string") {
    // Already formatted (e.g. "8.52MB", "获取失败") — return as-is
    if (/^\d+(\.\d+)?\s*(B|KB|MB|GB|TB)/i.test(bytes.trim())) return bytes.trim();
    if (isNaN(Number(bytes))) return bytes; // Non-numeric string like "获取失败"

    const b = Number(bytes);
    if (b <= 0) return "未知";
    return _formatBytes(b);
  }

  if (isNaN(bytes) || bytes <= 0) return "未知";
  return _formatBytes(bytes);
}

function _formatBytes(b: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let unitIndex = 0;
  let size = b;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Format seconds to mm:ss
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
