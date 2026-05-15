// ===== Song Types =====
export interface Song {
  id: number;
  name: string;
  artists: string;
  album: string;
  picUrl: string;
}

export interface SongDetail {
  id: string;
  name: string;
  ar_name: string;
  al_name: string;
  pic: string;
  url: string;
  size: string;
  level: string;
  type: string;
  lyric: string;
  tlyric: string;
}

export interface QueueItem {
  id: number;
  name: string;
  artists: string;
  album: string;
  picUrl: string;
}

// ===== Lyrics =====
export interface LyricLine {
  time: number; // in seconds
  text: string;
  translation?: string;
}

// ===== Playlist =====
export interface PlaylistData {
  data: {
    playlist: {
      id: number;
      name: string;
      coverImgUrl: string;
      creator: {
        nickname: string;
        avatarUrl: string;
      };
      trackCount: number;
      description: string;
      tracks: Song[];
    };
  };
}

// ===== Album =====
export interface AlbumData {
  data: {
    album: {
      id: number;
      name: string;
      coverImgUrl: string;
      artist: {
        name: string;
      };
      publishTime: number;
      description: string;
      songs: Song[];
    };
  };
}

// ===== Health =====
export interface HealthData {
  cookie_status: string;
  version: string;
  downloads_dir: string;
}

// ===== API Response =====
export interface ApiResponse<T> {
  data?: T;
  code?: number;
  msg?: string;
  error?: string;
  [key: string]: unknown;
}

// ===== Quality Options =====
export interface QualityOption {
  value: string;
  label: string;
  description: string;
}

export const QUALITY_OPTIONS: QualityOption[] = [
  { value: 'standard', label: '标准', description: '128kbps MP3' },
  { value: 'exhigh', label: '极高', description: '320kbps MP3' },
  { value: 'lossless', label: '无损', description: 'FLAC 无损音质' },
  { value: 'hires', label: 'Hi-Res', description: '高解析度音频' },
  { value: 'sky', label: '沉浸环绕声', description: '沉浸式环绕声' },
  { value: 'jyeffect', label: '高清环绕声', description: '高清环绕声' },
  { value: 'jymaster', label: '超清母带', description: '超清母带音质' },
  { value: 'dolby', label: '杜比全景声', description: 'Dolby Atmos 空间音频' },
];
