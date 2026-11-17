package com.stouch.app.plugin

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothProfile
import android.content.Intent
import android.os.Build
import android.util.Log
import com.stouch.app.STouchForegroundService
import androidx.activity.result.ActivityResultLauncher
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.ActivityCallback
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission

@CapacitorPlugin(
    name = "BluetoothHID",
    permissions = [
        Permission(
            strings = [
                android.Manifest.permission.BLUETOOTH,
                android.Manifest.permission.BLUETOOTH_ADMIN,
                android.Manifest.permission.ACCESS_FINE_LOCATION
            ],
            alias = "bluetoothLegacy"
        ),
        Permission(
            strings = [
                android.Manifest.permission.BLUETOOTH_CONNECT,
                android.Manifest.permission.BLUETOOTH_ADVERTISE
            ],
            alias = "bluetoothModern"
        )
    ]
)
class BluetoothHIDPlugin : Plugin(), BluetoothHIDManager.HIDEventListener {

    private lateinit var capabilityDetector: BluetoothCapabilityDetector
    private lateinit var hidManager: BluetoothHIDManager

    override fun load() {
        try {
            super.load()
            capabilityDetector = BluetoothCapabilityDetector(context)
            hidManager = BluetoothHIDManager(context, this)
        } catch (e: Exception) {
            Log.e("STouch_Plugin", "BluetoothHIDPlugin.load() error: ${e.message}", e)
            // Initialise safe fallbacks so plugin methods don't NPE
            if (!::capabilityDetector.isInitialized) capabilityDetector = BluetoothCapabilityDetector(context)
            if (!::hidManager.isInitialized) hidManager = BluetoothHIDManager(context, this)
        }
    }

    override fun handleOnPause() {
        super.handleOnPause()
        // Release all active mouse buttons and keys when the app leaves foreground
        hidManager.releaseAllInputs()
    }

    override fun handleOnDestroy() {
        super.handleOnDestroy()
        try {
            STouchForegroundService.stop(context)
        } catch (_: Throwable) {}
        hidManager.releaseAllInputs()
    }

    @PluginMethod
    fun getCapabilityStatus(call: PluginCall) {
        capabilityDetector.evaluateCapability { evaluation ->
            call.resolve(evaluation.toJSObject())
        }
    }

    @PluginMethod
    override fun requestPermissions(call: PluginCall) {
        val missing = capabilityDetector.getMissingPermissions()
        if (missing.isEmpty()) {
            val ret = JSObject()
            ret.put("granted", true)
            ret.put("missingPermissions", JSArray())
            call.resolve(ret)
            return
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            requestPermissionForAlias("bluetoothModern", call, "permissionsCallback")
        } else {
            requestPermissionForAlias("bluetoothLegacy", call, "permissionsCallback")
        }
    }

    @com.getcapacitor.annotation.PermissionCallback
    private fun permissionsCallback(call: PluginCall) {
        val missing = capabilityDetector.getMissingPermissions()
        val ret = JSObject()
        ret.put("granted", missing.isEmpty())
        val arr = JSArray()
        missing.forEach { arr.put(it) }
        ret.put("missingPermissions", arr)
        call.resolve(ret)
    }

    // --- Bluetooth HID Methods ---

    @PluginMethod
    fun initialize(call: PluginCall) {
        try {
            hidManager.initialize()
            val ret = JSObject()
            ret.put("success", true)
            call.resolve(ret)
        } catch (e: Throwable) {
            call.reject("Initialize failed: ${e.message}")
        }
    }

    @SuppressLint("MissingPermission")
    @PluginMethod
    fun register(call: PluginCall) {
        try {
            hidManager.registerApp()
            val ret = JSObject()
            ret.put("success", true)
            ret.put("registered", hidManager.isAppRegistered)
            call.resolve(ret)
        } catch (e: Throwable) {
            call.reject("Register failed: ${e.message}")
        }
    }

    @SuppressLint("MissingPermission")
    @PluginMethod
    fun requestDiscoverability(call: PluginCall) {
        val duration = call.getInt("durationSeconds", 120) ?: 120
        val discoverableIntent = Intent(BluetoothAdapter.ACTION_REQUEST_DISCOVERABLE).apply {
            putExtra(BluetoothAdapter.EXTRA_DISCOVERABLE_DURATION, duration)
        }
        startActivityForResult(call, discoverableIntent, "discoverableCallback")
    }

    @ActivityCallback
    private fun discoverableCallback(call: PluginCall?, result: androidx.activity.result.ActivityResult) {
        val ret = JSObject()
        ret.put("success", result.resultCode != android.app.Activity.RESULT_CANCELED)
        ret.put("durationSeconds", result.resultCode)
        call?.resolve(ret)
    }

    @SuppressLint("MissingPermission")
    @PluginMethod
    fun getPairedHosts(call: PluginCall) {
        val bonded = hidManager.getBondedHosts()
        val hostsArray = JSArray()

        for (device in bonded) {
            val obj = JSObject()
            val address = try { device.address } catch (_: Throwable) { "" }
            val name = try { device.name ?: "Unnamed PC" } catch (_: Throwable) { "Unnamed PC" }
            val isConnected = try { address == hidManager.connectedHost?.address } catch (_: Throwable) { false }
            obj.put("id", address)
            obj.put("name", name)
            obj.put("isConnected", isConnected)
            hostsArray.put(obj)
        }

        val ret = JSObject()
        ret.put("hosts", hostsArray)
        call.resolve(ret)
    }

    @SuppressLint("MissingPermission")
    @PluginMethod
    fun connect(call: PluginCall) {
        val hostId = call.getString("hostId")
        if (hostId.isNullOrEmpty()) {
            call.reject("Missing hostId")
            return
        }

        val device = hidManager.getBondedHosts().firstOrNull { it.address == hostId }
        if (device == null) {
            call.reject("Device not found among bonded hosts: $hostId")
            return
        }

        val success = hidManager.connect(device)
        val ret = JSObject()
        ret.put("success", success)
        call.resolve(ret)
    }

    @PluginMethod
    fun disconnect(call: PluginCall) {
        val success = hidManager.disconnect()
        val ret = JSObject()
        ret.put("success", success)
        call.resolve(ret)
    }

    @PluginMethod
    fun sendMouseReport(call: PluginCall) {
        val dx = call.getInt("dx", 0) ?: 0
        val dy = call.getInt("dy", 0) ?: 0
        val wheel = call.getInt("wheel", 0) ?: 0
        val hWheel = call.getInt("hWheel", 0) ?: 0

        if (wheel != 0 || hWheel != 0) {
            hidManager.sendMouseScroll(wheel, hWheel)
        }
        if (dx != 0 || dy != 0) {
            hidManager.sendMouseMove(dx, dy)
        }

        val ret = JSObject()
        ret.put("success", true)
        call.resolve(ret)
    }

    @PluginMethod
    fun sendMouseButtonState(call: PluginCall) {
        val left = if (call.hasOption("left")) call.getBoolean("left") else null
        val right = if (call.hasOption("right")) call.getBoolean("right") else null
        val middle = if (call.hasOption("middle")) call.getBoolean("middle") else null

        hidManager.setMouseButtonState(left, right, middle)
        val ret = JSObject()
        ret.put("success", true)
        call.resolve(ret)
    }

    @PluginMethod
    fun sendLeftClick(call: PluginCall) {
        hidManager.sendLeftClick()
        val ret = JSObject()
        ret.put("success", true)
        call.resolve(ret)
    }

    @PluginMethod
    fun sendRightClick(call: PluginCall) {
        hidManager.sendRightClick()
        val ret = JSObject()
        ret.put("success", true)
        call.resolve(ret)
    }

    @PluginMethod
    fun sendDoubleClick(call: PluginCall) {
        hidManager.sendDoubleClick()
        val ret = JSObject()
        ret.put("success", true)
        call.resolve(ret)
    }

    @PluginMethod
    fun sendKeyboardReport(call: PluginCall) {
        val modifiers = call.getInt("modifiers", 0) ?: 0
        val keysArray = call.getArray("keys", JSArray()) ?: JSArray()
        val keysList = IntArray(keysArray.length())
        for (i in 0 until keysArray.length()) {
            keysList[i] = keysArray.getInt(i)
        }

        hidManager.sendKeyboardReport(modifiers, keysList)
        val ret = JSObject()
        ret.put("success", true)
        call.resolve(ret)
    }

    @PluginMethod
    fun releaseAllInputs(call: PluginCall) {
        hidManager.releaseAllInputs()
        val ret = JSObject()
        ret.put("success", true)
        call.resolve(ret)
    }

    // --- HIDEventListener ---

    override fun onRegistrationStateChanged(registered: Boolean, error: String?) {
        val data = JSObject()
        data.put("registered", registered)
        if (error != null) data.put("error", error)
        notifyListeners("registrationChanged", data)
    }

    @SuppressLint("MissingPermission")
    override fun onConnectionStateChanged(device: BluetoothDevice?, state: Int) {
        if (state == BluetoothProfile.STATE_CONNECTED) {
            try {
                STouchForegroundService.start(context)
            } catch (_: Throwable) {}
        } else if (state == BluetoothProfile.STATE_DISCONNECTED) {
            try {
                STouchForegroundService.stop(context)
            } catch (_: Throwable) {}
        }

        val data = JSObject()
        val stateName = when (state) {
            BluetoothProfile.STATE_CONNECTED -> "connected"
            BluetoothProfile.STATE_CONNECTING -> "connecting"
            BluetoothProfile.STATE_DISCONNECTING -> "disconnecting"
            BluetoothProfile.STATE_DISCONNECTED -> "disconnected"
            else -> "unknown"
        }
        val hostId = try { device?.address } catch (_: Throwable) { null }
        val hostName = try { device?.name } catch (_: Throwable) { null }
        data.put("state", stateName)
        data.put("hostId", hostId)
        data.put("hostName", hostName)
        notifyListeners("connectionStateChanged", data)
    }

    override fun onHostListUpdated() {
        notifyListeners("hostListUpdated", JSObject())
    }
}
