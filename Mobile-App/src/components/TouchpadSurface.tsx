import React, { useRef, useEffect, useState, useMemo } from 'react';
import { TouchpadGestureEngine } from '@shared/gestures/TouchpadGestureEngine';
import { BluetoothHID } from '@shared/services/BluetoothHIDService';
import { MousePointer, Move, Hand } from 'lucide-react';

interface TouchpadSurfaceProps {
  sensitivity?: number;
  scrollSensitivity?: number;
}

export const TouchpadSurface: React.FC<TouchpadSurfaceProps> = ({
  sensitivity = 1.3,
  scrollSensitivity = 0.8,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
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

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      if (style === 'light') navigator.vibrate(12);
      else if (style === 'medium') navigator.vibrate(25);
      else navigator.vibrate(40);
    }
  };

  const triggerVisualFeedback = (text: string) => {
    setFeedbackEffect(text);
    setTimeout(() => setFeedbackEffect(null), 400);
  };

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
          triggerVisualFeedback('Left Click');
          BluetoothHID.sendLeftClick();
        },
        onRightClick: () => {
          triggerHaptic('medium');
          triggerVisualFeedback('Right Click');
          BluetoothHID.sendRightClick();
        },
        onDoubleClick: () => {
          triggerHaptic('medium');
          triggerVisualFeedback('Double Click');
          BluetoothHID.sendDoubleClick();
        },
        onDragStart: () => {
          triggerHaptic('heavy');
          triggerVisualFeedback('Drag & Drop (Holding Left Button)');
          BluetoothHID.sendMouseButtonState({ left: true });
        },
        onDragEnd: () => {
          triggerHaptic('light');
          triggerVisualFeedback('Drag Released');
          BluetoothHID.sendMouseButtonState({ left: false });
        },
        onGestureStateChange: (state) => {
          setGestureStatus(state);
        },
      },
      { sensitivity, scrollSensitivity }
    );
  }, [sensitivity, scrollSensitivity]);

  useEffect(() => {
    engine.updateConfig({ sensitivity, scrollSensitivity });
  }, [sensitivity, scrollSensitivity, engine]);

  return (
    <div
      ref={containerRef}
      onTouchStart={(e) => engine.handleTouchStart(e)}
      onTouchMove={(e) => engine.handleTouchMove(e)}
      onTouchEnd={(e) => engine.handleTouchEnd(e)}
      onTouchCancel={() => engine.handleTouchCancel()}
      className={`relative flex-1 w-full rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col items-center justify-center ${
        gestureStatus.isDragging
          ? 'bg-amber-950/20 border-amber-500/50 shadow-inner shadow-amber-500/20'
          : gestureStatus.isScrolling
          ? 'bg-cyan-950/20 border-cyan-500/50'
          : 'bg-slate-900/80 border-slate-800'
      }`}
      style={{ touchAction: 'none' }}
    >
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Floating Visual Feedback Badge */}
      {feedbackEffect && (
        <div className="absolute top-6 px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-semibold text-xs animate-fade-in shadow-lg">
          {feedbackEffect}
        </div>
      )}

      {/* Center Prompt & Status */}
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
            : 'Touchpad Surface'}
        </p>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          1-finger slide to move • Tap to click • 2-finger tap for right click • 2-finger slide to scroll • Long-press to drag
        </p>
      </div>

      {/* Bottom Live Gesture Pill */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-[11px] text-slate-500 pointer-events-none px-2">
        <span>Fingers: {gestureStatus.fingerCount}</span>
        <span className="font-mono">HID 60Hz Low Latency</span>
      </div>
    </div>
  );
};
