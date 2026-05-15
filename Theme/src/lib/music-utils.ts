import type { LyricLine } from './types';

/**
 * Parse LRC format lyrics string into timed lyric lines
 */
export function parseLRC(lrcString: string): LyricLine[] {
  if (!lrcString || !lrcString.trim()) return [];

  const lines = lrcString.split('\n');
  const result: LyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

  for (const line of lines) {
    const times: number[] = [];
    let match: RegExpExecArray | null;

    while ((match = timeRegex.exec(line)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const ms = match[3].length === 2
        ? parseInt(match[3], 10) * 10
        : parseInt(match[3], 10);
      times.push(minutes * 60 + seconds + ms / 1000);
    }

    const text = line.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '').trim();

    if (times.length > 0 && text) {
      for (const time of times) {
        result.push({ time, text });
      }
    }
  }

  return result.sort((a, b) => a.time - b.time);
}

/**
 * Merge original and translated lyrics
 */
export function mergeTranslations(
  original: LyricLine[],
  translation: string
): LyricLine[] {
  if (!translation || !translation.trim()) return original;

  const translated = parseLRC(translation);
  if (translated.length === 0) return original;

  const translatedMap = new Map<number, string>();
  for (const line of translated) {
    // Round to nearest second for matching
    const key = Math.round(line.time);
    translatedMap.set(key, line.text);
  }

  return original.map(line => {
    const key = Math.round(line.time);
    const trans = translatedMap.get(key);
    return trans ? { ...line, translation: trans } : line;
  });
}

/**
 * Find current lyric index based on time
 */
export function findCurrentLyricIndex(lyrics: LyricLine[], currentTime: number): number {
  if (!lyrics || lyrics.length === 0) return -1;

  let index = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (lyrics[i].time <= currentTime) {
      index = i;
    } else {
      break;
    }
  }
  return index;
}

/**
 * Extract numeric ID from URL or ID string
 * Supports: /song?id=123, /playlist?id=456, https://music.163.com/#/song?id=123, plain numbers
 */
export function extractId(input: string): string {
  if (!input) return '';
  
  // Already a plain number
  if (/^\d+$/.test(input.trim())) {
    return input.trim();
  }

  // Try to extract from URL query param
  const urlMatch = input.match(/[?&]id=(\d+)/);
  if (urlMatch) {
    return urlMatch[1];
  }

  // Try to extract any number from string
  const numMatch = input.match(/(\d{6,})/);
  if (numMatch) {
    return numMatch[1];
  }

  return input.trim();
}

/**
 * Format seconds to mm:ss
 */
export function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: string | number): string {
  const size = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (isNaN(size)) return '未知';
  
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Quality label map
 */
export function getQualityLabel(quality: string): string {
  const map: Record<string, string> = {
    standard: '标准',
    exhigh: '极高',
    lossless: '无损',
    hires: 'Hi-Res',
    sky: '沉浸环绕声',
    jyeffect: '高清环绕声',
    jymaster: '超清母带',
  };
  return map[quality] || quality;
}
