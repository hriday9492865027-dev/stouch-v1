/**
 * STouch Touchpad Gesture Engine
 * Implements pointer acceleration curves, tap-to-click controls, natural scrolling,
 * click/drag state machine, two-finger scrolling, and sub-pixel accumulation.
 * Reference architecture: Kurza TouchpadGestureHandler + KuneLab PointerPump.
 */

export interface GestureCallbacks {
  onMove: (dx: number, dy: number) => void;
  onScroll: (vScroll: number, hScroll: number) => void;
  onLeftClick: () => void;
  onRightClick: () => void;
  onDoubleClick: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onGestureStateChange?: (state: { fingerCount: number; isDragging: boolean; isScrolling: boolean }) => void;
}

export interface GestureConfig {
  sensitivity: number;          // Pointer multiplier (0.5 to 3.0, default 1.3)
  scrollSensitivity: number;    // Scroll multiplier (0.5 to 2.0, default 0.8)
  naturalScroll: boolean;       // Natural (finger moves content) vs Traditional (finger moves scrollbar)
  tapToClickEnabled: boolean;   // Enable tap-to-click vs requiring hardware/on-screen buttons
  pointerAcceleration: boolean; // Dynamic acceleration curve for quick movements
  tapTimeoutMs: number;         // Max duration for tap detection (default 180ms)
  doubleTapTimeoutMs: number;   // Max interval between two taps (default 280ms)
  dragHoldTimeoutMs: number;    // Hold duration before drag engages (default 320ms)
  moveThresholdPx: number;      // Distance before move cancels tap (default 5px)
}

interface TouchPoint {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  startTime: number;
}

export class TouchpadGestureEngine {
  private config: GestureConfig;
  private callbacks: GestureCallbacks;

  private activeTouches: Map<number, TouchPoint> = new Map();
  private lastMoveX: number = 0;
  private lastMoveY: number = 0;

  private hasMoved: boolean = false;
  private isDragging: boolean = false;
  private isTwoFingerScroll: boolean = false;

  private lastTapTime: number = 0;
  private tapPendingTimer: any = null;
  private dragHoldTimer: any = null;

  // Sub-pixel accumulator for smooth precision
  private remainderX: number = 0;
  private remainderY: number = 0;

  constructor(callbacks: GestureCallbacks, config?: Partial<GestureConfig>) {
    this.callbacks = callbacks;
    this.config = {
      sensitivity: 1.3,
      scrollSensitivity: 0.8,
      naturalScroll: true,
      tapToClickEnabled: true,
      pointerAcceleration: true,
      tapTimeoutMs: 180,
      doubleTapTimeoutMs: 280,
      dragHoldTimeoutMs: 320,
      moveThresholdPx: 5,
      ...config,
    };
  }

  public updateConfig(newConfig: Partial<GestureConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): Readonly<GestureConfig> {
    return this.config;
  }

  public handleTouchStart(e: React.TouchEvent | TouchEvent) {
    const now = Date.now();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      this.activeTouches.set(touch.identifier, {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: now,
      });
    }

    const fingerCount = this.activeTouches.size;

    if (fingerCount === 1) {
      const first = Array.from(this.activeTouches.values())[0];
      this.lastMoveX = first.x;
      this.lastMoveY = first.y;
      this.hasMoved = false;

      // Start drag timer for click-and-drag (long press + move)
      clearTimeout(this.dragHoldTimer);
      this.dragHoldTimer = setTimeout(() => {
        if (!this.hasMoved && this.activeTouches.size === 1) {
          this.isDragging = true;
          this.callbacks.onDragStart();
          this.notifyState();
        }
      }, this.config.dragHoldTimeoutMs);

    } else if (fingerCount === 2) {
      clearTimeout(this.dragHoldTimer);
      if (this.isDragging) {
        this.isDragging = false;
        this.callbacks.onDragEnd();
      }
      this.isTwoFingerScroll = true;
      const touches = Array.from(this.activeTouches.values());
      this.lastMoveX = (touches[0].x + touches[1].x) / 2;
      this.lastMoveY = (touches[0].y + touches[1].y) / 2;
    }

    this.notifyState();
  }

  public handleTouchMove(e: React.TouchEvent | TouchEvent) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const existing = this.activeTouches.get(touch.identifier);
      if (existing) {
        existing.x = touch.clientX;
        existing.y = touch.clientY;
      }
    }

    const fingerCount = this.activeTouches.size;

    if (fingerCount === 1) {
      const touch = Array.from(this.activeTouches.values())[0];
      const rawDx = touch.x - this.lastMoveX;
      const rawDy = touch.y - this.lastMoveY;

      const totalDist = Math.hypot(touch.x - touch.startX, touch.y - touch.startY);
      if (totalDist > this.config.moveThresholdPx) {
        this.hasMoved = true;
        clearTimeout(this.tapPendingTimer);
      }

      if (this.hasMoved) {
        // Compute acceleration curve if enabled
        const rawSpeed = Math.hypot(rawDx, rawDy);
        const accelFactor = this.config.pointerAcceleration
          ? Math.min(2.2, 1.0 + (rawSpeed / 20.0))
          : 1.0;

        const scaledX = (rawDx * this.config.sensitivity * accelFactor) + this.remainderX;
        const scaledY = (rawDy * this.config.sensitivity * accelFactor) + this.remainderY;

        const intX = Math.trunc(scaledX);
        const intY = Math.trunc(scaledY);

        this.remainderX = scaledX - intX;
        this.remainderY = scaledY - intY;

        this.lastMoveX = touch.x;
        this.lastMoveY = touch.y;

        if (intX !== 0 || intY !== 0) {
          this.callbacks.onMove(intX, intY);
        }
      }

    } else if (fingerCount === 2) {
      const touches = Array.from(this.activeTouches.values());
      const centerX = (touches[0].x + touches[1].x) / 2;
      const centerY = (touches[0].y + touches[1].y) / 2;

      const deltaY = centerY - this.lastMoveY;
      const deltaX = centerX - this.lastMoveX;

      const scrollMultiplier = this.config.naturalScroll ? -1 : 1;
      const scrollV = Math.trunc(deltaY * scrollMultiplier * this.config.scrollSensitivity);
      const scrollH = Math.trunc(deltaX * this.config.scrollSensitivity);

      this.lastMoveX = centerX;
      this.lastMoveY = centerY;

      if (scrollV !== 0 || scrollH !== 0) {
        this.hasMoved = true;
        this.callbacks.onScroll(scrollV, scrollH);
      }
    }

    this.notifyState();
  }

  public handleTouchEnd(e: React.TouchEvent | TouchEvent) {
    const now = Date.now();
    clearTimeout(this.dragHoldTimer);

    const countBeforeRemoval = this.activeTouches.size;

    for (let i = 0; i < e.changedTouches.length; i++) {
      this.activeTouches.delete(e.changedTouches[i].identifier);
    }

    if (this.isDragging) {
      this.isDragging = false;
      this.callbacks.onDragEnd();
      this.notifyState();
      return;
    }

    // Tap Detection (only when tap-to-click is enabled)
    if (!this.hasMoved && this.config.tapToClickEnabled) {
      if (countBeforeRemoval === 1) {
        // Single or Double Tap
        if (now - this.lastTapTime < this.config.doubleTapTimeoutMs) {
          clearTimeout(this.tapPendingTimer);
          this.lastTapTime = 0;
          this.callbacks.onDoubleClick();
        } else {
          this.lastTapTime = now;
          this.tapPendingTimer = setTimeout(() => {
            this.callbacks.onLeftClick();
          }, this.config.tapTimeoutMs);
        }
      } else if (countBeforeRemoval === 2) {
        // Two-finger Tap = Right Click
        clearTimeout(this.tapPendingTimer);
        this.callbacks.onRightClick();
      }
    }

    if (this.activeTouches.size === 0) {
      this.hasMoved = false;
      this.isTwoFingerScroll = false;
      this.remainderX = 0;
      this.remainderY = 0;
    }

    this.notifyState();
  }

  public handleTouchCancel() {
    clearTimeout(this.dragHoldTimer);
    clearTimeout(this.tapPendingTimer);
    if (this.isDragging) {
      this.isDragging = false;
      this.callbacks.onDragEnd();
    }
    this.activeTouches.clear();
    this.hasMoved = false;
    this.isTwoFingerScroll = false;
    this.notifyState();
  }

  private notifyState() {
    this.callbacks.onGestureStateChange?.({
      fingerCount: this.activeTouches.size,
      isDragging: this.isDragging,
      isScrolling: this.isTwoFingerScroll,
    });
  }
}
