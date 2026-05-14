"use client";

import React from "react";
import { Search, ListMusic, Disc3 } from "lucide-react";
import { useView, type ViewType } from "@/lib/view-context";
import { usePlayer } from "@/lib/player-context";
import { cn } from "@/lib/utils";

const tabItems: { view: ViewType; icon: React.ElementType; label: string }[] = [
  { view: "search", icon: Search, label: "搜索" },
  { view: "playlist", icon: ListMusic, label: "歌单" },
  { view: "album", icon: Disc3, label: "专辑" },
];

export default function TabBar() {
  const { activeView, setActiveView } = useView();
  const { currentSong } = usePlayer();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-player mobile-safe-bottom">
      <div className="flex items-center justify-around h-14">
        {tabItems.map((item) => {
          const isActive = activeView === item.view;
          const Icon = item.icon;
          return (
            <button
              key={item.view}
              onClick={() => setActiveView(item.view)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-4 py-1 transition-colors duration-200",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className={cn("text-[10px] font-medium", isActive && "text-primary")}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
