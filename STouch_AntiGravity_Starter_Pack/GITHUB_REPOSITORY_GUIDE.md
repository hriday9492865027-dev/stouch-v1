# STouch — GitHub Repository Evaluation Guide

These are the recommended repositories to inspect. They are candidates/references, not code that should be merged automatically.

## 1. KuneLab Kontroller
URL: https://github.com/Kunelab/kontroller

**Role:** Primary Bluetooth HID foundation candidate.

Checklist:
- [ ] Clone into a separate research directory.
- [ ] Read README and source.
- [ ] Inspect current LICENSE and dependency licences.
- [ ] Build unchanged.
- [ ] Test HID registration on physical Android devices.
- [ ] Pair with Windows.
- [ ] Verify pointer movement, click, scroll and keyboard.
- [ ] Map Kotlin HID registration, descriptor and report code.
- [ ] Decide which native pieces are suitable to port into a Capacitor plugin.
- [ ] Preserve required licence and attribution notices.

## 2. PhonePad
URL: https://github.com/alisajjadfatmi/PhonePad

**Role:** Lifecycle/background-service and Samsung behaviour comparison.

Checklist:
- [ ] Clone/build separately.
- [ ] Inspect current licence.
- [ ] Study HID registration and foreground connected-device service behaviour.
- [ ] Identify manufacturer-specific assumptions.
- [ ] Compare against KuneLab on multiple Android models.
- [ ] Do not assume one Samsung model's success proves universal support.
- [ ] Do not merge wholesale.

## 3. Kurza
URL: https://github.com/patrikflorek/Kurza

**Role:** Touchpad gesture reference.

Checklist:
- [ ] Clone/build separately.
- [ ] Inspect current licence.
- [ ] Study gesture handler, pointer movement, scrolling and drag behaviour.
- [ ] Adapt only relevant gesture logic into Shared/gestures.
- [ ] Do not copy Jetpack Compose UI into STouch React UI.
- [ ] Test for accidental clicks and stuck buttons.

## Selection rules
- Choose **one** primary native HID implementation after real-device testing.
- Use other repositories only as references for specific gaps.
- Do not merge overlapping implementations.
- Verify the current exact licence file and dependency licences before copying code. Do not rely on remembered or upstream licence claims.
- Preserve copyright, licence and NOTICE files.
- Record repository URL, commit/version, licence, reused files and modifications in `THIRD_PARTY_LICENSES.md`.
- Do not incorporate GPL code into a proprietary distribution unless the obligations are accepted.

## Test matrix
Record manufacturer, exact model, Android build, OEM skin, HID registration, discoverability, pairing, mouse/keyboard report tests, lifecycle behaviour, PC OS/adapter, date and result.
