import { create } from 'zustand';

export type ViewType = 'search' | 'playlist' | 'album' | 'settings';
type SettingsSubPage = 'quality' | 'cookie' | 'download' | 'playback' | 'about' | null;

interface NavStore {
  activeView: ViewType;
  settingsSubPage: SettingsSubPage;

  navigate: (view: ViewType) => void;
  openSettingsSubPage: (page: NonNullable<SettingsSubPage>) => void;
  closeSettingsSubPage: () => void;
  goBack: () => void;
}

export const useNavStore = create<NavStore>((set, get) => ({
  activeView: 'search',
  settingsSubPage: null,

  navigate: (view) => {
    set({ activeView: view, settingsSubPage: null });
  },

  openSettingsSubPage: (page) => {
    set({ activeView: 'settings', settingsSubPage: page });
  },

  closeSettingsSubPage: () => {
    set({ settingsSubPage: null });
  },

  goBack: () => {
    const { settingsSubPage } = get();
    if (settingsSubPage) {
      set({ settingsSubPage: null });
    }
  },
}));
