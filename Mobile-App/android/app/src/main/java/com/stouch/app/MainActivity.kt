package com.stouch.app

import android.os.Bundle
import android.util.Log
import com.getcapacitor.BridgeActivity
import com.stouch.app.plugin.BluetoothHIDPlugin

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        try {
            registerPlugin(BluetoothHIDPlugin::class.java)
            super.onCreate(savedInstanceState)

            // Start the foreground service so Android doesn't kill the app
            // when the screen goes off or another app comes to the foreground
            STouchForegroundService.start(this)
        } catch (e: Exception) {
            Log.e("STouch", "MainActivity onCreate error: ${e.message}", e)
            super.onCreate(savedInstanceState)
        }
    }

    override fun onDestroy() {
        try {
            // Stop the foreground service when the app is properly closed
            STouchForegroundService.stop(this)
        } catch (e: Exception) {
            Log.e("STouch", "MainActivity onDestroy error: ${e.message}", e)
        }
        super.onDestroy()
    }
}
