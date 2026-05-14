"use client";

import React from "react";
import Sidebar from "./sidebar";
import { usePlayer } from "@/lib/player-context";

interface AppShellProps {
  children: React.ReactNode;
  miniPlayer: React.ReactNode;
}

export default function AppShell({ children, miniPlayer }: AppShellProps) {
  const { currentSong } = usePlayer();

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar - desktop only */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Content scrollable area */}
        <div className="flex-1 overflow-y-auto pb-[120px] md:pb-0">
          {children}
        </div>

        {/* Mini Player - sticky at bottom */}
        {miniPlayer}
      </main>
    </div>
  );
}
