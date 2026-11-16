import { BluetoothHID } from '@shared/services/BluetoothHIDService';
import { KeyboardModifierMask } from '@shared/input-models/HIDReports';

/**
 * SmartBoardPresenter
 * Translates presentation actions to standard USB HID presentation clicker keystrokes.
 * Fully compatible with PowerPoint, Google Slides, Keynote, and interactive whiteboard suites.
 */
export class SmartBoardPresenter {
  private static sendKey(usage: number, modifiers = 0) {
    BluetoothHID.sendKeyboardReport({
      modifiers,
      keys: [usage],
    });
    setTimeout(() => {
      BluetoothHID.sendKeyboardReport({
        modifiers: 0,
        keys: [],
      });
    }, 45);
  }

  // Next Slide: PageDown (78)
  public static nextSlide() {
    this.sendKey(78);
  }

  // Previous Slide: PageUp (75)
  public static prevSlide() {
    this.sendKey(75);
  }

  // Start Slideshow: F5 (58)
  public static startSlideShow() {
    this.sendKey(58);
  }

  // Start from Current Slide: Shift + F5 (58)
  public static startFromCurrent() {
    this.sendKey(58, KeyboardModifierMask.LEFT_SHIFT);
  }

  // Exit Slideshow: Escape (41)
  public static exitSlideShow() {
    this.sendKey(41);
  }

  // Black Screen toggle: B key (5)
  public static toggleBlackScreen() {
    this.sendKey(5);
  }

  // White Screen toggle: W key (26)
  public static toggleWhiteScreen() {
    this.sendKey(26);
  }

  // Volume Up: Send mouse/keyboard consumer report
  public static volumeUp() {
    // Media report or Ctrl+Up
    this.sendKey(82, KeyboardModifierMask.LEFT_CTRL);
  }

  // Volume Down
  public static volumeDown() {
    this.sendKey(81, KeyboardModifierMask.LEFT_CTRL);
  }
}
