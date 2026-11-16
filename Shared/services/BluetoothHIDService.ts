import { registerPlugin, PluginListenerHandle } from '@capacitor/core';
import type { DeviceCapabilityResult, ConnectionState, PairedHost } from '../input-models/CapabilityState';
import type { MouseReport, KeyboardReport } from '../input-models/HIDReports';

export interface BluetoothHIDPluginInterface {
  getCapabilityStatus(): Promise<DeviceCapabilityResult>;
  requestPermissions(): Promise<{ granted: boolean; missingPermissions: string[] }>;
  initialize(): Promise<{ success: boolean; error?: string }>;
  register(): Promise<{ success: boolean; registered: boolean; error?: string }>;
  requestDiscoverability(options?: { durationSeconds?: number }): Promise<{ success: boolean; durationSeconds: number }>;
  getPairedHosts(): Promise<{ hosts: PairedHost[] }>;
  connect(options: { hostId: string }): Promise<{ success: boolean }>;
  disconnect(): Promise<{ success: boolean }>;
  sendMouseReport(report: MouseReport): Promise<{ success: boolean }>;
  sendMouseButtonState(options: { left?: boolean; right?: boolean; middle?: boolean }): Promise<{ success: boolean }>;
  sendLeftClick(): Promise<{ success: boolean }>;
  sendRightClick(): Promise<{ success: boolean }>;
  sendDoubleClick(): Promise<{ success: boolean }>;
  sendKeyboardReport(report: KeyboardReport): Promise<{ success: boolean }>;
  releaseAllInputs(): Promise<{ success: boolean }>;
  addListener(
    eventName: 'registrationChanged',
    listenerFunc: (result: { registered: boolean; error?: string }) => void
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'connectionStateChanged',
    listenerFunc: (state: { state: ConnectionState; hostId?: string; hostName?: string; error?: string }) => void
  ): Promise<PluginListenerHandle>;
}

// In-memory simulator state for browser preview & testing
const simulatedHosts: PairedHost[] = [];

export const BluetoothHID = registerPlugin<BluetoothHIDPluginInterface>('BluetoothHID', {
  web: () => ({
    async getCapabilityStatus(): Promise<DeviceCapabilityResult> {
      return {
        status: 'supported',
        hasBluetooth: true,
        isBluetoothEnabled: true,
        hasHidDeviceProfile: true,
        apiLevel: 34,
        manufacturer: 'Simulator / Android 14',
        model: 'Web Physical Preview',
        osVersion: 'Android 14 (API 34)',
        missingPermissions: [],
        diagnosticMessage: 'Simulator Mode: Native Bluetooth HID Profile proxy simulation active. You can test touchpad gestures, clicks, keyboard input, and pairing flows.',
      };
    },
    async requestPermissions() {
      return { granted: true, missingPermissions: [] };
    },
    async initialize() {
      return { success: true };
    },
    async register() {
      return { success: true, registered: true };
    },
    async requestDiscoverability(options?: { durationSeconds?: number }) {
      return { success: true, durationSeconds: options?.durationSeconds || 120 };
    },
    async getPairedHosts() {
      return { hosts: simulatedHosts };
    },
    async connect(options: { hostId: string }) {
      simulatedHosts.forEach(h => {
        h.isConnected = h.id === options.hostId;
      });
      return { success: true };
    },
    async disconnect() {
      simulatedHosts.forEach(h => {
        h.isConnected = false;
      });
      return { success: true };
    },
    async sendMouseReport() {
      return { success: true };
    },
    async sendMouseButtonState() {
      return { success: true };
    },
    async sendLeftClick() {
      return { success: true };
    },
    async sendRightClick() {
      return { success: true };
    },
    async sendDoubleClick() {
      return { success: true };
    },
    async sendKeyboardReport() {
      return { success: true };
    },
    async releaseAllInputs() {
      return { success: true };
    },
    async addListener() {
      return { remove: async () => {} };
    },
  }),
});
