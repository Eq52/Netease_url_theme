"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ListMusic, Loader2, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getPlaylist, type PlaylistData } from "@/lib/api";
import { extractAndCheckId } from "@/lib/music-utils";
import SongRow from "@/components/shared/song-row";
import { useView } from "@/lib/view-context";
import { toast } from "sonner";

export default function PlaylistView() {
  const { playlistId } = useView();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<PlaylistData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-load if playlistId is set
  React.useEffect(() => {
    if (playlistId) {
      setInput(playlistId);
      loadPlaylist(playlistId);
    }
  }, [playlistId]);

  const loadPlaylist = useCallback(async (id?: string) => {
    const text = id || input;
    if (!text.trim()) {
      toast.error("请输入歌单ID或链接");
      return;
    }

    const extracted = extractAndCheckId(text.trim());
    if (!extracted) {
      toast.error("无法识别歌单ID或链接");
      return;
    }

    setIsLoading(true);
    setResult(null);
    try {
      const res = await getPlaylist(extracted.id);
      if (res.success && res.data) {
        setResult(res.data);
        toast.success(`歌单加载成功，共 ${res.data.playlist.trackCount} 首`);
      } else {
        toast.error(res.message || "歌单加载失败");
      }
    } catch {
      toast.error("歌单请求失败");
    } finally {
      setIsLoading(false);
    }
  }, [input]);

  // Detect paste with URL
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text");
    const extracted = extractAndCheckId(text);
    if (extracted && extracted.type === "playlist") {
      setTimeout(() => loadPlaylist(text), 100);
    }
  }, [loadPlaylist]);

  const trackRows = result?.playlist.tracks || [];
  const queueData = trackRows.map(t => ({
    id: t.id,
    name: t.name,
    artists: t.artists,
    album: t.album,
    picUrl: t.picUrl,
  }));

  return (
    <div className="px-4 md:px-8 py-6">
      {/* Input state - shown when no result */}
      <AnimatePresence mode="wait">
        {!result && !isLoading && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <ListMusic className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">打开歌单</h2>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-xs">
              输入网易云歌单ID或链接，浏览并播放歌单中的歌曲
            </p>
            <div className="flex gap-2 w-full max-w-md">
              <Input
                placeholder="输入歌单ID或链接..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadPlaylist()}
                onPaste={handlePaste}
                className="glass-input h-11 border-0 focus-visible:ring-1 focus-visible:ring-primary rounded-lg"
              />
              <Button
                onClick={() => loadPlaylist()}
                disabled={isLoading}
                className="h-11 px-5 bg-primary hover:bg-primary/90 rounded-lg shrink-0"
              >
                打开
              </Button>
            </div>
          </motion.div>
        )}

        {/* Loading state */}
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="w-28 h-28 md:w-36 md:h-36 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          </motion.div>
        )}

        {/* Result state */}
        {result && !isLoading && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Back button */}
            <button
              onClick={() => {
                setResult(null);
                setInput("");
              }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              返回
            </button>

            {/* Hero section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-6">
              <div className="w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden shadow-2xl shrink-0 music-glow">
                <img
                  src={result.playlist.coverImgUrl || ""}
                  alt="歌单封面"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23333' width='100' height='100'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23666' font-size='20'%3E♫%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h2 className="text-xl md:text-2xl font-bold break-words">
                  {result.playlist.name}
                </h2>
                <p className="text-sm text-primary mt-1.5 truncate">
                  {result.playlist.creator}
                </p>
                <div className="flex flex-wrap gap-2 mt-2.5 justify-center sm:justify-start">
                  <Badge variant="secondary">
                    {result.playlist.trackCount} 首歌曲
                  </Badge>
                </div>
                {result.playlist.description && (
                  <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-2">
                    {result.playlist.description}
                  </p>
                )}
              </div>
            </div>

            {/* Track list */}
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="px-3 py-2 border-b border-border/30 flex items-center gap-3">
                <div className="w-6 text-center text-[11px] text-muted-foreground/50">#</div>
                <div className="w-10" />
                <div className="flex-1 text-[11px] text-muted-foreground/50 uppercase tracking-wider">标题</div>
              </div>
              <div className="max-h-[calc(100vh-380px)] overflow-y-auto">
                {trackRows.map((track, i) => (
                  <SongRow
                    key={track.id}
                    song={track}
                    index={i}
                    queue={queueData}
                    showIndex
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
