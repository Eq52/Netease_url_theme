'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Music2, Github, Heart, ExternalLink, Code2, Palette, Database, FolderOpen } from 'lucide-react';
import { useNavStore } from '@/lib/stores/nav-store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

export function AboutPage() {
  const { closeSettingsSubPage } = useNavStore();
  const [version, setVersion] = useState('');
  const [cookieStatus, setCookieStatus] = useState('');
  const [downloadsDir, setDownloadsDir] = useState('');

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const health = await api.getHealth();
        const data = health.data;
        if (data) {
          setVersion(data.version || '未知');
          setCookieStatus(data.cookie_status === 'valid' ? '有效' : '无效或过期');
          setDownloadsDir(data.downloads_dir || '未设置');
        } else {
          setVersion('未知');
          setCookieStatus('未知');
          setDownloadsDir('未知');
        }
      } catch {
        setVersion('无法获取');
        setCookieStatus('无法连接');
        setDownloadsDir('无法连接');
      }
    };
    fetchHealth();
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
        <div className="flex flex-col items-center text-center py-8">
          <div className="w-20 h-20 rounded-2xl bg-gold/10 flex items-center justify-center mb-4 gold-glow">
            <Music2 className="w-10 h-10 text-gold" />
          </div>
          <h2 className="text-2xl font-bold text-white gold-text-glow">Aural</h2>
          <p className="text-sm text-muted-foreground mt-1">Premium Music Experience</p>
          <span className="mt-3 px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-medium border border-gold/20">
            v2.1.0
          </span>
        </div>

        {/* Details */}
        <div className="space-y-3 max-w-sm mx-auto">
          {/* Version */}
          <div className="p-4 rounded-xl bg-surface-card">
            <p className="text-xs text-muted-foreground mb-1">后端版本</p>
            <p className="text-sm font-medium text-white">{version}</p>
          </div>

          {/* Cookie Status */}
          <div className="p-4 rounded-xl bg-surface-card">
            <p className="text-xs text-muted-foreground mb-1">Cookie 状态</p>
            <p className={`text-sm font-medium ${cookieStatus === '有效' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {cookieStatus}
            </p>
          </div>

          {/* Downloads Dir */}
          <div className="p-4 rounded-xl bg-surface-card">
            <p className="text-xs text-muted-foreground mb-1">下载目录</p>
            <div className="flex items-center gap-2">
              <FolderOpen className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <p className="text-sm font-medium text-white truncate">{downloadsDir}</p>
            </div>
          </div>

          {/* API Info */}
          <div className="p-4 rounded-xl bg-surface-card">
            <p className="text-xs text-muted-foreground mb-1">API 后端</p>
            <p className="text-sm font-medium text-white">网易云音乐 API</p>
          </div>

          {/* Tech Stack */}
          <div className="p-4 rounded-xl bg-surface-card space-y-2.5">
            <p className="text-xs text-muted-foreground mb-2">技术栈</p>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                <Code2 className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Next.js 16 + TypeScript</p>
                <p className="text-[11px] text-muted-foreground">前端框架</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
                <Palette className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Tailwind CSS 4 + shadcn/ui</p>
                <p className="text-[11px] text-muted-foreground">样式与组件</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-green-500/15 flex items-center justify-center flex-shrink-0">
                <Database className="w-3.5 h-3.5 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Flask (Python)</p>
                <p className="text-[11px] text-muted-foreground">后端服务</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-orange-500/15 flex items-center justify-center flex-shrink-0">
                <Music2 className="w-3.5 h-3.5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">APlayer</p>
                <p className="text-[11px] text-muted-foreground">音频播放</p>
              </div>
            </div>
          </div>

          {/* Supported Qualities */}
          <div className="p-4 rounded-xl bg-surface-card">
            <p className="text-xs text-muted-foreground mb-2">支持的音质</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '标准', tier: 'free' },
                { label: '极高', tier: 'vip' },
                { label: '无损', tier: 'vip' },
                { label: 'Hi-Res', tier: 'svip' },
                { label: '环绕声', tier: 'svip' },
                { label: '母带', tier: 'svip' },
              ].map((q) => (
                <span
                  key={q.label}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                    q.tier === 'svip'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : q.tier === 'vip'
                        ? 'bg-gold/10 text-gold border-gold/20'
                        : 'bg-white/5 text-muted-foreground border-white/10'
                  }`}
                >
                  {q.label}
                </span>
              ))}
            </div>
          </div>

          {/* GitHub Link */}
          <Button
            variant="outline"
            className="w-full h-11 rounded-xl border-gold/30 text-gold hover:bg-gold/10 hover:text-gold"
            asChild
          >
            <a href="https://github.com/Eq52/Netease_url_theme" target="_blank" rel="noopener noreferrer">
              <Github className="w-4 h-4 mr-2" />
              GitHub 仓库
              <ExternalLink className="w-3 h-3 ml-auto" />
            </a>
          </Button>

          {/* Original Project */}
          <div className="p-4 rounded-xl bg-surface-card">
            <p className="text-xs text-muted-foreground mb-1">基于</p>
            <a
              href="https://github.com/Suxiaoqinx/Netease_url"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gold hover:underline inline-flex items-center gap-1"
            >
              Suxiaoqinx/Netease_url
              <ExternalLink className="w-3 h-3" />
            </a>
            <p className="text-[11px] text-muted-foreground mt-1">
              核心后端代码来源于原项目，前端使用 Next.js 全新重写
            </p>
          </div>
        </div>

        {/* Credits */}
        <div className="mt-8 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Made with</span>
            <Heart className="w-3 h-3 text-gold" />
            <span>by</span>
            <a
              href="https://github.com/Eq52"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline font-medium"
            >
              Eq52
            </a>
          </div>
          <p className="text-[11px] text-muted-foreground/50">
            Aural · Black &amp; Gold Theme · 2025
          </p>
        </div>

        {/* Footer decorative line */}
        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      </div>
    </div>
  );
}
