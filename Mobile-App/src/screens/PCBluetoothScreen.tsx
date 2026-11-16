import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Bluetooth, 
  CheckCircle2, 
  RefreshCw, 
  ShieldAlert, 
  Keyboard as KeyboardIcon,
  Sliders,
  Unplug,
  Radio,
  Laptop
} from 'lucide-react';
import { BluetoothHID } from '@shared/services/BluetoothHIDService';
import type { DeviceCapabilityResult, PairedHost, ConnectionState } from '@shared/input-models/CapabilityState';
import { TouchpadSurface } from '../components/TouchpadSurface';
import { MouseButtonsBar } from '../components/MouseButtonsBar';
import { VirtualKeyboard } from '../components/VirtualKeyboard';

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

  // Active UI Tabs when Connected
  const [showKeyboard, setShowKeyboard] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [sensitivity, setSensitivity] = useState<number>(1.3);

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

    // Listen for native connection state changes
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
      await loadHosts();
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
      <div className="flex flex-col flex-1 h-screen max-w-lg mx-auto w-full p-3 select-none">
        {/* Connected Top Bar */}
        <div className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-2">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="text-xs font-bold text-white flex items-center space-x-1">
                <span>{connectedHost.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">({connectedHost.id})</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-medium">Standard Bluetooth HID Connected</div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl border transition ${
                showSettings ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              <Sliders className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowKeyboard(!showKeyboard)}
              className={`p-2 rounded-xl border transition ${
                showKeyboard ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              <KeyboardIcon className="w-4 h-4" />
            </button>
            <button
              onClick={handleDisconnect}
              className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition"
              title="Disconnect"
            >
              <Unplug className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Settings Overlay Drawer */}
        {showSettings && (
          <div className="p-3 mb-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-slate-300">Touchpad Pointer Sensitivity</span>
              <span className="text-cyan-400 font-mono">{sensitivity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={sensitivity}
              onChange={(e) => setSensitivity(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>
        )}

        {/* Main Control Area */}
        <div className="flex flex-col flex-1 min-h-0 relative">
          {showKeyboard ? (
            <div className="flex-1 flex flex-col justify-end">
              <VirtualKeyboard onClose={() => setShowKeyboard(false)} />
            </div>
          ) : (
            <TouchpadSurface sensitivity={sensitivity} />
          )}
        </div>

        {/* On-screen Mouse Buttons Bar */}
        {!showKeyboard && <MouseButtonsBar />}
      </div>
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
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-white">PC Bluetooth Controller</h1>
        <p className="text-xs text-slate-400 mt-1">
          Operates directly as a standard Bluetooth mouse & keyboard. No PC receiver needed.
        </p>
      </div>

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
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
              1. Tap <strong>Make Discoverable</strong> above.<br />
              2. Open <strong>Bluetooth Settings</strong> on your PC.<br />
              3. Pair with <strong>STouch</strong>.
            </p>
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
