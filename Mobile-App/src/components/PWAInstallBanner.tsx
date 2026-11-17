import React, { useEffect, useState } from 'react';
import { Smartphone, Download, Share, X, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already in standalone / installed PWA mode
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    
    setIsStandalone(isStandaloneMode);

    // Check if iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isAppleDevice);

    // Capture standard PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  // If already running inside installed standalone app, show small confirmation
  if (isStandalone) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 mb-3">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>Running as Installed PWA App</span>
      </div>
    );
  }

  // If dismissed, don't show
  if (dismissed) {
    return null;
  }

  return (
    <div className="mb-4 rounded-2xl bg-gradient-to-r from-blue-900/30 via-cyan-950/40 to-slate-900 border border-cyan-500/30 p-3.5 shadow-lg relative overflow-hidden">
      {/* Background neon accent */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs sm:text-sm font-bold text-white">Install STouch as Web App (PWA)</span>
              <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Fullscreen experience, faster loading & works right on your home screen
            </p>
          </div>
        </div>

        <button 
          onClick={() => setDismissed(true)} 
          className="text-slate-400 hover:text-white p-1 rounded-lg"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center space-x-2">
        <button
          onClick={handleInstallClick}
          className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-500/25 active:scale-95 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{deferredPrompt ? 'Add to Home Screen / Install' : isIOS ? 'How to Install on iPhone' : 'Install PWA App'}</span>
        </button>
      </div>

      {showIOSGuide && (
        <div className="mt-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-[11px] text-slate-300 space-y-1">
          <div className="font-bold text-cyan-400 flex items-center space-x-1">
            <Share className="w-3 h-3" />
            <span>To install on iOS Safari:</span>
          </div>
          <ol className="list-decimal list-inside space-y-0.5 text-slate-300 pl-1">
            <li>Tap the <strong>Share</strong> button at bottom of Safari (<span className="text-cyan-300 font-mono">⎋</span>)</li>
            <li>Scroll down and tap <strong>"Add to Home Screen"</strong> (<span className="text-cyan-300 font-mono">⊞</span>)</li>
            <li>Tap <strong>Add</strong> in the top-right corner</li>
          </ol>
        </div>
      )}
    </div>
  );
};
