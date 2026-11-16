# AntiGravity Build Instructions — STouch

## Source of truth
Read `STouch_PRD.md` before implementing features. If this file conflicts with a casual prompt, ask the project owner which requirement to change.

## Non-negotiable rules
1. Product name is **STouch**.
2. Cross-manufacturer Android compatibility is a core requirement. Never hard-code Samsung-only assumptions.
3. Bluetooth HID Device support must be detected at runtime and verified through native registration.
4. Do not implement HID using browser JavaScript, Web Bluetooth or a normal PWA.
5. Mobile UI: React + TypeScript. Android packaging: Capacitor. Native HID: Kotlin.
6. Preserve the requested `PC`, `SmartBoard`, `TV` category structure and each Wi-Fi/Bluetooth subfolder.
7. Build PC Bluetooth first. Wi-Fi receiver, Smart Board and TV are later phases.
8. Bluetooth HID mode must not depend on a PC receiver.
9. Wi-Fi mode must use authenticated local pairing and a secure receiver.
10. Never claim compatibility based only on compilation, emulator tests, brand or Android API level.

## Repository reuse
- KuneLab Kontroller: primary Bluetooth HID candidate; build and test unchanged first.
- PhonePad: compare lifecycle/background behaviour and platform-specific assumptions.
- Kurza: study gesture logic; do not copy its Compose UI into the React app.
- Clone each repository separately. Choose one primary HID implementation after testing. Do not merge overlapping projects wholesale.
- Inspect current licences and dependency notices before copying code. Preserve notices and update `THIRD_PARTY_LICENSES.md`.

## Required development sequence
1. Create repository structure and React/Capacitor shell.
2. Implement native capability-detection interface and status UI.
3. Test HID capability on real Android devices from multiple manufacturers.
4. Build and test the selected HID implementation.
5. Implement registration, pairing and native connection lifecycle.
6. Implement mouse reports and touchpad.
7. Implement keyboard and modifier handling.
8. Add safe disconnect/release-all-inputs and lifecycle handling.
9. Expand compatibility testing.
10. Only after Bluetooth MVP passes, begin PC Wi-Fi receiver.
11. Add Smart Board/TV adapters only for named, tested device families.

## Every task completion report must include
- Files created/changed.
- Commands run.
- Build result.
- Physical devices and host OS tested.
- Test cases passed/failed.
- Known limitations and assumptions.
- Next smallest testable task.

## First task prompt
Create only the STouch repository skeleton, React + TypeScript app, Capacitor Android project and Kotlin Bluetooth HID plugin skeleton. Add runtime capability states: supported, unsupported, permission-required and inconclusive. Do not implement Wi-Fi, Smart Board or TV functionality. Do not copy third-party code yet. Report the exact tree and setup commands.
