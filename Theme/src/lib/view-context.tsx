"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type ViewType = "search" | "playlist" | "album";

interface ViewState {
  activeView: ViewType;
  setActiveView: (v: ViewType) => void;

  // Sub-view data
  playlistId: string | null;
  albumId: string | null;

  openPlaylist: (id: string) => void;
  openAlbum: (id: string) => void;
  goBack: () => void;
}

const ViewContext = createContext<ViewState | null>(null);

export function useView() {
  const ctx = useContext(ViewContext);
  if (!ctx) throw new Error("useView must be used within ViewProvider");
  return ctx;
}

export function ViewProvider({ children }: { children: React.ReactNode }) {
  const [activeView, setActiveView] = useState<ViewType>("search");
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  const [albumId, setAlbumId] = useState<string | null>(null);

  const openPlaylist = useCallback((id: string) => {
    setPlaylistId(id);
    setActiveView("playlist");
  }, []);

  const openAlbum = useCallback((id: string) => {
    setAlbumId(id);
    setActiveView("album");
  }, []);

  const goBack = useCallback(() => {
    setPlaylistId(null);
    setAlbumId(null);
  }, []);

  return (
    <ViewContext.Provider
      value={{
        activeView,
        setActiveView,
        playlistId,
        albumId,
        openPlaylist,
        openAlbum,
        goBack,
      }}
    >
      {children}
    </ViewContext.Provider>
  );
}
