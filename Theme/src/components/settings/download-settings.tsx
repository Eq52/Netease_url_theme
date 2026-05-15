'use client';

import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Download, FolderOpen } from 'lucide-react';
import { useNavStore } from '@/lib/stores/nav-store';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { api } from '@/lib/api';
import { QUALITY_OPTIONS } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export function DownloadSettings() {
  const { closeSettingsSubPage } = useNavStore();
  const { downloadQuality, autoDownload, updateSetting } = useSettingsStore();
  const [downloadsDir, setDownloadsDir] = useState('加载中...');
  const [version, setVersion] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const health = await api.getHealth();
        if (!cancelled) {
          const data = health.data;
          setDownloadsDir(data?.downloads_dir || '未设置');
          setVersion(data?.version || '未知');
        }
      } catch {
        if (!cancelled) setDownloadsDir('无法获取');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-surface-hover">
        <button
          onClick={closeSettingsSubPage}
          className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-gold hover:bg-surface-hover transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-white">下载设置</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Download Quality */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-white">
            下载音质
          </label>
          <div className="grid grid-cols-2 gap-2">
            {QUALITY_OPTIONS.map((option) => {
              const isActive = downloadQuality === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => updateSetting('downloadQuality', option.value)}
                  className={cn(
                    'p-3 rounded-xl text-left transition-all duration-200',
                    isActive
                      ? 'bg-gold/10 border border-gold/30'
                      : 'bg-surface-card border border-transparent hover:bg-surface-hover'
                  )}
                >
                  <p className={cn(
                    'text-sm font-medium',
                    isActive ? 'text-gold' : 'text-white'
                  )}>
                    {option.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Auto Download */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-surface-card">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-gold" />
            <div>
              <p className="text-sm font-medium text-white">自动下载</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                播放歌曲时自动下载
              </p>
            </div>
          </div>
          <Switch
            checked={autoDownload}
            onCheckedChange={(checked) => updateSetting('autoDownload', checked)}
          />
        </div>

        {/* Downloads Directory */}
        <div className="p-4 rounded-xl bg-surface-card space-y-2">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-5 h-5 text-gold" />
            <div>
              <p className="text-sm font-medium text-white">下载目录</p>
              <p className="text-xs text-muted-foreground font-mono mt-1 break-all">
                {downloadsDir}
              </p>
            </div>
          </div>
        </div>

        {/* Server Info */}
        {version && (
          <div className="p-4 rounded-xl bg-surface-card">
            <p className="text-sm font-medium text-white">后端版本</p>
            <p className="text-xs text-muted-foreground mt-1">{version}</p>
          </div>
        )}
      </div>
    </div>
  );
}
