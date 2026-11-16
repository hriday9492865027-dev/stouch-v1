export type GestureType =
  | 'one-finger-move'
  | 'single-tap'
  | 'double-tap'
  | 'two-finger-scroll'
  | 'two-finger-tap'
  | 'long-press-drag'
  | 'pinch-zoom'
  | 'three-finger-swipe';

export interface TouchPosition {
  x: number;
  y: number;
  timestamp: number;
}

export interface TouchEventState {
  pointers: Map<number, TouchPosition>;
  startTime: number;
  primaryStart: TouchPosition | null;
  lastPrimary: TouchPosition | null;
  isDragging: boolean;
  twoFingerStartDistance: number | null;
}
