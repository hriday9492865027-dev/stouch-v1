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
  MousePointer
} from 'lucide-react';
import { SmartBoardPresenter } from '@smartboard/Bluetooth-SmartBoard/controls/SmartBoardPresenter';
import { TouchpadSurface } from '../components/TouchpadSurface';
import type { GestureConfig } from '@shared/gestures/TouchpadGestureEngine';

interface SmartBoardScreenProps {
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

export const SmartBoardScreen: React.FC<SmartBoardScreenProps> = ({ onBack }) => {
  const [mode, setMode] = useState<'presenter' | 'laser'>('presenter');
  const [feedback, setFeedback] = useState<string | null>(null);

  const triggerAction = (label: string, action: () => void) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(20);
    }
    setFeedback(label);
    action();
    setTimeout(() => setFeedback(null), 400);
  };

  return (
    <div className="flex flex-col flex-1 px-4 py-6 max-w-lg mx-auto w-full select-none">
      {/* Top Nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-medium text-slate-400 hover:text-white transition p-1 -ml-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs uppercase font-bold tracking-wider text-purple-400 flex items-center space-x-1.5">
          <Presentation className="w-4 h-4" />
          <span>Smart Board Presenter</span>
        </span>
      </div>

      {/* Header Mode Switcher */}
      <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-900 p-1 rounded-2xl border border-slate-800">
        <button
          onClick={() => setMode('presenter')}
          className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
            mode === 'presenter' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Presentation className="w-4 h-4" />
          <span>Slide Remote</span>
        </button>
        <button
          onClick={() => setMode('laser')}
          className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
            mode === 'laser' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MousePointer className="w-4 h-4" />
          <span>Laser & Annotation</span>
        </button>
      </div>

      {/* Visual Feedback Badge */}
      {feedback && (
        <div className="flex justify-center mb-2">
          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold animate-pulse">
            {feedback}
          </span>
        </div>
      )}

      {mode === 'presenter' ? (
        <div className="flex-1 flex flex-col justify-between space-y-4">
          {/* Big Next / Prev Navigation */}
          <div className="grid grid-cols-2 gap-3 flex-1 min-h-[220px]">
            {/* Prev Slide */}
            <button
              onClick={() => triggerAction('Previous Slide', () => SmartBoardPresenter.prevSlide())}
              className="rounded-3xl bg-slate-900 border border-slate-800 hover:bg-slate-850 active:scale-[0.98] transition flex flex-col items-center justify-center p-4 text-slate-300"
            >
              <ChevronLeft className="w-12 h-12 text-slate-400 mb-2" />
              <span className="text-base font-bold text-white">Previous</span>
              <span className="text-xs text-slate-500">PageUp / Back</span>
            </button>

            {/* Next Slide (Primary) */}
            <button
              onClick={() => triggerAction('Next Slide', () => SmartBoardPresenter.nextSlide())}
              className="rounded-3xl bg-gradient-to-b from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 active:scale-[0.98] transition flex flex-col items-center justify-center p-4 text-white shadow-xl shadow-purple-600/20"
            >
              <ChevronRight className="w-12 h-12 text-white mb-2" />
              <span className="text-base font-bold">Next</span>
              <span className="text-xs text-purple-200">PageDown / Space</span>
            </button>
          </div>

          {/* Slideshow Control Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => triggerAction('Start Slideshow', () => SmartBoardPresenter.startSlideShow())}
              className="py-3 px-4 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200 flex items-center justify-center space-x-2 transition"
            >
              <Play className="w-4 h-4 text-emerald-400" />
              <span>Start (F5)</span>
            </button>
            <button
              onClick={() => triggerAction('Exit Slideshow', () => SmartBoardPresenter.exitSlideShow())}
              className="py-3 px-4 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200 flex items-center justify-center space-x-2 transition"
            >
              <Square className="w-4 h-4 text-rose-400" />
              <span>Exit (Esc)</span>
            </button>
          </div>

          {/* Screen Actions Bar */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => triggerAction('Blackout Screen', () => SmartBoardPresenter.toggleBlackScreen())}
              className="py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[11px] font-semibold text-slate-300 flex flex-col items-center justify-center space-y-1 transition"
            >
              <EyeOff className="w-4 h-4 text-slate-400" />
              <span>Blackout (B)</span>
            </button>
            <button
              onClick={() => triggerAction('Whiteboard Screen', () => SmartBoardPresenter.toggleWhiteScreen())}
              className="py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[11px] font-semibold text-slate-300 flex flex-col items-center justify-center space-y-1 transition"
            >
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Whiteboard (W)</span>
            </button>
            <button
              onClick={() => triggerAction('Volume Up', () => SmartBoardPresenter.volumeUp())}
              className="py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[11px] font-semibold text-slate-300 flex flex-col items-center justify-center space-y-1 transition"
            >
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>Volume</span>
            </button>
          </div>
        </div>
      ) : (
        /* Laser Pointer & Annotation Mode: Touchpad surface */
        <div className="flex-1 flex flex-col min-h-0">
          <TouchpadSurface config={PRESENTATION_GESTURE_CONFIG} hapticsEnabled={true} />
        </div>
      )}

      {/* Footer Info */}
      <footer className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center space-x-1.5">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>PowerPoint, Google Slides, SMART, Promethean</span>
        </div>
        <span className="font-mono">HID Presenter</span>
      </footer>
    </div>
  );
};
