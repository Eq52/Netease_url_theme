'use client';

import { Play, Music2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '@/lib/stores/player-store';
import type { QueueItem } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SongRowProps {
  song: QueueItem;
  index: number;
  queue?: QueueItem[];
  showIndex?: boolean;
}

export function SongRow({ song, index, queue, showIndex = true }: SongRowProps) {
  const { playSong, currentSongId, isLoading } = usePlayerStore();

  const isActive = currentSongId === song.id;

  const handleClick = () => {
    if (!isLoading) {
      playSong(song, queue, index);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.2 }}
      onClick={handleClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group',
        'hover:bg-surface-hover',
        isActive && 'bg-gold/10 border border-gold/20',
        !isActive && 'border border-transparent'
      )}
    >
      {/* Index */}
      <div className="w-8 text-center flex-shrink-0">
        {isActive ? (
          <Music2 className="w-4 h-4 text-gold mx-auto" />
        ) : (
          <span className={cn(
            'text-sm group-hover:hidden',
            showIndex ? 'text-muted-foreground' : 'text-transparent'
          )}>
            {showIndex ? index + 1 : ''}
          </span>
        )}
        {!isActive && (
          <Play className="w-4 h-4 text-gold mx-auto hidden group-hover:block" />
        )}
      </div>

      {/* Cover thumbnail */}
      <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-surface">
        <img
          src={song.picUrl || '/logo.png'}
          alt={song.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo.png';
          }}
        />
      </div>

      {/* Song info */}
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          'text-sm font-medium truncate',
          isActive ? 'text-gold' : 'text-white group-hover:text-gold/80'
        )}>
          {song.name}
        </h3>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {song.artists}
        </p>
      </div>

      {/* Album */}
      <div className="block flex-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate text-right">
          {song.album}
        </p>
      </div>
    </motion.div>
  );
}
