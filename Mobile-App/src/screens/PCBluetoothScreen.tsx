import React, { useEffect, useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Bluetooth, 
  CheckCircle2, 
  RefreshCw, 
  ShieldAlert, 
  Radio, 
  Laptop, 
  MousePointer 
} from 'lucide-react';
import { BluetoothHID } from '@shared/services/BluetoothHIDService';
import type { DeviceCapabilityResult, PairedHost, ConnectionState } from '@shared/input-models/CapabilityState';
import { TouchpadDeck } from '../components/TouchpadDeck';

interface PCBluetoothScreenProps {
  onBack: () => void;
}

export const PCBluetoothScreen: React.FC<PCBluetoothScreenProps> = ({ onBack }) => {
  // Capability State
  const [capability, setCapability] = useState<DeviceCapabilityResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [requestingPerms, setRequestingPerms] = useState<boolean>(false);

  // Connection & Host State
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [pairedHosts, setPairedHosts] = useState<PairedHost[]>([]);
  const [connectedHost, setConnectedHost] = useState<PairedHost | null>(null);
  const [discoverableSeconds, setDiscoverableSeconds] = useState<number>(0);

  const [keepAwake] = useState<boolean>(() => {
    return localStorage.getItem('stouch_keep_awake') === 'true';
  });

  const wakeLockRef = useRef<any>(null);

  // Screen Wake Lock Management
  useEffect(() => {
    const handleWakeLock = async () => {
      if (keepAwake && 'wakeLock' in navigator && connectionState === 'connected') {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        } catch (e) {
          console.warn('Wake Lock request rejected:', e);
        }
      } else if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
        } catch {}
        wakeLockRef.current = null;
      }
    };

    handleWakeLock();
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [keepAwake, connectionState]);

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

  const loadHosts = async () => {
    try {
      const res = await BluetoothHID.getPairedHosts();
      setPairedHosts(res.hosts);
      const active = res.hosts.find(h => h.isConnected);
      if (active) {
        setConnectedHost(active);
        setConnectionState('connected');
      }
    } catch (e) {
      console.error('Failed to load paired hosts:', e);
    }
  };

  useEffect(() => {
    checkCapability();
    loadHosts();

    const connSub = BluetoothHID.addListener('connectionStateChanged', (data) => {
      setConnectionState(data.state);
      if (data.state === 'connected' && data.hostId) {
        setConnectedHost({
          id: data.hostId,
          name: data.hostName || 'Connected PC',
          isConnected: true,
        });
      } else if (data.state === 'disconnected') {
        setConnectedHost(null);
      }
      loadHosts();
    });

    const regSub = BluetoothHID.addListener('registrationChanged', (data) => {
      setIsRegistered(data.registered);
    });

    return () => {
      connSub.then(h => h.remove());
      regSub.then(h => h.remove());
    };
  }, []);

  const handleRegisterApp = async () => {
    setLoading(true);
    try {
      await BluetoothHID.initialize();
      const res = await BluetoothHID.register();
      setIsRegistered(res.registered);
    } catch (e) {
      console.error('Registration failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeDiscoverable = async () => {
    try {
      const res = await BluetoothHID.requestDiscoverability({ durationSeconds: 120 });
      if (res.success) {
        setDiscoverableSeconds(120);
        const timer = setInterval(() => {
          setDiscoverableSeconds(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (e) {
      console.error('Discoverability error:', e);
    }
  };

  const handleConnectHost = async (hostId: string) => {
    setLoading(true);
    try {
      setConnectionState('connecting');
      await BluetoothHID.connect({ hostId });
      const host = pairedHosts.find(h => h.id === hostId) || { id: hostId, name: 'Connected PC', isConnected: true };
      setConnectedHost(host);
      setConnectionState('connected');
    } catch (e) {
      console.error('Connect failed:', e);
      setConnectionState('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    await BluetoothHID.releaseAllInputs();
    await BluetoothHID.disconnect();
    setConnectionState('disconnected');
    setConnectedHost(null);
    await loadHosts();
  };

  const handleRequestPermissions = async () => {
    setRequestingPerms(true);
    try {
      await BluetoothHID.requestPermissions();
      await checkCapability();
    } catch (err) {
      console.error('Permission request failed:', err);
    } finally {
      setRequestingPerms(false);
    }
  };

  // --- Render Connected Control Surface ---
  if (connectionState === 'connected' && connectedHost) {
    return (
      <TouchpadDeck 
        onBack={handleDisconnect} 
        connectionMode="bluetooth" 
      />
    );
  }

  // --- Render Pairing & Pre-connection Views ---
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
      <div className="mb-4">
        <h1 className="text-xl font-extrabold text-white">PC Bluetooth Controller</h1>
        <p className="text-xs text-slate-400 mt-1">
          Operates directly as a standard Bluetooth mouse & keyboard. No PC receiver needed.
        </p>
      </div>

      {/* Direct Quick Launch Touchpad Surface */}
      <button
        onClick={() => {
          setConnectedHost({
            id: 'FC:F8:AE:34:12:01',
            name: 'Work-Station-Win11 (Active)',
            isConnected: true,
          });
          setConnectionState('connected');
        }}
        className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-2.5 transition active:scale-[0.99] mb-5 border border-cyan-400/30 group"
      >
        <div className="p-1 rounded-lg bg-white/20 group-hover:scale-110 transition">
          <MousePointer className="w-4 h-4 text-white" />
        </div>
        <span>Open Touchpad Surface Directly</span>
      </button>

      {/* Main Status & Registration Card */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Bluetooth className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Native HID Profile</div>
              <div className="text-sm font-bold text-white">
                {isRegistered ? 'Registered & Active' : 'Supported by Hardware'}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ready</span>
          </div>
        </div>

        {/* Diagnostic Hardware Details */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 leading-relaxed mb-4">
          {capability?.diagnosticMessage || 'Hardware evaluation ready.'}
        </div>

        {/* Registration & Discoverability Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
          <button
            onClick={handleRegisterApp}
            disabled={loading}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center justify-center space-x-1.5 transition"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isRegistered ? 'Re-register HID' : 'Register HID App'}</span>
          </button>

          <button
            onClick={handleMakeDiscoverable}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center justify-center space-x-1.5 transition"
          >
            <Bluetooth className="w-3.5 h-3.5 text-blue-400" />
            <span>
              {discoverableSeconds > 0 ? `Pairing Mode (${discoverableSeconds}s)` : 'Make Discoverable'}
            </span>
          </button>
        </div>
      </div>

      {/* Paired Hosts List */}
      <div className="flex-1 flex flex-col mb-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Paired PC Hosts
          </h2>
          <button
            onClick={loadHosts}
            className="text-xs text-cyan-400 hover:underline flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>

        {pairedHosts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 rounded-2xl border border-dashed border-slate-800 text-center">
            <Laptop className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-xs font-semibold text-slate-300">No paired PC found yet</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed">
              1. Tap <strong>Make Discoverable</strong> above.<br />
              2. Open <strong>Bluetooth Settings</strong> on your PC.<br />
              3. Pair with <strong>STouch</strong>.<br />
            </p>
            <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 max-w-xs text-left leading-relaxed">
              💡 <strong>Note on Web vs Phone:</strong> Web browsers cannot broadcast hardware Bluetooth HID profiles. For live PC control from this browser, use <strong>Local Wi-Fi Mode</strong>. For direct Bluetooth without PC software, install the Android APK on your phone.
            </div>
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto max-h-56">
            {pairedHosts.map((host) => (
              <div
                key={host.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{host.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{host.id}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleConnectHost(host.id)}
                  disabled={loading}
                  className="py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition"
                >
                  Connect
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Permission Warning / Prompt if needed */}
      {capability?.status === 'permission-required' && (
        <button
          onClick={handleRequestPermissions}
          disabled={requestingPerms}
          className="w-full py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow-lg shadow-amber-500/25 transition flex items-center justify-center space-x-2 mb-3"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{requestingPerms ? 'Requesting Permissions...' : 'Grant Bluetooth Permissions'}</span>
        </button>
      )}
    </div>
  );
};
