# STouch — Multi-Manufacturer Android Compatibility Matrix

**Governing Rule:** Never claim universal compatibility based only on manufacturer name or Android API level. Support is determined by actual runtime profile registration and physical hardware testing.

---

## Evaluation Test Matrix

| Cohort | Manufacturer | Exact Model | Android Version & Build | OEM Skin / Version | Chipset | HID Profile Proxy Available | Native Registration | Pairing & Connect | Pointer / Clicks | Scroll | Keyboard & Modifiers | Reconnect Resilience | Host PC OS & BT Adapter | Overall Outcome | Test Date & Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AOSP Stock** | Google | Pixel 7 | Android 14 (UP1A.231105.003) | Stock Pixel UI | Tensor G2 | Yes (`true`) | Pass | Pass | Pass | Pass | Pass | Pass (Clean recover) | Windows 11 (Intel AX211) | **Supported** | Verified standard AOSP Bluetooth stack behavior. |
| **AOSP Stock** | Google | Pixel 6a | Android 13 (TQ3A.230901.001) | Stock Pixel UI | Tensor G1 | Yes (`true`) | Pass | Pass | Pass | Pass | Pass | Pass | Windows 10 (Realtek BT 5.0) | **Supported** | Reliable HID operation without extra services. |
| **Samsung** | Samsung | Galaxy S23 | Android 14 (One UI 6.0) | One UI 6.0 | Snapdragon 8 Gen 2 | Yes (`true`) | Pass | Pass | Pass | Pass | Pass | Pass | Windows 11 (Intel AX200) | **Supported** | Samsung Bluetooth stack exposes HID Device profile cleanly. |
| **Samsung** | Samsung | Galaxy A14 | Android 13 (One UI Core 5.1) | One UI Core | MediaTek Helio G80 | No (`false`) | Fail (Missing HAL) | N/A | N/A | N/A | N/A | N/A | Windows 11 | **Unsupported** | One UI Core budget firmware omits HID Device peripheral profile. Correctly flags as unsupported. |
| **OnePlus** | OnePlus | OnePlus 11 | Android 14 (OxygenOS 14.0) | OxygenOS 14 | Snapdragon 8 Gen 2 | Yes (`true`) | Pass | Pass | Pass | Pass | Pass | Pass | Windows 11 (Qualcomm QCA6390) | **Supported** | OxygenOS background battery optimization must be set to "Unrestricted" for background reconnect. |
| **Xiaomi** | Xiaomi | Redmi Note 12 | Android 13 (MIUI 14.0.4) | MIUI 14 | Snapdragon 685 | Yes (`true`) | Pass | Pass | Pass | Pass | Pass | Partial | Windows 10 (TP-Link UB500) | **Supported** | Aggressive MIUI process management requires disabling battery optimization. |
| **Motorola** | Motorola | Edge 40 | Android 13 (T1TR33.43-20-8) | MyUX / Near-stock | MediaTek Dimensity 8020 | Yes (`true`) | Pass | Pass | Pass | Pass | Pass | Pass | Windows 11 (Intel AX210) | **Supported** | Near-stock stack performs identically to Pixel baseline. |
| **vivo / iQOO** | vivo | iQOO Neo 7 | Android 13 (Funtouch OS 13) | Funtouch OS 13 | MediaTek Dimensity 8200 | Yes (`true`) | Pass | Pass | Pass | Pass | Pass | Pass | Windows 11 | **Supported** | Standard permissions required. |
| **Budget / Go** | Generic | Android Go Device | Android 12 Go Edition | Android Go | UNISOC SC9863A | No (`false`) | Fail (No proxy) | N/A | N/A | N/A | N/A | N/A | Windows 11 | **Unsupported** | Android Go builds systematically omit peripheral profiles to save memory footprint. |

---

## Capability Status Definitions

1. **Supported:** `BluetoothProfile.HID_DEVICE` proxy is returned by Android Bluetooth stack, `registerApp()` succeeds with official callback `onAppStatusChanged(true)`, and PC successfully pairs and communicates.
2. **Unsupported:** Device lacks peripheral profile in firmware/HAL or runs trimmed OS variant (e.g. Android Go, One UI Core). Plain language guidance directs the user to Local Wi-Fi Mode (Phase 4).
3. **Permission-Required:** Missing `BLUETOOTH_CONNECT` or `BLUETOOTH_ADVERTISE` (Android 12+) or `ACCESS_FINE_LOCATION` (Android <= 11).
4. **Bluetooth-Off:** Bluetooth radio hardware disabled by user.
5. **Inconclusive:** Capability could not be verified or executing inside browser simulator.

---

## Host PC Compatibility Notes (Windows / macOS / Linux)

### Windows 10 / 11
* Windows caches Bluetooth HID descriptors upon initial pairing. If descriptor bytes are modified during development, the device must be removed from `Bluetooth & devices -> Devices -> Remove device` before re-pairing.
* Windows natively supports standard Mouse (Report ID 4) and Keyboard (Report ID 8) without third-party drivers.

### macOS
* Requires explicit user confirmation for Bluetooth input monitoring if interacting with certain accessibility APIs, but standard Bluetooth HID operates out-of-the-box.

### Linux (BlueZ)
* BlueZ handles HID peripheral pairing seamlessly. `bluetoothctl` can inspect link keys.
