'use client';

import { ArrowLeft, Check } from 'lucide-react';
import { useNavStore } from '@/lib/stores/nav-store';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { QUALITY_OPTIONS } from '@/lib/types';
import { cn } from '@/lib/utils';

export function QualitySettings() {
  const { closeSettingsSubPage } = useNavStore();
  const { defaultQuality, updateSetting } = useSettingsStore();

  const handleSelect = (value: string) => {
    updateSetting('defaultQuality', value);
  };

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
        <h1 className="text-lg font-bold text-white">默认音质</h1>
      </div>

      {/* Quality Options */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <p className="text-sm text-muted-foreground mb-4">
          选择歌曲播放时的默认音质
        </p>

        {QUALITY_OPTIONS.map((option) => {
          const isActive = defaultQuality === option.value;
          return (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 text-left',
                isActive
                  ? 'bg-gold/10 border border-gold/30 gold-glow-sm'
                  : 'bg-surface-card border border-transparent hover:bg-surface-hover hover:border-gold/10'
              )}
            >
              <div className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0',
                isActive
                  ? 'border-gold bg-gold'
                  : 'border-muted-foreground/30'
              )}>
                {isActive && (
                  <Check className="w-3 h-3 text-black" strokeWidth={3} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  'text-sm font-medium',
                  isActive ? 'text-gold' : 'text-white'
                )}>
                  {option.label}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {option.description}
                </p>
              </div>

              {isActive && (
                <span className="text-[11px] text-gold font-medium px-2 py-0.5 rounded-full bg-gold/10 border border-gold/20">
                  当前
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
