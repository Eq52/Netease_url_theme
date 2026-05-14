"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Music2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { searchSongs, type SearchSong } from "@/lib/api";
import SongCard from "@/components/shared/song-card";
import { toast } from "sonner";

export default function SearchView() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<SearchSong[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback(async () => {
    if (!keyword.trim()) {
      toast.error("请输入搜索关键词");
      return;
    }
    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await searchSongs(keyword.trim(), 30);
      if (res.success && res.data) {
        setResults(res.data);
        if (res.data.length === 0) {
          toast.info("没有找到相关歌曲");
        }
      } else {
        toast.error(res.message || "搜索失败");
        setResults([]);
      }
    } catch {
      toast.error("搜索请求失败");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [keyword]);

  return (
    <div className="px-4 md:px-8 py-6">
      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="搜索你想要的音乐..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="glass-input pl-12 h-12 md:h-14 text-base border-0 focus-visible:ring-1 focus-visible:ring-primary rounded-xl"
            />
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 md:h-10 px-4 md:px-6 bg-primary hover:bg-primary/90 rounded-lg"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "搜索"
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Empty state - before searching */}
      {!hasSearched && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 music-glow">
            <Music2 className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Aural</h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            搜索歌曲名、歌手名或关键词，发现你喜欢的音乐
          </p>
        </motion.div>
      )}

      {/* Loading state */}
      {isSearching && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl overflow-hidden">
              <Skeleton className="aspect-square" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results grid */}
      {!isSearching && results.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm text-muted-foreground">
              找到 <span className="text-foreground font-medium">{results.length}</span> 首歌曲
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {results.map((song, i) => (
              <SongCard key={song.id} song={song} index={i} queue={results} />
            ))}
          </div>
        </motion.div>
      )}

      {/* No results */}
      {!isSearching && hasSearched && results.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">没有找到相关歌曲</h3>
          <p className="text-sm text-muted-foreground/60 mt-1">试试换个关键词搜索</p>
        </motion.div>
      )}
    </div>
  );
}
