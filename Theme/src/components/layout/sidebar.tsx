'use client';

import { Search, ListMusic, Disc3, Settings, Music2 } from 'lucide-react';
import { useNavStore } from '@/lib/stores/nav-store';
import { cn } from '@/lib/utils';
import type { ViewType } from '@/lib/stores/nav-store';

const navItems: { view: ViewType; label: string; icon: typeof Search }[] = [
  { view: 'search', label: '搜索', icon: Search },
  { view: 'playlist', label: '歌单', icon: ListMusic },
  { view: 'album', label: '专辑', icon: Disc3 },
  { view: 'settings', label: '设置', icon: Settings },
];

export function Sidebar() {
  const { activeView, navigate } = useNavStore();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-16 hover:w-56 flex-col items-center py-6 z-40 glass-dark transition-all duration-300 group overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-4 w-full">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gold flex items-center justify-center">
          <Music2 className="w-5 h-5 text-black" />
        </div>
        <span className="text-gold font-bold text-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Aural
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-2 w-full px-3">
        {navItems.map(({ view, label, icon: Icon }) => (
          <button
            key={view}
            onClick={() => navigate(view)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full text-left',
              'hover:bg-surface-hover',
              activeView === view
                ? 'bg-gold/10 text-gold gold-glow-sm'
                : 'text-muted-foreground hover:text-white'
            )}
          >
            <Icon className={cn(
              'w-5 h-5 flex-shrink-0',
              activeView === view && 'text-gold'
            )} />
            <span className={cn(
              'text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200',
              activeView === view && 'text-gold'
            )}>
              {label}
            </span>
            {activeView === view && (
              <div className="absolute left-0 w-1 h-6 bg-gold rounded-r-full" />
            )}
          </button>
        ))}
      </nav>

      {/* Bottom decorative line */}
      <div className="mt-auto mx-4 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="mt-3 px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <p className="text-[10px] text-muted-foreground">v2.1.0</p>
      </div>
    </aside>
  );
}
