/**
 * STouch Runtime Capability States
 * Governed by STouch PRD Section 5.4
 */
export type CapabilityStatus = 
  | 'checking'
  | 'supported'
  | 'unsupported'
  | 'permission-required'
  | 'bluetooth-off'
  | 'inconclusive';

export interface DeviceCapabilityResult {
  status: CapabilityStatus;
  hasBluetooth: boolean;
  isBluetoothEnabled: boolean;
  hasHidDeviceProfile: boolean;
  apiLevel: number;
  manufacturer: string;
  model: string;
  osVersion: string;
  missingPermissions: string[];
  diagnosticMessage: string;
}

export type ConnectionState =
  | 'disconnected'
  | 'registering-hid'
  | 'ready-to-pair'
  | 'pairing'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

export interface PairedHost {
  id: string; // MAC address or UUID
  name: string;
  isConnected: boolean;
  lastConnected?: number;
}
