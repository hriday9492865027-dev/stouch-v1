import { registerPlugin, PluginListenerHandle } from '@capacitor/core';
import type { DeviceCapabilityResult, ConnectionState, PairedHost } from '../input-models/CapabilityState';
import type { MouseReport, KeyboardReport } from '../input-models/HIDReports';

export interface BluetoothHIDPluginInterface {
  getCapabilityStatus(): Promise<DeviceCapabilityResult>;
  requestPermissions(): Promise<{ granted: boolean; missingPermissions: string[] }>;
  initialize(): Promise<{ success: boolean; error?: string }>;
  register(): Promise<{ success: boolean; state: ConnectionState; error?: string }>;
  requestDiscoverability(): Promise<{ success: boolean; durationSeconds: number }>;
  getPairedHosts(): Promise<{ hosts: PairedHost[] }>;
  connect(options: { hostId: string }): Promise<{ success: boolean }>;
  disconnect(): Promise<{ success: boolean }>;
  sendMouseReport(report: MouseReport): Promise<{ success: boolean }>;
  sendKeyboardReport(report: KeyboardReport): Promise<{ success: boolean }>;
  releaseAllInputs(): Promise<{ success: boolean }>;
  addListener(
    eventName: 'capabilityChanged',
    listenerFunc: (result: DeviceCapabilityResult) => void
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'connectionStateChanged',
    listenerFunc: (state: { state: ConnectionState; hostId?: string; error?: string }) => void
  ): Promise<PluginListenerHandle>;
}

// Register the custom Capacitor native plugin
export const BluetoothHID = registerPlugin<BluetoothHIDPluginInterface>('BluetoothHID', {
  web: () => ({
    async getCapabilityStatus(): Promise<DeviceCapabilityResult> {
      // Honest web-fallback diagnostic
      return {
        status: 'inconclusive',
        hasBluetooth: typeof navigator !== 'undefined' && 'bluetooth' in navigator,
        isBluetoothEnabled: false,
        hasHidDeviceProfile: false,
        apiLevel: 0,
        manufacturer: 'Web Browser / Simulator',
        model: 'Web Preview',
        osVersion: navigator.userAgent,
        missingPermissions: [],
        diagnosticMessage: 'Running in browser/preview mode. Native Android Bluetooth HID Peripheral profile requires a physical Android device build with Capacitor.',
      };
    },
    async requestPermissions() {
      return { granted: false, missingPermissions: ['android.permission.BLUETOOTH_CONNECT'] };
    },
    async initialize() {
      return { success: false, error: 'Not supported on Web' };
    },
    async register() {
      return { success: false, state: 'disconnected', error: 'Web Bluetooth cannot act as HID peripheral' };
    },
    async requestDiscoverability() {
      return { success: false, durationSeconds: 0 };
    },
    async getPairedHosts() {
      return { hosts: [] };
    },
    async connect() {
      return { success: false };
    },
    async disconnect() {
      return { success: true };
    },
    async sendMouseReport() {
      return { success: false };
    },
    async sendKeyboardReport() {
      return { success: false };
    },
    async releaseAllInputs() {
      return { success: true };
    },
    async addListener() {
      return { remove: async () => {} };
    },
  }),
});
