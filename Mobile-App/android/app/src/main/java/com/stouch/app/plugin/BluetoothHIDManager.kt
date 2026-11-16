package com.stouch.app.plugin

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothHidDevice
import android.bluetooth.BluetoothHidDeviceAppQosSettings
import android.bluetooth.BluetoothHidDeviceAppSdpSettings
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothProfile
import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import kotlin.experimental.and
import kotlin.experimental.or

@SuppressLint("MissingPermission")
class BluetoothHIDManager(
    private val context: Context,
    private val listener: HIDEventListener
) : BluetoothHidDevice.Callback(), BluetoothProfile.ServiceListener {

    interface HIDEventListener {
        fun onRegistrationStateChanged(registered: Boolean, error: String? = null)
        fun onConnectionStateChanged(device: BluetoothDevice?, state: Int)
        fun onHostListUpdated()
    }

    companion object {
        private const val TAG = "STouch_HIDManager"
        private const val CLICK_HOLD_MS = 45L
        private const val MAX_DELTA = 2047
    }

    private val bluetoothManager: BluetoothManager? =
        context.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
    val bluetoothAdapter: BluetoothAdapter? = bluetoothManager?.adapter

    @Volatile
    var hidDevice: BluetoothHidDevice? = null
        private set

    @Volatile
    var connectedHost: BluetoothDevice? = null
        private set

    @Volatile
    var isAppRegistered: Boolean = false
        private set

    private val mainHandler = Handler(Looper.getMainLooper())

    // 7-byte Mouse Report: [0]=buttons, [1]=dxLsb, [2]=dxMsb, [3]=dyLsb, [4]=dyMsb, [5]=vWheel, [6]=hWheel
    private val mouseBuffer = ByteArray(7) { 0 }

    // 8-byte Keyboard Report: [0]=modifiers, [1]=reserved, [2..7]=keycodes
    private val keyboardBuffer = ByteArray(8) { 0 }

    fun initialize() {
        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled) {
            Log.w(TAG, "Bluetooth adapter not available or disabled")
            return
        }
        if (hidDevice == null) {
            bluetoothAdapter.getProfileProxy(context, this, BluetoothProfile.HID_DEVICE)
        }
    }

    fun registerApp() {
        val hid = hidDevice
        if (hid == null) {
            Log.w(TAG, "Cannot registerApp: hidDevice proxy not yet connected")
            initialize()
            return
        }

        try {
            // Unregister any previous stale instance
            hid.unregisterApp()
        } catch (e: Exception) {
            Log.d(TAG, "Clean unregisterApp exception: ${e.message}")
        }

        val sdpSettings = BluetoothHidDeviceAppSdpSettings(
            "STouch",
            "STouch Bluetooth Input Controller",
            "STouch Org",
            BluetoothHidDevice.SUBCLASS1_COMBO,
            BluetoothHIDDescriptor.COMBO_DESCRIPTOR
        )

        val qosOut = BluetoothHidDeviceAppQosSettings(
            BluetoothHidDeviceAppQosSettings.SERVICE_BEST_EFFORT,
            800,
            9,
            0,
            11250,
            BluetoothHidDeviceAppQosSettings.MAX
        )

        val success = hid.registerApp(sdpSettings, null, qosOut, { it.run() }, this)
        Log.i(TAG, "hidDevice.registerApp called, success: $success")
    }

    fun unregisterApp() {
        releaseAllInputs()
        hidDevice?.unregisterApp()
        isAppRegistered = false
    }

    fun getBondedHosts(): List<BluetoothDevice> {
        return bluetoothAdapter?.bondedDevices?.toList() ?: emptyList()
    }

    fun connect(device: BluetoothDevice): Boolean {
        val hid = hidDevice ?: return false
        return hid.connect(device)
    }

    fun disconnect(): Boolean {
        releaseAllInputs()
        val host = connectedHost
        val hid = hidDevice
        if (host != null && hid != null) {
            return hid.disconnect(host)
        }
        return true
    }

    // --- Report Senders ---

    fun sendMouseMove(dx: Int, dy: Int) {
        val host = connectedHost ?: return
        val hid = hidDevice ?: return

        val cx = dx.coerceIn(-MAX_DELTA, MAX_DELTA)
        val cy = dy.coerceIn(-MAX_DELTA, MAX_DELTA)

        mouseBuffer[1] = (cx and 0xFF).toByte()
        mouseBuffer[2] = (cx shr 8).toByte()
        mouseBuffer[3] = (cy and 0xFF).toByte()
        mouseBuffer[4] = (cy shr 8).toByte()
        mouseBuffer[5] = 0
        mouseBuffer[6] = 0

        hid.sendReport(host, BluetoothHIDDescriptor.REPORT_ID_MOUSE.toInt(), mouseBuffer)
    }

    fun sendMouseScroll(vWheel: Int, hWheel: Int) {
        val host = connectedHost ?: return
        val hid = hidDevice ?: return

        mouseBuffer[1] = 0
        mouseBuffer[2] = 0
        mouseBuffer[3] = 0
        mouseBuffer[4] = 0
        mouseBuffer[5] = vWheel.coerceIn(-127, 127).toByte()
        mouseBuffer[6] = hWheel.coerceIn(-127, 127).toByte()

        hid.sendReport(host, BluetoothHIDDescriptor.REPORT_ID_MOUSE.toInt(), mouseBuffer)

        // Clear scroll bits after sending detent
        mouseBuffer[5] = 0
        mouseBuffer[6] = 0
    }

    fun setMouseButtonState(left: Boolean? = null, right: Boolean? = null, middle: Boolean? = null) {
        val host = connectedHost ?: return
        val hid = hidDevice ?: return

        left?.let {
            mouseBuffer[0] = if (it) mouseBuffer[0] or 0x01 else mouseBuffer[0] and 0xFE.toByte()
        }
        right?.let {
            mouseBuffer[0] = if (it) mouseBuffer[0] or 0x02 else mouseBuffer[0] and 0xFD.toByte()
        }
        middle?.let {
            mouseBuffer[0] = if (it) mouseBuffer[0] or 0x04 else mouseBuffer[0] and 0xFB.toByte()
        }

        mouseBuffer[1] = 0
        mouseBuffer[2] = 0
        mouseBuffer[3] = 0
        mouseBuffer[4] = 0
        mouseBuffer[5] = 0
        mouseBuffer[6] = 0

        hid.sendReport(host, BluetoothHIDDescriptor.REPORT_ID_MOUSE.toInt(), mouseBuffer)
    }

    fun sendLeftClick() {
        setMouseButtonState(left = true)
        mainHandler.postDelayed({ setMouseButtonState(left = false) }, CLICK_HOLD_MS)
    }

    fun sendRightClick() {
        setMouseButtonState(right = true)
        mainHandler.postDelayed({ setMouseButtonState(right = false) }, CLICK_HOLD_MS)
    }

    fun sendDoubleClick() {
        setMouseButtonState(left = true)
        mainHandler.postDelayed({
            setMouseButtonState(left = false)
            mainHandler.postDelayed({
                setMouseButtonState(left = true)
                mainHandler.postDelayed({
                    setMouseButtonState(left = false)
                }, CLICK_HOLD_MS)
            }, CLICK_HOLD_MS)
        }, CLICK_HOLD_MS)
    }

    fun sendKeyboardReport(modifiers: Int, keys: IntArray) {
        val host = connectedHost ?: return
        val hid = hidDevice ?: return

        keyboardBuffer[0] = (modifiers and 0xFF).toByte()
        keyboardBuffer[1] = 0
        for (i in 0 until 6) {
            keyboardBuffer[2 + i] = if (i < keys.size) (keys[i] and 0xFF).toByte() else 0
        }

        hid.sendReport(host, BluetoothHIDDescriptor.REPORT_ID_KEYBOARD.toInt(), keyboardBuffer)
    }

    fun releaseAllInputs() {
        val host = connectedHost ?: return
        val hid = hidDevice ?: return

        // Zero mouse buttons & movement
        mouseBuffer.fill(0)
        hid.sendReport(host, BluetoothHIDDescriptor.REPORT_ID_MOUSE.toInt(), mouseBuffer)

        // Zero keyboard modifiers & keys
        keyboardBuffer.fill(0)
        hid.sendReport(host, BluetoothHIDDescriptor.REPORT_ID_KEYBOARD.toInt(), keyboardBuffer)

        mainHandler.removeCallbacksAndMessages(null)
    }

    // --- BluetoothProfile.ServiceListener ---

    override fun onServiceConnected(profile: Int, proxy: BluetoothProfile?) {
        if (profile == BluetoothProfile.HID_DEVICE && proxy is BluetoothHidDevice) {
            Log.i(TAG, "Bluetooth HID Device profile proxy connected")
            hidDevice = proxy
            registerApp()
        }
    }

    override fun onServiceDisconnected(profile: Int) {
        if (profile == BluetoothProfile.HID_DEVICE) {
            Log.w(TAG, "Bluetooth HID Device profile proxy disconnected")
            releaseAllInputs()
            hidDevice = null
            isAppRegistered = false
            listener.onRegistrationStateChanged(false)
        }
    }

    // --- BluetoothHidDevice.Callback ---

    override fun onAppStatusChanged(pluggedDevice: BluetoothDevice?, registered: Boolean) {
        Log.i(TAG, "onAppStatusChanged: registered=$registered, device=${pluggedDevice?.address}")
        isAppRegistered = registered
        mainHandler.post {
            listener.onRegistrationStateChanged(registered)
        }
    }

    override fun onConnectionStateChanged(device: BluetoothDevice?, state: Int) {
        Log.i(TAG, "onConnectionStateChanged: device=${device?.address}, state=$state")
        when (state) {
            BluetoothProfile.STATE_CONNECTED -> {
                connectedHost = device
            }
            BluetoothProfile.STATE_DISCONNECTED -> {
                if (connectedHost == device) {
                    releaseAllInputs()
                    connectedHost = null
                }
            }
        }
        mainHandler.post {
            listener.onConnectionStateChanged(device, state)
        }
    }

    override fun onGetReport(device: BluetoothDevice?, type: Byte, id: Byte, bufferSize: Int) {
        val hid = hidDevice ?: return
        when (id) {
            BluetoothHIDDescriptor.REPORT_ID_MOUSE -> {
                hid.replyReport(device, type, id, mouseBuffer)
            }
            BluetoothHIDDescriptor.REPORT_ID_KEYBOARD -> {
                hid.replyReport(device, type, id, keyboardBuffer)
            }
            else -> {
                hid.reportError(device, BluetoothHidDevice.ERROR_RSP_UNSUPPORTED_REQ)
            }
        }
    }

    override fun onSetReport(device: BluetoothDevice?, type: Byte, id: Byte, data: ByteArray?) {
        hidDevice?.reportError(device, BluetoothHidDevice.ERROR_RSP_SUCCESS)
    }
}
