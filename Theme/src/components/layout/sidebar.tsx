"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, ListMusic, Disc3, Music2 } from "lucide-react";
import { useView, type ViewType } from "@/lib/view-context";
import { cn } from "@/lib/utils";

const navItems: { view: ViewType; icon: React.ElementType; label: string; labelZh: string }[] = [
  { view: "search", icon: Search, label: "Search", labelZh: "搜索" },
  { view: "playlist", icon: ListMusic, label: "Playlists", labelZh: "歌单" },
  { view: "album", icon: Disc3, label: "Albums", labelZh: "专辑" },
];

export default function Sidebar() {
  const { activeView, setActiveView } = useView();

  return (
    <aside className="hidden md:flex w-60 flex-col glass-sidebar h-full shrink-0">
      {/* Logo */}
      <div className="px-6 pt-6 pb-8">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg music-glow">
            <Music2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Aural</h1>
            <p className="text-[10px] text-muted-foreground -mt-0.5 tracking-wider uppercase">Music</p>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground/50 font-medium px-3 mb-2">
          浏览
        </div>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeView === item.view;
            const Icon = item.icon;
            return (
              <li key={item.view}>
                <button
                  onClick={() => setActiveView(item.view)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-3/50"
                  )}
                >
                  <Icon className={cn("h-[18px] w-[18px]", isActive && "text-primary")} />
                  <span>{item.labelZh}</span>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-6 pb-6">
        <div className="text-[11px] text-muted-foreground/40">
          Aural v1.0
        </div>
      </div>
    </aside>
  );
}
