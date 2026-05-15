'use client';

import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Music2, Github, Heart, ExternalLink } from 'lucide-react';
import { useNavStore } from '@/lib/stores/nav-store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

export function AboutPage() {
  const { closeSettingsSubPage } = useNavStore();
  const [version, setVersion] = useState('');

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const health = await api.getHealth();
        setVersion(health.version || '未知');
      } catch {
        setVersion('无法获取');
      }
    };
    fetchVersion();
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
        <h1 className="text-lg font-bold text-white">关于</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* App Info */}
        <div className="flex flex-col items-center text-center py-10">
          <div className="w-20 h-20 rounded-2xl bg-gold/10 flex items-center justify-center mb-4 gold-glow">
            <Music2 className="w-10 h-10 text-gold" />
          </div>
          <h2 className="text-2xl font-bold text-white gold-text-glow">Aural</h2>
          <p className="text-sm text-muted-foreground mt-1">Premium Music Experience</p>
          <span className="mt-3 px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-medium border border-gold/20">
            v1.0.0
          </span>
        </div>

        {/* Details */}
        <div className="space-y-3 max-w-sm mx-auto">
          {/* Version */}
          <div className="p-4 rounded-xl bg-surface-card">
            <p className="text-xs text-muted-foreground mb-1">后端版本</p>
            <p className="text-sm font-medium text-white">{version}</p>
          </div>

          {/* API Info */}
          <div className="p-4 rounded-xl bg-surface-card">
            <p className="text-xs text-muted-foreground mb-1">API 后端</p>
            <p className="text-sm font-medium text-white">网易云音乐 API</p>
          </div>

          {/* Tech Stack */}
          <div className="p-4 rounded-xl bg-surface-card">
            <p className="text-xs text-muted-foreground mb-1">技术栈</p>
            <p className="text-sm font-medium text-white">Next.js + Tailwind CSS + APlayer</p>
          </div>

          {/* GitHub Link */}
          <Button
            variant="outline"
            className="w-full h-11 rounded-xl border-gold/30 text-gold hover:bg-gold/10 hover:text-gold"
            asChild
          >
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Github className="w-4 h-4 mr-2" />
              GitHub
              <ExternalLink className="w-3 h-3 ml-auto" />
            </a>
          </Button>
        </div>

        {/* Credits */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            Made with <Heart className="w-3 h-3 text-gold" /> by Aural Team
          </div>
        </div>

        {/* Footer decorative line */}
        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      </div>
    </div>
  );
}
