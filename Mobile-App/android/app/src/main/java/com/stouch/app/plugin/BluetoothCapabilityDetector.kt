package com.stouch.app.plugin

import android.Manifest
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothProfile
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.content.ContextCompat
import com.getcapacitor.JSObject

data class CapabilityEvaluation(
    val status: String,
    val hasBluetooth: Boolean,
    val isBluetoothEnabled: Boolean,
    val hasHidDeviceProfile: Boolean,
    val apiLevel: Int,
    val manufacturer: String,
    val model: String,
    val osVersion: String,
    val missingPermissions: List<String>,
    val diagnosticMessage: String
) {
    fun toJSObject(): JSObject {
        val obj = JSObject()
        obj.put("status", status)
        obj.put("hasBluetooth", hasBluetooth)
        obj.put("isBluetoothEnabled", isBluetoothEnabled)
        obj.put("hasHidDeviceProfile", hasHidDeviceProfile)
        obj.put("apiLevel", apiLevel)
        obj.put("manufacturer", manufacturer)
        obj.put("model", model)
        obj.put("osVersion", osVersion)
        
        val permsArray = com.getcapacitor.JSArray()
        missingPermissions.forEach { permsArray.put(it) }
        obj.put("missingPermissions", permsArray)
        obj.put("diagnosticMessage", diagnosticMessage)
        return obj
    }
}

class BluetoothCapabilityDetector(private val context: Context) {

    private val bluetoothManager: BluetoothManager? = 
        context.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
    private val bluetoothAdapter: BluetoothAdapter? = bluetoothManager?.adapter

    fun getRequiredPermissions(): List<String> {
        val permissions = mutableListOf<String>()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            permissions.add(Manifest.permission.BLUETOOTH_CONNECT)
            permissions.add(Manifest.permission.BLUETOOTH_ADVERTISE)
        } else {
            permissions.add(Manifest.permission.BLUETOOTH)
            permissions.add(Manifest.permission.BLUETOOTH_ADMIN)
            permissions.add(Manifest.permission.ACCESS_FINE_LOCATION)
        }
        return permissions
    }

    fun getMissingPermissions(): List<String> {
        return getRequiredPermissions().filter { perm ->
            ContextCompat.checkSelfPermission(context, perm) != PackageManager.PERMISSION_GRANTED
        }
    }

    fun evaluateCapability(callback: (CapabilityEvaluation) -> Unit) {
        val manufacturer = Build.MANUFACTURER ?: "Unknown"
        val model = Build.MODEL ?: "Unknown"
        val apiLevel = Build.VERSION.SDK_INT
        val osVersion = "Android ${Build.VERSION.RELEASE} (API $apiLevel)"

        // 1. Check basic hardware radio
        if (bluetoothAdapter == null) {
            callback(
                CapabilityEvaluation(
                    status = "unsupported",
                    hasBluetooth = false,
                    isBluetoothEnabled = false,
                    hasHidDeviceProfile = false,
                    apiLevel = apiLevel,
                    manufacturer = manufacturer,
                    model = model,
                    osVersion = osVersion,
                    missingPermissions = emptyList(),
                    diagnosticMessage = "Device does not possess a Bluetooth adapter hardware radio."
                )
            )
            return
        }

        // 2. Check Android API level prerequisite (BluetoothHidDevice added in API 28 / Pie)
        if (apiLevel < Build.VERSION_CODES.P) {
            callback(
                CapabilityEvaluation(
                    status = "unsupported",
                    hasBluetooth = true,
                    isBluetoothEnabled = try { bluetoothAdapter.isEnabled } catch (e: Exception) { false },
                    hasHidDeviceProfile = false,
                    apiLevel = apiLevel,
                    manufacturer = manufacturer,
                    model = model,
                    osVersion = osVersion,
                    missingPermissions = emptyList(),
                    diagnosticMessage = "Android API level $apiLevel is below Android 9 Pie (API 28). The native Bluetooth HID peripheral profile is unavailable."
                )
            )
            return
        }

        // 3. Check runtime permissions
        val missing = getMissingPermissions()
        if (missing.isNotEmpty()) {
            callback(
                CapabilityEvaluation(
                    status = "permission-required",
                    hasBluetooth = true,
                    isBluetoothEnabled = try { bluetoothAdapter.isEnabled } catch (e: Exception) { false },
                    hasHidDeviceProfile = false,
                    apiLevel = apiLevel,
                    manufacturer = manufacturer,
                    model = model,
                    osVersion = osVersion,
                    missingPermissions = missing,
                    diagnosticMessage = "Bluetooth permissions (${missing.joinToString(", ")}) are required before verifying HID profile access."
                )
            )
            return
        }

        // 4. Check if Bluetooth is turned on
        if (!bluetoothAdapter.isEnabled) {
            callback(
                CapabilityEvaluation(
                    status = "bluetooth-off",
                    hasBluetooth = true,
                    isBluetoothEnabled = false,
                    hasHidDeviceProfile = false,
                    apiLevel = apiLevel,
                    manufacturer = manufacturer,
                    model = model,
                    osVersion = osVersion,
                    missingPermissions = emptyList(),
                    diagnosticMessage = "Bluetooth is currently disabled. Please turn on Bluetooth in Android settings to verify peripheral profile capability."
                )
            )
            return
        }

        // 5. Test obtaining BluetoothProfile.HID_DEVICE proxy
        // BluetoothProfile.HID_DEVICE is defined as 19 in Android API 28+
        val hidDeviceProfileConstant = BluetoothProfile.HID_DEVICE

        try {
            var callbackTriggered = false
            val serviceListener = object : BluetoothProfile.ServiceListener {
                override fun onServiceConnected(profile: Int, proxy: BluetoothProfile?) {
                    if (profile == hidDeviceProfileConstant && proxy != null) {
                        callbackTriggered = true
                        bluetoothAdapter.closeProfileProxy(hidDeviceProfileConstant, proxy)
                        callback(
                            CapabilityEvaluation(
                                status = "supported",
                                hasBluetooth = true,
                                isBluetoothEnabled = true,
                                hasHidDeviceProfile = true,
                                apiLevel = apiLevel,
                                manufacturer = manufacturer,
                                model = model,
                                osVersion = osVersion,
                                missingPermissions = emptyList(),
                                diagnosticMessage = "Native Bluetooth HID Device profile proxy successfully acquired. Device supports operating as a Bluetooth HID peripheral."
                            )
                        )
                    }
                }

                override fun onServiceDisconnected(profile: Int) {
                    // Profile disconnected
                }
            }

            val proxyAcquired = bluetoothAdapter.getProfileProxy(context, serviceListener, hidDeviceProfileConstant)
            if (!proxyAcquired) {
                callback(
                    CapabilityEvaluation(
                        status = "unsupported",
                        hasBluetooth = true,
                        isBluetoothEnabled = true,
                        hasHidDeviceProfile = false,
                        apiLevel = apiLevel,
                        manufacturer = manufacturer,
                        model = model,
                        osVersion = osVersion,
                        missingPermissions = emptyList(),
                        diagnosticMessage = "Device failed to obtain Bluetooth HID Device profile proxy. The OEM firmware has disabled or omitted peripheral HID support."
                    )
                )
            }
        } catch (e: SecurityException) {
            callback(
                CapabilityEvaluation(
                    status = "permission-required",
                    hasBluetooth = true,
                    isBluetoothEnabled = true,
                    hasHidDeviceProfile = false,
                    apiLevel = apiLevel,
                    manufacturer = manufacturer,
                    model = model,
                    osVersion = osVersion,
                    missingPermissions = getRequiredPermissions(),
                    diagnosticMessage = "SecurityException while inspecting profile: ${e.localizedMessage}"
                )
            )
        } catch (t: Throwable) {
            callback(
                CapabilityEvaluation(
                    status = "inconclusive",
                    hasBluetooth = true,
                    isBluetoothEnabled = true,
                    hasHidDeviceProfile = false,
                    apiLevel = apiLevel,
                    manufacturer = manufacturer,
                    model = model,
                    osVersion = osVersion,
                    missingPermissions = emptyList(),
                    diagnosticMessage = "Unexpected exception during profile evaluation: ${t.localizedMessage}"
                )
            )
        }
    }
}
