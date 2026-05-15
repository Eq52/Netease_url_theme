'use client';

import { ArrowLeft, PlayCircle, Volume2, Type } from 'lucide-react';
import { useNavStore } from '@/lib/stores/nav-store';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export function PlaybackSettings() {
  const { closeSettingsSubPage } = useNavStore();
  const {
    autoPlayNext,
    showLyrics,
    lyricsFontSize,
    defaultVolume,
    updateSetting,
  } = useSettingsStore();

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
        <h1 className="text-lg font-bold text-white">播放设置</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Auto Play Next */}
        <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-surface-card">
          <div className="flex items-center gap-3 min-w-0">
            <PlayCircle className="w-5 h-5 text-gold flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">自动播放下一首</p>
              <p className="text-xs text-muted-foreground mt-0.5 break-words">
                当前歌曲结束后自动播放队列中的下一首
              </p>
            </div>
          </div>
          <Switch
            checked={autoPlayNext}
            onCheckedChange={(checked) => updateSetting('autoPlayNext', checked)}
            className="flex-shrink-0"
          />
        </div>

        {/* Default Volume */}
        <div className="p-4 rounded-xl bg-surface-card space-y-4">
          <div className="flex items-center gap-3 min-w-0">
            <Volume2 className="w-5 h-5 text-gold flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">默认音量</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                设置初始播放音量: {defaultVolume}%
              </p>
            </div>
          </div>
          <Slider
            value={[defaultVolume]}
            max={100}
            step={5}
            onValueChange={(val) => updateSetting('defaultVolume', val[0])}
            className="w-full"
          />
        </div>

        {/* Show Lyrics */}
        <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-surface-card">
          <div className="flex items-center gap-3 min-w-0">
            <Type className="w-5 h-5 text-gold flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">显示歌词</p>
              <p className="text-xs text-muted-foreground mt-0.5 break-words">
                在全屏播放器中显示歌词
              </p>
            </div>
          </div>
          <Switch
            checked={showLyrics}
            onCheckedChange={(checked) => updateSetting('showLyrics', checked)}
            className="flex-shrink-0"
          />
        </div>

        {/* Lyrics Font Size */}
        <div className={cn(
          'p-4 rounded-xl bg-surface-card space-y-4 transition-opacity',
          !showLyrics && 'opacity-40 pointer-events-none'
        )}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-5 h-5 text-gold font-bold flex items-center justify-center text-xs flex-shrink-0">
              A
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">歌词字体大小</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                当前: {lyricsFontSize}px
              </p>
            </div>
          </div>
          <Slider
            value={[lyricsFontSize]}
            min={12}
            max={28}
            step={1}
            onValueChange={(val) => updateSetting('lyricsFontSize', val[0])}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>小 (12px)</span>
            <span>大 (28px)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
