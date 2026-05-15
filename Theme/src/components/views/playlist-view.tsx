'use client';

import { useState, useCallback } from 'react';
import { Loader2, ListMusic, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SongRow } from '@/components/shared/song-row';
import { usePlayerStore } from '@/lib/stores/player-store';
import { api } from '@/lib/api';
import { extractId } from '@/lib/music-utils';
import type { QueueItem } from '@/lib/types';

interface PlaylistInfo {
  id: number;
  name: string;
  coverImgUrl: string;
  creator: string;
  trackCount: number;
  description: string;
  tracks: QueueItem[];
}

export function PlaylistView() {
  const [inputValue, setInputValue] = useState('');
  const [playlist, setPlaylist] = useState<PlaylistInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { playSong } = usePlayerStore();

  const loadPlaylist = useCallback(async () => {
    if (!inputValue.trim()) return;
    setIsLoading(true);
    setError('');
    setPlaylist(null);

    try {
      const id = extractId(inputValue.trim());
      if (!id) {
        setError('无法解析歌单 ID');
        setIsLoading(false);
        return;
      }

      const response = await api.getPlaylist(id);
      const pl = response.data?.playlist;

      if (!pl) {
        setError('歌单不存在或加载失败');
        setIsLoading(false);
        return;
      }

      const tracks: QueueItem[] = (pl.tracks || []).map((t) => ({
        id: t.id,
        name: t.name,
        artists: t.artists,
        album: t.album,
        picUrl: t.picUrl,
      }));

      setPlaylist({
        id: pl.id,
        name: pl.name,
        coverImgUrl: pl.coverImgUrl,
        creator: typeof pl.creator === 'string' ? pl.creator : pl.creator?.nickname || '未知',
        trackCount: pl.trackCount,
        description: pl.description,
        tracks,
      });
    } catch (err) {
      console.error('Load playlist failed:', err);
      setError('加载失败，请检查歌单 ID');
    } finally {
      setIsLoading(false);
    }
  }, [inputValue]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') loadPlaylist();
  }, [loadPlaylist]);

  const handlePlayAll = useCallback(() => {
    if (!playlist || playlist.tracks.length === 0) return;
    playSong(playlist.tracks[0], playlist.tracks, 0);
  }, [playlist, playSong]);

  const handlePlaySong = useCallback((song: QueueItem, index: number) => {
    if (!playlist) return;
    playSong(song, playlist.tracks, index);
  }, [playlist, playSong]);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
          歌单
        </h1>
        <p className="text-sm text-muted-foreground">
          输入歌单 ID 或链接来加载歌单
        </p>
      </div>

      {/* Input */}
      <div className="flex gap-2 mb-6">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入歌单 ID 或链接..."
          className="flex-1 h-11 rounded-xl bg-surface-card border-surface-hover text-white placeholder:text-muted-foreground/60 focus:border-gold focus:ring-gold/20"
        />
        <Button
          onClick={loadPlaylist}
          disabled={isLoading || !inputValue.trim()}
          className="h-11 px-6 rounded-xl bg-gold text-black hover:bg-gold-light font-medium"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            '加载'
          )}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
          <p className="text-sm text-muted-foreground">加载歌单中...</p>
        </div>
      )}

      {/* Empty state */}
      {!playlist && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-20 h-20 rounded-full bg-surface-card flex items-center justify-center">
            <ListMusic className="w-10 h-10 text-gold/40" />
          </div>
          <p className="text-muted-foreground text-sm">输入歌单 ID 开始探索</p>
        </div>
      )}

      {/* Playlist Content */}
      {playlist && !isLoading && (
        <div className="space-y-6">
          {/* Banner */}
          <div className="relative rounded-2xl overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center scale-110 blur-sm"
              style={{ backgroundImage: `url(${playlist.coverImgUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />

            <div className="relative flex gap-5 p-5 md:p-6">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden flex-shrink-0 shadow-xl">
                <img
                  src={playlist.coverImgUrl}
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                />
              </div>

              <div className="flex flex-col justify-end min-w-0">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2">
                  {playlist.name}
                </h2>
                <p className="text-sm text-gold/80 mb-1">
                  by {playlist.creator}
                </p>
                <p className="text-xs text-muted-foreground">
                  {playlist.trackCount} 首歌曲
                </p>
                {playlist.description && (
                  <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-2 max-w-md">
                    {playlist.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Play All button */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handlePlayAll}
              className="bg-gold text-black hover:bg-gold-light rounded-xl px-6 font-medium"
            >
              播放全部
            </Button>
            <span className="text-sm text-muted-foreground">
              共 {playlist.tracks.length} 首
            </span>
          </div>

          {/* Track List */}
          <div className="space-y-1">
            {playlist.tracks.map((song, index) => (
              <SongRow
                key={song.id}
                song={song}
                index={index}
                queue={playlist.tracks}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
