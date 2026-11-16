import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Wifi, 
  AlertCircle, 
  Sliders, 
  Keyboard as KeyboardIcon, 
  Unplug, 
  Laptop, 
  KeyRound,
  ShieldCheck,
  RefreshCw,
  MousePointer, 
  Move, 
  Hand
} from 'lucide-react';
import { WiFiClientService, type WiFiConnectionStatus } from '@pc/WiFi-PC/connection/WiFiClientService';
import type { GestureConfig } from '@shared/gestures/TouchpadGestureEngine';
import { TouchpadGestureEngine } from '@shared/gestures/TouchpadGestureEngine';
import { MouseButtonsBar } from '../components/MouseButtonsBar';
import { VirtualKeyboard } from '../components/VirtualKeyboard';
import { TouchpadSettingsModal } from '../components/TouchpadSettingsModal';

interface PCWiFiScreenProps {
  onBack: () => void;
}

const DEFAULT_GESTURE_CONFIG: GestureConfig = {
  sensitivity: 1.3,
  scrollSensitivity: 0.8,
  naturalScroll: true,
  tapToClickEnabled: true,
  pointerAcceleration: true,
  tapTimeoutMs: 180,
  doubleTapTimeoutMs: 280,
  dragHoldTimeoutMs: 320,
  moveThresholdPx: 5,
};

export const PCWiFiScreen: React.FC<PCWiFiScreenProps> = ({ onBack }) => {
  // Connection Form State
  const [hostIp, setHostIp] = useState<string>(() => localStorage.getItem('stouch_last_wifi_ip') || '');
  const [port, setPort] = useState<string>('8765');
  const [pin, setPin] = useState<string>('');

  // Client & Connection State
  const [status, setStatus] = useState<WiFiConnectionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active UI Controls & Modals
  const [showKeyboard, setShowKeyboard] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // User Preferences
  const [gestureConfig, setGestureConfig] = useState<GestureConfig>(() => {
    try {
      const saved = localStorage.getItem('stouch_gesture_config');
      return saved ? { ...DEFAULT_GESTURE_CONFIG, ...JSON.parse(saved) } : DEFAULT_GESTURE_CONFIG;
    } catch {
      return DEFAULT_GESTURE_CONFIG;
    }
  });

  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('stouch_haptics') !== 'false';
  });

  const [keepAwake, setKeepAwake] = useState<boolean>(() => {
    return localStorage.getItem('stouch_keep_awake') === 'true';
  });

  const [gestureStatus, setGestureStatus] = useState<{
    fingerCount: number;
    isDragging: boolean;
    isScrolling: boolean;
  }>({
    fingerCount: 0,
    isDragging: false,
    isScrolling: false,
  });

  const [feedbackEffect, setFeedbackEffect] = useState<string | null>(null);
  const wakeLockRef = useRef<any>(null);

  // Initialize WiFi Client
  const client = useMemo(() => {
    return new WiFiClientService({
      onStatusChange: (newStatus: WiFiConnectionStatus, err?: string) => {
        setStatus(newStatus);
        if (err) setErrorMessage(err);
        else if (newStatus === 'connected') setErrorMessage(null);
      },
    });
  }, []);

  // Screen Wake Lock
  useEffect(() => {
    const handleWakeLock = async () => {
      if (keepAwake && 'wakeLock' in navigator && status === 'connected') {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        } catch {}
      } else if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
        } catch {}
        wakeLockRef.current = null;
      }
    };
    handleWakeLock();
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, [keepAwake, status]);

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (hapticsEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      if (style === 'light') navigator.vibrate(12);
      else if (style === 'medium') navigator.vibrate(25);
      else navigator.vibrate(40);
    }
  };

  const triggerVisualFeedback = (text: string) => {
    setFeedbackEffect(text);
    setTimeout(() => setFeedbackEffect(null), 400);
  };

  // WiFi Touchpad Gesture Engine
  const gestureEngine = useMemo(() => {
    return new TouchpadGestureEngine(
      {
        onMove: (dx, dy) => {
          client.sendMouseMove(dx, dy);
        },
        onScroll: (vScroll, hScroll) => {
          client.sendMouseScroll(hScroll, vScroll);
        },
        onLeftClick: () => {
          triggerHaptic('light');
          triggerVisualFeedback('Left Click');
          client.sendMouseButton('left', 'down');
          setTimeout(() => client.sendMouseButton('left', 'up'), 40);
        },
        onRightClick: () => {
          triggerHaptic('medium');
          triggerVisualFeedback('Right Click');
          client.sendMouseButton('right', 'down');
          setTimeout(() => client.sendMouseButton('right', 'up'), 40);
        },
        onDoubleClick: () => {
          triggerHaptic('medium');
          triggerVisualFeedback('Double Click');
          client.sendMouseButton('left', 'down');
          setTimeout(() => {
            client.sendMouseButton('left', 'up');
            setTimeout(() => {
              client.sendMouseButton('left', 'down');
              setTimeout(() => client.sendMouseButton('left', 'up'), 40);
            }, 40);
          }, 40);
        },
        onDragStart: () => {
          triggerHaptic('heavy');
          triggerVisualFeedback('Drag & Drop (Holding Left Button)');
          client.sendMouseButton('left', 'down');
        },
        onDragEnd: () => {
          triggerHaptic('light');
          triggerVisualFeedback('Drag Released');
          client.sendMouseButton('left', 'up');
        },
        onGestureStateChange: (state) => {
          setGestureStatus(state);
        },
      },
      gestureConfig
    );
  }, [client, gestureConfig]);

  useEffect(() => {
    gestureEngine.updateConfig(gestureConfig);
  }, [gestureConfig, gestureEngine]);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostIp.trim()) {
      setErrorMessage('Please enter the Receiver IP address displayed on your PC.');
      return;
    }
    if (!pin.trim()) {
      setErrorMessage('Please enter the 6-digit PIN displayed on your PC.');
      return;
    }

    try {
      localStorage.setItem('stouch_last_wifi_ip', hostIp.trim());
    } catch {}

    setErrorMessage(null);
    client.connect({
      host: hostIp.trim(),
      port: parseInt(port.trim()) || 8765,
      token: pin.trim(),
      sessionId: 'manual-session',
      version: '1.0.0',
      expiresAt: Date.now() + 300000,
    });
  };

  const handleDisconnect = () => {
    client.disconnect();
  };

  // --- Render Connected Control Surface ---
  if (status === 'connected') {
    return (
      <div className="flex flex-col flex-1 h-screen max-w-lg mx-auto w-full p-3 select-none">
        {/* Connected Top Bar */}
        <div className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-2">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="text-xs font-bold text-white flex items-center space-x-1">
                <span>PC Host</span>
                <span className="text-[10px] text-slate-500 font-mono">({hostIp}:{port})</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-medium">Local Wi-Fi WebSocket Connected</div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-xl bg-slate-900 text-slate-400 border border-slate-800 hover:text-white transition"
              title="Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowKeyboard(!showKeyboard)}
              className={`p-2 rounded-xl border transition ${
                showKeyboard ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
              title="Virtual Keyboard"
            >
              <KeyboardIcon className="w-4 h-4" />
            </button>
            <button
              onClick={handleDisconnect}
              className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition"
              title="Disconnect"
            >
              <Unplug className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Touchpad Area */}
        <div className="flex flex-col flex-1 min-h-0 relative">
          {showKeyboard ? (
            <div className="flex-1 flex flex-col justify-end">
              <VirtualKeyboard onClose={() => setShowKeyboard(false)} />
            </div>
          ) : (
            <div
              onTouchStart={(e) => gestureEngine.handleTouchStart(e)}
              onTouchMove={(e) => gestureEngine.handleTouchMove(e)}
              onTouchEnd={(e) => gestureEngine.handleTouchEnd(e)}
              onTouchCancel={() => gestureEngine.handleTouchCancel()}
              className={`relative flex-1 w-full rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col items-center justify-center ${
                gestureStatus.isDragging
                  ? 'bg-amber-950/20 border-amber-500/50 shadow-inner shadow-amber-500/20'
                  : gestureStatus.isScrolling
                  ? 'bg-cyan-950/20 border-cyan-500/50'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
              style={{ touchAction: 'none' }}
            >
              <div 
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {feedbackEffect && (
                <div className="absolute top-6 px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-semibold text-xs animate-fade-in shadow-lg">
                  {feedbackEffect}
                </div>
              )}

              <div className="text-center pointer-events-none select-none p-4">
                <div className="flex justify-center mb-3 text-slate-600">
                  {gestureStatus.isDragging ? (
                    <Hand className="w-10 h-10 text-amber-400 animate-pulse" />
                  ) : gestureStatus.isScrolling ? (
                    <Move className="w-10 h-10 text-cyan-400 animate-pulse" />
                  ) : (
                    <MousePointer className="w-10 h-10 text-slate-600" />
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-300">
                  {gestureStatus.isDragging
                    ? 'Dragging Active (Release to Drop)'
                    : gestureStatus.isScrolling
                    ? 'Two-Finger Scrolling'
                    : 'Wi-Fi Touchpad Surface'}
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Low-latency local network WebSocket control
                </p>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-[11px] text-slate-500 pointer-events-none px-2">
                <span>Fingers: {gestureStatus.fingerCount}</span>
                <span className="font-mono text-emerald-400">Wi-Fi Direct Active</span>
              </div>
            </div>
          )}
        </div>

        {/* On-screen Mouse Buttons Bar */}
        {!showKeyboard && <MouseButtonsBar />}

        {/* Settings Modal */}
        {showSettingsModal && (
          <TouchpadSettingsModal
            config={gestureConfig}
            hapticsEnabled={hapticsEnabled}
            keepAwake={keepAwake}
            onUpdateConfig={(partial) => {
              setGestureConfig(prev => ({ ...prev, ...partial }));
            }}
            onToggleHaptics={setHapticsEnabled}
            onToggleKeepAwake={setKeepAwake}
            onClose={() => setShowSettingsModal(false)}
          />
        )}
      </div>
    );
  }

  // --- Render Wi-Fi Pairing Screen ---
  return (
    <div className="flex flex-col flex-1 px-4 py-6 max-w-lg mx-auto w-full">
      {/* Top Nav */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-medium text-slate-400 hover:text-white transition p-1 -ml-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
          PC Control • Local Wi-Fi
        </span>
      </div>

      {/* Title */}
      <div className="mb-4">
        <h1 className="text-xl font-extrabold text-white">Local Wi-Fi Controller</h1>
        <p className="text-xs text-slate-400 mt-1">
          Connects via high-speed authenticated local WebSocket to the STouch Desktop Receiver on your PC.
        </p>
      </div>

      {/* Direct Quick Launch Touchpad Surface */}
      <button
        onClick={() => {
          setStatus('connected');
        }}
        className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center space-x-2.5 transition active:scale-[0.99] mb-5 border border-blue-400/30 group"
      >
        <div className="p-1 rounded-lg bg-white/20 group-hover:scale-110 transition">
          <MousePointer className="w-4 h-4 text-white" />
        </div>
        <span>Open Wi-Fi Touchpad Directly (Demo / Test)</span>
      </button>

      {/* Instructions Card */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl mb-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Step 1: Start PC Receiver</div>
            <div className="text-sm font-bold text-white">STouch Desktop Host</div>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Open <strong>STouch Receiver</strong> on your PC. It will display your PC's LAN IP address and a temporary 6-digit pairing PIN.
        </p>
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center space-x-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Authenticated session • No public cloud relay</span>
        </div>
      </div>

      {/* Connection Form */}
      <form onSubmit={handleConnect} className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            PC Host IP Address
          </label>
          <input
            type="text"
            placeholder="e.g. 192.168.1.100"
            value={hostIp}
            onChange={(e) => setHostIp(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Port
            </label>
            <input
              type="text"
              placeholder="8765"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>6-Digit PIN</span>
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="e.g. 482910"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 font-mono tracking-widest text-center"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'connecting' || status === 'authenticating'}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.99] text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 transition flex items-center justify-center space-x-2"
        >
          {status === 'connecting' || status === 'authenticating' ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{status === 'connecting' ? 'Connecting to PC...' : 'Verifying PIN...'}</span>
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4" />
              <span>Connect to PC via Wi-Fi</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
