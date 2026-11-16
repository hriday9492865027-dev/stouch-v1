import { BluetoothHID } from '@shared/services/BluetoothHIDService';
import type { TVButton } from '../../WiFi-TV/protocols/TVRemoteProtocol';

/**
 * BluetoothTVRemote
 * Maps TV navigation controls to Bluetooth HID usages accepted by Android TV, Google TV,
 * and Smart TVs supporting Bluetooth peripheral keyboards/remotes.
 */
export class BluetoothTVRemote {
  private static readonly HID_MAPPINGS: Record<TVButton, number> = {
    dpad_up: 82,         // Up Arrow
    dpad_down: 81,       // Down Arrow
    dpad_left: 80,       // Left Arrow
    dpad_right: 79,      // Right Arrow
    dpad_center: 40,     // Enter (OK / Select)
    back: 41,            // Escape (Back)
    home: 74,            // Home key
    menu: 101,           // Application / Menu key
    power: 41,
    volume_up: 58,       // F1 or Consumer report
    volume_down: 59,
    mute: 60,
    channel_up: 75,      // PageUp
    channel_down: 78,    // PageDown
    media_play_pause: 44,// Space (Play/Pause)
    media_rewind: 80,
    media_fast_forward: 79,
  };

  public static sendButton(button: TVButton) {
    const usage = this.HID_MAPPINGS[button];
    if (!usage) return;

    BluetoothHID.sendKeyboardReport({
      modifiers: 0,
      keys: [usage],
    });

    setTimeout(() => {
      BluetoothHID.sendKeyboardReport({
        modifiers: 0,
        keys: [],
      });
    }, 45);
  }
}
