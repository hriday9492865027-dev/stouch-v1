/**
 * STouch Wi-Fi Protocol Specification v1.0
 * Strongly typed message schema governing local WebSocket communication between
 * the STouch mobile app and the STouch Desktop Receiver.
 */

export const PROTOCOL_VERSION = '1.0.0';

export type WiFiMessageType =
  | 'auth.handshake'
  | 'auth.response'
  | 'pointer.move'
  | 'pointer.button'
  | 'pointer.scroll'
  | 'keyboard.key'
  | 'session.heartbeat'
  | 'session.disconnect';

export interface BaseMessage {
  type: WiFiMessageType;
  timestamp: number;
}

export interface AuthHandshakeMessage extends BaseMessage {
  type: 'auth.handshake';
  token: string;
  sessionId: string;
  clientName: string;
  deviceModel: string;
  protocolVersion: string;
}

export interface AuthResponseMessage extends BaseMessage {
  type: 'auth.response';
  success: boolean;
  message: string;
  sessionExpiry?: number;
}

export interface PointerMoveMessage extends BaseMessage {
  type: 'pointer.move';
  dx: number;
  dy: number;
}

export interface PointerButtonMessage extends BaseMessage {
  type: 'pointer.button';
  button: 'left' | 'right' | 'middle';
  state: 'down' | 'up';
}

export interface PointerScrollMessage extends BaseMessage {
  type: 'pointer.scroll';
  deltaX: number;
  deltaY: number;
}

export interface KeyboardKeyMessage extends BaseMessage {
  type: 'keyboard.key';
  key: string;
  state: 'down' | 'up';
  modifiers: number; // Bitmask matching KeyboardModifierMask
}

export interface SessionHeartbeatMessage extends BaseMessage {
  type: 'session.heartbeat';
}

export interface SessionDisconnectMessage extends BaseMessage {
  type: 'session.disconnect';
  reason: string;
}

export type WiFiMessage =
  | AuthHandshakeMessage
  | AuthResponseMessage
  | PointerMoveMessage
  | PointerButtonMessage
  | PointerScrollMessage
  | KeyboardKeyMessage
  | SessionHeartbeatMessage
  | SessionDisconnectMessage;
