# STouch Shared Module

Shared components, services, gesture processing, and input models across all connection types and UI surfaces.

## Structure
- `components/`: Reusable UI elements (status badges, buttons, modal dialogs).
- `services/`: Unified BluetoothHID and Wi-Fi connection abstractions.
- `gestures/`: Touchpad physics, pointer acceleration, click/drag state machines, and multi-finger scroll calculations.
- `input-models/`: Typed HID descriptors, capability results, connection states, and keyboard/mouse reports.
- `security/`: Session token verification, pairing secrets, and zero-log input handling.
- `utilities/`: Cross-platform helpers and formatting utilities.
