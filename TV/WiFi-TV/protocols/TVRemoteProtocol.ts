/**
 * STouch TV Remote Protocol Specification
 * Directional navigation, media, audio, and power controls for smart TVs.
 */

export type TVButton =
  | 'power'
  | 'home'
  | 'back'
  | 'menu'
  | 'dpad_up'
  | 'dpad_down'
  | 'dpad_left'
  | 'dpad_right'
  | 'dpad_center'
  | 'volume_up'
  | 'volume_down'
  | 'mute'
  | 'channel_up'
  | 'channel_down'
  | 'media_play_pause'
  | 'media_rewind'
  | 'media_fast_forward';

export interface TVRemoteCommand {
  type: 'tv.command';
  button: TVButton;
  state: 'press' | 'release' | 'click';
  timestamp: number;
}
