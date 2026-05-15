'use client';

import { Search, ListMusic, Disc3, Settings } from 'lucide-react';
import { useNavStore } from '@/lib/stores/nav-store';
import { cn } from '@/lib/utils';
import type { ViewType } from '@/lib/stores/nav-store';

const navItems: { view: ViewType; label: string; icon: typeof Search }[] = [
  { view: 'search', label: '搜索', icon: Search },
  { view: 'playlist', label: '歌单', icon: ListMusic },
  { view: 'album', label: '专辑', icon: Disc3 },
  { view: 'settings', label: '设置', icon: Settings },
];

export function TabBar() {
  const { activeView, navigate } = useNavStore();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-dark border-t border-gold/10 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14">
        {navItems.map(({ view, label, icon: Icon }) => (
          <button
            key={view}
            onClick={() => navigate(view)}
            className={cn(
              'flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-all duration-200 min-w-[56px]',
              activeView === view
                ? 'text-gold'
                : 'text-muted-foreground active:text-white'
            )}
          >
            <Icon className={cn(
              'w-5 h-5 transition-all duration-200',
              activeView === view && 'text-gold drop-shadow-[0_0_6px_rgba(212,168,67,0.5)]'
            )} />
            <span className={cn(
              'text-[10px] font-medium',
              activeView === view && 'text-gold'
            )}>
              {label}
            </span>
            {activeView === view && (
              <div className="w-1 h-1 rounded-full bg-gold mt-0.5" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
