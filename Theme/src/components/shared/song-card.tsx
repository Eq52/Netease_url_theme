'use client';

import { Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '@/lib/stores/player-store';
import type { QueueItem } from '@/lib/types';

interface SongCardProps {
  song: QueueItem;
  queue?: QueueItem[];
  index?: number;
}

export function SongCard({ song, queue, index }: SongCardProps) {
  const { playSong, currentSongId, isLoading } = usePlayerStore();

  const isActive = currentSongId === song.id;
  const coverUrl = song.picUrl || '/logo.svg';

  const handleClick = () => {
    if (!isLoading) {
      playSong(song, queue, index);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="relative group cursor-pointer rounded-xl overflow-hidden bg-surface-card border border-transparent hover:border-gold/20 transition-all duration-300"
    >
      {/* Cover Art */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={coverUrl}
          alt={song.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo.svg';
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            className="w-12 h-12 rounded-full bg-gold/90 flex items-center justify-center gold-glow"
          >
            <Play className="w-5 h-5 text-black ml-0.5" fill="black" />
          </motion.div>
        </div>

        {/* Active indicator */}
        {isActive && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-gold text-black text-[10px] font-bold">
            播放中
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-medium text-white truncate group-hover:text-gold transition-colors">
          {song.name}
        </h3>
        <p className="text-xs text-muted-foreground truncate">
          {song.artists}
        </p>
        <p className="text-[11px] text-muted-foreground/60 truncate">
          {song.album}
        </p>
      </div>
    </motion.div>
  );
}
