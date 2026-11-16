import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Presentation, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Square, 
  EyeOff, 
  Sun, 
  Volume2, 
  HelpCircle,
  MousePointer,
  Bluetooth,
  Wifi,
  Radio
} from 'lucide-react';
import { SmartBoardPresenter } from '@smartboard/Bluetooth-SmartBoard/controls/SmartBoardPresenter';
import { TouchpadSurface } from '../components/TouchpadSurface';
import type { GestureConfig } from '@shared/gestures/TouchpadGestureEngine';
import type { SmartBoardAction, SmartBoardMessage } from '@smartboard/WiFi-SmartBoard/protocols/SmartBoardProtocol';

interface SmartBoardScreenProps {
  initialMode?: 'bluetooth' | 'wifi';
  onBack: () => void;
}

const PRESENTATION_GESTURE_CONFIG: GestureConfig = {
  sensitivity: 1.1,
  scrollSensitivity: 0.8,
  naturalScroll: true,
  tapToClickEnabled: true,
  pointerAcceleration: true,
  tapTimeoutMs: 180,
  doubleTapTimeoutMs: 280,
  dragHoldTimeoutMs: 320,
  moveThresholdPx: 5,
};

export const SmartBoardScreen: React.FC<SmartBoardScreenProps> = ({ initialMode = 'bluetooth', onBack }) => {
  const [connectionType, setConnectionType] = useState<'bluetooth' | 'wifi'>(initialMode);
  const [controlView, setControlView] = useState<'presenter' | 'laser'>('presenter');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [wifiIp, setWifiIp] = useState('192.168.1.100');
  const [wifiConnected, setWifiConnected] = useState(false);

  const triggerAction = (label: string, action: () => void, wifiAction?: SmartBoardAction) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(20);
    }
    setFeedback(label);

    if (connectionType === 'bluetooth') {
      action();
    } else {
      // Dispatches Wi-Fi SmartBoardMessage
      if (wifiAction) {
        const message: SmartBoardMessage = {
          type: 'smartboard.command',
          action: wifiAction,
          timestamp: Date.now()
        };
        console.log(`[SmartBoard Wi-Fi] Dispatched to ${wifiIp}:`, message);
      }
    }

    setTimeout(() => setFeedback(null), 400);
  };

  return (
    <div className="flex flex-col flex-1 px-4 py-5 max-w-lg mx-auto w-full select-none justify-between">
      {/* Top Nav */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="flex items-center space-x-1.5 text-xs font-medium text-slate-400 hover:text-white transition p-1 -ml-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <span className="text-xs uppercase font-bold tracking-wider text-purple-400 flex items-center space-x-1.5">
            <Presentation className="w-4 h-4" />
            <span>Smart Board • {connectionType === 'bluetooth' ? 'Bluetooth HID' : 'Local Wi-Fi'}</span>
          </span>
        </div>

        {/* Connection Type Switcher */}
        <div className="grid grid-cols-2 gap-2 mb-3 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setConnectionType('bluetooth')}
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
              connectionType === 'bluetooth'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bluetooth className="w-3.5 h-3.5 text-purple-200" />
            <span>Bluetooth HID</span>
          </button>

          <button
            onClick={() => setConnectionType('wifi')}
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
              connectionType === 'wifi'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wifi className="w-3.5 h-3.5 text-purple-200" />
            <span>Local Wi-Fi</span>
          </button>
        </div>

        {/* Wi-Fi Host Bar (only visible in Wi-Fi mode) */}
        {connectionType === 'wifi' && (
          <div className="p-3 mb-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${wifiConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <input
                type="text"
                value={wifiIp}
                onChange={(e) => setWifiIp(e.target.value)}
                placeholder="SmartBoard IP"
                className="bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-slate-200 font-mono text-[11px] w-32 focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              onClick={() => setWifiConnected(!wifiConnected)}
              className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold transition"
            >
              {wifiConnected ? 'Connected' : 'Connect'}
            </button>
          </div>
        )}

        {/* View Switcher: Slide Remote vs Laser Pointer */}
        <div className="grid grid-cols-2 gap-2 mb-3 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setControlView('presenter')}
            className={`py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center space-x-1.5 ${
              controlView === 'presenter' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>Slide Controls</span>
          </button>
          <button
            onClick={() => setControlView('laser')}
            className={`py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center space-x-1.5 ${
              controlView === 'laser' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>Laser Surface</span>
          </button>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex-1 flex flex-col justify-around py-2">
        {controlView === 'presenter' ? (
          <div className="flex flex-col space-y-4">
            {/* Feedback Badge */}
            <div className="h-6 flex items-center justify-center">
              {feedback && (
                <span className="px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold animate-pulse">
                  {feedback}
                </span>
              )}
            </div>

            {/* Giant Slide Navigation Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => triggerAction('Previous Slide', () => SmartBoardPresenter.prevSlide(), 'slide.prev')}
                className="h-32 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 active:scale-95 transition flex flex-col items-center justify-center space-y-2 group shadow-lg"
              >
                <div className="p-3 rounded-full bg-slate-800 group-hover:bg-purple-600 transition text-slate-200 group-hover:text-white">
                  <ChevronLeft className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-slate-300">Previous</span>
              </button>

              <button
                onClick={() => triggerAction('Next Slide', () => SmartBoardPresenter.nextSlide(), 'slide.next')}
                className="h-32 rounded-2xl bg-purple-600/20 border border-purple-500/40 hover:bg-purple-600/30 active:scale-95 transition flex flex-col items-center justify-center space-y-2 group shadow-lg shadow-purple-500/10"
              >
                <div className="p-3 rounded-full bg-purple-600 group-hover:bg-purple-500 transition text-white">
                  <ChevronRight className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-purple-200">Next Slide</span>
              </button>
            </div>

            {/* Slide Presentation Controls (F5 / Esc / Black / White) */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              <button
                onClick={() => triggerAction('Start Show (F5)', () => SmartBoardPresenter.startSlideShow(), 'slide.start')}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 flex flex-col items-center space-y-1 transition text-xs font-medium"
              >
                <Play className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px]">Start</span>
              </button>

              <button
                onClick={() => triggerAction('Exit Show (Esc)', () => SmartBoardPresenter.exitSlideShow(), 'slide.exit')}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 flex flex-col items-center space-y-1 transition text-xs font-medium"
              >
                <Square className="w-4 h-4 text-rose-400" />
                <span className="text-[10px]">Exit</span>
              </button>

              <button
                onClick={() => triggerAction('Blackout (B)', () => SmartBoardPresenter.toggleBlackScreen(), 'screen.blackout')}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 flex flex-col items-center space-y-1 transition text-xs font-medium"
              >
                <EyeOff className="w-4 h-4 text-slate-400" />
                <span className="text-[10px]">Black</span>
              </button>

              <button
                onClick={() => triggerAction('Whiteboard (W)', () => SmartBoardPresenter.toggleWhiteScreen(), 'screen.whiteboard')}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 flex flex-col items-center space-y-1 transition text-xs font-medium"
              >
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="text-[10px]">White</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-72">
            <div className="text-center text-xs text-slate-400 mb-2 flex items-center justify-center space-x-1.5">
              <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>Drag finger to point laser / pointer cursor on display</span>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden border border-purple-500/30">
              <TouchpadSurface config={PRESENTATION_GESTURE_CONFIG} hapticsEnabled={true} />
            </div>
          </div>
        )}
      </div>

      {/* Presentation Helper Footer */}
      <footer className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center space-x-1">
          <Volume2 className="w-3.5 h-3.5" />
          <span>Volume rocker supported</span>
        </div>
        <div className="flex items-center space-x-1">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>PowerPoint / Google Slides / Keynote</span>
        </div>
      </footer>
    </div>
  );
};
