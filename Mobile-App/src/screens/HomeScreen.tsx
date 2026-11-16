import React from 'react';
import { 
  Monitor, 
  Tv, 
  Presentation, 
  Bluetooth, 
  Wifi, 
  ChevronRight, 
  ShieldCheck, 
  Info,
  MousePointer
} from 'lucide-react';

export type ScreenTarget = 
  | 'touchpad-deck'
  | 'pc-bluetooth' 
  | 'pc-wifi' 
  | 'smartboard-bluetooth' 
  | 'smartboard-wifi' 
  | 'tv-bluetooth' 
  | 'tv-wifi';

interface HomeScreenProps {
  onSelectCategory: (target: ScreenTarget) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectCategory }) => {
  return (
    <div className="flex flex-col flex-1 px-4 py-5 max-w-lg mx-auto w-full">
      {/* Brand Header */}
      <header className="mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-cyan-500/20">
            S
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              STouch
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Your phone. Every screen. One control platform.
            </p>
          </div>
        </div>
      </header>

      {/* Target Category Cards */}
      <div className="space-y-4 flex-1">
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
            Choose Target Device & Mode
          </h2>
        </div>

        {/* 1. PC Card */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-4 shadow-xl">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Personal Computers (PCs)</h3>
              <p className="text-[11px] text-slate-400">Windows, macOS, Linux</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {/* Direct Touchpad Surface Launcher */}
            <button
              onClick={() => onSelectCategory('touchpad-deck')}
              className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-cyan-950/60 to-blue-950/60 hover:from-cyan-900/50 hover:to-blue-900/50 border border-cyan-500/40 text-left transition active:scale-[0.99] group shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-cyan-500 text-white shadow-md shadow-cyan-500/30 group-hover:scale-105 transition">
                  <MousePointer className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">Full Touchpad Surface</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-500/30 text-cyan-200 border border-cyan-400/40">
                      Primary Interface
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Multi-touch pad, mouse buttons, drag-and-drop & keyboard
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition" />
            </button>
            {/* Bluetooth HID */}
            <button
              onClick={() => onSelectCategory('pc-bluetooth')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-left border border-slate-700/60 transition active:scale-[0.99] group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 group-hover:bg-cyan-500/25 transition">
                  <Bluetooth className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-white">Bluetooth HID Mode</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Direct BT
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Direct mouse & keyboard. No PC software needed.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
            </button>

            {/* Local Wi-Fi Mode */}
            <button
              onClick={() => onSelectCategory('pc-wifi')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-left border border-slate-700/60 transition active:scale-[0.99] group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-500/15 text-blue-400 group-hover:bg-blue-500/25 transition">
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-white">Local Wi-Fi Mode</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Wi-Fi Receiver
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Fast WebSocket control via STouch Desktop Receiver.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition" />
            </button>
          </div>
        </div>

        {/* 2. Smart Board Card */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-4 shadow-xl">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Interactive Smart Boards</h3>
              <p className="text-[11px] text-slate-400">Classroom displays, meeting rooms & projectors</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {/* Bluetooth Presenter */}
            <button
              onClick={() => onSelectCategory('smartboard-bluetooth')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-left border border-slate-700/60 transition active:scale-[0.99] group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400 group-hover:bg-purple-500/25 transition">
                  <Bluetooth className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-white">Bluetooth Presenter Mode</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Direct BT
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Hardware slide clicker, laser pointer & blackout keys.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition" />
            </button>

            {/* Wi-Fi Smart Board */}
            <button
              onClick={() => onSelectCategory('smartboard-wifi')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-left border border-slate-700/60 transition active:scale-[0.99] group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400 group-hover:bg-purple-500/25 transition">
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-white">Local Wi-Fi Mode</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      Network Sync
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Classroom presentation sync & interactive board commands.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition" />
            </button>
          </div>
        </div>

        {/* 3. TV Card */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-4 shadow-xl">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Smart TVs</h3>
              <p className="text-[11px] text-slate-400">Android TV, Google TV, Samsung, LG & streaming boxes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {/* Bluetooth TV Remote */}
            <button
              onClick={() => onSelectCategory('tv-bluetooth')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-left border border-slate-700/60 transition active:scale-[0.99] group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 group-hover:bg-amber-500/25 transition">
                  <Bluetooth className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-white">Bluetooth TV Remote</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Direct BT
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Direct Bluetooth HID remote: D-Pad, media & volume rocker.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
            </button>

            {/* Wi-Fi TV Remote */}
            <button
              onClick={() => onSelectCategory('tv-wifi')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-left border border-slate-700/60 transition active:scale-[0.99] group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 group-hover:bg-amber-500/25 transition">
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-white">Local Wi-Fi Remote</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Local Wi-Fi
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    High-speed network remote control via local IP / Smart TV.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Privacy-First: Zero keystroke logging</span>
        </div>
        <div className="flex items-center space-x-1">
          <Info className="w-3.5 h-3.5" />
          <span>v0.1.0-alpha</span>
        </div>
      </footer>
    </div>
  );
};
