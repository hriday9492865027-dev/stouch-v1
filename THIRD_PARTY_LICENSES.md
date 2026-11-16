# Third-Party Licenses and Attributions

This document records the third-party open-source repositories evaluated and referenced in STouch.

---

## 1. KuneLab Kontroller
- **Repository URL:** https://github.com/Kunelab/kontroller
- **License:** Apache License 2.0
- **Evaluation Status:** Selected as the **Primary Bluetooth HID Foundation**.
- **Inspected Components:**
  - `DescriptorCollection.kt`: USB HID report descriptor (Mouse Report ID 4, Keyboard Report ID 8, Media Report ID 10).
  - `BluetoothController.kt`: `BluetoothHidDevice` lifecycle, SDP record registration, watchdog, and callback handling.
  - `reports/ScrollableTrackpadMouseReport.kt` & `reports/KeyboardReport.kt`: Byte serialization and modifier masks.
  - `senders/RelativeMouseSender.kt`, `senders/KeyboardSender.kt`: Report transmission and synthetic click delays.
  - `PointerPump.kt`: Frame rate-limiting via Choreographer to eliminate Bluetooth buffer overrun.
- **Modifications for STouch:**
  - Integrated into STouch's custom Capacitor Kotlin plugin (`BluetoothHIDPlugin.kt`, `BluetoothHIDManager.kt`).
  - Added safe lifecycle listeners and failsafe `releaseAllInputs()`.
  - Exposed strongly-typed JavaScript methods and events to the React layer.

---

## 2. Kurza
- **Repository URL:** https://github.com/patrikflorek/Kurza
- **License:** MIT License
- **Evaluation Status:** Selected as the **Touchpad Gesture Reference**.
- **Inspected Components:**
  - `TouchpadGestureHandler.kt`: Gesture state machine, tap-detection timing, move threshold, two-finger center tracking for scrolling.
- **Modifications for STouch:**
  - Ported into pure TypeScript in `Shared/gestures/TouchpadGestureEngine.ts`.
  - UI remains pure React + TypeScript (no Jetpack Compose code imported).

---

## 3. PhonePad
- **Repository URL:** https://github.com/alisajjadfatmi/PhonePad
- **License:** MIT License
- **Evaluation Status:** Evaluated for **Lifecycle and Platform Comparison**.
- **Key Takeaways:**
  - Evaluated foreground service and Quick Settings tile patterns.
  - Identified manufacturer-specific assumptions to avoid in STouch's universal AOSP core.
