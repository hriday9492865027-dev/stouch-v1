package com.stouch.app.plugin

import android.os.Build
import androidx.activity.result.ActivityResultLauncher
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
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
class BluetoothHIDPlugin : Plugin() {

    private lateinit var capabilityDetector: BluetoothCapabilityDetector

    override fun load() {
        super.load()
        capabilityDetector = BluetoothCapabilityDetector(context)
    }

    @PluginMethod
    fun getCapabilityStatus(call: PluginCall) {
        capabilityDetector.evaluateCapability { evaluation ->
            call.resolve(evaluation.toJSObject())
        }
    }

    @PluginMethod
    fun requestPermissions(call: PluginCall) {
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

    // --- Phase 2 Stubs (Planned for Bluetooth MVP) ---

    @PluginMethod
    fun initialize(call: PluginCall) {
        val ret = JSObject()
        ret.put("success", true)
        ret.put("message", "BluetoothHID native bridge initialized (Phase 1 Skeleton)")
        call.resolve(ret)
    }

    @PluginMethod
    fun register(call: PluginCall) {
        val ret = JSObject()
        ret.put("success", false)
        ret.put("state", "disconnected")
        ret.put("error", "Native HID registration scheduled for Phase 2 implementation")
        call.resolve(ret)
    }

    @PluginMethod
    fun requestDiscoverability(call: PluginCall) {
        val ret = JSObject()
        ret.put("success", false)
        ret.put("durationSeconds", 0)
        call.resolve(ret)
    }

    @PluginMethod
    fun getPairedHosts(call: PluginCall) {
        val ret = JSObject()
        ret.put("hosts", JSArray())
        call.resolve(ret)
    }

    @PluginMethod
    fun connect(call: PluginCall) {
        call.reject("Connect flow will be implemented in Phase 2")
    }

    @PluginMethod
    fun disconnect(call: PluginCall) {
        val ret = JSObject()
        ret.put("success", true)
        call.resolve(ret)
    }

    @PluginMethod
    fun sendMouseReport(call: PluginCall) {
        call.reject("Mouse reports will be activated in Phase 2")
    }

    @PluginMethod
    fun sendKeyboardReport(call: PluginCall) {
        call.reject("Keyboard reports will be activated in Phase 2")
    }

    @PluginMethod
    fun releaseAllInputs(call: PluginCall) {
        val ret = JSObject()
        ret.put("success", true)
        call.resolve(ret)
    }
}
