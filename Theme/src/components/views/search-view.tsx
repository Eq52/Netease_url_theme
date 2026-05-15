'use client';

import { useState, useCallback } from 'react';
import { Search, Loader2, Music2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { SongCard } from '@/components/shared/song-card';
import { api } from '@/lib/api';
import type { QueueItem } from '@/lib/types';

export function SearchView() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<QueueItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const handleSearch = useCallback(async () => {
    if (!keyword.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const response = await api.searchSongs(keyword.trim(), 30);
      const data = response.data;
      // Handle various response formats
      const rawSongs = Array.isArray(data) ? data : [];
      const songs: QueueItem[] = rawSongs.map((item: unknown) => {
        const r = item as Record<string, unknown>;
        return {
          id: Number(r.id),
          name: String(r.name || ''),
          artists: String(r.artists || r.artist || ''),
          album: String(r.album || r.al_name || ''),
          picUrl: String(r.picUrl || r.pic || ''),
        };
      });
      setResults(songs);
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [keyword]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
          搜索音乐
        </h1>
        <p className="text-sm text-muted-foreground">
          发现你喜欢的歌曲
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-gold transition-colors" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入歌曲名、歌手或专辑..."
            className="h-12 pl-12 pr-24 rounded-xl bg-surface-card border-surface-hover text-white placeholder:text-muted-foreground/60 focus:border-gold focus:ring-gold/20 text-sm"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !keyword.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-4 rounded-lg bg-gold text-black text-sm font-medium hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              '搜索'
            )}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isSearching && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
          <p className="text-sm text-muted-foreground">搜索中...</p>
        </div>
      )}

      {/* Empty State */}
      {!isSearching && !hasSearched && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-20 h-20 rounded-full bg-surface-card flex items-center justify-center">
            <Music2 className="w-10 h-10 text-gold/40" />
          </div>
          <p className="text-muted-foreground text-sm">输入关键词开始搜索</p>
        </div>
      )}

      {/* No Results */}
      {!isSearching && hasSearched && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-20 h-20 rounded-full bg-surface-card flex items-center justify-center">
            <Search className="w-10 h-10 text-gold/40" />
          </div>
          <p className="text-muted-foreground text-sm">没有找到相关歌曲</p>
        </div>
      )}

      {/* Results Grid */}
      {!isSearching && results.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            找到 <span className="text-gold font-medium">{results.length}</span> 首歌曲
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((song, index) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
              >
                <SongCard
                  song={song}
                  queue={results}
                  index={index}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
