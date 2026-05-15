'use client';

import { useState, useCallback } from 'react';
import { Loader2, Disc3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SongRow } from '@/components/shared/song-row';
import { usePlayerStore } from '@/lib/stores/player-store';
import { api } from '@/lib/api';
import { extractId } from '@/lib/music-utils';
import type { QueueItem } from '@/lib/types';

interface AlbumInfo {
  id: number;
  name: string;
  coverImgUrl: string;
  artist: { name: string };
  publishTime: number;
  description: string;
  songs: QueueItem[];
}

export function AlbumView() {
  const [inputValue, setInputValue] = useState('');
  const [album, setAlbum] = useState<AlbumInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { playSong } = usePlayerStore();

  const loadAlbum = useCallback(async () => {
    if (!inputValue.trim()) return;
    setIsLoading(true);
    setError('');
    setAlbum(null);

    try {
      const id = extractId(inputValue.trim());
      if (!id) {
        setError('无法解析专辑 ID');
        setIsLoading(false);
        return;
      }

      const response = await api.getAlbum(id);
      const al = response.data?.album;

      if (!al) {
        setError('专辑不存在或加载失败');
        setIsLoading(false);
        return;
      }

      const songs: QueueItem[] = (al.songs || []).map((s) => ({
        id: s.id,
        name: s.name,
        artists: s.artists,
        album: s.album,
        picUrl: s.picUrl,
      }));

      setAlbum({
        id: al.id,
        name: al.name,
        coverImgUrl: al.coverImgUrl,
        artist: al.artist,
        publishTime: al.publishTime,
        description: al.description,
        songs,
      });
    } catch (err) {
      console.error('Load album failed:', err);
      setError('加载失败，请检查专辑 ID');
    } finally {
      setIsLoading(false);
    }
  }, [inputValue]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') loadAlbum();
  }, [loadAlbum]);

  const handlePlayAll = useCallback(() => {
    if (!album || album.songs.length === 0) return;
    playSong(album.songs[0], album.songs, 0);
  }, [album, playSong]);

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '未知';
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
          专辑
        </h1>
        <p className="text-sm text-muted-foreground">
          输入专辑 ID 或链接来加载专辑
        </p>
      </div>

      {/* Input */}
      <div className="flex gap-2 mb-6">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入专辑 ID 或链接..."
          className="flex-1 h-11 rounded-xl bg-surface-card border-surface-hover text-white placeholder:text-muted-foreground/60 focus:border-gold focus:ring-gold/20"
        />
        <Button
          onClick={loadAlbum}
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
          <p className="text-sm text-muted-foreground">加载专辑中...</p>
        </div>
      )}

      {/* Empty state */}
      {!album && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-20 h-20 rounded-full bg-surface-card flex items-center justify-center">
            <Disc3 className="w-10 h-10 text-gold/40" />
          </div>
          <p className="text-muted-foreground text-sm">输入专辑 ID 开始探索</p>
        </div>
      )}

      {/* Album Content */}
      {album && !isLoading && (
        <div className="space-y-6">
          {/* Banner */}
          <div className="relative rounded-2xl overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center scale-110 blur-sm"
              style={{ backgroundImage: `url(${album.coverImgUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />

            <div className="relative flex gap-5 p-5 md:p-6">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden flex-shrink-0 shadow-xl">
                <img
                  src={album.coverImgUrl}
                  alt={album.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                />
              </div>

              <div className="flex flex-col justify-end min-w-0">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2">
                  {album.name}
                </h2>
                <p className="text-sm text-gold/80 mb-1">
                  {album.artist?.name || '未知歌手'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {album.songs.length} 首歌曲 · {formatDate(album.publishTime)}
                </p>
                {album.description && (
                  <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-2 max-w-md">
                    {album.description}
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
              共 {album.songs.length} 首
            </span>
          </div>

          {/* Track List */}
          <div className="space-y-1">
            {album.songs.map((song, index) => (
              <SongRow
                key={song.id}
                song={song}
                index={index}
                queue={album.songs}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
