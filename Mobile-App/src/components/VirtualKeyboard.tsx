import React, { useState } from 'react';
import { BluetoothHID } from '@shared/services/BluetoothHIDService';
import { KeyboardModifierMask } from '@shared/input-models/HIDReports';
import { Delete, CornerDownLeft, X } from 'lucide-react';

interface VirtualKeyboardProps {
  onClose?: () => void;
}

// Standard USB HID Usage Table 7 for Keyboard / Keypad
const HID_KEYS: Record<string, number> = {
  // Letters
  a: 4, b: 5, c: 6, d: 7, e: 8, f: 9, g: 10, h: 11, i: 12, j: 13,
  k: 14, l: 15, m: 16, n: 17, o: 18, p: 19, q: 20, r: 21, s: 22,
  t: 23, u: 24, v: 25, w: 26, x: 27, y: 28, z: 29,
  // Numbers
  '1': 30, '2': 31, '3': 32, '4': 33, '5': 34,
  '6': 35, '7': 36, '8': 37, '9': 38, '0': 39,
  // Controls
  Enter: 40, Esc: 41, Backspace: 42, Tab: 43, Space: 44,
  '-': 45, '=': 46, '[': 47, ']': 48, '\\': 49,
  ';': 51, "'": 52, '`': 53, ',': 54, '.': 55, '/': 56,
  // Navigation & Editing
  Home: 74, PageUp: 75, Delete: 76, End: 77, PageDown: 78,
  Right: 79, Left: 80, Down: 81, Up: 82,
  // Function keys
  F1: 58, F2: 59, F3: 60, F4: 61, F5: 62, F6: 63,
  F7: 64, F8: 65, F9: 66, F10: 67, F11: 68, F12: 69,
};

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ onClose }) => {
  const [activeModifiers, setActiveModifiers] = useState<number>(0);
  const [showFunctionKeys, setShowFunctionKeys] = useState(false);

  const toggleModifier = (mask: number) => {
    setActiveModifiers((prev) => {
      const next = prev ^ mask;
      return next;
    });
  };

  const sendKey = (keyLabel: string, forceModifier = 0) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    const usage = HID_KEYS[keyLabel.toLowerCase()] || HID_KEYS[keyLabel];
    if (!usage) return;

    const currentMod = activeModifiers | forceModifier;

    // Send Keydown with modifiers
    BluetoothHID.sendKeyboardReport({
      modifiers: currentMod,
      keys: [usage],
    });

    // Send Keyup (release) after 40ms
    setTimeout(() => {
      BluetoothHID.sendKeyboardReport({
        modifiers: activeModifiers, // keep sticky modifiers if active
        keys: [],
      });
    }, 40);
  };

  const handleShortcut = (type: 'copy' | 'paste' | 'select-all' | 'undo' | 'alt-tab' | 'close-app') => {
    if (type === 'copy') sendKey('c', KeyboardModifierMask.LEFT_CTRL);
    else if (type === 'paste') sendKey('v', KeyboardModifierMask.LEFT_CTRL);
    else if (type === 'select-all') sendKey('a', KeyboardModifierMask.LEFT_CTRL);
    else if (type === 'undo') sendKey('z', KeyboardModifierMask.LEFT_CTRL);
    else if (type === 'alt-tab') sendKey('Tab', KeyboardModifierMask.LEFT_ALT);
    else if (type === 'close-app') sendKey('F4', KeyboardModifierMask.LEFT_ALT);
  };

  const releaseAll = () => {
    setActiveModifiers(0);
    BluetoothHID.releaseAllInputs();
  };

  const isCtrlActive = (activeModifiers & KeyboardModifierMask.LEFT_CTRL) !== 0;
  const isAltActive = (activeModifiers & KeyboardModifierMask.LEFT_ALT) !== 0;
  const isShiftActive = (activeModifiers & KeyboardModifierMask.LEFT_SHIFT) !== 0;
  const isGuiActive = (activeModifiers & KeyboardModifierMask.LEFT_GUI) !== 0;

  return (
    <div className="flex flex-col w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-2xl">
      {/* Header controls */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-300">PC Virtual Keyboard</span>
          <span className="text-[10px] text-emerald-400 font-mono">Zero-Keystroke-Log</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFunctionKeys(!showFunctionKeys)}
            className={`px-2 py-1 rounded text-[11px] font-semibold border ${
              showFunctionKeys ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {showFunctionKeys ? 'Hide F1-F12' : 'F1-F12'}
          </button>
          <button
            onClick={releaseAll}
            className="px-2 py-1 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30"
          >
            Release All
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Function keys row (if toggled) */}
      {showFunctionKeys && (
        <div className="grid grid-cols-6 gap-1 mb-2">
          {['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'].map((fn) => (
            <button
              key={fn}
              onClick={() => sendKey(fn)}
              className="py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
            >
              {fn}
            </button>
          ))}
        </div>
      )}

      {/* Common Shortcuts Bar */}
      <div className="flex space-x-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar text-xs">
        <button onClick={() => handleShortcut('copy')} className="px-2.5 py-1 rounded bg-slate-800/80 text-slate-300 whitespace-nowrap hover:bg-slate-800">
          Ctrl+C (Copy)
        </button>
        <button onClick={() => handleShortcut('paste')} className="px-2.5 py-1 rounded bg-slate-800/80 text-slate-300 whitespace-nowrap hover:bg-slate-800">
          Ctrl+V (Paste)
        </button>
        <button onClick={() => handleShortcut('select-all')} className="px-2.5 py-1 rounded bg-slate-800/80 text-slate-300 whitespace-nowrap hover:bg-slate-800">
          Ctrl+A (Select All)
        </button>
        <button onClick={() => handleShortcut('undo')} className="px-2.5 py-1 rounded bg-slate-800/80 text-slate-300 whitespace-nowrap hover:bg-slate-800">
          Ctrl+Z (Undo)
        </button>
        <button onClick={() => handleShortcut('alt-tab')} className="px-2.5 py-1 rounded bg-slate-800/80 text-slate-300 whitespace-nowrap hover:bg-slate-800">
          Alt+Tab
        </button>
        <button onClick={() => handleShortcut('close-app')} className="px-2.5 py-1 rounded bg-slate-800/80 text-slate-300 whitespace-nowrap hover:bg-slate-800">
          Alt+F4
        </button>
      </div>

      {/* Modifier latch row */}
      <div className="grid grid-cols-4 gap-1.5 mb-2">
        <button
          onClick={() => toggleModifier(KeyboardModifierMask.LEFT_CTRL)}
          className={`py-2 rounded-lg text-xs font-bold border transition ${
            isCtrlActive ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}
        >
          Ctrl
        </button>
        <button
          onClick={() => toggleModifier(KeyboardModifierMask.LEFT_ALT)}
          className={`py-2 rounded-lg text-xs font-bold border transition ${
            isAltActive ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}
        >
          Alt
        </button>
        <button
          onClick={() => toggleModifier(KeyboardModifierMask.LEFT_SHIFT)}
          className={`py-2 rounded-lg text-xs font-bold border transition ${
            isShiftActive ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}
        >
          Shift
        </button>
        <button
          onClick={() => toggleModifier(KeyboardModifierMask.LEFT_GUI)}
          className={`py-2 rounded-lg text-xs font-bold border transition ${
            isGuiActive ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}
        >
          Win / Cmd
        </button>
      </div>

      {/* Main QWERTY Rows */}
      <div className="space-y-1.5">
        {/* Number Row */}
        <div className="grid grid-cols-10 gap-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((num) => (
            <button
              key={num}
              onClick={() => sendKey(num)}
              className="py-2.5 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-bold active:scale-95"
            >
              {num}
            </button>
          ))}
        </div>

        {/* QWERTY Row 1 */}
        <div className="grid grid-cols-10 gap-1">
          {['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'].map((char) => (
            <button
              key={char}
              onClick={() => sendKey(char)}
              className="py-2.5 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-bold uppercase active:scale-95"
            >
              {char}
            </button>
          ))}
        </div>

        {/* QWERTY Row 2 */}
        <div className="grid grid-cols-9 gap-1 px-2">
          {['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'].map((char) => (
            <button
              key={char}
              onClick={() => sendKey(char)}
              className="py-2.5 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-bold uppercase active:scale-95"
            >
              {char}
            </button>
          ))}
        </div>

        {/* QWERTY Row 3 (with Backspace) */}
        <div className="grid grid-cols-9 gap-1">
          {['z', 'x', 'c', 'v', 'b', 'n', 'm'].map((char) => (
            <button
              key={char}
              onClick={() => sendKey(char)}
              className="py-2.5 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-bold uppercase active:scale-95"
            >
              {char}
            </button>
          ))}
          <button
            onClick={() => sendKey('Backspace')}
            className="col-span-2 py-2.5 rounded bg-slate-800 text-rose-400 hover:bg-slate-700 flex items-center justify-center text-xs font-bold active:scale-95"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Actions Row */}
        <div className="grid grid-cols-6 gap-1 pt-1">
          <button
            onClick={() => sendKey('Esc')}
            className="py-2 rounded bg-slate-800 text-slate-300 text-xs font-bold"
          >
            Esc
          </button>
          <button
            onClick={() => sendKey('Tab')}
            className="py-2 rounded bg-slate-800 text-slate-300 text-xs font-bold"
          >
            Tab
          </button>
          <button
            onClick={() => sendKey('Space')}
            className="col-span-2 py-2 rounded bg-slate-800 text-slate-300 text-xs font-bold"
          >
            Space
          </button>
          <button
            onClick={() => sendKey('Enter')}
            className="col-span-2 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center text-xs font-bold"
          >
            <CornerDownLeft className="w-4 h-4 mr-1" />
            <span>Enter</span>
          </button>
        </div>
      </div>
    </div>
  );
};
