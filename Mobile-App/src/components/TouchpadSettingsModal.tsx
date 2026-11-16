import React from 'react';
import { X, Sliders, Check } from 'lucide-react';
import type { GestureConfig } from '@shared/gestures/TouchpadGestureEngine';

interface TouchpadSettingsModalProps {
  config: GestureConfig;
  hapticsEnabled: boolean;
  keepAwake: boolean;
  onUpdateConfig: (newConfig: Partial<GestureConfig>) => void;
  onToggleHaptics: (enabled: boolean) => void;
  onToggleKeepAwake: (enabled: boolean) => void;
  onClose: () => void;
}

export const TouchpadSettingsModal: React.FC<TouchpadSettingsModalProps> = ({
  config,
  hapticsEnabled,
  keepAwake,
  onUpdateConfig,
  onToggleHaptics,
  onToggleKeepAwake,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-5 shadow-2xl flex flex-col space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Touchpad & Control Settings</h2>
              <p className="text-[11px] text-slate-400">Customized for your comfort</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sliders */}
        <div className="space-y-4 text-xs">
          {/* Pointer Sensitivity */}
          <div>
            <div className="flex justify-between items-center mb-1.5 font-semibold text-slate-300">
              <span>Pointer Sensitivity</span>
              <span className="font-mono text-cyan-400">{config.sensitivity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={config.sensitivity}
              onChange={(e) => onUpdateConfig({ sensitivity: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500"
            />
          </div>

          {/* Scroll Sensitivity */}
          <div>
            <div className="flex justify-between items-center mb-1.5 font-semibold text-slate-300">
              <span>Scroll Sensitivity</span>
              <span className="font-mono text-cyan-400">{config.scrollSensitivity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="2.0"
              step="0.1"
              value={config.scrollSensitivity}
              onChange={(e) => onUpdateConfig({ scrollSensitivity: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs">
          {/* Natural Scrolling */}
          <div 
            onClick={() => onUpdateConfig({ naturalScroll: !config.naturalScroll })}
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 cursor-pointer"
          >
            <div>
              <div className="font-bold text-slate-200">Natural Scrolling</div>
              <div className="text-[11px] text-slate-500">Content follows finger direction</div>
            </div>
            <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
              config.naturalScroll ? 'bg-cyan-600 border-cyan-400 text-white' : 'border-slate-700'
            }`}>
              {config.naturalScroll && <Check className="w-3.5 h-3.5" />}
            </div>
          </div>

          {/* Tap-to-Click */}
          <div 
            onClick={() => onUpdateConfig({ tapToClickEnabled: !config.tapToClickEnabled })}
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 cursor-pointer"
          >
            <div>
              <div className="font-bold text-slate-200">Tap to Click</div>
              <div className="text-[11px] text-slate-500">Tap surface for left-click / 2-finger for right-click</div>
            </div>
            <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
              config.tapToClickEnabled ? 'bg-cyan-600 border-cyan-400 text-white' : 'border-slate-700'
            }`}>
              {config.tapToClickEnabled && <Check className="w-3.5 h-3.5" />}
            </div>
          </div>

          {/* Pointer Acceleration */}
          <div 
            onClick={() => onUpdateConfig({ pointerAcceleration: !config.pointerAcceleration })}
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 cursor-pointer"
          >
            <div>
              <div className="font-bold text-slate-200">Pointer Acceleration</div>
              <div className="text-[11px] text-slate-500">Faster flicks move cursor across the whole screen</div>
            </div>
            <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
              config.pointerAcceleration ? 'bg-cyan-600 border-cyan-400 text-white' : 'border-slate-700'
            }`}>
              {config.pointerAcceleration && <Check className="w-3.5 h-3.5" />}
            </div>
          </div>

          {/* Haptic Feedback */}
          <div 
            onClick={() => onToggleHaptics(!hapticsEnabled)}
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 cursor-pointer"
          >
            <div>
              <div className="font-bold text-slate-200">Haptic Vibration</div>
              <div className="text-[11px] text-slate-500">Subtle vibration pulse on clicks and drags</div>
            </div>
            <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
              hapticsEnabled ? 'bg-cyan-600 border-cyan-400 text-white' : 'border-slate-700'
            }`}>
              {hapticsEnabled && <Check className="w-3.5 h-3.5" />}
            </div>
          </div>

          {/* Keep Screen Awake */}
          <div 
            onClick={() => onToggleKeepAwake(!keepAwake)}
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 cursor-pointer"
          >
            <div>
              <div className="font-bold text-slate-200">Keep Screen Awake</div>
              <div className="text-[11px] text-slate-500">Prevent phone display from sleeping during use</div>
            </div>
            <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
              keepAwake ? 'bg-cyan-600 border-cyan-400 text-white' : 'border-slate-700'
            }`}>
              {keepAwake && <Check className="w-3.5 h-3.5" />}
            </div>
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition active:scale-[0.99]"
        >
          Done
        </button>
      </div>
    </div>
  );
};
