# STouch

> **Your phone. Every screen. One control platform.**

STouch is a mobile-first device-control platform that transforms a smartphone touchscreen into a mouse, keyboard, and gesture trackpad for PCs, and in later releases, interactive Smart Boards and TVs.

---

## Architecture & Phased Roadmap

- **Phase 1: Foundation (Current)**
  - Exact modular folder structure (`PC`, `SmartBoard`, `TV`, `Shared`, `Mobile-App`, `Desktop-App`, `Documentation`).
  - React + TypeScript mobile application shell.
  - Capacitor Android packaging.
  - Kotlin `BluetoothHIDPlugin` native skeleton with unbiased multi-OEM capability detection (`supported`, `unsupported`, `permission-required`, `bluetooth-off`, `inconclusive`).
  - Runtime diagnostic and verification UI under `PCs → Bluetooth`.

- **Phase 2: Bluetooth MVP**
  - Native HID Device profile registration via Kotlin.
  - Standard HID Mouse and Keyboard reports.
  - Bluetooth pairing lifecycle with PC without companion software.
  - Touchpad gesture engine and safe input release failsafe.

- **Phase 3: Bluetooth Stability & Cross-OEM Compatibility**
  - Validation across multiple Android device cohorts (Google Pixel, Samsung, OnePlus, Xiaomi, Motorola, etc.).
  - Advanced gestures and sensitivity settings.
  - Background lifecycle & reconnect management.

- **Phase 4: PC Wi-Fi Mode**
  - Lightweight desktop receiver (`Desktop-App/`).
  - Authenticated local WebSocket and ephemeral QR pairing.

- **Phase 5: Smart Board & TV Expansion**
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
