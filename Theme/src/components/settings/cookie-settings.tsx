'use client';

import { useState, useCallback } from 'react';
import { ArrowLeft, Save, RefreshCw, Shield, ShieldAlert } from 'lucide-react';
import { useNavStore } from '@/lib/stores/nav-store';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { api } from '@/lib/api';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export function CookieSettings() {
  const { closeSettingsSubPage } = useNavStore();
  const { cookie, updateSetting } = useSettingsStore();
  const [localCookie, setLocalCookie] = useState(cookie);
  const [cookieStatus, setCookieStatus] = useState<'idle' | 'valid' | 'invalid' | 'checking'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = useCallback(() => {
    updateSetting('cookie', localCookie);
    setSaveMessage('已保存');
    setTimeout(() => setSaveMessage(''), 2000);
  }, [localCookie, updateSetting]);

  const handleTest = useCallback(async () => {
    setCookieStatus('checking');
    try {
      const health = await api.getHealth();
      setCookieStatus(health.cookie_status === 'valid' ? 'valid' : 'invalid');
    } catch {
      setCookieStatus('invalid');
    }
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
        <h1 className="text-lg font-bold text-white">Cookie 管理</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Status indicator */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-card">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            cookieStatus === 'valid' ? 'bg-green-500/10' :
            cookieStatus === 'invalid' ? 'bg-destructive/10' :
            cookieStatus === 'checking' ? 'bg-gold/10' :
            'bg-surface-hover'
          }`}>
            {cookieStatus === 'checking' ? (
              <RefreshCw className="w-5 h-5 text-gold animate-spin" />
            ) : cookieStatus === 'valid' ? (
              <Shield className="w-5 h-5 text-green-500" />
            ) : cookieStatus === 'invalid' ? (
              <ShieldAlert className="w-5 h-5 text-destructive" />
            ) : (
              <Shield className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Cookie 状态</p>
            <p className={`text-xs mt-0.5 ${
              cookieStatus === 'valid' ? 'text-green-500' :
              cookieStatus === 'invalid' ? 'text-destructive' :
              'text-muted-foreground'
            }`}>
              {cookieStatus === 'valid' ? 'Cookie 有效' :
               cookieStatus === 'invalid' ? 'Cookie 无效或已过期' :
               cookieStatus === 'checking' ? '正在验证...' :
               '点击测试按钮验证'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTest}
            disabled={cookieStatus === 'checking'}
            className="border-gold/30 text-gold hover:bg-gold/10 hover:text-gold"
          >
            测试
          </Button>
        </div>

        {/* Cookie input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">
            Cookie 内容
          </label>
          <Textarea
            value={localCookie}
            onChange={(e) => setLocalCookie(e.target.value)}
            placeholder="粘贴你的 Cookie 内容..."
            className="min-h-[200px] rounded-xl bg-surface-card border-surface-hover text-white placeholder:text-muted-foreground/60 focus:border-gold focus:ring-gold/20 text-xs font-mono resize-none"
          />
        </div>

        {/* Save button */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            className="flex-1 h-11 rounded-xl bg-gold text-black hover:bg-gold-light font-medium"
          >
            <Save className="w-4 h-4 mr-2" />
            保存 Cookie
          </Button>
          {saveMessage && (
            <span className="text-sm text-gold animate-pulse">{saveMessage}</span>
          )}
        </div>

        {/* Info */}
        <div className="p-4 rounded-xl bg-gold/5 border border-gold/10">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Cookie 用于访问网易云音乐 API。请从浏览器登录网易云音乐后获取 Cookie。
            Cookie 过期后需要重新获取。
          </p>
        </div>
      </div>
    </div>
  );
}
