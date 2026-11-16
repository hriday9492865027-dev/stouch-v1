import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Bluetooth, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle, 
  RefreshCw, 
  ShieldAlert, 
  Cpu, 
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { BluetoothHID } from '@shared/services/BluetoothHIDService';
import type { DeviceCapabilityResult, CapabilityStatus } from '@shared/input-models/CapabilityState';

interface PCBluetoothScreenProps {
  onBack: () => void;
}

export const PCBluetoothScreen: React.FC<PCBluetoothScreenProps> = ({ onBack }) => {
  const [capability, setCapability] = useState<DeviceCapabilityResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [requestingPerms, setRequestingPerms] = useState<boolean>(false);

  const checkCapability = async () => {
    setLoading(true);
    try {
      const result = await BluetoothHID.getCapabilityStatus();
      setCapability(result);
    } catch (err) {
      console.error('Capability check failed:', err);
      setCapability({
        status: 'inconclusive',
        hasBluetooth: false,
        isBluetoothEnabled: false,
        hasHidDeviceProfile: false,
        apiLevel: 0,
        manufacturer: 'Unknown',
        model: 'Unknown',
        osVersion: 'Unknown',
        missingPermissions: [],
        diagnosticMessage: 'Failed to invoke native BluetoothHID capability detection bridge.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkCapability();
  }, []);

  const handleRequestPermissions = async () => {
    setRequestingPerms(true);
    try {
      await BluetoothHID.requestPermissions();
      // Re-run check after permission prompt returns
      await checkCapability();
    } catch (err) {
      console.error('Permission request failed:', err);
    } finally {
      setRequestingPerms(false);
    }
  };

  const renderStatusBadge = (status: CapabilityStatus) => {
    switch (status) {
      case 'supported':
        return (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Supported (HID Profile Ready)</span>
          </div>
        );
      case 'unsupported':
        return (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-semibold">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>Unsupported by Android Firmware</span>
          </div>
        );
      case 'permission-required':
        return (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Permissions Required</span>
          </div>
        );
      case 'bluetooth-off':
        return (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Bluetooth Turned Off</span>
          </div>
        );
      case 'checking':
        return (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-semibold">
            <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
            <span>Evaluating Device...</span>
          </div>
        );
      case 'inconclusive':
      default:
        return (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/50 text-xs font-semibold">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Inconclusive / Web Simulator</span>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col flex-1 px-4 py-6 max-w-lg mx-auto w-full">
      {/* Top Nav */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-medium text-slate-400 hover:text-white transition p-1 -ml-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
          PC Control • Bluetooth HID
        </span>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-white">Device Capability Verification</h1>
        <p className="text-xs text-slate-400 mt-1">
          Validating native Bluetooth HID Device peripheral support without OEM bias.
        </p>
      </div>

      {/* Main Status Card */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Bluetooth className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Profile Status</div>
              <div className="text-sm font-bold text-white">Bluetooth HID Peripheral</div>
            </div>
          </div>
          {capability && renderStatusBadge(capability.status)}
        </div>

        {/* Diagnostic explanation text */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 leading-relaxed mb-4">
          {capability?.diagnosticMessage || 'Running hardware detection...'}
        </div>

        {/* Hardware & OS Details Table */}
        <div className="space-y-2 pt-1 border-t border-slate-800/80 text-xs">
          <div className="flex justify-between py-1">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Device Model</span>
            </span>
            <span className="text-slate-200 font-mono">
              {capability ? `${capability.manufacturer} ${capability.model}` : '...'}
            </span>
          </div>

          <div className="flex justify-between py-1">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>Android API Level</span>
            </span>
            <span className="text-slate-200 font-mono">
              {capability ? `API ${capability.apiLevel} (${capability.osVersion})` : '...'}
            </span>
          </div>

          <div className="flex justify-between py-1">
            <span className="text-slate-400">Bluetooth Adapter Radio</span>
            <span className={`font-semibold ${capability?.isBluetoothEnabled ? 'text-emerald-400' : 'text-amber-400'}`}>
              {capability?.isBluetoothEnabled ? 'Enabled' : 'Disabled / Off'}
            </span>
          </div>

          <div className="flex justify-between py-1">
            <span className="text-slate-400">Native HID Device Profile</span>
            <span className={`font-semibold ${capability?.hasHidDeviceProfile ? 'text-emerald-400' : 'text-rose-400'}`}>
              {capability?.hasHidDeviceProfile ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>
      </div>

      {/* Action / Next steps */}
      <div className="space-y-3 mt-auto">
        {capability?.status === 'permission-required' && (
          <button
            onClick={handleRequestPermissions}
            disabled={requestingPerms}
            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition flex items-center justify-center space-x-2"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{requestingPerms ? 'Requesting Permissions...' : 'Grant Bluetooth Permissions'}</span>
          </button>
        )}

        {capability?.status === 'supported' && (
          <button
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.99] text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 transition flex items-center justify-center space-x-2"
          >
            <span>Proceed to Pair with PC (Phase 2)</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        )}

        {capability?.status === 'unsupported' && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
            <strong>Honest Hardware Limit:</strong> This phone's operating system build does not expose the Android Bluetooth HID Device profile. STouch will offer Local Wi-Fi Mode in Phase 4 for this device.
          </div>
        )}

        <button
          onClick={checkCapability}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 active:scale-[0.99] text-slate-300 font-medium text-xs border border-slate-700 transition flex items-center justify-center space-x-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Re-check Capability</span>
        </button>
      </div>
    </div>
  );
};
