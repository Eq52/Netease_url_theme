'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useNavStore } from '@/lib/stores/nav-store';
import {
  ChevronRight,
  Sparkles,
  Download,
  PlayCircle,
  Info,
} from 'lucide-react';
import { QualitySettings } from '@/components/settings/quality-settings';
import { DownloadSettings } from '@/components/settings/download-settings';
import { PlaybackSettings } from '@/components/settings/playback-settings';
import { AboutPage } from '@/components/settings/about-page';

const settingsItems = [
  {
    key: 'quality',
    label: '默认音质',
    description: '选择播放音质',
    icon: Sparkles,
  },
  {
    key: 'download',
    label: '下载设置',
    description: '下载音质与目录',
    icon: Download,
  },
  {
    key: 'playback',
    label: '播放设置',
    description: '自动播放、歌词显示等',
    icon: PlayCircle,
  },
  {
    key: 'about',
    label: '关于',
    description: '版本信息与致谢',
    icon: Info,
  },
];

const subPageComponents: Record<string, React.ComponentType> = {
  quality: QualitySettings,
  download: DownloadSettings,
  playback: PlaybackSettings,
  about: AboutPage,
};

export function SettingsView() {
  const { settingsSubPage, openSettingsSubPage } = useNavStore();

  // If a sub-page is open, render it
  if (settingsSubPage) {
    const SubPage = subPageComponents[settingsSubPage];
    if (SubPage) {
      return (
        <AnimatePresence mode="wait">
          <motion.div
            key={settingsSubPage}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed inset-0 z-50 bg-background"
          >
            <SubPage />
          </motion.div>
        </AnimatePresence>
      );
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-1">
          设置
        </h1>
        <p className="text-sm text-muted-foreground">
          自定义你的音乐体验
        </p>
      </div>

      {/* Settings List */}
      <div className="space-y-2">
        {settingsItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => openSettingsSubPage(item.key as 'quality' | 'download' | 'playback' | 'about')}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-surface-card hover:bg-surface-hover border border-transparent hover:border-gold/10 transition-all duration-200 group text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors">
                <Icon className="w-5 h-5 text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white group-hover:text-gold transition-colors">
                  {item.label}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.description}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-gold/50 transition-colors flex-shrink-0" />
            </motion.button>
          );
        })}
      </div>

      {/* Bottom decorative line */}
      <div className="mt-8 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <p className="text-center text-[11px] text-muted-foreground/50 mt-4">
        Aural · Premium Music Experience
      </p>
    </div>
  );
}
