/**
 * STouch HID Report Models
 * Standard USB HID specifications for Mouse & Keyboard reports
 */

export interface MouseReport {
  buttons: number; // Bitmask: bit 0 = Left, bit 1 = Right, bit 2 = Middle
  dx: number;      // -127 to 127
  dy: number;      // -127 to 127
  wheel?: number;  // Vertical scroll (-127 to 127)
  hWheel?: number; // Horizontal scroll (-127 to 127)
}

export interface KeyboardReport {
  modifiers: number; // Bitmask: Ctrl, Shift, Alt, GUI
  keys: number[];    // Up to 6 keycodes pressed simultaneously
}

export enum MouseButtonMask {
  NONE = 0,
  LEFT = 1 << 0,
  RIGHT = 1 << 1,
  MIDDLE = 1 << 2,
}

export enum KeyboardModifierMask {
  NONE = 0,
  LEFT_CTRL = 1 << 0,
  LEFT_SHIFT = 1 << 1,
  LEFT_ALT = 1 << 2,
  LEFT_GUI = 1 << 3,
  RIGHT_CTRL = 1 << 4,
  RIGHT_SHIFT = 1 << 5,
  RIGHT_ALT = 1 << 6,
  RIGHT_GUI = 1 << 7,
}
