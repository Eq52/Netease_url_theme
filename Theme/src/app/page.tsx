'use client';

import { useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useSettingsStore } from '@/lib/stores/settings-store';

export default function Home() {
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return <AppShell />;
}
