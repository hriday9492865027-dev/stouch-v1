# STouch Desktop App (Phase 4)

Houses the desktop companion receiver for local Wi-Fi mode.

## Structure
- `receiver/`: Local WebSocket server listening on loopback/local interface with temporary token authentication.
- `installer/`: Packaging scripts for Windows (MSIX/Inno Setup) and desktop platforms.
- `configuration/`: Host settings, pairing security tokens, and active session limits.
