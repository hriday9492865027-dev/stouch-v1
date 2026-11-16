/**
 * STouch Wi-Fi Pairing Payload
 * Contains ephemeral, short-lived session information transferred via QR code or manual entry.
 * Governed by PRD Section 7: Never place a permanent secret in the QR code.
 */

export interface QRPairingPayload {
  version: string;
  host: string;
  port: number;
  sessionId: string;
  token: string;
  expiresAt: number;
}

export function parseQRPairingPayload(raw: string): QRPairingPayload | null {
  try {
    const data = JSON.parse(raw);
    if (!data.host || !data.port || !data.token || !data.sessionId) {
      return null;
    }
    // Check if token has expired
    if (data.expiresAt && Date.now() > data.expiresAt) {
      return null;
    }
    return {
      version: data.version || '1.0.0',
      host: String(data.host),
      port: Number(data.port),
      sessionId: String(data.sessionId),
      token: String(data.token),
      expiresAt: Number(data.expiresAt) || (Date.now() + 180000),
    };
  } catch {
    return null;
  }
}
