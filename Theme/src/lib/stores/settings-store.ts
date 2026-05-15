import { create } from 'zustand';

interface SettingsStore {
  defaultQuality: string;
  downloadQuality: string;
  autoPlayNext: boolean;
  showLyrics: boolean;
  lyricsFontSize: number;
  defaultVolume: number;
  autoDownload: boolean;
  cookie: string;

  loadSettings: () => void;
  saveSettings: () => void;
  updateSetting: <K extends keyof SettingsStore>(key: K, value: SettingsStore[K]) => void;
}

const STORAGE_KEY = 'aural-settings';

const defaults: Omit<SettingsStore, 'loadSettings' | 'saveSettings' | 'updateSetting'> = {
  defaultQuality: 'exhigh',
  downloadQuality: 'lossless',
  autoPlayNext: true,
  showLyrics: true,
  lyricsFontSize: 16,
  defaultVolume: 80,
  autoDownload: false,
  cookie: '',
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...defaults,

  loadSettings: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({
          defaultQuality: parsed.defaultQuality ?? defaults.defaultQuality,
          downloadQuality: parsed.downloadQuality ?? defaults.downloadQuality,
          autoPlayNext: parsed.autoPlayNext ?? defaults.autoPlayNext,
          showLyrics: parsed.showLyrics ?? defaults.showLyrics,
          lyricsFontSize: parsed.lyricsFontSize ?? defaults.lyricsFontSize,
          defaultVolume: parsed.defaultVolume ?? defaults.defaultVolume,
          autoDownload: parsed.autoDownload ?? defaults.autoDownload,
          cookie: parsed.cookie ?? defaults.cookie,
        });
      }
    } catch {
      // Ignore parse errors
    }
  },

  saveSettings: () => {
    const state = get();
    const toSave = {
      defaultQuality: state.defaultQuality,
      downloadQuality: state.downloadQuality,
      autoPlayNext: state.autoPlayNext,
      showLyrics: state.showLyrics,
      lyricsFontSize: state.lyricsFontSize,
      defaultVolume: state.defaultVolume,
      autoDownload: state.autoDownload,
      cookie: state.cookie,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  },

  updateSetting: (key, value) => {
    set({ [key]: value });
    get().saveSettings();
  },
}));
