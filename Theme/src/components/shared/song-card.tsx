"use client";

import React from "react";
import { motion } from "framer-motion";
import { Play, Download } from "lucide-react";
import { usePlayer } from "@/lib/player-context";
import type { SearchSong } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SongCardProps {
  song: SearchSong;
  index: number;
  queue: SearchSong[];
}

export default function SongCard({ song, index, queue }: SongCardProps) {
  const { playSong, downloadSongById } = usePlayer();

  const handlePlay = () => {
    const queueItems = queue.map(s => ({
      id: s.id,
      name: s.name,
      artists: s.artists,
      album: s.album,
      picUrl: s.picUrl,
    }));
    playSong(
      { id: song.id, name: song.name, artists: song.artists, album: song.album, picUrl: song.picUrl },
      queueItems,
      index
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="group cursor-pointer"
      onClick={handlePlay}
    >
      <div className="glass-card rounded-xl overflow-hidden">
        {/* Cover image with play overlay */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={song.picUrl || ""}
            alt={song.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23333' width='100' height='100'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23666' font-size='28'%3E♪%3C/text%3E%3C/svg%3E";
            }}
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlay();
              }}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg hover:scale-110 transition-transform"
            >
              <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadSongById(song.id, song.name, song.artists);
              }}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Song info */}
        <div className="p-3">
          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
            {song.name}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {song.artists}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
