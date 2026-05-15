import { create } from 'zustand';
import type { QueueItem, SongDetail, LyricLine } from '@/lib/types';

interface APlayerControls {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  destroy: () => void;
}

interface PlayerStore {
  // Song State
  currentSong: SongDetail | null;
  currentSongId: number | null;
  isLoading: boolean;

  // Playback State
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;

  // Queue
  queue: QueueItem[];
  currentIndex: number;

  // UI State
  showFullPlayer: boolean;

  // Lyrics
  lyrics: LyricLine[];
  currentLyricIndex: number;

  // APlayer bridge ref
  aplayerControls: APlayerControls | null;
  setAplayerControls: (controls: APlayerControls | null) => void;

  // Actions
  playSong: (song: QueueItem, queue?: QueueItem[], index?: number) => Promise<void>;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  seek: (time: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  setIsPlaying: (playing: boolean) => void;
  setShowFullPlayer: (show: boolean) => void;
  setLyrics: (lyrics: LyricLine[]) => void;
  setCurrentLyricIndex: (index: number) => void;
  setIsLoading: (loading: boolean) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  // Initial State
  currentSong: null,
  currentSongId: null,
  isLoading: false,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  queue: [],
  currentIndex: -1,
  showFullPlayer: false,
  lyrics: [],
  currentLyricIndex: -1,
  aplayerControls: null,

  setAplayerControls: (controls) => set({ aplayerControls: controls }),

  playSong: async (song, queue, index) => {
    const store = get();
    set({ isLoading: true, currentSongId: song.id });

    try {
      // Import api dynamically to avoid circular deps
      const { api } = await import('@/lib/api');
      const { parseLRC, mergeTranslations } = await import('@/lib/music-utils');
      
      // Get quality from settings
      const settingsStr = localStorage.getItem('aural-settings');
      const quality = settingsStr ? JSON.parse(settingsStr).defaultQuality || 'exhigh' : 'exhigh';

      const response = await api.getSongDetail(String(song.id), quality);
      const detail = response.data;

      if (!detail || !detail.url) {
        set({ isLoading: false });
        return;
      }

      // Parse lyrics
      let lyrics = parseLRC(detail.lyric || '');
      if (detail.tlyric) {
        lyrics = mergeTranslations(lyrics, detail.tlyric);
      }

      // Update queue if provided
      if (queue) {
        const idx = index ?? queue.findIndex(s => s.id === song.id);
        set({ queue, currentIndex: idx >= 0 ? idx : 0 });
      }

      set({
        currentSong: detail,
        currentSongId: song.id,
        isPlaying: true,
        currentTime: 0,
        lyrics,
        currentLyricIndex: -1,
        isLoading: false,
      });

      // Signal APlayer to load new song
      store.aplayerControls?.destroy();
    } catch (error) {
      console.error('Failed to play song:', error);
      set({ isLoading: false });
    }
  },

  togglePlay: () => {
    const { isPlaying, aplayerControls } = get();
    if (isPlaying) {
      aplayerControls?.pause();
    } else {
      aplayerControls?.play();
    }
    set({ isPlaying: !isPlaying });
  },

  playNext: () => {
    const { queue, currentIndex, playSong } = get();
    if (queue.length === 0) return;
    const nextIndex = (currentIndex + 1) % queue.length;
    const nextSong = queue[nextIndex];
    if (nextSong) {
      playSong(nextSong, queue, nextIndex);
    }
  },

  playPrev: () => {
    const { queue, currentIndex, playSong } = get();
    if (queue.length === 0) return;
    const prevIndex = currentIndex <= 0 ? queue.length - 1 : currentIndex - 1;
    const prevSong = queue[prevIndex];
    if (prevSong) {
      playSong(prevSong, queue, prevIndex);
    }
  },

  seek: (time) => {
    const { aplayerControls } = get();
    aplayerControls?.seek(time);
    set({ currentTime: time });
  },

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (vol) => {
    const { aplayerControls } = get();
    aplayerControls?.setVolume(vol);
    set({ volume: vol, isMuted: vol === 0 });
  },
  toggleMute: () => {
    const { isMuted, volume, aplayerControls } = get();
    if (isMuted) {
      aplayerControls?.setVolume(volume || 0.8);
      set({ isMuted: false });
    } else {
      aplayerControls?.setVolume(0);
      set({ isMuted: true });
    }
  },
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setShowFullPlayer: (show) => set({ showFullPlayer: show }),
  setLyrics: (lyrics) => set({ lyrics }),
  setCurrentLyricIndex: (index) => set({ currentLyricIndex: index }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
