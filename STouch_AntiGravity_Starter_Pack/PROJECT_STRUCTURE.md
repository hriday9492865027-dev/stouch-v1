# STouch Project Structure

```text
STouch/
├── PC/
│   ├── WiFi-PC/
│   │   ├── pairing/
│   │   ├── connection/
│   │   ├── protocol/
│   │   └── receiver-integration/
│   └── Bluetooth-PC/
│       ├── hid/
│       ├── bluetooth-manager/
│       ├── reports/
│       └── compatibility/
├── SmartBoard/
│   ├── WiFi-SmartBoard/
│   │   ├── discovery/
│   │   ├── protocols/
│   │   └── controls/
│   └── Bluetooth-SmartBoard/
│       ├── pairing/
│       ├── bluetooth-manager/
│       └── controls/
├── TV/
│   ├── WiFi-TV/
│   │   ├── discovery/
│   │   ├── protocols/
│   │   └── remote-controls/
│   └── Bluetooth-TV/
│       ├── pairing/
│       ├── bluetooth-manager/
│       └── remote-controls/
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
│   ├── receiver/
│   ├── installer/
│   └── configuration/
├── Documentation/
│   ├── PRD/
│   ├── Architecture/
│   ├── API/
│   └── Third-Party-Licences/
└── README.md
```

## Module boundaries
- `PC/Bluetooth-PC`: Android-to-PC Bluetooth HID protocol and compatibility-specific native logic.
- `PC/WiFi-PC`: later local network pairing and receiver integration.
- `SmartBoard/*`: future board-specific adapters.
- `TV/*`: future TV-specific adapters.
- `Shared`: reusable UI components, gesture engine, input models, common services and utilities.
- `Mobile-App`: React + TypeScript app and Capacitor Android project.
- `Desktop-App`: future PC receiver and installer.
- `Documentation`: PRD, architecture, API and licence records.

## Avoid duplication
Do not copy the touchpad UI, keyboard UI or gesture engine into each connection folder. Keep reusable UI and gesture logic in shared modules. Device folders should contain only protocol-specific adapters and integration code.
