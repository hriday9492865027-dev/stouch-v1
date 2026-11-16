import type { 
  WiFiMessage, 
  AuthResponseMessage, 
  PointerMoveMessage, 
  PointerButtonMessage, 
  PointerScrollMessage, 
  KeyboardKeyMessage 
} from '../protocol/WiFiProtocol';
import { PROTOCOL_VERSION } from '../protocol/WiFiProtocol';
import type { QRPairingPayload } from '../pairing/QRPairingPayload';

export type WiFiConnectionStatus = 
  | 'idle' 
  | 'connecting' 
  | 'authenticating' 
  | 'connected' 
  | 'disconnected' 
  | 'error';

export interface WiFiClientCallbacks {
  onStatusChange: (status: WiFiConnectionStatus, error?: string) => void;
  onServerMessage?: (msg: string) => void;
}

export class WiFiClientService {
  private ws: WebSocket | null = null;
  private status: WiFiConnectionStatus = 'idle';
  private callbacks: WiFiClientCallbacks;
  private heartbeatInterval: any = null;
  private activePayload: QRPairingPayload | null = null;

  constructor(callbacks: WiFiClientCallbacks) {
    this.callbacks = callbacks;
  }

  public getStatus(): WiFiConnectionStatus {
    return this.status;
  }

  public getActivePayload(): QRPairingPayload | null {
    return this.activePayload;
  }

  public connect(payload: QRPairingPayload) {
    if (this.ws) {
      this.disconnect('Starting new connection');
    }

    this.activePayload = payload;
    this.setStatus('connecting');

    const wsUrl = `ws://${payload.host}:${payload.port}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.setStatus('authenticating');
        this.sendHandshake(payload);
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleMessage(msg);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      this.ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        this.setStatus('error', 'Connection to desktop receiver failed. Check IP & port.');
      };

      this.ws.onclose = (event) => {
        this.stopHeartbeat();
        this.setStatus('disconnected', event.reason || 'Connection closed');
        this.ws = null;
      };
    } catch (e: any) {
      this.setStatus('error', e.message || 'Unable to connect to receiver');
    }
  }

  public disconnect(reason = 'User disconnected') {
    this.stopHeartbeat();
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      try {
        this.send({
          type: 'session.disconnect',
          timestamp: Date.now(),
          reason,
        });
        this.ws.close();
      } catch {}
    }
    this.ws = null;
    this.setStatus('disconnected', reason);
  }

  // --- Input Command Senders ---

  public sendMouseMove(dx: number, dy: number) {
    const msg: PointerMoveMessage = {
      type: 'pointer.move',
      timestamp: Date.now(),
      dx,
      dy,
    };
    this.send(msg);
  }

  public sendMouseButton(button: 'left' | 'right' | 'middle', state: 'down' | 'up') {
    const msg: PointerButtonMessage = {
      type: 'pointer.button',
      timestamp: Date.now(),
      button,
      state,
    };
    this.send(msg);
  }

  public sendMouseScroll(deltaX: number, deltaY: number) {
    const msg: PointerScrollMessage = {
      type: 'pointer.scroll',
      timestamp: Date.now(),
      deltaX,
      deltaY,
    };
    this.send(msg);
  }

  public sendKey(key: string, state: 'down' | 'up', modifiers = 0) {
    const msg: KeyboardKeyMessage = {
      type: 'keyboard.key',
      timestamp: Date.now(),
      key,
      state,
      modifiers,
    };
    this.send(msg);
  }

  private sendHandshake(payload: QRPairingPayload) {
    this.send({
      type: 'auth.handshake',
      timestamp: Date.now(),
      token: payload.token,
      sessionId: payload.sessionId,
      clientName: 'STouch Mobile Client',
      deviceModel: navigator.userAgent.includes('Android') ? 'Android Device' : 'Web/Simulator',
      protocolVersion: PROTOCOL_VERSION,
    });
  }

  private handleMessage(msg: WiFiMessage) {
    if (msg.type === 'auth.response') {
      const auth = msg as AuthResponseMessage;
      if (auth.success) {
        this.setStatus('connected');
      } else {
        this.setStatus('error', auth.message || 'Authentication rejected by receiver');
        this.disconnect('Authentication failed');
      }
    }
  }

  private send(msg: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      this.send({
        type: 'session.heartbeat',
        timestamp: Date.now(),
      });
    }, 5000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private setStatus(status: WiFiConnectionStatus, error?: string) {
    this.status = status;
    this.callbacks.onStatusChange(status, error);
  }
}
