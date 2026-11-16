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
  Minus
} from 'lucide-react';
import { BluetoothTVRemote } from '@tv/Bluetooth-TV/remote-controls/BluetoothTVRemote';
import type { TVButton } from '@tv/WiFi-TV/protocols/TVRemoteProtocol';
import { VirtualKeyboard } from '../components/VirtualKeyboard';

interface TVScreenProps {
  onBack: () => void;
}

export const TVScreen: React.FC<TVScreenProps> = ({ onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const sendBtn = (button: TVButton, label: string) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(18);
    }
    setFeedback(label);
    BluetoothTVRemote.sendButton(button);
    setTimeout(() => setFeedback(null), 350);
  };

  return (
    <div className="flex flex-col flex-1 px-4 py-5 max-w-lg mx-auto w-full select-none justify-between">
      {/* Top Nav */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-medium text-slate-400 hover:text-white transition p-1 -ml-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center space-x-1.5">
          <Tv className="w-4 h-4" />
          <span>Smart TV Remote</span>
        </span>
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
              className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 active:scale-95 transition"
            >
              <Power className="w-5 h-5" />
            </button>
            <button
              onClick={() => sendBtn('mute', 'Mute')}
              className="p-3 rounded-2xl bg-slate-900 text-slate-400 border border-slate-800 hover:text-white active:scale-95 transition"
            >
              <VolumeX className="w-5 h-5" />
            </button>
            <button
              onClick={() => sendBtn('menu', 'Menu')}
              className="p-3 rounded-2xl bg-slate-900 text-slate-400 border border-slate-800 hover:text-white active:scale-95 transition"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Ergonomic Circular D-Pad */}
          <div className="flex justify-center my-3">
            <div className="relative w-56 h-56 rounded-full bg-slate-900 border-2 border-slate-800 p-2 shadow-2xl flex items-center justify-center">
              {/* Up */}
              <button
                onClick={() => sendBtn('dpad_up', 'Up')}
                className="absolute top-2 w-14 h-14 rounded-full flex items-center justify-center text-slate-300 hover:text-white active:bg-slate-800 active:scale-95 transition"
              >
                <ChevronUp className="w-7 h-7" />
              </button>

              {/* Down */}
              <button
                onClick={() => sendBtn('dpad_down', 'Down')}
                className="absolute bottom-2 w-14 h-14 rounded-full flex items-center justify-center text-slate-300 hover:text-white active:bg-slate-800 active:scale-95 transition"
              >
                <ChevronDown className="w-7 h-7" />
              </button>

              {/* Left */}
              <button
                onClick={() => sendBtn('dpad_left', 'Left')}
                className="absolute left-2 w-14 h-14 rounded-full flex items-center justify-center text-slate-300 hover:text-white active:bg-slate-800 active:scale-95 transition"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>

              {/* Right */}
              <button
                onClick={() => sendBtn('dpad_right', 'Right')}
                className="absolute right-2 w-14 h-14 rounded-full flex items-center justify-center text-slate-300 hover:text-white active:bg-slate-800 active:scale-95 transition"
              >
                <ChevronRight className="w-7 h-7" />
              </button>

              {/* Center OK / Select Button */}
              <button
                onClick={() => sendBtn('dpad_center', 'OK / Select')}
                className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center transition"
              >
                OK
              </button>
            </div>
          </div>

          {/* Navigation Bar (Back, Home, Keyboard) */}
          <div className="grid grid-cols-3 gap-3 px-2">
            <button
              onClick={() => sendBtn('back', 'Back')}
              className="py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 active:scale-95 flex flex-col items-center justify-center text-xs font-semibold text-slate-300 transition"
            >
              <RotateCcw className="w-5 h-5 mb-1 text-slate-400" />
              <span>Back</span>
            </button>
            <button
              onClick={() => sendBtn('home', 'Home')}
              className="py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 active:scale-95 flex flex-col items-center justify-center text-xs font-semibold text-slate-300 transition"
            >
              <Home className="w-5 h-5 mb-1 text-amber-400" />
              <span>Home</span>
            </button>
            <button
              onClick={() => setShowKeyboard(true)}
              className="py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 active:scale-95 flex flex-col items-center justify-center text-xs font-semibold text-slate-300 transition"
            >
              <KeyboardIcon className="w-5 h-5 mb-1 text-cyan-400" />
              <span>Keyboard</span>
            </button>
          </div>

          {/* Volume and Channel Rockers */}
          <div className="grid grid-cols-2 gap-4 px-2 my-2">
            {/* Volume Rocker */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => sendBtn('volume_down', 'Volume -')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-400 flex items-center space-x-1">
                <Volume2 className="w-3.5 h-3.5" />
                <span>VOL</span>
              </span>
              <button
                onClick={() => sendBtn('volume_up', 'Volume +')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Channel Rocker */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => sendBtn('channel_down', 'CH -')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-400">CH</span>
              <button
                onClick={() => sendBtn('channel_up', 'CH +')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Media Playback Controls */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => sendBtn('media_rewind', 'Rewind')}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white active:scale-95 transition"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsPlaying(!isPlaying);
                sendBtn('media_play_pause', isPlaying ? 'Pause' : 'Play');
              }}
              className="p-3 px-5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 active:scale-95 transition"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={() => sendBtn('media_fast_forward', 'Forward')}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white active:scale-95 transition"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <footer className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span>Android TV • Google TV • webOS • Tizen</span>
        <span className="font-mono">HID Remote Profile</span>
      </footer>
    </div>
  );
};
