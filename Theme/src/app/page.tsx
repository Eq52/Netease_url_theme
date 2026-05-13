"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Music, Download, Disc3, ListMusic, Mic2, Image as ImageIcon, Loader2,
  Headphones,
} from "lucide-react";
import { toast } from "sonner";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

import APlayerComponent from "@/components/aplayer-component";
import {
  searchSongs,
  getSongDetail,
  getPlaylist,
  getAlbum,
  downloadSong,
  SearchSong,
  SongDetail,
  PlaylistData,
  AlbumData,
  QUALITY_OPTIONS,
} from "@/lib/api";
import {
  extractAndCheckId,
  formatFileSize,
} from "@/lib/music-utils";

// ─────────────── Animation Variants ───────────────
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const tabContentVariants = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.15 } },
};

const cardVariants = {
  initial: { opacity: 0, y: 16, scale: 0.97 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" },
  }),
};

// ─────────────── Sub-Components ───────────────

function SongCard({
  song,
  index,
  onParse,
  onDownload,
}: {
  song: SearchSong;
  index: number;
  onParse: (song: SearchSong) => void;
  onDownload: (song: SearchSong) => void;
}) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(236, 65, 65, 0.12)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="glass-card overflow-hidden group cursor-pointer border-0">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Album art */}
            <div className="relative shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shadow-lg">
                <img
                  src={song.picUrl || "/placeholder-music.png"}
                  alt={song.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23333' width='100' height='100'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23666' font-size='28'%3E♪%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base text-foreground truncate group-hover:text-primary transition-colors">
                {song.name}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">
                {song.artists}
              </p>
              <p className="text-xs text-muted-foreground/60 truncate">
                {song.album}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-9 text-xs border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
              onClick={() => onParse(song)}
            >
              <Mic2 className="h-3.5 w-3.5 mr-1" />
              解析
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-9 text-xs border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
              onClick={() => onDownload(song)}
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              下载
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 flex-1" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TrackListItem({
  track,
  onParse,
  onDownload,
}: {
  track: { id: number; name: string; artists: string; album: string; picUrl: string };
  onParse: (track: typeof track) => void;
  onDownload: (track: typeof track) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
    >
      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 shadow-md">
        <img
          src={track.picUrl || ""}
          alt={`${track.name} 封面`}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23333' width='100' height='100'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23666' font-size='28'%3E♪%3C/text%3E%3C/svg%3E";
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate text-foreground group-hover:text-primary transition-colors">
          {track.name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {track.artists} · {track.album}
        </p>
      </div>
      <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
          onClick={() => onParse(track)}
        >
          <Mic2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
          onClick={() => onDownload(track)}
        >
          <Download className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}

// ─────────────── Main Page ───────────────

export default function Home() {
  // Global state for cross-tab data sharing
  const [activeTab, setActiveTab] = useState("search");

  // Search state
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLimit, setSearchLimit] = useState("30");
  const [searchResults, setSearchResults] = useState<SearchSong[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Song parse state
  const [parseInput, setParseInput] = useState("");
  const [parseQuality, setParseQuality] = useState("exhigh");
  const [parseResult, setParseResult] = useState<SongDetail | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);

  // Playlist state
  const [playlistInput, setPlaylistInput] = useState("");
  const [playlistResult, setPlaylistResult] = useState<PlaylistData | null>(null);
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(false);

  // Album state
  const [albumInput, setAlbumInput] = useState("");
  const [albumResult, setAlbumResult] = useState<AlbumData | null>(null);
  const [isLoadingAlbum, setIsLoadingAlbum] = useState(false);

  // Download state
  const [downloadInput, setDownloadInput] = useState("");
  const [downloadQuality, setDownloadQuality] = useState("exhigh");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Ref for song parse input
  const parseInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ─────────────── Search Handler ───────────────
  const handleSearch = useCallback(async () => {
    if (!searchKeyword.trim()) {
      toast.error("请输入搜索关键词");
      return;
    }
    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await searchSongs(searchKeyword.trim(), parseInt(searchLimit, 10));
      if (res.success && res.data) {
        setSearchResults(res.data);
        if (res.data.length === 0) {
          toast.info("没有找到相关歌曲");
        }
      } else {
        toast.error(res.message || "搜索失败");
        setSearchResults([]);
      }
    } catch {
      toast.error("搜索请求失败");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchKeyword, searchLimit]);

  // ─────────────── Song Parse Handler ───────────────
  const handleParse = useCallback(async (input?: string) => {
    const text = input || parseInput;
    if (!text.trim()) {
      toast.error("请输入歌曲ID或链接");
      return;
    }

    const extracted = extractAndCheckId(text.trim());
    if (!extracted) {
      toast.error("无法识别歌曲ID或链接");
      return;
    }

    setIsParsing(true);
    setParseResult(null);
    try {
      const songUrl = extracted.id;
      const res = await getSongDetail(songUrl, parseQuality);
      if (res.success && res.data) {
        setParseResult(res.data);
        toast.success("解析成功");
      } else {
        toast.error(res.message || "解析失败");
      }
    } catch {
      toast.error("解析请求失败");
    } finally {
      setIsParsing(false);
    }
  }, [parseInput, parseQuality]);

  // ─────────────── Playlist Handler ───────────────
  const handlePlaylist = useCallback(async () => {
    if (!playlistInput.trim()) {
      toast.error("请输入歌单ID或链接");
      return;
    }
    const extracted = extractAndCheckId(playlistInput.trim());
    if (!extracted) {
      toast.error("无法识别歌单ID或链接");
      return;
    }
    setIsLoadingPlaylist(true);
    setPlaylistResult(null);
    try {
      const res = await getPlaylist(extracted.id);
      if (res.success && res.data) {
        setPlaylistResult(res.data);
        toast.success(`歌单解析成功，共 ${res.data.playlist.trackCount} 首`);
      } else {
        toast.error(res.message || "歌单解析失败");
      }
    } catch {
      toast.error("歌单解析请求失败");
    } finally {
      setIsLoadingPlaylist(false);
    }
  }, [playlistInput]);

  // ─────────────── Album Handler ───────────────
  const handleAlbum = useCallback(async () => {
    if (!albumInput.trim()) {
      toast.error("请输入专辑ID或链接");
      return;
    }
    const extracted = extractAndCheckId(albumInput.trim());
    if (!extracted) {
      toast.error("无法识别专辑ID或链接");
      return;
    }
    setIsLoadingAlbum(true);
    setAlbumResult(null);
    try {
      const res = await getAlbum(extracted.id);
      if (res.success && res.data) {
        setAlbumResult(res.data);
        toast.success(`专辑解析成功，共 ${res.data.album.songs.length} 首`);
      } else {
        toast.error(res.message || "专辑解析失败");
      }
    } catch {
      toast.error("专辑解析请求失败");
    } finally {
      setIsLoadingAlbum(false);
    }
  }, [albumInput]);

  /** 清理文件名中的非法字符 */
  function sanitizeFileName(name: string): string {
    return name.replace(/[\\/:*?"<>|]/g, "_").trim();
  }

  // ─────────────── Download Handler ───────────────
  const handleDownload = useCallback(async (
    input?: string,
    quality?: string,
    songName?: string,
    artist?: string,
  ) => {
    const text = input || downloadInput;
    if (!text.trim()) {
      toast.error("请输入歌曲ID或链接");
      return;
    }
    const extracted = extractAndCheckId(text.trim());
    if (!extracted) {
      toast.error("无法识别歌曲ID或链接");
      return;
    }

    const q = quality || downloadQuality;

    setIsDownloading(true);
    setDownloadProgress(10);
    try {
      // 如果没有歌曲名/作者，先解析获取
      let name = songName;
      let ar = artist;
      if (!name || !ar) {
        setDownloadProgress(20);
        const detail = await getSongDetail(extracted.id, q);
        if (detail.success && detail.data) {
          name = detail.data.name;
          ar = detail.data.ar_name;
        }
      }

      const res = await downloadSong(extracted.id, q);
      if (res.success && res.data) {
        setDownloadProgress(80);
        const blob = res.data as unknown as Blob;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;

        const safeName = name ? sanitizeFileName(name) : `music_${extracted.id}`;
        const safeArtist = ar ? sanitizeFileName(ar) : "";
        a.download = safeArtist ? `${safeName} - ${safeArtist}` : safeName;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setDownloadProgress(100);
        toast.success("下载成功");
      } else {
        toast.error(res.message || "下载失败");
      }
    } catch {
      toast.error("下载请求失败");
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 800);
    }
  }, [downloadInput, downloadQuality]);

  // ─────────────── Cross-tab actions ───────────────
  const handleParseFromSearch = useCallback((song: SearchSong) => {
    setParseInput(String(song.id));
    setParseQuality("exhigh");
    setActiveTab("parse");
    setTimeout(() => {
      handleParse(String(song.id));
    }, 100);
  }, [handleParse]);

  const handleDownloadFromSearch = useCallback((song: SearchSong) => {
    setDownloadInput(String(song.id));
    setDownloadQuality("exhigh");
    setActiveTab("download");
    setTimeout(() => {
      handleDownload(String(song.id), "exhigh", song.name, song.artists);
    }, 100);
  }, [handleDownload]);

  const handleParseFromTrack = useCallback((track: { id: number }) => {
    setParseInput(String(track.id));
    setParseQuality("exhigh");
    setActiveTab("parse");
    setTimeout(() => {
      handleParse(String(track.id));
    }, 100);
  }, [handleParse]);

  const handleDownloadFromTrack = useCallback((track: { id: number; name: string; artists: string }) => {
    setDownloadInput(String(track.id));
    setDownloadQuality("exhigh");
    setActiveTab("download");
    setTimeout(() => {
      handleDownload(String(track.id), "exhigh", track.name, track.artists);
    }, 100);
  }, [handleDownload]);

  // ─────────────── Empty state ───────────────
  function EmptyState({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="text-muted-foreground/30 mb-4">{icon}</div>
        <h3 className="text-lg font-medium text-muted-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground/60 mt-1">{desc}</p>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ─────────── Header ─────────── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass sticky top-0 z-50 border-b border-border/50"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg music-glow">
              <Music className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight truncate">
                网易云音乐工具箱
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground -mt-0.5">
                Music Toolkit
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs hidden sm:flex items-center gap-1">
            <Headphones className="h-3 w-3" />
            v2.0
          </Badge>
        </div>
      </motion.header>

      {/* ─────────── Main Content ─────────── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">
        <motion.div variants={pageVariants} initial="initial" animate="animate">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="glass-card w-full flex h-auto p-1 mb-6 rounded-xl">
              <TabsTrigger
                value="search"
                className="flex-1 flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg text-xs sm:text-sm py-2.5"
              >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">歌曲搜索</span>
                <span className="sm:hidden">搜索</span>
              </TabsTrigger>
              <TabsTrigger
                value="parse"
                className="flex-1 flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg text-xs sm:text-sm py-2.5"
              >
                <Mic2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">单曲解析</span>
                <span className="sm:hidden">解析</span>
              </TabsTrigger>
              <TabsTrigger
                value="playlist"
                className="flex-1 flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg text-xs sm:text-sm py-2.5"
              >
                <ListMusic className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">歌单解析</span>
                <span className="sm:hidden">歌单</span>
              </TabsTrigger>
              <TabsTrigger
                value="album"
                className="flex-1 flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg text-xs sm:text-sm py-2.5"
              >
                <Disc3 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">专辑解析</span>
                <span className="sm:hidden">专辑</span>
              </TabsTrigger>
              <TabsTrigger
                value="download"
                className="flex-1 flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg text-xs sm:text-sm py-2.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">音乐下载</span>
                <span className="sm:hidden">下载</span>
              </TabsTrigger>
            </TabsList>

            {/* ═══════ Tab 1: Song Search ═══════ */}
            <AnimatePresence mode="wait">
              {activeTab === "search" && (
                <TabsContent value="search" forceMount asChild>
                  <motion.div
                    key="search"
                    variants={tabContentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    {/* Search input area */}
                    <div className="glass-card rounded-xl p-4 sm:p-5 mb-6">
                      <div className="flex gap-2 sm:gap-3">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            ref={searchInputRef}
                            placeholder="输入歌曲名、歌手名..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="glass-input pl-9 h-11 border-0 focus-visible:ring-1 focus-visible:ring-primary rounded-lg"
                          />
                        </div>
                        <Select value={searchLimit} onValueChange={setSearchLimit}>
                          <SelectTrigger className="w-24 h-11 glass-input border-0 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10首</SelectItem>
                            <SelectItem value="20">20首</SelectItem>
                            <SelectItem value="30">30首</SelectItem>
                            <SelectItem value="50">50首</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={handleSearch}
                          disabled={isSearching}
                          className="h-11 px-5 bg-primary hover:bg-primary/90 rounded-lg"
                        >
                          {isSearching ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4 sm:mr-2" />
                          )}
                          <span className="hidden sm:inline">搜索</span>
                        </Button>
                      </div>
                    </div>

                    {/* Results */}
                    {isSearching ? (
                      <SearchSkeleton />
                    ) : hasSearched && searchResults.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {searchResults.map((song, i) => (
                          <SongCard
                            key={song.id}
                            song={song}
                            index={i}
                            onParse={handleParseFromSearch}
                            onDownload={handleDownloadFromSearch}
                          />
                        ))}
                      </div>
                    ) : hasSearched && searchResults.length === 0 ? (
                      <EmptyState
                        icon={<Search className="h-16 w-16" />}
                        title="没有找到相关歌曲"
                        desc="试试换个关键词搜索"
                      />
                    ) : (
                      <EmptyState
                        icon={<Music className="h-16 w-16" />}
                        title="搜索你喜欢的音乐"
                        desc="输入歌曲名、歌手名或关键词开始搜索"
                      />
                    )}
                  </motion.div>
                </TabsContent>
              )}

              {/* ═══════ Tab 2: Song Parse ═══════ */}
              {activeTab === "parse" && (
                <TabsContent value="parse" forceMount asChild>
                  <motion.div
                    key="parse"
                    variants={tabContentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <div className="glass-card rounded-xl p-4 sm:p-5 mb-6">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                          ref={parseInputRef}
                          placeholder="输入歌曲ID或网易云音乐链接"
                          value={parseInput}
                          onChange={(e) => setParseInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleParse()}
                          className="glass-input flex-1 h-11 border-0 focus-visible:ring-1 focus-visible:ring-primary rounded-lg"
                        />
                        <Select value={parseQuality} onValueChange={setParseQuality}>
                          <SelectTrigger className="w-full sm:w-40 h-11 glass-input border-0 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {QUALITY_OPTIONS.map((q) => (
                              <SelectItem key={q.value} value={q.value}>
                                {q.label} ({q.desc})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => handleParse()}
                          disabled={isParsing}
                          className="h-11 px-5 bg-primary hover:bg-primary/90 rounded-lg"
                        >
                          {isParsing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Mic2 className="h-4 w-4 sm:mr-2" />
                          )}
                          <span className="hidden sm:inline">解析</span>
                        </Button>
                      </div>
                    </div>

                    {isParsing && (
                      <Card className="glass-card border-0">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <Skeleton className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl" />
                              <div className="flex-1 space-y-3">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-4 w-2/3" />
                                <div className="flex gap-2 mt-2">
                                  <Skeleton className="h-6 w-16 rounded-full" />
                                  <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {parseResult && !isParsing && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Card className="glass-card border-0 overflow-visible">
                          <CardContent className="p-5 sm:p-6">
                            {/* Top section: cover + info */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-5">
                              <div
                                className="relative group/cover cursor-pointer shrink-0"
                                onClick={() => setShowImageDialog(true)}
                              >
                                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-2xl music-glow">
                                  <img
                                    src={parseResult.pic || ""}
                                    alt={parseResult.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23333' width='100' height='100'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23666' font-size='28'%3E♪%3C/text%3E%3C/svg%3E";
                                    }}
                                  />
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center">
                                  <ImageIcon className="h-6 w-6 text-white" />
                                </div>
                              </div>

                              <div className="flex-1 min-w-0 text-center sm:text-left">
                                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 break-words">
                                  {parseResult.name}
                                </h2>
                                <p className="text-base text-muted-foreground truncate">
                                  <span className="text-primary font-medium">{parseResult.ar_name}</span>
                                </p>
                                <p className="text-sm text-muted-foreground/70 mt-1 truncate">
                                  专辑：{parseResult.al_name}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                                  <Badge className="bg-primary/15 text-primary border-primary/30 hover:bg-primary/25">
                                    {parseResult.level}
                                  </Badge>
                                  <Badge variant="secondary">
                                    {formatFileSize(parseResult.size)}
                                  </Badge>
                                </div>

                                {parseResult.url && (
                                  <div className="mt-4 flex gap-2 justify-center sm:justify-start">
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        setDownloadInput(parseInput);
                                        setDownloadQuality(parseQuality);
                                        setActiveTab("download");
                                        setTimeout(() => {
                                          handleDownload(parseInput, parseQuality, parseResult.name, parseResult.ar_name);
                                        }, 100);
                                      }}
                                      className="bg-primary hover:bg-primary/90"
                                    >
                                      <Download className="h-4 w-4 mr-1.5" />
                                      下载
                                    </Button>
                                    {parseResult.url && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-primary/30 text-primary hover:bg-primary/10"
                                        onClick={() => setShowImageDialog(true)}
                                      >
                                        <ImageIcon className="h-4 w-4 mr-1.5" />
                                        显示大图
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* APlayer: Player + Lyrics */}
                            {parseResult.url && (
                              <div className="mb-5 px-1">
                                <APlayerComponent
                                  name={parseResult.name}
                                  artist={parseResult.ar_name}
                                  url={parseResult.url}
                                  cover={parseResult.pic || ""}
                                  lyric={parseResult.lyric || ""}
                                  tlyric={parseResult.tlyric || ""}
                                />
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Image dialog */}
                        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
                          <DialogContent className="max-w-lg p-2 sm:p-6 bg-background/95 backdrop-blur-xl border-border/50">
                            <DialogTitle className="sr-only">封面大图</DialogTitle>
                            {parseResult.pic && (
                              <img
                                src={parseResult.pic}
                                alt={parseResult.name}
                                className="w-full rounded-lg"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23333' width='100' height='100'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23666' font-size='28'%3E♪%3C/text%3E%3C/svg%3E";
                                }}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                      </motion.div>
                    )}

                    {!parseResult && !isParsing && (
                      <EmptyState
                        icon={<Mic2 className="h-16 w-16" />}
                        title="解析单曲信息"
                        desc="输入歌曲ID或链接，获取详细信息、歌词和在线播放"
                      />
                    )}
                  </motion.div>
                </TabsContent>
              )}

              {/* ═══════ Tab 3: Playlist Parse ═══════ */}
              {activeTab === "playlist" && (
                <TabsContent value="playlist" forceMount asChild>
                  <motion.div
                    key="playlist"
                    variants={tabContentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <div className="glass-card rounded-xl p-4 sm:p-5 mb-6">
                      <div className="flex gap-2 sm:gap-3">
                        <Input
                          placeholder="输入歌单ID或网易云音乐链接"
                          value={playlistInput}
                          onChange={(e) => setPlaylistInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handlePlaylist()}
                          className="glass-input flex-1 h-11 border-0 focus-visible:ring-1 focus-visible:ring-primary rounded-lg"
                        />
                        <Button
                          onClick={handlePlaylist}
                          disabled={isLoadingPlaylist}
                          className="h-11 px-5 bg-primary hover:bg-primary/90 rounded-lg"
                        >
                          {isLoadingPlaylist ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ListMusic className="h-4 w-4 sm:mr-2" />
                          )}
                          <span className="hidden sm:inline">解析</span>
                        </Button>
                      </div>
                    </div>

                    {isLoadingPlaylist && (
                      <Card className="glass-card border-0">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl" />
                            <div className="flex-1 space-y-3">
                              <Skeleton className="h-5 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                              <Skeleton className="h-4 w-2/3" />
                            </div>
                          </div>
                          <div className="mt-6 space-y-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Skeleton key={i} className="h-12 w-full rounded-lg" />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {playlistResult && !isLoadingPlaylist && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Card className="glass-card border-0 overflow-hidden mb-4">
                          <CardContent className="p-5 sm:p-6">
                            <div className="flex items-start gap-4 mb-4">
                              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-xl shrink-0">
                                <img
                                  src={playlistResult.playlist.coverImgUrl || ""}
                                  alt="歌单封面"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23333' width='100' height='100'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23666' font-size='20'%3E♫%3C/text%3E%3C/svg%3E";
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h2 className="text-lg sm:text-xl font-bold text-foreground break-words">
                                  {playlistResult.playlist.name}
                                </h2>
                                <p className="text-sm text-primary mt-1 truncate">
                                  {playlistResult.playlist.creator}
                                </p>
                                <Badge variant="secondary" className="mt-2 shrink-0">
                                  {playlistResult.playlist.trackCount} 首歌曲
                                </Badge>
                                {playlistResult.playlist.description && (
                                  <p className="text-xs text-muted-foreground/60 mt-2 line-clamp-2 break-words">
                                    {playlistResult.playlist.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="glass-card border-0">
                          <CardContent className="p-2 sm:p-3">
                            <ScrollArea className="max-h-96">
                              <div>
                                {playlistResult.playlist.tracks.map((track) => (
                                  <TrackListItem
                                    key={track.id}
                                    track={track}
                                    onParse={handleParseFromTrack}
                                    onDownload={handleDownloadFromTrack}
                                  />
                                ))}
                              </div>
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}

                    {!playlistResult && !isLoadingPlaylist && (
                      <EmptyState
                        icon={<ListMusic className="h-16 w-16" />}
                        title="解析歌单信息"
                        desc="输入歌单ID或链接，查看歌单中的所有歌曲"
                      />
                    )}
                  </motion.div>
                </TabsContent>
              )}

              {/* ═══════ Tab 4: Album Parse ═══════ */}
              {activeTab === "album" && (
                <TabsContent value="album" forceMount asChild>
                  <motion.div
                    key="album"
                    variants={tabContentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <div className="glass-card rounded-xl p-4 sm:p-5 mb-6">
                      <div className="flex gap-2 sm:gap-3">
                        <Input
                          placeholder="输入专辑ID或网易云音乐链接"
                          value={albumInput}
                          onChange={(e) => setAlbumInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAlbum()}
                          className="glass-input flex-1 h-11 border-0 focus-visible:ring-1 focus-visible:ring-primary rounded-lg"
                        />
                        <Button
                          onClick={handleAlbum}
                          disabled={isLoadingAlbum}
                          className="h-11 px-5 bg-primary hover:bg-primary/90 rounded-lg"
                        >
                          {isLoadingAlbum ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Disc3 className="h-4 w-4 sm:mr-2" />
                          )}
                          <span className="hidden sm:inline">解析</span>
                        </Button>
                      </div>
                    </div>

                    {isLoadingAlbum && (
                      <Card className="glass-card border-0">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl" />
                            <div className="flex-1 space-y-3">
                              <Skeleton className="h-5 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                              <Skeleton className="h-4 w-2/3" />
                            </div>
                          </div>
                          <div className="mt-6 space-y-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Skeleton key={i} className="h-12 w-full rounded-lg" />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {albumResult && !isLoadingAlbum && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Card className="glass-card border-0 overflow-hidden mb-4">
                          <CardContent className="p-5 sm:p-6">
                            <div className="flex items-start gap-4 mb-4">
                              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-xl shrink-0">
                                <img
                                  src={albumResult.album.coverImgUrl || ""}
                                  alt="专辑封面"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23333' width='100' height='100'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23666' font-size='20'%3E♫%3C/text%3E%3C/svg%3E";
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h2 className="text-lg sm:text-xl font-bold text-foreground break-words">
                                  {albumResult.album.name}
                                </h2>
                                <p className="text-sm text-primary mt-1 truncate">
                                  {albumResult.album.artist}
                                </p>
                                <Badge variant="secondary" className="mt-2 shrink-0">
                                  {albumResult.album.songs.length} 首歌曲
                                </Badge>
                                {albumResult.album.description && (
                                  <p className="text-xs text-muted-foreground/60 mt-2 line-clamp-2 break-words">
                                    {albumResult.album.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="glass-card border-0">
                          <CardContent className="p-2 sm:p-3">
                            <ScrollArea className="max-h-96">
                              <div>
                                {albumResult.album.songs.map((track) => (
                                  <TrackListItem
                                    key={track.id}
                                    track={track}
                                    onParse={handleParseFromTrack}
                                    onDownload={handleDownloadFromTrack}
                                  />
                                ))}
                              </div>
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}

                    {!albumResult && !isLoadingAlbum && (
                      <EmptyState
                        icon={<Disc3 className="h-16 w-16" />}
                        title="解析专辑信息"
                        desc="输入专辑ID或链接，查看专辑中的所有歌曲"
                      />
                    )}
                  </motion.div>
                </TabsContent>
              )}

              {/* ═══════ Tab 5: Music Download ═══════ */}
              {activeTab === "download" && (
                <TabsContent value="download" forceMount asChild>
                  <motion.div
                    key="download"
                    variants={tabContentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <div className="glass-card rounded-xl p-4 sm:p-5 mb-6">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                          placeholder="输入歌曲ID或网易云音乐链接"
                          value={downloadInput}
                          onChange={(e) => setDownloadInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleDownload()}
                          className="glass-input flex-1 h-11 border-0 focus-visible:ring-1 focus-visible:ring-primary rounded-lg"
                        />
                        <Select value={downloadQuality} onValueChange={setDownloadQuality}>
                          <SelectTrigger className="w-full sm:w-44 h-11 glass-input border-0 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {QUALITY_OPTIONS.map((q) => (
                              <SelectItem key={q.value} value={q.value}>
                                {q.label} ({q.desc})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => handleDownload()}
                          disabled={isDownloading}
                          className="h-11 px-5 bg-primary hover:bg-primary/90 rounded-lg"
                        >
                          {isDownloading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4 sm:mr-2" />
                          )}
                          <span className="hidden sm:inline">下载</span>
                        </Button>
                      </div>
                    </div>

                    {isDownloading && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Card className="glass-card border-0">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-3">
                              <Loader2 className="h-5 w-5 text-primary animate-spin" />
                              <span className="text-sm font-medium">
                                正在下载...
                              </span>
                            </div>
                            <Progress
                              value={downloadProgress}
                              className="h-2"
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                              {downloadProgress}% 完成
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}

                    {!isDownloading && downloadProgress === 100 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <Card className="glass-card border-0">
                          <CardContent className="p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-3">
                              <Download className="h-6 w-6 text-primary" />
                            </div>
                            <p className="text-sm font-medium">下载已完成</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              文件已保存到您的下载目录
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}

                    {!isDownloading && downloadProgress === 0 && (
                      <EmptyState
                        icon={<Download className="h-16 w-16" />}
                        title="下载高品质音乐"
                        desc="输入歌曲ID或链接，选择音质后点击下载"
                      />
                    )}
                  </motion.div>
                </TabsContent>
              )}
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </main>

      {/* ─────────── Footer ─────────── */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-auto border-t border-border/30 glass"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 text-center">
          <p className="text-xs text-muted-foreground/50">
            网易云音乐工具箱 · 仅供学习交流使用
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
