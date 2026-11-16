# STouch

> **Your phone. Every screen. One control platform.**

STouch is a mobile-first device-control platform that transforms a smartphone touchscreen into a mouse, keyboard, and gesture trackpad for PCs, and in later releases, interactive Smart Boards and TVs.

---

## Architecture & Phased Roadmap

- **Phase 1: Foundation (Completed)**
  - Exact modular folder structure (`PC`, `SmartBoard`, `TV`, `Shared`, `Mobile-App`, `Desktop-App`, `Documentation`).
  - React + TypeScript mobile application shell.
  - Capacitor Android packaging.
  - Kotlin `BluetoothHIDPlugin` native skeleton with unbiased multi-OEM capability detection.

- **Phase 2: Bluetooth MVP (Completed)**
  - Native HID Device profile registration via Kotlin.
  - Standard HID Mouse (Report ID 4), Keyboard (Report ID 8), and Media (Report ID 10) reports.
  - Bluetooth pairing lifecycle with PC without companion software.
  - Touchpad gesture engine and safe input release failsafe.

- **Phase 3: Bluetooth Stability & Cross-OEM Compatibility (Completed)**
  - Multi-manufacturer compatibility records and regression test matrix (`COMPATIBILITY_MATRIX.md`).
  - Advanced gestures & custom settings (pointer acceleration curves, natural/traditional scrolling, tap-to-click, haptics, screen wake-lock).
  - Background lifecycle hooks (`handleOnPause`, `handleOnDestroy`) with guaranteed input release failsafe.
  - Host PC troubleshooting guide (`HostTroubleshooting.md`) for Windows/macOS/Linux Bluetooth descriptor cache invalidation.

- **Phase 4: PC Wi-Fi Mode (Completed)**
  - Standalone desktop companion receiver (`Desktop-App/receiver/stouch_receiver.py`) with Tkinter status UI, local LAN IP display, rotating 6-digit PIN, and session revocation.
  - Authenticated local WebSocket protocol (`PC/WiFi-PC/protocol/WiFiProtocol.ts`) and client service (`WiFiClientService.ts`).
  - Mobile Wi-Fi control screen (`PCWiFiScreen.tsx`) reusing full touchpad gestures, mouse buttons, and virtual keyboard with zero public cloud exposure.

- **Phase 5: Smart Board & TV Expansion (Next Phase)**
  - Verified hardware-specific adapters.

---

## Governing Principles

1. **Cross-Manufacturer Compatibility:** Never hardcode Samsung-specific or OEM-exclusive logic. Target all Android devices supporting `BluetoothHidDevice`.
2. **Honest Capability Detection:** Bluetooth availability alone does not guarantee HID peripheral capability. Support is verified via native registration checks.
3. **Privacy-First:** Zero keystroke or credential logging.
4. **Failsafe Disconnect:** Automatic release of all held keys and mouse buttons upon disconnect.

---

## Directory Layout

```text
STouch/
├── PC/
│   ├── WiFi-PC/
│   └── Bluetooth-PC/
├── SmartBoard/
│   ├── WiFi-SmartBoard/
│   └── Bluetooth-SmartBoard/
├── TV/
│   ├── WiFi-TV/
│   └── Bluetooth-TV/
├── Shared/
│   ├── components/
│   ├── services/
│   ├── gestures/
│   ├── input-models/
│   ├── security/
│   └── utilities/
├── Mobile-App/
│   ├── src/
│   ├── android/
│   └── public/
├── Desktop-App/
├── Documentation/
└── THIRD_PARTY_LICENSES.md
```
