/**
 * STouch Smart Board Protocol Specification
 * Presentation and annotation commands for interactive displays.
 */

export type SmartBoardAction =
  | 'slide.next'
  | 'slide.prev'
  | 'slide.start'
  | 'slide.exit'
  | 'screen.blackout'
  | 'screen.whiteboard'
  | 'laser.pointer'
  | 'media.play_pause'
  | 'media.volume_up'
  | 'media.volume_down';

export interface SmartBoardMessage {
  type: 'smartboard.command';
  action: SmartBoardAction;
  timestamp: number;
  payload?: any;
}
