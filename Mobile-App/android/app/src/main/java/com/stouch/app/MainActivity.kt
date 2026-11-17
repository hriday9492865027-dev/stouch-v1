package com.stouch.app

import android.os.Bundle
import com.getcapacitor.BridgeActivity
import com.stouch.app.plugin.BluetoothHIDPlugin

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(BluetoothHIDPlugin::class.java)
        super.onCreate(savedInstanceState)
    }

    override fun onDestroy() {
        try {
            STouchForegroundService.stop(this)
        } catch (_: Exception) {}
        super.onDestroy()
    }
}
