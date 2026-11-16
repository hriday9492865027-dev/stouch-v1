import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Tv, 
  Power, 
  Volume2, 
  VolumeX, 
  Home, 
  RotateCcw, 
  Menu, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Keyboard as KeyboardIcon,
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Minus,
  Bluetooth,
  Wifi
} from 'lucide-react';
import { BluetoothTVRemote } from '@tv/Bluetooth-TV/remote-controls/BluetoothTVRemote';
import type { TVButton, TVRemoteCommand } from '@tv/WiFi-TV/protocols/TVRemoteProtocol';
import { VirtualKeyboard } from '../components/VirtualKeyboard';

interface TVScreenProps {
  initialMode?: 'bluetooth' | 'wifi';
  onBack: () => void;
}

export const TVScreen: React.FC<TVScreenProps> = ({ initialMode = 'bluetooth', onBack }) => {
  const [connectionType, setConnectionType] = useState<'bluetooth' | 'wifi'>(initialMode);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [tvIp, setTvIp] = useState('192.168.1.50');
  const [tvConnected, setTvConnected] = useState(false);

  const sendBtn = (button: TVButton, label: string) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(18);
    }
    setFeedback(label);

    if (connectionType === 'bluetooth') {
      BluetoothTVRemote.sendButton(button);
    } else {
      // Wi-Fi TV command
      const cmd: TVRemoteCommand = {
        type: 'tv.command',
        button,
        state: 'click',
        timestamp: Date.now()
      };
      console.log(`[Smart TV Wi-Fi] Dispatched to ${tvIp}:`, cmd);
    }

    setTimeout(() => setFeedback(null), 350);
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
          <span className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center space-x-1.5">
            <Tv className="w-4 h-4" />
            <span>Smart TV • {connectionType === 'bluetooth' ? 'Bluetooth HID' : 'Local Wi-Fi'}</span>
          </span>
        </div>

        {/* Connection Type Switcher */}
        <div className="grid grid-cols-2 gap-2 mb-3 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setConnectionType('bluetooth')}
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
              connectionType === 'bluetooth'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bluetooth className="w-3.5 h-3.5 text-amber-200" />
            <span>Bluetooth HID</span>
          </button>

          <button
            onClick={() => setConnectionType('wifi')}
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
              connectionType === 'wifi'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wifi className="w-3.5 h-3.5 text-amber-200" />
            <span>Local Wi-Fi</span>
          </button>
        </div>

        {/* Wi-Fi TV Host Configuration Bar */}
        {connectionType === 'wifi' && (
          <div className="p-3 mb-2 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${tvConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <input
                type="text"
                value={tvIp}
                onChange={(e) => setTvIp(e.target.value)}
                placeholder="Smart TV IP"
                className="bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-slate-200 font-mono text-[11px] w-32 focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              onClick={() => setTvConnected(!tvConnected)}
              className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold transition"
            >
              {tvConnected ? 'Connected' : 'Connect'}
            </button>
          </div>
        )}
      </div>

      {/* Visual Feedback Badge */}
      <div className="h-6 flex items-center justify-center">
        {feedback && (
          <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold animate-pulse">
            {feedback}
          </span>
        )}
      </div>

      {showKeyboard ? (
        <div className="flex-1 flex flex-col justify-end my-auto">
          <VirtualKeyboard onClose={() => setShowKeyboard(false)} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-around py-2">
          {/* Top Power & Utility Bar */}
          <div className="flex justify-between items-center px-4">
            <button
              onClick={() => sendBtn('power', 'Power')}
              className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 active:scale-95 transition shadow-lg shadow-rose-500/10"
              title="Power"
            >
              <Power className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowKeyboard(!showKeyboard)}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white active:scale-95 transition"
              title="Keyboard"
            >
              <KeyboardIcon className="w-5 h-5" />
            </button>

            <button
              onClick={() => sendBtn('mute', 'Mute')}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white active:scale-95 transition"
              title="Mute"
            >
              <VolumeX className="w-5 h-5" />
            </button>
          </div>

          {/* D-Pad Controller */}
          <div className="flex justify-center my-4">
            <div className="relative w-56 h-56 rounded-full bg-slate-900/90 border border-slate-800 shadow-2xl p-2 flex items-center justify-center">
              {/* Up */}
              <button
                onClick={() => sendBtn('dpad_up', 'Up')}
                className="absolute top-2 w-16 h-12 flex items-center justify-center text-slate-300 hover:text-amber-400 active:scale-95 transition"
              >
                <ChevronUp className="w-7 h-7" />
              </button>

              {/* Down */}
              <button
                onClick={() => sendBtn('dpad_down', 'Down')}
                className="absolute bottom-2 w-16 h-12 flex items-center justify-center text-slate-300 hover:text-amber-400 active:scale-95 transition"
              >
                <ChevronDown className="w-7 h-7" />
              </button>

              {/* Left */}
              <button
                onClick={() => sendBtn('dpad_left', 'Left')}
                className="absolute left-2 h-16 w-12 flex items-center justify-center text-slate-300 hover:text-amber-400 active:scale-95 transition"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>

              {/* Right */}
              <button
                onClick={() => sendBtn('dpad_right', 'Right')}
                className="absolute right-2 h-16 w-12 flex items-center justify-center text-slate-300 hover:text-amber-400 active:scale-95 transition"
              >
                <ChevronRight className="w-7 h-7" />
              </button>

              {/* OK / Center Select */}
              <button
                onClick={() => sendBtn('dpad_center', 'Select (OK)')}
                className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 text-white font-extrabold text-sm shadow-xl shadow-amber-500/25 active:scale-90 transition flex items-center justify-center"
              >
                OK
              </button>
            </div>
          </div>

          {/* Navigation Controls (Back / Home / Menu) */}
          <div className="grid grid-cols-3 gap-3 px-4">
            <button
              onClick={() => sendBtn('back', 'Back')}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex flex-col items-center space-y-1 active:scale-95 transition text-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={() => sendBtn('home', 'Home')}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex flex-col items-center space-y-1 active:scale-95 transition text-xs"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => sendBtn('menu', 'Menu')}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex flex-col items-center space-y-1 active:scale-95 transition text-xs"
            >
              <Menu className="w-4 h-4" />
              <span>Menu</span>
            </button>
          </div>

          {/* Dual Rockers: Volume & Channel */}
          <div className="grid grid-cols-2 gap-4 px-4 pt-2">
            {/* Volume Rocker */}
            <div className="flex flex-col items-center p-2 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center space-x-1">
                <Volume2 className="w-3 h-3 text-amber-400" />
                <span>Volume</span>
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => sendBtn('volume_down', 'Vol -')}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95 transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => sendBtn('volume_up', 'Vol +')}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Channel Rocker */}
            <div className="flex flex-col items-center p-2 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center space-x-1">
                <Tv className="w-3 h-3 text-amber-400" />
                <span>Channel</span>
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => sendBtn('channel_down', 'CH -')}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95 transition"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => sendBtn('channel_up', 'CH +')}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95 transition"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Media Playback Controls */}
          <div className="flex justify-center items-center space-x-4 px-4 pt-1">
            <button
              onClick={() => sendBtn('media_rewind', 'Rewind')}
              className="p-2.5 text-slate-400 hover:text-white active:scale-95 transition"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                const nextState = !isPlaying;
                setIsPlaying(nextState);
                sendBtn('media_play_pause', nextState ? 'Play' : 'Pause');
              }}
              className="p-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/25 active:scale-95 transition"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <button
              onClick={() => sendBtn('media_fast_forward', 'Forward')}
              className="p-2.5 text-slate-400 hover:text-white active:scale-95 transition"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="pt-2 text-center text-[10px] text-slate-500">
        Compatible with Android TV, Google TV, Samsung Tizen, LG webOS & Apple TV
      </footer>
    </div>
  );
};
