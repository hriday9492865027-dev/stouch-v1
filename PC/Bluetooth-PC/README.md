# PC Bluetooth HID Module

This module houses the PC-specific Bluetooth HID implementation logic for STouch.

## Contents
- `hid/`: Native Bluetooth HID descriptor and profile hooks.
- `bluetooth-manager/`: Connection lifecycle, discovery, and pairing managers.
- `reports/`: Mouse and keyboard HID report formatters and serializers.
- `compatibility/`: Multi-manufacturer quirks, host OS profile notes (Windows, macOS, Linux).

## Guidelines
- Reusable UI (touchpad surface, virtual keyboard) and generic gesture math must reside in `Shared/`.
- Never hardcode Samsung-specific assumptions here.
