# STouch — Product Requirements Document (PRD)

**Version:** 2.1  
**Status:** Product and implementation baseline  
**Product tagline:** Your phone. Every screen. One control platform.

## 1. Product summary

STouch is a mobile-first device-control platform. It turns a compatible smartphone into a touch-based controller for PCs and, in later releases, compatible Smart Boards and TVs.

The phone is the input surface. The target device receives standard input or commands through an appropriate connection method.

### Product vision
Provide one consistent phone interface for controlling different screen-based devices, with Bluetooth and Wi-Fi connection choices where the target device and platform support them.

### Core value
- Use a phone touchscreen as a touchpad instead of carrying a separate mouse.
- Provide mouse, keyboard, navigation and presentation controls in one app.
- Offer direct Bluetooth HID control for compatible phones and PCs without a PC companion app.
- Offer a separate secure local Wi-Fi mode using a desktop receiver where required.
- Keep Smart Board and TV integrations modular.

### Governing principles
1. **Cross-manufacturer compatibility:** target every Android phone that genuinely supports Bluetooth HID Device mode; do not hard-code Samsung-only behaviour.
2. **Capability detection:** detect support at runtime and verify it through native registration and real pairing tests.
3. **Honest compatibility:** Bluetooth availability alone does not mean HID Device support.
4. **Modular architecture:** protocol-specific code belongs in isolated modules/adapters.
5. **Privacy-first:** do not collect or upload typed text.
6. **Incremental delivery:** prove PC Bluetooth HID on real devices before expanding.

## 2. Product name and target platforms

The product name is **STouch**. Do not rename it to “AS Touch”.

| Platform | Requirement |
|---|---|
| Android phones | Primary mobile platform. Target all manufacturers/models that expose a working Bluetooth HID Device profile and meet app requirements. |
| Windows PCs | First host platform for Bluetooth HID validation and later Wi-Fi receiver. |
| macOS/Linux PCs | Target standard Bluetooth HID where host OS and adapter support it; validate separately. |
| Smart Boards | Future category; each board family requires a verified adapter. |
| TVs | Future category; each TV platform/vendor requires a verified control protocol. |

## 3. Release priorities

### P0 — Bluetooth MVP
- React + TypeScript mobile app shell.
- Capacitor Android packaging.
- Kotlin native Bluetooth HID plugin.
- Cross-manufacturer HID capability detection.
- HID registration, pairing and connection state.
- Touchpad, mouse buttons, scrolling and basic keyboard.
- Unsupported-device and permission handling.
- Real-device compatibility test matrix.

### P1 — Bluetooth stability
- Advanced gestures and settings.
- Background/lifecycle behaviour.
- Reconnection and safe release of held keys/buttons.
- Accessibility, diagnostics and broader compatibility tests.

### P2 — PC Wi-Fi
- Desktop receiver.
- QR pairing and authenticated local WebSocket.
- Windows packaging and device-aware download behaviour.

### P3 — Expansion
- Smart Board and TV adapters, one tested model family at a time.

### Out of scope for first release
- Claiming every Android phone is compatible.
- Universal support for every PC, Smart Board or TV.
- Smart Board/TV integrations before PC Bluetooth is stable.
- Requiring a PC receiver for Bluetooth HID mode.
- Public-internet remote control or cloud relay.
- Windows EXE download inside the Android app.

## 4. Navigation and core user journeys

Home screen categories:
- PCs
- Smart Boards
- TVs

Each category may expose Wi-Fi and Bluetooth choices. Unimplemented features must be clearly marked as coming later rather than presented as functional.

### PC Bluetooth journey
1. Open STouch.
2. Select **PCs → Bluetooth**.
3. Check phone capability and permissions.
4. Register the Bluetooth HID Device application.
5. Make the phone discoverable/ready to pair, following Android platform rules.
6. Pair from the target PC's Bluetooth settings.
7. Confirm connection using the native callback.
8. Open touchpad and keyboard controls.

### PC Wi-Fi journey (later)
1. Select **PCs → Wi-Fi**.
2. Show PC receiver installation guidance.
3. Start STouch Receiver on the PC.
4. PC displays a temporary QR pairing code.
5. Phone scans and authenticates.
6. Establish a secure local WebSocket connection.
7. Open touchpad and keyboard controls.

### Connection states
Show clear states: Checking support, Supported, Unsupported, Bluetooth off, Permission required, Registering HID, Ready to pair, Pairing, Connecting, Connected, Reconnecting, Disconnected and Error.

Only show **Connected** after the native HID connection callback confirms it.

## 5. Universal Android Bluetooth compatibility — mandatory

### 5.1 Requirement
STouch must be designed for all Android phones that can operate as a Bluetooth HID peripheral. It must not assume Samsung, One UI, a specific chipset or a manufacturer extension.

### 5.2 Technical reality
A phone having Bluetooth does not mean it can act as a Bluetooth mouse. STouch requires the Android build to expose and support the Bluetooth HID Device (peripheral) profile, including HID application registration and HID report transmission.

The Android `BluetoothHidDevice` API is available from API level 28, but API level alone does not prove the feature is enabled or correctly implemented by the device manufacturer. Support depends on Android version, Bluetooth stack, chipset, OEM firmware and device policy.

### 5.3 Capability detection
- Check Android API level and required Bluetooth feature availability.
- Check whether the HID Device profile/API can be obtained.
- Attempt native HID registration and wait for the official callback/result.
- Record registration success or precise failure reason.
- Check Bluetooth enabled state and request only required runtime permissions.
- Do not use a single system property or manufacturer name as the final decision.
- Where possible, verify advertising/discovery, pairing and actual input reports.
- Keep **Supported** separate from **Paired** and **Connected**.

### 5.4 Capability states

| State | Meaning |
|---|---|
| Supported | Native profile is exposed and registration succeeds; proceed to pairing. |
| Unsupported | Required HID capability is absent or definitively unavailable. Explain and offer Wi-Fi when available. |
| Permission required | Ask for the relevant Android permission with an explanation. |
| Bluetooth off | Ask the user to enable Bluetooth. |
| Unknown/inconclusive | Capability could not yet be verified; do not claim support. |
| Host incompatibility | Phone supports HID, but target PC cannot pair/connect. Show host troubleshooting. |

### 5.5 Manufacturer coverage
Test phones from multiple manufacturers, for example Samsung, Google Pixel, OnePlus, Xiaomi/Redmi, OPPO, realme, vivo, Motorola and others. These are test cohorts, **not guaranteed compatible brands**. Never mark an entire brand compatible after testing one model.

Maintain records with:
- Manufacturer and exact model.
- Android version, build number, security patch and OEM skin/version.
- Chipset, if known.
- HID API availability and registration result.
- Discoverability, pairing and connection results.
- Mouse and keyboard test results.
- Host OS and Bluetooth adapter.
- Test date and notes.

### 5.6 Fallback
If Bluetooth HID is unavailable, explain that the phone's Android system does not expose the required peripheral capability. Do not silently switch to BLE or another protocol and call it HID. Offer PC Wi-Fi mode once implemented. Do not promise that a hidden setting or another app will enable HID on unsupported firmware.

## 6. PC Bluetooth HID requirements

### 6.1 Core behaviour
The Android phone acts as a standard Bluetooth HID peripheral, presenting mouse and keyboard functionality to a compatible PC. No Wi-Fi, cloud account, USB dongle or STouch desktop receiver is required in this mode.

### 6.2 Technology
- Native Android `BluetoothHidDevice` API through Kotlin.
- Custom Capacitor plugin for native methods/events.
- Valid HID report descriptor and mouse/keyboard reports.
- Shared TypeScript gesture engine mapping touch gestures to neutral input actions.
- Native Kotlin report layer sending HID reports.

A normal website/PWA or browser-only JavaScript cannot register the phone as a Bluetooth HID Device. Do not implement this using Web Bluetooth.

### 6.3 Pairing flow
- Check capability and permissions.
- Register HID app and wait for successful callback.
- Give clear instructions to open PC Bluetooth settings and pair the phone.
- Handle discoverability and pairing confirmation using Android platform rules.
- Display paired host details where available.
- Connect only after native callback confirmation.
- Support disconnect and safe reconnect.

### 6.4 Touchpad gestures

| Gesture | Expected result |
|---|---|
| One-finger movement | Move pointer |
| Single tap | Left click |
| Double tap | Double click |
| Two-finger movement | Vertical/horizontal scroll where supported |
| Two-finger tap | Right click; configurable |
| Long press + move | Click-and-drag |
| On-screen mouse buttons | Left, right and optional middle; support hold |
| Pinch | Optional zoom shortcut mapping; not native PC multitouch |
| Three-finger swipe | Optional configurable keyboard shortcut |
| Three-/four-finger tap | Optional advanced action after core gestures are stable |

### 6.5 Keyboard
- Virtual keyboard for letters, numbers and symbols.
- Ctrl, Alt, Shift and Windows key where supported.
- Escape, Tab, Enter, arrows, Home, End, Page Up/Down and Delete.
- F1–F12.
- Common shortcuts: copy, paste, cut, undo, redo, select all, app switch and close window.
- Correct key-down/key-up handling.
- Release all held keys after disconnect or app failure.

### 6.6 Settings
- Pointer speed/sensitivity.
- Scroll speed and natural/inverted scrolling.
- Tap-to-click and haptic feedback toggles.
- Left-handed mode.
- Optional keep-screen-awake behaviour.
- Gesture customisation after default gestures are reliable.

### 6.7 Host compatibility
Generic Bluetooth HID is intended for interoperability, but host OS behaviour, Bluetooth adapters, pairing policy and HID descriptor support can differ. Test Windows first, then macOS and Linux. Do not claim all PCs are supported merely because they have Bluetooth.

## 7. PC Wi-Fi mode — later phase

### Workflow
- Phone instructs user to install STouch Receiver on the PC.
- Receiver starts a local pairing session and displays a QR code.
- QR contains local address, port, short-lived random token, session ID and protocol version; never place a permanent secret in the QR.
- Phone scans and authenticates.
- Phone and PC establish local WebSocket connection.
- Receiver validates commands and applies OS input events.

### Receiver requirements
- Minimal desktop UI with start/stop, QR, connection status and paired-device revocation.
- Explicit PC approval for a new phone.
- Clean exit and no hidden persistence.
- Windows installer/EXE only after packaging and security validation.
- Never expose an unauthenticated remote-input server.

### Suggested protocol messages
```text
pointer.move        { dx, dy }
pointer.button      { button, state: "down" | "up" }
pointer.scroll      { deltaX, deltaY }
keyboard.key        { key, state: "down" | "up", modifiers }
session.heartbeat   { timestamp }
session.disconnect  { reason }
```

Use a versioned schema. Validate payloads, key/button names, message size and rate. Expire tokens and time out idle sessions.

### Device-aware downloads

| Client device | Behaviour |
|---|---|
| Android | Never show Windows EXE. Show app guidance and QR scanner. |
| iPhone | Never show Windows EXE. Show iOS path only if a supported app exists. |
| Windows PC | Show Windows receiver download only for a tested release. |
| macOS/Linux | Show downloads only when tested builds exist. |

## 8. Smart Board and TV expansion

### Smart Boards
Future module only. Compatibility depends on board OS, vendor APIs, network protocol and Bluetooth profile. Research named models before exposing controls.

Potential controls: pointer, presentation navigation, annotation controls and screen actions where supported.

### TVs
Use platform/vendor-specific adapters. Android TV/Google TV and other brands may use different remote-control protocols.

Potential controls: navigation, OK/select, Back, Home, volume, media playback and text entry where supported. Bluetooth pairing does not automatically grant TV remote-control functionality.

## 9. UI and UX
- Modern, clean, premium and responsive interface.
- Consistent design language across device categories.
- Large touch targets and readable labels.
- Portrait and landscape touchpad layouts where practical.
- Colour must not be the only status indicator.
- Capability screen explains unsupported devices in plain language.
- PC Bluetooth screen shows host/status, capability result, touchpad, click controls, keyboard, settings and disconnect.

Example unsupported message:

> This phone can use Bluetooth, but its Android system does not provide the Bluetooth HID Device feature required to act as a mouse. Try Wi-Fi mode when available.

## 10. Technical architecture

| Layer | Technology / responsibility |
|---|---|
| Mobile UI | React + TypeScript |
| Android packaging | Capacitor Android |
| Native Bluetooth | Kotlin + `BluetoothHidDevice` |
| Bridge | Custom Capacitor plugin with typed methods/events |
| Shared interaction | TypeScript gesture engine, input models, settings and components |
| PC Wi-Fi receiver (later) | Desktop receiver; Python is a candidate, with WebSocket and native OS input APIs |
| Version control | GitHub |

### Architecture rules
- Do not implement Bluetooth HID in browser JavaScript or Web Bluetooth.
- Do not use Samsung-only APIs as the core HID implementation.
- Do not duplicate touchpad, keyboard or gesture logic in every module.
- Separate UI from native Bluetooth lifecycle/report generation.
- Keep capability abstraction distinct from connection state.
- Keep Wi-Fi receiver independent from Bluetooth HID.
- Keep Smart Board/TV protocols in isolated adapters.

### Proposed native bridge contract
```text
BluetoothHID.getCapabilityStatus()
BluetoothHID.initialize()
BluetoothHID.register()
BluetoothHID.requestDiscoverability()
BluetoothHID.getPairedHosts()
BluetoothHID.connect(hostId)
BluetoothHID.disconnect()
BluetoothHID.sendMouseReport(report)
BluetoothHID.sendKeyboardReport(report)
BluetoothHID.releaseAllInputs()
BluetoothHID.addListener("capabilityChanged", callback)
BluetoothHID.addListener("connectionStateChanged", callback)
```
This is a proposed custom plugin interface, not a built-in Capacitor API. Methods must return typed results and useful error codes.

## 11. Requested folder structure

Preserve the requested top-level folders: `PC`, `SmartBoard`, and `TV`, each with Wi-Fi and Bluetooth modules. Supporting folders are siblings.

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

The tree is a logical module map; build tooling may require workspace configuration. Shared UI and gesture logic must not be copied into each device module.

## 12. Must-use GitHub repositories and instructions

These repositories are important engineering references. Clone and test them separately before copying code. Do not merge all implementations or import their UI wholesale.

### 12.1 KuneLab Kontroller — primary Bluetooth HID candidate
Repository: https://github.com/Kunelab/kontroller

Use as the first candidate for native HID registration, mouse/keyboard reports, connection lifecycle and reconnect behaviour.

Instructions:
1. Clone into a separate research directory.
2. Read README, source, current LICENSE and dependency licences.
3. Build unchanged using documented Android toolchain.
4. Test on multiple Android manufacturers, not just one phone.
5. Pair with Windows and verify pointer, click, scroll and keyboard reports.
6. Map Kotlin classes, HID descriptor and registration lifecycle.
7. Port only necessary native HID logic into the STouch Capacitor plugin.
8. Do not import its UI; keep STouch React/TypeScript UI.

### 12.2 PhonePad — lifecycle and Samsung comparison
Repository: https://github.com/alisajjadfatmi/PhonePad

Use to compare foreground connected-device service behaviour, Samsung-specific observations, host selection and keyboard/touchpad lifecycle. It is a reference, not proof of universal compatibility.

Instructions:
1. Build and inspect separately.
2. Study HID registration and lifecycle.
3. Identify Samsung-specific assumptions and keep them out of shared core.
4. Compare behaviour against KuneLab on several Android models.
5. Treat reported device validation as evidence only for the exact tested model/firmware.
6. Do not merge wholesale with the primary implementation.

### 12.3 Kurza — touchpad gesture reference
Repository: https://github.com/patrikflorek/Kurza

Use for pointer movement, touchpad gestures, scrolling, clicking and drag interaction.

Instructions:
1. Build and explore separately.
2. Study the gesture handler and input mapping.
3. Adapt relevant gesture logic into `Shared/gestures`.
4. Do not copy its Jetpack Compose UI into the React app.
5. Test every adapted gesture for accidental clicks and stuck button states.

### 12.4 Repository selection and licensing
- KuneLab is the primary HID candidate; PhonePad is a lifecycle/platform comparison; Kurza is a gesture reference.
- Choose **one** primary native HID implementation after testing.
- Inspect each current LICENSE file and all dependency licences before copying code.
- Previously surfaced repository pages indicated MIT for PhonePad and Kurza; verify current licence files.
- Verify KuneLab's own current licence and upstream notices; do not rely only on parent-project history.
- Preserve copyright, licence and NOTICE files.
- Create `THIRD_PARTY_LICENSES.md` listing repository URL, commit/version, licence, reused files/components and modifications.
- Do not incorporate GPL code into a proprietary distribution unless its obligations are accepted.
- If licence status is unclear, use the repository for study only.

### Mandatory evaluation sequence
1. Create STouch repository and clean structure.
2. Clone KuneLab separately and build unchanged.
3. Clone PhonePad separately and inspect lifecycle/platform assumptions.
4. Clone Kurza separately and inspect gesture handling.
5. Test HID capability across available Android models and a Windows host.
6. Select one primary HID foundation.
7. Create the STouch Capacitor Kotlin plugin.
8. Port only necessary code with attribution.
9. Implement shared React touchpad and keyboard UI.
10. Add multi-manufacturer compatibility tests and regression checks.

## 13. Security, privacy and reliability

### Bluetooth
- Request only permissions needed for the Android version and operations.
- Explain nearby-device/Bluetooth/notification permission purposes.
- Do not collect, store or upload typed content.
- Do not log keyboard text or passwords.
- Release all pressed keys and mouse buttons on disconnect, failure and shutdown.
- Handle Bluetooth off, permission denial, unsupported profile, host unavailable and registration failure.

### Wi-Fi
- Use short-lived high-entropy pairing tokens.
- Require explicit PC approval for new phone pairing.
- Authenticate every session and reject expired tokens.
- Bind to local interfaces where possible; no public remote control by default.
- Validate messages, allowed keys/buttons, payload size and command rate.
- Provide disconnect and revoke controls.

### Reliability
- Handle rotation, backgrounding, lock/unlock and process recreation.
- Prevent stuck modifiers and mouse buttons.
- Avoid duplicate reports and infinite reconnect loops.
- Exclude typed input from diagnostic logs.
- Test physical devices and multiple PC Bluetooth adapters.

## 14. Test strategy and acceptance criteria

### Android compatibility matrix
For each tested device, record:
- Manufacturer, exact model and chipset if known.
- Android version, build number, security patch and OEM skin/version.
- HID API/profile availability and registration result.
- Advertising/discovery, pairing and connection result.
- Mouse and keyboard report results.
- Lifecycle/background/reconnect results.
- Host OS and Bluetooth adapter.
- Pass/partial/fail/unsupported outcome, date and notes.

### Manufacturer test cohorts
Samsung, Google Pixel, OnePlus, Xiaomi/Redmi, OPPO, realme, vivo, Motorola and other Android manufacturers. This is a test plan, not a compatibility guarantee. Publish results by exact model/build where practical.

### Bluetooth MVP acceptance criteria
- Capability detection distinguishes supported, unsupported, permission-denied and inconclusive states.
- Supported phone registers as a Bluetooth HID peripheral.
- Compatible PC pairs without an STouch PC receiver.
- Pointer movement, left/right click, double click and scroll work.
- Drag-and-drop works without stuck buttons.
- Basic keyboard and modifier combinations work.
- Disconnect releases all active keys/buttons.
- UI connection state reflects native callbacks.
- At least one device from more than one Android manufacturer is validated before making a cross-manufacturer claim.
- Every test is recorded against exact model/software/host.

### Wi-Fi acceptance criteria
- QR pairing uses a temporary token.
- Unauthenticated clients cannot control the PC.
- Mouse and keyboard work over local WebSocket.
- Receiver stops/exits cleanly.
- Android UI never shows a Windows EXE download.
- Only tested desktop builds are offered.

## 15. Development roadmap

| Phase | Work | Exit condition |
|---|---|---|
| 0. Feasibility | Inspect repositories, verify licences, test HID across Android devices and Windows | Viable primary approach selected; limitations documented |
| 1. Foundation | Folder structure, React/TypeScript, Capacitor, native plugin skeleton | App installs; bridge responds; capability shown |
| 2. Bluetooth MVP | HID registration, pairing, pointer, buttons, scroll, keyboard, safe disconnect | Acceptance criteria pass on supported devices |
| 3. Compatibility & polish | Manufacturer matrix, gestures, settings, lifecycle, diagnostics | No unsupported-device false positives; stable tests |
| 4. PC Wi-Fi | Receiver, QR, WebSocket, authentication, packaging | Secure local control works |
| 5. Smart Board/TV | Isolated adapters by model family | Each published model has test evidence |

### First sprint
- Create STouch GitHub repository and requested structure.
- Configure React + TypeScript and Capacitor Android.
- Build recommended repositories unchanged in separate directories.
- Test HID capability on devices from multiple manufacturers if available.
- Pair a supported phone with Windows and record results.
- Select primary HID foundation only after testing.
- Create Home → PCs → Bluetooth → capability/connection status screens.

## 16. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Some Android phones lack HID Device support | Runtime detection; honest unsupported state; Wi-Fi fallback later |
| Manufacturer firmware differences | Exact model/build compatibility records |
| Reference repo works on one model only | Test multiple manufacturers; no brand-wide assumptions |
| Windows caches pairing/descriptor data | Document unpair/re-pair troubleshooting |
| Background lifecycle interrupts HID | Test lifecycle and service patterns across OEMs |
| Overlapping repositories conflict | One primary implementation; others are references |
| Wi-Fi receiver network exposure | Local-only design, expiring tokens, approval and validation |
| TV/board protocols vary | Isolated adapters; publish only tested model support |

## 17. AntiGravity IDE implementation instructions

Treat this PRD as the product source of truth. Implement in small, verifiable milestones.

- Use the exact product name STouch.
- Preserve `PC`, `SmartBoard`, `TV` top-level folders and their Wi-Fi/Bluetooth subfolders.
- Make cross-manufacturer Android support a core requirement.
- Implement runtime HID capability detection before the full touchpad UI.
- Use React + TypeScript, Capacitor and Kotlin.
- Do not use browser-only JavaScript or Web Bluetooth for HID Device mode.
- Build/test the recommended repositories separately before adapting code.
- Choose one primary HID implementation.
- Keep UI and gesture engine independent of native HID implementation.
- Defer Wi-Fi, Smart Board and TV until Bluetooth MVP passes.
- Add tests for gesture mapping, report generation and release-all-inputs.
- After each phase, report files changed, commands run, device/host tests passed, failures and untested assumptions.
- Never claim compatibility based only on compilation, emulator tests or brand name.

### First AntiGravity task prompt

```text
You are implementing STouch. Read the complete PRD first.

For this task, create only the project skeleton and initial Android foundation.

1. Preserve PC, SmartBoard and TV top-level folders.
2. Inside each category, preserve WiFi and Bluetooth modules.
3. Add Shared, Mobile-App, Desktop-App and Documentation.
4. Use React + TypeScript for the mobile UI.
5. Configure Capacitor Android.
6. Create a Kotlin Capacitor plugin skeleton for Bluetooth HID.
7. Create a capability-check interface returning supported,
   unsupported, permission-required or inconclusive.
8. Do not hard-code Samsung-specific APIs or assumptions.
9. Do not implement Wi-Fi receiver, Smart Board or TV features yet.
10. Do not copy repository code until repositories are built,
    tested and licence-reviewed.
11. Add README.md and THIRD_PARTY_LICENSES.md.

Before finishing, provide:
- exact folder tree,
- setup/run commands,
- files created,
- capability detection approach,
- assumptions and limitations,
- next smallest testable step.
```

## 18. Final product decisions and success measures

### Decisions
- STouch targets all Android devices that genuinely support Bluetooth HID Device mode, not one brand.
- Bluetooth HID support is determined by runtime capability and testing, not Bluetooth availability alone.
- Bluetooth mode does not require a PC receiver.
- Wi-Fi mode requires a secure STouch PC receiver.
- PC Bluetooth is the first implementation milestone.
- Smart Board and TV are future adapters, not universal promises.

### Success measures
- Successful HID registration and pairing on multiple tested Android models.
- Reliable mouse and keyboard operation across supported host PCs.
- Low rate of stuck buttons, missed input and unexpected disconnects.
- Accurate unsupported-device detection.
- Compatibility records maintained by exact model/software version.
- Secure and reliable Wi-Fi pairing when that phase is delivered.

## 19. Reference links

- KuneLab Kontroller: https://github.com/Kunelab/kontroller
- PhonePad: https://github.com/alisajjadfatmi/PhonePad
- Kurza: https://github.com/patrikflorek/Kurza
- Android BluetoothHidDevice API: https://developer.android.com/reference/android/bluetooth/BluetoothHidDevice
- Android Bluetooth documentation: https://developer.android.com/develop/connectivity/bluetooth
- Capacitor documentation: https://capacitorjs.com/docs

**Final principle:** STouch should work across Android manufacturers wherever the required Bluetooth HID peripheral capability exists. It must detect that capability accurately, provide a dependable experience on supported devices and explain limitations honestly on unsupported devices.
