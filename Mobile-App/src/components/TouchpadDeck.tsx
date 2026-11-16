import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Search, 
  Activity, 
  Folder, 
  Scissors, 
  Monitor, 
  Lock, 
  Bluetooth, 
  Maximize, 
  Minimize, 
  Settings, 
  X, 
  Volume2, 
  VolumeX, 
  Play, 
  SkipBack, 
  SkipForward, 
  ChevronLeft, 
  ChevronRight, 
  EyeOff, 
  Sun, 
  Square, 
  Power, 
  Moon, 
  RotateCcw, 
  LogOut,
  Unplug
} from 'lucide-react';
import { TouchpadGestureEngine, type GestureConfig } from '@shared/gestures/TouchpadGestureEngine';
import { BluetoothHID } from '@shared/services/BluetoothHIDService';
import { KeyboardModifierMask } from '@shared/input-models/HIDReports';
import { SmartBoardPresenter } from '@smartboard/Bluetooth-SmartBoard/controls/SmartBoardPresenter';
import { BluetoothTVRemote } from '@tv/Bluetooth-TV/remote-controls/BluetoothTVRemote';
import { TouchpadSettingsModal } from './TouchpadSettingsModal';
import { VirtualKeyboard } from './VirtualKeyboard';

interface TouchpadDeckProps {
  onBack?: () => void;
  connectionMode?: 'bluetooth' | 'wifi';
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

export const TouchpadDeck: React.FC<TouchpadDeckProps> = ({ onBack, connectionMode = 'bluetooth' }) => {
  // Connection & Host State
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [hostName, setHostName] = useState<string>(
    connectionMode === 'wifi' ? 'PC-Receiver (Wi-Fi)' : 'Work-Station-Win11 (Bluetooth)'
  );
  const [latencyMs, setLatencyMs] = useState<number | null>(12);
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);

  // Tabs & Views
  const [activeTab, setActiveTab] = useState<'Apps' | 'Media' | 'Presenter' | 'Power'>('Apps');
  const [showHints, setShowHints] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showKeyboard, setShowKeyboard] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Settings & Haptics
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

  // Touch & Gesture Interaction State
  const isMouseDownRef = useRef<boolean>(false);
  const [gestureStatus, setGestureStatus] = useState<{
    fingerCount: number;
    isDragging: boolean;
    isScrolling: boolean;
  }>({
    fingerCount: 0,
    isDragging: false,
    isScrolling: false,
  });

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (hapticsEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      if (style === 'light') navigator.vibrate(12);
      else if (style === 'medium') navigator.vibrate(22);
      else navigator.vibrate(40);
    }
  };

  const showNotification = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 450);
  };

  // Hotkey & Action Dispatcher
  const sendKeyCombo = (label: string, modifiers: number, keys: number[]) => {
    triggerHaptic('medium');
    showNotification(label);
    BluetoothHID.sendKeyboardReport({ modifiers, keys });
    setTimeout(() => {
      BluetoothHID.sendKeyboardReport({ modifiers: 0, keys: [] });
    }, 45);
  };

  // Gesture Engine Setup
  const engine = useMemo(() => {
    return new TouchpadGestureEngine(
      {
        onMove: (dx, dy) => {
          BluetoothHID.sendMouseReport({ dx, dy, buttons: 0 });
        },
        onScroll: (vScroll, hScroll) => {
          BluetoothHID.sendMouseReport({ dx: 0, dy: 0, buttons: 0, wheel: vScroll, hWheel: hScroll });
        },
        onLeftClick: () => {
          triggerHaptic('light');
          showNotification('Left Click');
          BluetoothHID.sendLeftClick();
        },
        onRightClick: () => {
          triggerHaptic('medium');
          showNotification('Right Click');
          BluetoothHID.sendRightClick();
        },
        onDoubleClick: () => {
          triggerHaptic('medium');
          showNotification('Double Click');
          BluetoothHID.sendDoubleClick();
        },
        onDragStart: () => {
          triggerHaptic('heavy');
          showNotification('Drag & Drop (Holding)');
          BluetoothHID.sendMouseButtonState({ left: true });
        },
        onDragEnd: () => {
          triggerHaptic('light');
          showNotification('Dropped');
          BluetoothHID.sendMouseButtonState({ left: false });
        },
        onGestureStateChange: (state) => {
          setGestureStatus(state);
        },
      },
      gestureConfig
    );
  }, []);

  useEffect(() => {
    engine.updateConfig(gestureConfig);
  }, [gestureConfig, engine]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Desktop Mouse Emulation Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDownRef.current = true;
    engine.handleTouchStart({
      changedTouches: [{
        identifier: 999,
        clientX: e.clientX,
        clientY: e.clientY,
      }]
    } as any);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    engine.handleTouchMove({
      changedTouches: [{
        identifier: 999,
        clientX: e.clientX,
        clientY: e.clientY,
      }]
    } as any);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    engine.handleTouchEnd({
      changedTouches: [{
        identifier: 999,
        clientX: e.clientX,
        clientY: e.clientY,
      }]
    } as any);
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full bg-[#070c18] text-slate-100 select-none p-2.5 sm:p-4 justify-between font-sans">
      {/* 1. TOP STATUS BAR */}
      <header className="flex items-center justify-between px-2 py-1.5 mb-2">
        {/* Left Connection Status Pill */}
        <button
          onClick={() => setShowConnectModal(true)}
          className="flex items-center space-x-2 text-xs font-medium text-slate-300 hover:text-white transition group py-1 px-2 rounded-lg hover:bg-slate-900"
        >
          <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'}`} />
          <span className="font-semibold">
            {isConnected ? `Connected: ${hostName}` : 'Disconnected (Tap to Connect)'}
          </span>
        </button>

        {/* Right Status Indicators & Tools */}
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          {/* Latency Pill */}
          <div className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/30 text-[11px] font-mono font-bold text-cyan-400">
            {isConnected && latencyMs ? `${latencyMs} ms` : '-- ms'}
          </div>

          {/* Bluetooth Icon */}
          <button 
            onClick={() => setShowConnectModal(true)}
            className="p-1.5 hover:text-cyan-400 transition" 
            title="Bluetooth"
          >
            <Bluetooth className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Haptics / Activity Pulse */}
          <button 
            onClick={() => {
              const next = !hapticsEnabled;
              setHapticsEnabled(next);
              localStorage.setItem('stouch_haptics', String(next));
              showNotification(next ? 'Haptics Enabled' : 'Haptics Muted');
            }}
            className={`p-1.5 transition ${hapticsEnabled ? 'text-cyan-400' : 'text-slate-600'}`} 
            title="Haptics Vibration"
          >
            <Activity className="w-4 h-4" />
          </button>

          {/* Fullscreen Expand */}
          <button 
            onClick={toggleFullscreen}
            className="p-1.5 hover:text-white transition" 
            title="Fullscreen Mode"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Settings */}
          <button 
            onClick={() => setShowSettings(true)}
            className="p-1.5 hover:text-white transition" 
            title="Touchpad Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Exit / Back */}
          {onBack && (
            <button 
              onClick={onBack}
              className="p-1.5 text-slate-500 hover:text-rose-400 transition" 
              title="Return to Menu"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* 2. GESTURE GUIDE TICKER BAR */}
      {showHints && (
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 tracking-wide overflow-x-auto whitespace-nowrap scrollbar-none">
          <div className="flex items-center space-x-3">
            <span><strong className="text-cyan-400 font-semibold">1 finger</strong> Move</span>
            <span className="text-slate-700">•</span>
            <span><strong className="text-cyan-400 font-semibold">1 tap</strong> Click</span>
            <span className="text-slate-700">•</span>
            <span><strong className="text-cyan-400 font-semibold">2 fingers</strong> Scroll</span>
            <span className="text-slate-700">•</span>
            <span><strong className="text-cyan-400 font-semibold">2 tap</strong> Right click</span>
            <span className="text-slate-700">•</span>
            <span><strong className="text-cyan-400 font-semibold">Hold</strong> Drag</span>
          </div>
          <button 
            onClick={() => setShowHints(false)}
            className="p-0.5 text-slate-500 hover:text-white ml-2 transition"
            title="Dismiss hints"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. MAIN TOUCH SURFACE */}
      <div className="flex-1 flex flex-col min-h-[220px] sm:min-h-[280px] my-1 relative">
        <div
          onTouchStart={(e) => engine.handleTouchStart(e)}
          onTouchMove={(e) => engine.handleTouchMove(e)}
          onTouchEnd={(e) => engine.handleTouchEnd(e)}
          onTouchCancel={() => engine.handleTouchCancel()}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="relative flex-1 w-full rounded-2xl sm:rounded-3xl border-2 border-cyan-500/80 shadow-[0_0_20px_rgba(6,182,212,0.18)] bg-gradient-to-b from-[#0a152e] via-[#081024] to-[#060b18] overflow-hidden flex flex-col items-center justify-center cursor-crosshair select-none"
          style={{ touchAction: 'none' }}
        >
          {/* Subtle Radar Circle Guide */}
          <div className="flex flex-col items-center justify-center pointer-events-none select-none opacity-60">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-cyan-500/35 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-cyan-400/40" />
            </div>
            <span className="text-[11px] uppercase tracking-[0.22em] font-semibold text-slate-400/80 mt-3">
              TOUCH SURFACE
            </span>
          </div>

          {/* Floating Action Notifications */}
          {feedback && (
            <div className="absolute top-4 px-4 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 text-xs font-bold animate-fade-in shadow-lg">
              {feedback}
            </div>
          )}

          {/* Active Status Corner Indicators */}
          <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center text-[10px] text-slate-500 pointer-events-none font-mono">
            <span>FINGERS: {isMouseDownRef.current ? 1 : gestureStatus.fingerCount}</span>
            <span className="text-cyan-400 font-bold">
              {gestureStatus.isDragging ? 'DRAGGING' : gestureStatus.isScrolling ? 'SCROLLING' : 'READY'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. MOUSE BUTTONS BAR (Left Click & Right Click) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 my-2">
        <button
          onClick={() => {
            triggerHaptic('light');
            showNotification('Left Click');
            BluetoothHID.sendLeftClick();
          }}
          className="py-3 sm:py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 active:scale-[0.98] border border-slate-800 text-sm font-semibold text-slate-200 transition shadow-md flex items-center justify-center space-x-1.5"
        >
          <span>Left Click</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('medium');
            showNotification('Right Click');
            BluetoothHID.sendRightClick();
          }}
          className="py-3 sm:py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 active:scale-[0.98] border border-slate-800 text-sm font-semibold text-slate-200 transition shadow-md flex items-center justify-center space-x-1.5"
        >
          <span>Right Click</span>
        </button>
      </div>

      {/* 5. TAB NAVIGATION BAR */}
      <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800/90 my-1 text-xs">
        {(['Apps', 'Media', 'Presenter', 'Power'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 rounded-lg font-bold text-center transition ${
              activeTab === tab
                ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 6. QUICK ACTION GRID */}
      <div className="my-1">
        {/* TAB 1: APPS (Search, Task Mgr, Explorer, Snip, Desktop, Lock) */}
        {activeTab === 'Apps' && (
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => sendKeyCombo('Search', KeyboardModifierMask.LEFT_GUI, [22])}
              className="py-2.5 px-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-slate-200 flex flex-col items-center justify-center space-y-1 active:scale-95 transition"
            >
              <Search className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-medium text-slate-300">Search</span>
            </button>

            <button
              onClick={() => sendKeyCombo('Task Mgr', KeyboardModifierMask.LEFT_CTRL | KeyboardModifierMask.LEFT_SHIFT, [41])}
              className="py-2.5 px-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-slate-200 flex flex-col items-center justify-center space-y-1 active:scale-95 transition"
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-medium text-slate-300">Task Mgr</span>
            </button>

            <button
              onClick={() => sendKeyCombo('Explorer', KeyboardModifierMask.LEFT_GUI, [8])}
              className="py-2.5 px-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-slate-200 flex flex-col items-center justify-center space-y-1 active:scale-95 transition"
            >
              <Folder className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-medium text-slate-300">Explorer</span>
            </button>

            <button
              onClick={() => sendKeyCombo('Screen Snip', KeyboardModifierMask.LEFT_GUI | KeyboardModifierMask.LEFT_SHIFT, [22])}
              className="py-2.5 px-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-slate-200 flex flex-col items-center justify-center space-y-1 active:scale-95 transition"
            >
              <Scissors className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-medium text-slate-300">Snip</span>
            </button>

            <button
              onClick={() => sendKeyCombo('Show Desktop', KeyboardModifierMask.LEFT_GUI, [7])}
              className="py-2.5 px-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-slate-200 flex flex-col items-center justify-center space-y-1 active:scale-95 transition"
            >
              <Monitor className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-medium text-slate-300">Desktop</span>
            </button>

            <button
              onClick={() => sendKeyCombo('Lock PC', KeyboardModifierMask.LEFT_GUI, [15])}
              className="py-2.5 px-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-slate-200 flex flex-col items-center justify-center space-y-1 active:scale-95 transition"
            >
              <Lock className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-medium text-slate-300">Lock</span>
            </button>
          </div>
        )}

        {/* TAB 2: MEDIA (Volume, Mute, Play/Pause, Tracks) */}
        {activeTab === 'Media' && (
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                triggerHaptic('light');
                BluetoothTVRemote.sendButton('volume_down');
                showNotification('Volume -');
              }}
              className="py-2.5 px-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-slate-200 flex flex-col items-center justify-center space-y-1 active:scale-95 transition"
            >
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-medium text-slate-300">Vol -</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('light');
                BluetoothTVRemote.sendButton('volume_up');
                showNotification('Volume +');
              }}
              className="py-2.5 px-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-slate-200 flex flex-col items-center justify-center space-y-1 active:scale-95 transition"
            >
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-medium text-slate-300">Vol +</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('medium');
                BluetoothTVRemote.sendButton('mute');
                showNotification('Mute Toggled');
              }}
              className="py-2.5 px-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-slate-200 flex flex-col items-center justify-center space-y-1 active:scale-95 transition"
            >
              <VolumeX className="w-4 h-4 text-rose-400" />
              <span className="text-[11px] font-medium text-slate-300">Mute</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('light');
                BluetoothTVRemote.sendButton('media_rewind');
                showNotification('Previous Track');
              }}
              className="py-2.5 px-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-slate-200 flex flex-col items-center justify-center space-y-1 active:scale-95 transition"
            >
              <SkipBack className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-medium text-slate-300">Prev</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('medium');
                BluetoothTVRemote.sendButton('media_play_pause');
                showNotification('Play / Pause');
              }}
              className="py-2.5 px-2 rounded-xl bg-cyan-600/20 border border-cyan-500/40 hover:bg-cyan-600/30 text-white flex flex-col items-center justify-center space-y-1 active:scale-95 transition"
            >
              <Play className="w-4 h-4 text-cyan-300" />
              <span className="text-[11px] font-medium text-cyan-200">Play/Pause</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('light');
                BluetoothTVRemote.sendButton('media_fast_forward');
                showNotification('Next Track');
              }}
              className="py-2.5 px-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-slate-200 flex flex-col items-center justify-center space-y-1 active:scale-95 transition"
            >
              <SkipForward className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-medium text-slate-300">Next</span>
            </button>
          </div>
        )}

        {/* TAB 3: PRESENTER (Slideshow navigation) */}
        {activeTab === 'Presenter' && (
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                triggerHaptic('light');
                SmartBoardPresenter.prevSlide();
                showNotification('Previous Slide');
              }}
              className="py-2.5 px-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-slate-200 flex flex-col items-center justify-center space-y-1 active:scale-95 transition"
            >
              <ChevronLeft className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-medium text-slate-300">Prev Slide</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('light');
                SmartBoardPresenter.nextSlide();
                showNotification('Next Slide');
              }}
              className="py-2.5 px-2 rounded-xl bg-cyan-600/20 border border-cyan-500/40 hover:bg-cyan-600/30 text-white flex flex-col items-center justify-center space-y-1 active:scale-95 transition"
            >
              <ChevronRight className="w-4 h-4 text-cyan-300" />
              <span className="text-[11px] font-medium text-cyan-200">Next Slide</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('medium');
                SmartBoardPresenter.startSlideShow();
                showNotification('Start Show (F5)');
              }}
              className="py-2.5 px-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-slate-200 flex flex-col items-center justify-center space-y-1 active:scale-95 transition"
            >
              <Play className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-medium text-slate-300">Start (F5)</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('medium');
                SmartBoardPresenter.exitSlideShow();
                showNotification('Exit Show (Esc)');
              }}
              className="py-2.5 px-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-slate-200 flex flex-col items-center justify-center space-y-1 active:scale-95 transition"
            >
              <Square className="w-4 h-4 text-rose-400" />
              <span className="text-[11px] font-medium text-slate-300">Exit (Esc)</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('light');
                SmartBoardPresenter.toggleBlackScreen();
                showNotification('Black Screen (B)');
              }}
              className="py-2.5 px-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-slate-200 flex flex-col items-center justify-center space-y-1 active:scale-95 transition"
            >
              <EyeOff className="w-4 h-4 text-slate-400" />
              <span className="text-[11px] font-medium text-slate-300">Black (B)</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('light');
                SmartBoardPresenter.toggleWhiteScreen();
                showNotification('White Screen (W)');
              }}
              className="py-2.5 px-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-slate-200 flex flex-col items-center justify-center space-y-1 active:scale-95 transition"
            >
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-medium text-slate-300">White (W)</span>
            </button>
          </div>
        )}

        {/* TAB 4: POWER (Sleep, Lock, Display Off, Restart) */}
        {activeTab === 'Power' && (
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => sendKeyCombo('Sleep PC', 0, [100])}
              className="py-2.5 px-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-slate-200 flex flex-col items-center justify-center space-y-1 active:scale-95 transition"
            >
              <Moon className="w-4 h-4 text-indigo-400" />
              <span className="text-[11px] font-medium text-slate-300">Sleep</span>
            </button>

            <button
              onClick={() => sendKeyCombo('Lock PC', KeyboardModifierMask.LEFT_GUI, [15])}
              className="py-2.5 px-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-slate-200 flex flex-col items-center justify-center space-y-1 active:scale-95 transition"
            >
              <Lock className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-medium text-slate-300">Lock</span>
            </button>

            <button
              onClick={() => sendKeyCombo('Restart Prompt', KeyboardModifierMask.LEFT_ALT, [60])}
              className="py-2.5 px-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-slate-200 flex flex-col items-center justify-center space-y-1 active:scale-95 transition"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-medium text-slate-300">Restart</span>
            </button>

            <button
              onClick={() => sendKeyCombo('Sign Out (Win+X, U, I)', KeyboardModifierMask.LEFT_GUI, [27])}
              className="py-2.5 px-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-slate-200 flex flex-col items-center justify-center space-y-1 active:scale-95 transition"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
              <span className="text-[11px] font-medium text-slate-300">Sign Out</span>
            </button>

            <button
              onClick={() => sendKeyCombo('Display Off', KeyboardModifierMask.LEFT_CTRL | KeyboardModifierMask.LEFT_SHIFT, [40])}
              className="py-2.5 px-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-slate-200 flex flex-col items-center justify-center space-y-1 active:scale-95 transition"
            >
              <Monitor className="w-4 h-4 text-slate-500" />
              <span className="text-[11px] font-medium text-slate-300">Screen Off</span>
            </button>

            <button
              onClick={() => sendKeyCombo('Shutdown (Alt+F4)', KeyboardModifierMask.LEFT_ALT, [61])}
              className="py-2.5 px-2 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-300 flex flex-col items-center justify-center space-y-1 active:scale-95 transition"
            >
              <Power className="w-4 h-4 text-rose-400" />
              <span className="text-[11px] font-medium text-rose-300">Shutdown</span>
            </button>
          </div>
        )}
      </div>

      {/* MODAL: Connection Manager (when tapping status bar) */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Bluetooth className="w-4 h-4 text-cyan-400" />
                <span>Host Connection Manager</span>
              </h3>
              <button 
                onClick={() => setShowConnectModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                <div className="font-semibold text-white mb-1 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>Connection Mode</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  In a web browser, connect via <strong>Local Wi-Fi Mode</strong> (Desktop Receiver). On Android phone, direct <strong>Bluetooth HID</strong> connects in phone Bluetooth settings.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Connected Device Display Name
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    placeholder="e.g. My-Windows-PC"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <button
                    onClick={() => {
                      setIsConnected(true);
                      setShowConnectModal(false);
                      showNotification(`Connected as ${hostName}`);
                    }}
                    className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition"
                  >
                    Set
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  const nextState = !isConnected;
                  setIsConnected(nextState);
                  setLatencyMs(nextState ? 12 : null);
                  setShowConnectModal(false);
                  showNotification(nextState ? `Connected to ${hostName}` : 'Disconnected');
                }}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition ${
                  isConnected 
                    ? 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-400' 
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                }`}
              >
                <Unplug className="w-4 h-4" />
                <span>{isConnected ? 'Disconnect Controller' : 'Connect Controller'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Settings */}
      {showSettings && (
        <TouchpadSettingsModal
          config={gestureConfig}
          hapticsEnabled={hapticsEnabled}
          keepAwake={keepAwake}
          onUpdateConfig={(partial) => {
            setGestureConfig(prev => {
              const updated = { ...prev, ...partial };
              localStorage.setItem('stouch_gesture_config', JSON.stringify(updated));
              return updated;
            });
          }}
          onToggleHaptics={(val) => {
            setHapticsEnabled(val);
            localStorage.setItem('stouch_haptics', String(val));
          }}
          onToggleKeepAwake={(val) => {
            setKeepAwake(val);
            localStorage.setItem('stouch_keep_awake', String(val));
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* MODAL: Virtual Keyboard */}
      {showKeyboard && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col justify-end">
          <VirtualKeyboard onClose={() => setShowKeyboard(false)} />
        </div>
      )}
    </div>
  );
};
