import React, { useRef, useState, useMemo, useEffect } from 'react';
import { TouchpadGestureEngine, type GestureConfig } from '@shared/gestures/TouchpadGestureEngine';
import { BluetoothHID } from '@shared/services/BluetoothHIDService';
import { MousePointer, Move, Hand } from 'lucide-react';

interface TouchpadSurfaceProps {
  config: GestureConfig;
  hapticsEnabled: boolean;
  onCustomMove?: (dx: number, dy: number) => void;
  onCustomClick?: (type: 'left' | 'right' | 'double') => void;
  onCustomScroll?: (v: number, h: number) => void;
}

export const TouchpadSurface: React.FC<TouchpadSurfaceProps> = ({
  config,
  hapticsEnabled,
  onCustomMove,
  onCustomClick,
  onCustomScroll,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
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

  const [feedbackEffect, setFeedbackEffect] = useState<string | null>(null);

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (hapticsEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
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
          if (onCustomMove) onCustomMove(dx, dy);
          else BluetoothHID.sendMouseReport({ dx, dy, buttons: 0 });
        },
        onScroll: (vScroll, hScroll) => {
          if (onCustomScroll) onCustomScroll(vScroll, hScroll);
          else BluetoothHID.sendMouseReport({ dx: 0, dy: 0, buttons: 0, wheel: vScroll, hWheel: hScroll });
        },
        onLeftClick: () => {
          triggerHaptic('light');
          triggerVisualFeedback('Left Click');
          if (onCustomClick) onCustomClick('left');
          else BluetoothHID.sendLeftClick();
        },
        onRightClick: () => {
          triggerHaptic('medium');
          triggerVisualFeedback('Right Click');
          if (onCustomClick) onCustomClick('right');
          else BluetoothHID.sendRightClick();
        },
        onDoubleClick: () => {
          triggerHaptic('medium');
          triggerVisualFeedback('Double Click');
          if (onCustomClick) onCustomClick('double');
          else BluetoothHID.sendDoubleClick();
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
      config
    );
  }, [onCustomMove, onCustomClick, onCustomScroll]);

  // Live update config whenever user adjusts sliders/toggles
  useEffect(() => {
    engine.updateConfig(config);
  }, [config, engine]);

  // Mouse emulation handlers for desktop web browser testing
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

  const handleMouseLeave = () => {
    if (isMouseDownRef.current) {
      isMouseDownRef.current = false;
      engine.handleTouchCancel();
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={(e) => engine.handleTouchStart(e)}
      onTouchMove={(e) => engine.handleTouchMove(e)}
      onTouchEnd={(e) => engine.handleTouchEnd(e)}
      onTouchCancel={() => engine.handleTouchCancel()}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className={`relative flex-1 w-full rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col items-center justify-center cursor-crosshair select-none ${
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
        <div className="absolute top-6 px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-semibold text-xs animate-fade-in shadow-lg shadow-cyan-500/10">
          {feedbackEffect}
        </div>
      )}

      {/* Center Indicator */}
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
          1-Finger move, tap to click, 2-finger scroll & right-click, long-press to drag
        </p>
      </div>

      {/* Active Gestures State Bar */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-[11px] text-slate-500 pointer-events-none px-2">
        <span>Fingers: {isMouseDownRef.current ? 1 : gestureStatus.fingerCount}</span>
        <span className="font-mono text-cyan-400">
          {gestureStatus.isDragging ? 'DRAGGING' : gestureStatus.isScrolling ? 'SCROLLING' : 'READY'}
        </span>
      </div>
    </div>
  );
};
