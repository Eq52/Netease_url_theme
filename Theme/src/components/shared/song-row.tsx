"use client";

import React from "react";
import { motion } from "framer-motion";
import { Play, Download } from "lucide-react";
import { usePlayer } from "@/lib/player-context";
import { cn } from "@/lib/utils";

export interface SongRowData {
  id: number;
  name: string;
  artists: string;
  album: string;
  picUrl: string;
  duration?: string;
}

interface SongRowProps {
  song: SongRowData;
  index: number;
  queue: SongRowData[];
  showIndex?: boolean;
}

export default function SongRow({ song, index, queue, showIndex = true }: SongRowProps) {
  const { playSong, currentSongId, isPlaying, downloadSongById } = usePlayer();

  const isCurrentSong = currentSongId !== null && song.id === currentSongId;

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
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className="song-row flex items-center gap-3 px-3 py-2.5 rounded-lg group cursor-pointer"
      onClick={handlePlay}
    >
      {/* Index or playing indicator */}
      {showIndex && (
        <div className="w-6 text-center shrink-0">
          <span className={cn(
            "text-xs tabular-nums transition-colors",
            isCurrentSong ? "text-primary font-medium" : "text-muted-foreground/60"
          )}>
            {isCurrentSong && isPlaying ? (
              <span className="inline-block w-3 h-3">
                <svg viewBox="0 0 12 12" className="w-3 h-3 text-primary">
                  <rect x="1" y="5" width="2" height="4" fill="currentColor" opacity="0.7">
                    <animate attributeName="height" values="4;7;4" dur="0.8s" repeatCount="indefinite" />
                    <animate attributeName="y" values="5;2.5;5" dur="0.8s" repeatCount="indefinite" />
                  </rect>
                  <rect x="5" y="3" width="2" height="6" fill="currentColor" opacity="0.9">
                    <animate attributeName="height" values="6;3;6" dur="0.6s" repeatCount="indefinite" />
                    <animate attributeName="y" values="3;4.5;3" dur="0.6s" repeatCount="indefinite" />
                  </rect>
                  <rect x="9" y="4" width="2" height="5" fill="currentColor" opacity="0.8">
                    <animate attributeName="height" values="5;8;5" dur="0.7s" repeatCount="indefinite" />
                    <animate attributeName="y" values="4;2;4" dur="0.7s" repeatCount="indefinite" />
                  </rect>
                </svg>
              </span>
            ) : (
              index + 1
            )}
          </span>
        </div>
      )}

      {/* Cover thumbnail */}
      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 shadow-sm">
        <img
          src={song.picUrl || ""}
          alt={song.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23333' width='100' height='100'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23666' font-size='28'%3E♪%3C/text%3E%3C/svg%3E";
          }}
        />
      </div>

      {/* Song info */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium truncate transition-colors",
          isCurrentSong ? "text-primary" : "text-foreground group-hover:text-primary"
        )}>
          {song.name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {song.artists}{song.album ? ` · ${song.album}` : ""}
        </p>
      </div>

      {/* Duration (if available) */}
      {song.duration && (
        <span className="text-xs text-muted-foreground/60 tabular-nums shrink-0">
          {song.duration}
        </span>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePlay();
          }}
          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
        >
          <Play className="h-3.5 w-3.5" fill="currentColor" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            downloadSongById(song.id, song.name, song.artists);
          }}
          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
        >
          <Download className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
