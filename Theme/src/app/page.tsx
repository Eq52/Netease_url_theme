"use client";

import React, { useRef } from "react";
import { PlayerProvider } from "@/lib/player-context";
import { ViewProvider, useView } from "@/lib/view-context";
import AppShell from "@/components/layout/app-shell";
import TabBar from "@/components/layout/tab-bar";
import MiniPlayer from "@/components/player/mini-player";
import FullPlayer from "@/components/player/full-player";
import APlayerWrapper from "@/components/player/aplayer-wrapper";
import type { APlayerWrapperRef } from "@/components/player/aplayer-wrapper";
import SearchView from "@/components/views/search-view";
import PlaylistView from "@/components/views/playlist-view";
import AlbumView from "@/components/views/album-view";
import { usePlayer } from "@/lib/player-context";

function AppContent() {
  const { activeView } = useView();
  const { currentSong } = usePlayer();
  const aplayerRef = useRef<APlayerWrapperRef>(null);

  return (
    <>
      {/* Hidden APlayer instance */}
      <APlayerWrapper ref={aplayerRef} />

      <AppShell
        miniPlayer={<MiniPlayer aplayerRef={aplayerRef} />}
      >
        {activeView === "search" && <SearchView />}
        {activeView === "playlist" && <PlaylistView />}
        {activeView === "album" && <AlbumView />}
      </AppShell>

      {/* Full-screen player overlay */}
      <FullPlayer aplayerRef={aplayerRef} />

      {/* Mobile tab bar */}
      <TabBar />
    </>
  );
}

export default function Home() {
  return (
    <PlayerProvider>
      <ViewProvider>
        <AppContent />
      </ViewProvider>
    </PlayerProvider>
  );
}
