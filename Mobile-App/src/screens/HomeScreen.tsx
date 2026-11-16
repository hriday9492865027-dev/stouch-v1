import React from 'react';
import { Monitor, Tv, Presentation, Bluetooth, Wifi, ChevronRight, ShieldCheck, Info } from 'lucide-react';

interface HomeScreenProps {
  onSelectCategory: (category: 'pc-bluetooth' | 'pc-wifi' | 'smartboard' | 'tv') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectCategory }) => {
  return (
    <div className="flex flex-col flex-1 px-4 py-6 max-w-lg mx-auto w-full">
      {/* Brand Header */}
      <header className="mb-8">
        <div className="flex items-center space-x-2">
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
      <div className="space-y-5 flex-1">
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">
            Choose Target Device
          </h2>
        </div>

        {/* 1. PC Card */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-5 shadow-xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Personal Computers (PCs)</h3>
              <p className="text-xs text-slate-400">Windows, macOS, Linux</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 pt-1">
            {/* Bluetooth HID - Phase 1 Active */}
            <button
              onClick={() => onSelectCategory('pc-bluetooth')}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-left border border-slate-700/60 transition active:scale-[0.99]"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400">
                  <Bluetooth className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-white">Bluetooth HID Mode</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Direct BT
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Direct mouse & keyboard. No PC software needed.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            {/* Wi-Fi Mode - Active */}
            <button
              onClick={() => onSelectCategory('pc-wifi')}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-left border border-slate-700/60 transition active:scale-[0.99]"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-500/15 text-blue-400">
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-white">Local Wi-Fi Mode</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Phase 4 (Active)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Fast WebSocket control via STouch Desktop Receiver.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* 2. Smart Board Card - Phase 5 Active */}
        <div 
          onClick={() => onSelectCategory('smartboard')}
          className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-5 shadow-xl hover:border-purple-500/50 cursor-pointer transition active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Presentation className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-100">Interactive Smart Boards</h3>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    Phase 5 (Active)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Presentation clicker, laser pointer, and classroom displays</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
        </div>

        {/* 3. TV Card - Phase 5 Active */}
        <div 
          onClick={() => onSelectCategory('tv')}
          className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-5 shadow-xl hover:border-amber-500/50 cursor-pointer transition active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-100">Smart TVs</h3>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Phase 5 (Active)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">D-Pad navigation, media playback, and volume remote</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
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
