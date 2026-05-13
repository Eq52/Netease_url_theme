// API utility functions for the Netease Cloud Music Toolkit
// 直连 Flask 后端，所有请求通过 config.js 中配置的 apiBase 发出

export interface ApiResponse<T = unknown> {
  status: number;
  success?: boolean;
  message?: string;
  detail?: string;
  data?: T;
}

export interface SearchSong {
  id: number;
  name: string;
  artists: string;
  album: string;
  picUrl: string;
}

export interface SongDetail {
  name: string;
  ar_name: string;
  al_name: string;
  level: string;
  size: string;
  url: string;
  pic: string;
  lyric: string;
  tlyric: string;
}

export interface PlaylistTrack {
  id: number;
  name: string;
  artists: string;
  album: string;
  picUrl: string;
}

export interface PlaylistData {
  playlist: {
    name: string;
    creator: string;
    coverImgUrl: string;
    trackCount: number;
    description: string;
    tracks: PlaylistTrack[];
  };
}

export interface AlbumSong {
  id: number;
  name: string;
  artists: string;
  album: string;
  picUrl: string;
}

export interface AlbumData {
  album: {
    name: string;
    artist: string;
    coverImgUrl: string;
    description: string;
    songs: AlbumSong[];
  };
}

// Quality options mapping
export const QUALITY_OPTIONS = [
  { value: "standard", label: "标准", desc: "128kbps" },
  { value: "higher", label: "极高", desc: "192kbps" },
  { value: "exhigh", label: "无损", desc: "320kbps" },
  { value: "lossless", label: "Hi-Res", desc: "FLAC" },
  { value: "hires", label: "Hi-Res", desc: "高解析度" },
  { value: "jyeffect", label: "高清环绕声", desc: "环绕声" },
  { value: "sky", label: "沉浸环绕声", desc: "天空声道" },
  { value: "jymaster", label: "超清母带", desc: "母带级" },
  { value: "dolby", label: "杜比全景声", desc: "Dolby Atmos" },
];

/**
 * 从 config.js 获取 Flask 后端地址
 * 空字符串 "" 表示同源（前端与 Flask 在同一服务器）
 * 默认: http://localhost:5000
 */
function getApiBase(): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  if (w.APP_CONFIG && typeof w.APP_CONFIG.apiBase === 'string') {
    return w.APP_CONFIG.apiBase;
  }
  return "http://localhost:5000";
}

async function apiRequest<T>(
  endpoint: string,
  method: string = "POST",
  body?: Record<string, unknown>,
  query?: Record<string, string>
): Promise<ApiResponse<T>> {
  const base = getApiBase();

  try {
    // 直连 Flask 后端
    let url = base
      ? `${base}/${endpoint}`
      : `/${endpoint}`;

    // GET 请求追加 query 参数
    if (query && method === "GET") {
      const params = new URLSearchParams(query);
      url += `?${params.toString()}`;
    }

    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, audio/*, */*",
      },
    };

    if (method === "POST" && body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const res = await fetch(url, fetchOptions);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `请求失败 (${res.status})`);
    }

    const contentType = res.headers.get("content-type") || "";

    // 处理音频文件下载
    if (contentType.includes("audio") || contentType.includes("octet-stream")) {
      const blob = await res.blob();
      return { status: 200, success: true, data: blob as unknown as T };
    }

    const data = await res.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("fetch") ||
        error.message.includes("NetworkError")
      ) {
        return {
          status: 503,
          success: false,
          message: `无法连接到后端服务 (${base})，请确认 Flask 服务已启动`,
        };
      }
      return {
        status: 500,
        success: false,
        message: error.message,
      };
    }
    return {
      status: 500,
      success: false,
      message: "未知错误",
    };
  }
}

// 搜索歌曲
export async function searchSongs(keyword: string, limit: number = 30): Promise<ApiResponse<SearchSong[]>> {
  return apiRequest<SearchSong[]>("search", "POST", { keyword, limit });
}

// 获取单曲详情
export async function getSongDetail(url: string, level: string = "exhigh"): Promise<ApiResponse<SongDetail>> {
  return apiRequest<SongDetail>("Song_V1", "POST", { url, level, type: "json" });
}

// 获取歌单
export async function getPlaylist(id: string): Promise<ApiResponse<PlaylistData>> {
  return apiRequest<PlaylistData>("Playlist", "GET", undefined, { id });
}

// 获取专辑
export async function getAlbum(id: string): Promise<ApiResponse<AlbumData>> {
  return apiRequest<AlbumData>("Album", "GET", undefined, { id });
}

// 下载歌曲
export async function downloadSong(id: string, quality: string = "exhigh"): Promise<ApiResponse<Blob>> {
  return apiRequest<Blob>("Download", "POST", { id, quality });
}
