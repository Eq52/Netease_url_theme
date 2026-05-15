'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useNavStore } from '@/lib/stores/nav-store';
import { usePlayerStore } from '@/lib/stores/player-store';
import { Sidebar } from './sidebar';
import { ScreenGuard } from './screen-guard';
import { SearchView } from '@/components/views/search-view';
import { PlaylistView } from '@/components/views/playlist-view';
import { AlbumView } from '@/components/views/album-view';
import { SettingsView } from '@/components/views/settings-view';
import { APlayerWrapper } from '@/components/player/aplayer-wrapper';
import { MiniPlayer } from '@/components/player/mini-player';
import { FullPlayer } from '@/components/player/full-player';

const viewComponents = {
  search: SearchView,
  playlist: PlaylistView,
  album: AlbumView,
  settings: SettingsView,
};

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export function AppShell() {
  const { activeView } = useNavStore();
  const { currentSong } = usePlayerStore();

  const ActiveComponent = viewComponents[activeView];

  const hasSong = !!currentSong;

  return (
    <ScreenGuard>
      <div className="min-h-screen bg-background flex overflow-hidden">
        <Sidebar />

        <main
          className="flex-1 min-w-0 ml-16 flex flex-col overflow-y-auto overflow-x-hidden transition-all duration-300"
          style={{
            paddingBottom: hasSong ? '80px' : undefined,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex-1 min-w-0"
            >
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </main>

        <APlayerWrapper />

        {hasSong && <MiniPlayer />}
        <FullPlayer />
      </div>
    </ScreenGuard>
  );
}
