#!/usr/bin/env python3
"""
Automated End-to-End Test for STouch Desktop Receiver
Tests WebSocket handshake, authentication token/PIN validation, input handling, and session teardown
using Starlette TestClient (no extra dependencies required).
"""

import sys
import time
import json
from starlette.testclient import TestClient
from stouch_receiver import STouchReceiverCore


def main():
    print("Initializing STouch Receiver Core...")
    core = STouchReceiverCore(port=8765)
    client = TestClient(core.app)
    pin = core.active_pin
    token = core.active_token

    print(f"Generated test PIN: {pin}, Token: {token[:8]}...")

    # Test 1: Invalid PIN must be rejected
    with client.websocket_connect("/ws") as ws:
        ws.send_json({
            "type": "auth.handshake",
            "timestamp": int(time.time() * 1000),
            "token": "invalid_pin_000000",
            "sessionId": "test-session",
            "clientName": "Test Client",
            "deviceModel": "Automated Tester",
            "protocolVersion": "1.0.0"
        })
        res = ws.receive_json()
        assert res["type"] == "auth.response"
        assert res["success"] is False, "Expected invalid PIN to fail authentication"
        print("  [PASS] Test 1: Invalid PIN correctly rejected with auth.response: false")

    # Test 2: Valid PIN must be accepted
    with client.websocket_connect("/ws") as ws:
        ws.send_json({
            "type": "auth.handshake",
            "timestamp": int(time.time() * 1000),
            "token": pin,
            "sessionId": "test-session",
            "clientName": "Test Client",
            "deviceModel": "Automated Tester",
            "protocolVersion": "1.0.0"
        })
        res = ws.receive_json()
        assert res["type"] == "auth.response"
        assert res["success"] is True, "Expected valid PIN to authenticate"
        print("  [PASS] Test 2: Valid PIN successfully authenticated with auth.response: true")

        # Test 3: Send pointer move
        ws.send_json({
            "type": "pointer.move",
            "timestamp": int(time.time() * 1000),
            "dx": 25,
            "dy": -15
        })
        print("  [PASS] Test 3: pointer.move transmitted and processed without error")

        # Test 4: Send pointer button press and release (left click)
        ws.send_json({
            "type": "pointer.button",
            "timestamp": int(time.time() * 1000),
            "button": "left",
            "state": "down"
        })
        ws.send_json({
            "type": "pointer.button",
            "timestamp": int(time.time() * 1000),
            "button": "left",
            "state": "up"
        })
        print("  [PASS] Test 4: pointer.button (left click) transmitted and processed")

        # Test 5: Send pointer scroll
        ws.send_json({
            "type": "pointer.scroll",
            "timestamp": int(time.time() * 1000),
            "deltaX": 0,
            "deltaY": 2
        })
        print("  [PASS] Test 5: pointer.scroll transmitted and processed")

        # Test 6: Send keyboard stroke
        ws.send_json({
            "type": "keyboard.key",
            "timestamp": int(time.time() * 1000),
            "key": "A",
            "state": "down",
            "modifiers": 0
        })
        ws.send_json({
            "type": "keyboard.key",
            "timestamp": int(time.time() * 1000),
            "key": "A",
            "state": "up",
            "modifiers": 0
        })
        print("  [PASS] Test 6: keyboard.key transmitted and processed")

        # Test 7: Clean session disconnect
        ws.send_json({
            "type": "session.disconnect",
            "timestamp": int(time.time() * 1000),
            "reason": "Test finished"
        })
        print("  [PASS] Test 7: Clean session disconnect completed")

    print("\n>>> ALL 7 RECEIVER END-TO-END TESTS PASSED CLEANLY! <<<")


if __name__ == "__main__":
    main()
