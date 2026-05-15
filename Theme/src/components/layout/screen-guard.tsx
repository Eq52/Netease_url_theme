'use client';

import { useState, useEffect } from 'react';
import { Monitor } from 'lucide-react';

const MIN_WIDTH = 768;

export function ScreenGuard({ children }: { children: React.ReactNode }) {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [forceEnter, setForceEnter] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsSmallScreen(window.innerWidth < MIN_WIDTH);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Also check session storage for previous force-enter
  useEffect(() => {
    if (sessionStorage.getItem('aural-force-enter') === 'true') {
      setForceEnter(true);
    }
  }, []);

  if (!mounted) return null;

  const shouldBlock = isSmallScreen && !forceEnter;

  if (shouldBlock) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto gold-glow">
            <Monitor className="w-10 h-10 text-gold" />
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-white">
              Sorry
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              当前主题只支持大屏横屏哦，但您也可以点击继续强制进入
            </p>
          </div>
          <button
            onClick={() => {
              setForceEnter(true);
              sessionStorage.setItem('aural-force-enter', 'true');
            }}
            className="px-8 py-3 rounded-xl bg-gold text-black font-medium hover:bg-gold-light transition-all gold-glow"
          >
            继续
          </button>
          <p className="text-[11px] text-muted-foreground/40">
            Aural · Premium Music Experience
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
