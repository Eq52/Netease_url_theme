const getApiBase = () => {
  if (typeof window !== 'undefined' && (window as unknown as Record<string, { apiBase: string }>).APP_CONFIG?.apiBase) {
    return (window as unknown as Record<string, { apiBase: string }>).APP_CONFIG.apiBase;
  }
  return '';
};

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const base = getApiBase();
  const url = `${base}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_');
}

function inferExtensionFromUrl(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('.flac')) return '.flac';
  if (lower.includes('.mp3')) return '.mp3';
  if (lower.includes('.m4a')) return '.m4a';
  if (lower.includes('.mp4')) return '.mp4';
  if (lower.includes('.wav')) return '.wav';
  if (lower.includes('.ogg')) return '.ogg';
  if (lower.includes('.aac')) return '.aac';
  // Netease CDN URLs often contain format hints like "/mp3/" or "/m4a/"
  if (/[/.]mp3([/?]|$)/.test(lower)) return '.mp3';
  if (/[/.](m4a|mp4)([/?]|$)/.test(lower)) return '.m4a';
  if (/[/.]flac([/?]|$)/.test(lower)) return '.flac';
  return '';
}

function blobDownload(url: string, body: Record<string, unknown>, filename: string): Promise<void> {
  const base = getApiBase();
  const fullUrl = `${base}${url}`;
  return fetch(fullUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(res => {
    if (!res.ok) throw new Error(`Download Error: ${res.status}`);

    // Try to extract extension from Content-Disposition header
    const disposition = res.headers.get('Content-Disposition') || '';
    const extMatch = disposition.match(/filename=.*\.(\w+)/);
    if (extMatch) {
      const ext = extMatch[1];
      const baseName = filename.replace(/\.\w+$/, '');
      filename = `${baseName}.${ext}`;
    } else {
      // Fallback: try Content-Type
      const contentType = res.headers.get('Content-Type') || '';
      const mimeToExt: Record<string, string> = {
        'audio/mpeg': 'mp3',
        'audio/flac': 'flac',
        'audio/mp4': 'm4a',
        'audio/m4a': 'm4a',
        'audio/x-m4a': 'm4a',
        'audio/wav': 'wav',
        'audio/ogg': 'ogg',
        'audio/aac': 'aac',
        'application/octet-stream': '',
      };
      for (const [mime, ext] of Object.entries(mimeToExt)) {
        if (contentType.includes(mime)) {
          if (ext) {
            const baseName = filename.replace(/\.\w+$/, '');
            filename = `${baseName}.${ext}`;
          }
          break;
        }
      }
    }

    return res.blob();
  }).then(blob => {
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(downloadUrl);
  });
}

export const api = {
  searchSongs: (keyword: string, limit = 30) =>
    fetchApi<{ data?: unknown[]; [key: string]: unknown }>('/search', {
      method: 'POST',
      body: JSON.stringify({ keyword, limit }),
    }),

  getSongDetail: (id: string, level: string) =>
    fetchApi<{ data?: { id: string; name: string; ar_name: string; al_name: string; pic: string; url: string; size: string; level: string; type: string; lyric: string; tlyric: string }; [key: string]: unknown }>('/Song_V1', {
      method: 'POST',
      body: JSON.stringify({ id, level, type: 'json' }),
    }),

  getPlaylist: (id: string) =>
    fetchApi<{ data: { playlist: { id: number; name: string; coverImgUrl: string; creator: { nickname: string; avatarUrl: string }; trackCount: number; description: string; tracks: Array<{ id: number; name: string; artists: string; album: string; picUrl: string }> } } }>(`/Playlist?id=${id}`, {
      method: 'GET',
    }),

  getAlbum: (id: string) =>
    fetchApi<{ data: { album: { id: number; name: string; coverImgUrl: string; artist: { name: string }; publishTime: number; description: string; songs: Array<{ id: number; name: string; artists: string; album: string; picUrl: string }> } } }>(`/Album?id=${id}`, {
      method: 'GET',
    }),

  downloadSong: (id: string, quality: string, name?: string, artist?: string, fileType?: string) => {
    const baseName = (name && artist) ? `${sanitizeFilename(name)}-${sanitizeFilename(artist)}` : 'download';
    const filename = fileType ? `${baseName}.${fileType}` : baseName;
    return blobDownload('/Download', { id, quality }, filename);
  },

  getHealth: () =>
    fetchApi<{ status: number; success: boolean; message: string; data: { cookie_status: string; version: string; downloads_dir: string; service: string; timestamp: number } }>('/health', {
      method: 'GET',
    }),
};
