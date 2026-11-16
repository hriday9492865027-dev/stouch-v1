import React, { useState } from 'react';
import { BluetoothHID } from '@shared/services/BluetoothHIDService';

export const MouseButtonsBar: React.FC = () => {
  const [leftPressed, setLeftPressed] = useState(false);
  const [middlePressed, setMiddlePressed] = useState(false);
  const [rightPressed, setRightPressed] = useState(false);

  const handlePress = (button: 'left' | 'middle' | 'right') => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
    if (button === 'left') {
      setLeftPressed(true);
      BluetoothHID.sendMouseButtonState({ left: true });
    } else if (button === 'middle') {
      setMiddlePressed(true);
      BluetoothHID.sendMouseButtonState({ middle: true });
    } else if (button === 'right') {
      setRightPressed(true);
      BluetoothHID.sendMouseButtonState({ right: true });
    }
  };

  const handleRelease = (button: 'left' | 'middle' | 'right') => {
    if (button === 'left') {
      setLeftPressed(false);
      BluetoothHID.sendMouseButtonState({ left: false });
    } else if (button === 'middle') {
      setMiddlePressed(false);
      BluetoothHID.sendMouseButtonState({ middle: false });
    } else if (button === 'right') {
      setRightPressed(false);
      BluetoothHID.sendMouseButtonState({ right: false });
    }
  };

  return (
    <div className="grid grid-cols-5 gap-2 w-full mt-3 h-14 select-none">
      {/* Left Click (Wide) */}
      <button
        onTouchStart={() => handlePress('left')}
        onTouchEnd={() => handleRelease('left')}
        onMouseDown={() => handlePress('left')}
        onMouseUp={() => handleRelease('left')}
        className={`col-span-2 rounded-xl font-bold text-xs flex items-center justify-center border transition-all active:scale-[0.98] ${
          leftPressed
            ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-500/30'
            : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800'
        }`}
      >
        Left Click
      </button>

      {/* Middle Click / Scroll Wheel Click */}
      <button
        onTouchStart={() => handlePress('middle')}
        onTouchEnd={() => handleRelease('middle')}
        onMouseDown={() => handlePress('middle')}
        onMouseUp={() => handleRelease('middle')}
        className={`col-span-1 rounded-xl font-bold text-xs flex items-center justify-center border transition-all active:scale-[0.98] ${
          middlePressed
            ? 'bg-blue-600 text-white border-blue-400'
            : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:bg-slate-800'
        }`}
      >
        Middle
      </button>

      {/* Right Click (Wide) */}
      <button
        onTouchStart={() => handlePress('right')}
        onTouchEnd={() => handleRelease('right')}
        onMouseDown={() => handlePress('right')}
        onMouseUp={() => handleRelease('right')}
        className={`col-span-2 rounded-xl font-bold text-xs flex items-center justify-center border transition-all active:scale-[0.98] ${
          rightPressed
            ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-500/30'
            : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800'
        }`}
      >
        Right Click
      </button>
    </div>
  );
};
