#!/usr/bin/env python3
"""
STouch Desktop Receiver (Phase 4)
Lightweight cross-platform local receiver for STouch Wi-Fi Mode.
Exposes an authenticated local WebSocket server and displays pairing PIN and QR information.
Governed by STouch PRD Section 7.
"""

import sys
import os
import json
import time
import socket
import secrets
import threading
import ctypes
from typing import Optional, Dict

# GUI
import tkinter as tk
from tkinter import ttk, messagebox

# Server components (available in environment: fastapi, uvicorn, starlette)
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import uvicorn

# --- Windows Input Injection via ctypes ---
user32 = ctypes.windll.user32 if os.name == 'nt' else None

# Mouse event constants
MOUSEEVENTF_MOVE = 0x0001
MOUSEEVENTF_LEFTDOWN = 0x0002
MOUSEEVENTF_LEFTUP = 0x0004
MOUSEEVENTF_RIGHTDOWN = 0x0008
MOUSEEVENTF_RIGHTUP = 0x0010
MOUSEEVENTF_MIDDLEDOWN = 0x0020
MOUSEEVENTF_MIDDLEUP = 0x0040
MOUSEEVENTF_WHEEL = 0x0800
MOUSEEVENTF_HWHEEL = 0x01000

# Virtual key map for common keys
VK_MAP = {
    'enter': 0x0D, 'esc': 0x1B, 'backspace': 0x08, 'tab': 0x09, 'space': 0x20,
    'left': 0x25, 'up': 0x26, 'right': 0x27, 'down': 0x28,
    'delete': 0x2E, 'home': 0x24, 'end': 0x23, 'pageup': 0x21, 'pagedown': 0x22,
    'f1': 0x70, 'f2': 0x71, 'f3': 0x72, 'f4': 0x73, 'f5': 0x74, 'f6': 0x75,
    'f7': 0x76, 'f8': 0x77, 'f9': 0x78, 'f10': 0x79, 'f11': 0x7A, 'f12': 0x7B,
}

def get_local_ip() -> str:
    """Retrieve the primary local LAN IP address."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return '127.0.0.1'


class STouchReceiverCore:
    """Manages active credentials, WebSocket server lifecycle, and input execution."""

    def __init__(self, port: int = 8765):
        self.port = port
        self.host_ip = get_local_ip()
        self.session_id = secrets.token_hex(4)
        self.active_pin = f"{secrets.randbelow(900000) + 100000}"  # 6-digit PIN
        self.active_token = secrets.token_urlsafe(16)
        self.token_expiry = time.time() + 300  # 5 minutes validity
        self.connected_client_info: Optional[Dict] = None
        self.active_websocket: Optional[WebSocket] = None
        self.is_running = False
        self.app = FastAPI(title="STouch Desktop Receiver")
        self.setup_routes()

    def regenerate_credentials(self):
        """Rotate temporary pairing credentials."""
        self.session_id = secrets.token_hex(4)
        self.active_pin = f"{secrets.randbelow(900000) + 100000}"
        self.active_token = secrets.token_urlsafe(16)
        self.token_expiry = time.time() + 300

    def get_qr_payload_str(self) -> str:
        """Returns JSON string for the mobile QR code scanner."""
        payload = {
            "version": "1.0.0",
            "host": self.host_ip,
            "port": self.port,
            "sessionId": self.session_id,
            "token": self.active_token,
            "pin": self.active_pin,
            "expiresAt": int(self.token_expiry * 1000)
        }
        return json.dumps(payload)

    def setup_routes(self):
        @self.app.websocket("/ws")
        async def websocket_endpoint(websocket: WebSocket):
            await websocket.accept()

            authenticated = False
            client_id = None

            try:
                while True:
                    text = await websocket.receive_text()
                    try:
                        data = json.loads(text)
                    except json.JSONDecodeError:
                        continue

                    msg_type = data.get("type")

                    # Handshake / Auth
                    if msg_type == "auth.handshake":
                        token = data.get("token")
                        # Allow matching either secret token or active 6-digit PIN
                        if (token == self.active_token or token == self.active_pin) and time.time() <= self.token_expiry + 60:
                            authenticated = True
                            client_id = data.get("clientName", "Phone Client")
                            self.connected_client_info = {
                                "clientName": client_id,
                                "deviceModel": data.get("deviceModel", "Unknown Model"),
                                "ip": websocket.client.host if websocket.client else "Unknown",
                                "connectedAt": time.strftime("%H:%M:%S")
                            }
                            self.active_websocket = websocket
                            await websocket.send_json({
                                "type": "auth.response",
                                "timestamp": int(time.time() * 1000),
                                "success": True,
                                "message": "Authentication successful"
                            })
                        else:
                            await websocket.send_json({
                                "type": "auth.response",
                                "timestamp": int(time.time() * 1000),
                                "success": False,
                                "message": "Invalid or expired token/PIN"
                            })
                            await websocket.close(code=1008, reason="Authentication failed")
                            return

                    elif not authenticated:
                        await websocket.close(code=1008, reason="Unauthorized")
                        return

                    # Input handling
                    elif msg_type == "pointer.move":
                        dx = int(data.get("dx", 0))
                        dy = int(data.get("dy", 0))
                        self.handle_pointer_move(dx, dy)

                    elif msg_type == "pointer.button":
                        btn = data.get("button", "left")
                        state = data.get("state", "down")
                        self.handle_pointer_button(btn, state)

                    elif msg_type == "pointer.scroll":
                        dy = int(data.get("deltaY", 0))
                        self.handle_pointer_scroll(dy)

                    elif msg_type == "keyboard.key":
                        key = str(data.get("key", ""))
                        state = data.get("state", "down")
                        self.handle_keyboard_key(key, state)

                    elif msg_type == "session.heartbeat":
                        pass

                    elif msg_type == "session.disconnect":
                        break

            except WebSocketDisconnect:
                pass
            finally:
                if self.active_websocket == websocket:
                    self.active_websocket = None
                    self.connected_client_info = None
                    self.release_all_inputs()

    def handle_pointer_move(self, dx: int, dy: int):
        if user32:
            user32.mouse_event(MOUSEEVENTF_MOVE, dx, dy, 0, 0)

    def handle_pointer_button(self, button: str, state: str):
        if not user32:
            return
        if button == "left":
            flag = MOUSEEVENTF_LEFTDOWN if state == "down" else MOUSEEVENTF_LEFTUP
        elif button == "right":
            flag = MOUSEEVENTF_RIGHTDOWN if state == "down" else MOUSEEVENTF_RIGHTUP
        elif button == "middle":
            flag = MOUSEEVENTF_MIDDLEDOWN if state == "down" else MOUSEEVENTF_MIDDLEUP
        else:
            return
        user32.mouse_event(flag, 0, 0, 0, 0)

    def handle_pointer_scroll(self, delta_y: int):
        if user32:
            # Standard mouse wheel step is 120 units
            wheel_amount = delta_y * 120
            user32.mouse_event(MOUSEEVENTF_WHEEL, 0, 0, wheel_amount, 0)

    def handle_keyboard_key(self, key_str: str, state: str):
        if not user32:
            return
        lower_key = key_str.lower()
        vk = VK_MAP.get(lower_key)
        if vk is None and len(key_str) == 1:
            # ASCII character lookup
            vk = ord(key_str.upper())

        if vk:
            flags = 0 if state == "down" else 2  # KEYEVENTF_KEYUP = 2
            user32.keybd_event(vk, 0, flags, 0)

    def release_all_inputs(self):
        """Emergency failsafe: release any stuck mouse buttons."""
        if user32:
            user32.mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
            user32.mouse_event(MOUSEEVENTF_RIGHTUP, 0, 0, 0, 0)
            user32.mouse_event(MOUSEEVENTF_MIDDLEUP, 0, 0, 0, 0)


class STouchReceiverApp:
    """Tkinter Desktop GUI for the STouch Receiver."""

    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("STouch Desktop Receiver")
        self.root.geometry("460x520")
        self.root.minsize(420, 480)
        self.root.configure(bg="#090d16")

        self.core = STouchReceiverCore()
        self.server_thread: Optional[threading.Thread] = None

        self.setup_ui()
        self.start_server()
        self.poll_updates()

    def setup_ui(self):
        style = ttk.Style()
        style.theme_use('clam')

        # Header Frame
        header = tk.Frame(self.root, bg="#090d16")
        header.pack(fill="x", padx=20, pady=(20, 10))

        title = tk.Label(
            header,
            text="STouch Receiver",
            font=("Segoe UI", 16, "bold"),
            fg="#f8fafc",
            bg="#090d16"
        )
        title.pack(anchor="w")

        subtitle = tk.Label(
            header,
            text="Local Wi-Fi Host for Mobile Touchpad & Keyboard",
            font=("Segoe UI", 9),
            fg="#94a3b8",
            bg="#090d16"
        )
        subtitle.pack(anchor="w")

        # Credentials Card
        card = tk.Frame(self.root, bg="#0f172a", bd=1, relief="solid")
        card.pack(fill="x", padx=20, pady=10)

        ip_label = tk.Label(
            card,
            text=f"Server LAN IP: {self.core.host_ip} : {self.core.port}",
            font=("Segoe UI", 11, "bold"),
            fg="#38bdf8",
            bg="#0f172a"
        )
        ip_label.pack(pady=(15, 5))

        pin_title = tk.Label(
            card,
            text="PAIRING PIN (Manual Entry)",
            font=("Segoe UI", 8, "bold"),
            fg="#64748b",
            bg="#0f172a"
        )
        pin_title.pack()

        self.pin_display = tk.Label(
            card,
            text=self.core.active_pin,
            font=("Consolas", 26, "bold"),
            fg="#10b981",
            bg="#0f172a"
        )
        self.pin_display.pack(pady=(0, 10))

        refresh_btn = tk.Button(
            card,
            text="Rotate PIN & Token",
            command=self.refresh_pin,
            font=("Segoe UI", 9),
            bg="#1e293b",
            fg="#cbd5e1",
            activebackground="#334155",
            activeforeground="#ffffff",
            bd=0,
            padx=12,
            pady=4
        )
        refresh_btn.pack(pady=(0, 15))

        # Status & Client Info
        status_frame = tk.Frame(self.root, bg="#090d16")
        status_frame.pack(fill="x", padx=20, pady=10)

        self.status_label = tk.Label(
            status_frame,
            text="Status: Listening for STouch mobile app...",
            font=("Segoe UI", 9),
            fg="#94a3b8",
            bg="#090d16"
        )
        self.status_label.pack(anchor="w")

        self.client_label = tk.Label(
            status_frame,
            text="Connected Client: None",
            font=("Segoe UI", 9, "bold"),
            fg="#64748b",
            bg="#090d16"
        )
        self.client_label.pack(anchor="w", pady=(4, 0))

        # Action Buttons
        btn_frame = tk.Frame(self.root, bg="#090d16")
        btn_frame.pack(fill="x", padx=20, pady=(15, 20))

        self.revoke_btn = tk.Button(
            btn_frame,
            text="Revoke / Disconnect Phone",
            command=self.disconnect_client,
            font=("Segoe UI", 9, "bold"),
            bg="#7f1d1d",
            fg="#fecaca",
            activebackground="#991b1b",
            activeforeground="#ffffff",
            bd=0,
            padx=12,
            pady=8,
            state="disabled"
        )
        self.revoke_btn.pack(fill="x")

        # Clean Exit on window close
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

    def refresh_pin(self):
        self.core.regenerate_credentials()
        self.pin_display.config(text=self.core.active_pin)

    def disconnect_client(self):
        if self.core.active_websocket:
            async def close_ws():
                try:
                    await self.core.active_websocket.close(code=1000, reason="Host revoked session")
                except Exception:
                    pass
            # Trigger close
            threading.Thread(target=lambda: self.core.release_all_inputs()).start()
            self.core.connected_client_info = None

    def start_server(self):
        config = uvicorn.Config(app=self.core.app, host="0.0.0.0", port=self.core.port, log_level="warning")
        server = uvicorn.Server(config)
        self.server_thread = threading.Thread(target=server.run, daemon=True)
        self.server_thread.start()

    def poll_updates(self):
        client = self.core.connected_client_info
        if client:
            self.status_label.config(text="Status: Active connection established", fg="#34d399")
            self.client_label.config(
                text=f"Connected Client: {client.get('clientName')} ({client.get('deviceModel')})",
                fg="#f8fafc"
            )
            self.revoke_btn.config(state="normal")
        else:
            self.status_label.config(text="Status: Listening for incoming STouch app...", fg="#94a3b8")
            self.client_label.config(text="Connected Client: None", fg="#64748b")
            self.revoke_btn.config(state="disabled")

        self.root.after(1000, self.poll_updates)

    def on_close(self):
        self.core.release_all_inputs()
        self.root.destroy()
        sys.exit(0)


def main():
    root = tk.Tk()
    app = STouchReceiverApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
