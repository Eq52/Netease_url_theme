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

function blobDownload(url: string, body: Record<string, unknown>): Promise<void> {
  const base = getApiBase();
  const fullUrl = `${base}${url}`;
  return fetch(fullUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(res => {
    if (!res.ok) throw new Error(`Download Error: ${res.status}`);
    return res.blob();
  }).then(blob => {
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'download.mp3';
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
    fetchApi<{ data?: { id: string; name: string; ar_name: string; al_name: string; pic: string; url: string; size: string; level: string; lyric: string; tlyric: string }; [key: string]: unknown }>('/Song_V1', {
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

  downloadSong: (id: string, quality: string) =>
    blobDownload('/Download', { id, quality }),

  getHealth: () =>
    fetchApi<{ cookie_status: string; version: string; downloads_dir: string }>('/health', {
      method: 'GET',
    }),
};
