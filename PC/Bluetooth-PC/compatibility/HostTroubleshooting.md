# Host PC Bluetooth Troubleshooting Guide

When pairing STouch as a Bluetooth HID peripheral to a host PC, host-side Bluetooth stacks can exhibit caching or bonding quirks.

## 1. Windows 10 / 11 Caching & Stale Link Keys

### Problem
* Windows pairs with STouch, but cursor doesn't move or keyboard events don't register.
* Phone shows "Connected", but Windows shows "Paired" rather than "Connected".

### Root Cause
Windows aggressively caches the Bluetooth HID descriptor and link keys in the registry under `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\BTHPORT\Parameters\Devices`. If a descriptor changes or if the phone was unpaired on mobile without unpairing on Windows, Windows ignores incoming report packets.

### Resolution Steps
1. On the PC, open **Settings → Bluetooth & devices → Devices**.
2. Locate **STouch** in the device list.
3. Click the three dots `...` and select **Remove device**.
4. Toggle PC Bluetooth Off and back On.
5. In STouch on the phone, tap **Make Discoverable**.
6. On PC, click **Add device → Bluetooth** and select **STouch**.
7. Confirm pairing code on both screens.

---

## 2. macOS Bluetooth Cache Invalidation

### Problem
macOS displays connection drops or latency when reconnecting.

### Resolution Steps
1. Open **System Settings → Bluetooth**.
2. Hover over **STouch** and click the `(i)` button or `X` to forget the device.
3. If necessary, reset the macOS Bluetooth module by running in Terminal:
   ```bash
   sudo pkill bluetoothd
   ```
4. Re-pair STouch freshly.

---

## 3. Emergency Input Release Failsafe
If the phone is disconnected abruptly while holding down a mouse button or `Ctrl`/`Alt` modifier:
* STouch automatically broadcasts a null report packet via native Android `BluetoothHidDevice` callback `releaseAllInputs()`.
* If a host OS ever retains a stuck key state due to radio loss, tapping the physical `Ctrl`, `Alt`, or `Shift` key on the host keyboard immediately clears the host's modifier bitmask.
