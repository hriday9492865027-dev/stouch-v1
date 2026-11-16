package com.stouch.app.plugin

/**
 * Standard USB HID Report Descriptor for STouch.
 * Defines a combo peripheral comprising:
 * - Report ID 4: Relative Mouse with Left/Right/Middle buttons, 16-bit X/Y, Vertical Wheel, Horizontal AC Pan
 * - Report ID 8: Standard 8-byte Keyboard (1 byte modifier bitmask, 1 reserved byte, 6-key array)
 * - Report ID 10: Consumer Controls (Media volume up/down, mute, play/pause, next, prev)
 */
object BluetoothHIDDescriptor {

    const val REPORT_ID_MOUSE: Byte = 4
    const val REPORT_ID_KEYBOARD: Byte = 8
    const val REPORT_ID_MEDIA: Byte = 10

    val COMBO_DESCRIPTOR = byteArrayOf(
        // === MOUSE COLLECTION (Report ID 4) ===
        0x05.toByte(), 0x01.toByte(),                         // USAGE_PAGE (Generic Desktop)
        0x09.toByte(), 0x02.toByte(),                         // USAGE (Mouse)
        0xa1.toByte(), 0x01.toByte(),                         // COLLECTION (Application)
        0x05.toByte(), 0x01.toByte(),                         // USAGE_PAGE (Generic Desktop)
        0x09.toByte(), 0x02.toByte(),                         // USAGE (Mouse)
        0xa1.toByte(), 0x02.toByte(),                         // COLLECTION (Logical)

        0x85.toByte(), REPORT_ID_MOUSE,                       // REPORT_ID (4)
        0x09.toByte(), 0x01.toByte(),                         // USAGE (Pointer)
        0xa1.toByte(), 0x00.toByte(),                         // COLLECTION (Physical)
        0x05.toByte(), 0x09.toByte(),                         //   USAGE_PAGE (Button)
        0x19.toByte(), 0x01.toByte(),                         //   USAGE_MINIMUM (Button 1: Left)
        0x29.toByte(), 0x03.toByte(),                         //   USAGE_MAXIMUM (Button 3: Middle)
        0x15.toByte(), 0x00.toByte(),                         //   LOGICAL_MINIMUM (0)
        0x25.toByte(), 0x01.toByte(),                         //   LOGICAL_MAXIMUM (1)
        0x75.toByte(), 0x01.toByte(),                         //   REPORT_SIZE (1)
        0x95.toByte(), 0x03.toByte(),                         //   REPORT_COUNT (3 buttons)
        0x81.toByte(), 0x02.toByte(),                         //   INPUT (Data,Var,Abs)
        0x95.toByte(), 0x01.toByte(),                         //   REPORT_COUNT (1)
        0x75.toByte(), 0x05.toByte(),                         //   REPORT_SIZE (5 padding bits)
        0x81.toByte(), 0x03.toByte(),                         //   INPUT (Cnst,Var,Abs)

        0x05.toByte(), 0x01.toByte(),                         //   USAGE_PAGE (Generic Desktop)
        0x09.toByte(), 0x30.toByte(),                         //   USAGE (X)
        0x09.toByte(), 0x31.toByte(),                         //   USAGE (Y)
        0x16.toByte(), 0x01.toByte(), 0xf8.toByte(),          //   LOGICAL_MINIMUM (-2047)
        0x26.toByte(), 0xff.toByte(), 0x07.toByte(),          //   LOGICAL_MAXIMUM (2047)
        0x75.toByte(), 0x10.toByte(),                         //   REPORT_SIZE (16 bits)
        0x95.toByte(), 0x02.toByte(),                         //   REPORT_COUNT (2 channels: X & Y)
        0x81.toByte(), 0x06.toByte(),                         //   INPUT (Data,Var,Rel)

        // Vertical Wheel
        0x09.toByte(), 0x38.toByte(),                         //   USAGE (Wheel)
        0x15.toByte(), 0x81.toByte(),                         //   LOGICAL_MINIMUM (-127)
        0x25.toByte(), 0x7f.toByte(),                         //   LOGICAL_MAXIMUM (127)
        0x75.toByte(), 0x08.toByte(),                         //   REPORT_SIZE (8 bits)
        0x95.toByte(), 0x01.toByte(),                         //   REPORT_COUNT (1)
        0x81.toByte(), 0x06.toByte(),                         //   INPUT (Data,Var,Rel)

        // Horizontal Scroll (Consumer AC Pan)
        0x05.toByte(), 0x0c.toByte(),                         //   USAGE_PAGE (Consumer Devices)
        0x0a.toByte(), 0x38.toByte(), 0x02.toByte(),          //   USAGE (AC Pan)
        0x15.toByte(), 0x81.toByte(),                         //   LOGICAL_MINIMUM (-127)
        0x25.toByte(), 0x7f.toByte(),                         //   LOGICAL_MAXIMUM (127)
        0x75.toByte(), 0x08.toByte(),                         //   REPORT_SIZE (8 bits)
        0x95.toByte(), 0x01.toByte(),                         //   REPORT_COUNT (1)
        0x81.toByte(), 0x06.toByte(),                         //   INPUT (Data,Var,Rel)

        0xc0.toByte(),                                        // END_COLLECTION (Physical)
        0xc0.toByte(),                                        // END_COLLECTION (Logical)
        0xc0.toByte(),                                        // END_COLLECTION (Application)

        // === KEYBOARD COLLECTION (Report ID 8) ===
        0x05.toByte(), 0x01.toByte(),                         // USAGE_PAGE (Generic Desktop)
        0x09.toByte(), 0x06.toByte(),                         // USAGE (Keyboard)
        0xA1.toByte(), 0x01.toByte(),                         // COLLECTION (Application)
        0x85.toByte(), REPORT_ID_KEYBOARD,                    // REPORT_ID (8)
        0x05.toByte(), 0x07.toByte(),                         //   USAGE_PAGE (Key Codes)
        0x19.toByte(), 0xe0.toByte(),                         //   USAGE_MINIMUM (224: Left Ctrl)
        0x29.toByte(), 0xe7.toByte(),                         //   USAGE_MAXIMUM (231: Right GUI)
        0x15.toByte(), 0x00.toByte(),                         //   LOGICAL_MINIMUM (0)
        0x25.toByte(), 0x01.toByte(),                         //   LOGICAL_MAXIMUM (1)
        0x75.toByte(), 0x01.toByte(),                         //   REPORT_SIZE (1)
        0x95.toByte(), 0x08.toByte(),                         //   REPORT_COUNT (8 modifier bits)
        0x81.toByte(), 0x02.toByte(),                         //   INPUT (Data,Var,Abs)

        0x95.toByte(), 0x01.toByte(),                         //   REPORT_COUNT (1)
        0x75.toByte(), 0x08.toByte(),                         //   REPORT_SIZE (8)
        0x81.toByte(), 0x01.toByte(),                         //   INPUT (Cnst) reserved byte

        0x95.toByte(), 0x06.toByte(),                         //   REPORT_COUNT (6 keys)
        0x75.toByte(), 0x08.toByte(),                         //   REPORT_SIZE (8)
        0x15.toByte(), 0x00.toByte(),                         //   LOGICAL_MINIMUM (0)
        0x25.toByte(), 0x65.toByte(),                         //   LOGICAL_MAXIMUM (101)
        0x05.toByte(), 0x07.toByte(),                         //   USAGE_PAGE (Key Codes)
        0x19.toByte(), 0x00.toByte(),                         //   USAGE_MINIMUM (0)
        0x29.toByte(), 0x65.toByte(),                         //   USAGE_MAXIMUM (101)
        0x81.toByte(), 0x00.toByte(),                         //   INPUT (Data,Array) 6 bytes
        0xc0.toByte(),                                        // END_COLLECTION (Application)

        // === CONSUMER CONTROLS (Report ID 10) ===
        0x05.toByte(), 0x0c.toByte(),                         // USAGE_PAGE (Consumer Devices)
        0x09.toByte(), 0x01.toByte(),                         // USAGE (Consumer Control)
        0xa1.toByte(), 0x01.toByte(),                         // COLLECTION (Application)
        0x85.toByte(), REPORT_ID_MEDIA,                       // REPORT_ID (10)
        0x15.toByte(), 0x00.toByte(),                         //   LOGICAL_MINIMUM (0)
        0x25.toByte(), 0x01.toByte(),                         //   LOGICAL_MAXIMUM (1)
        0x75.toByte(), 0x01.toByte(),                         //   REPORT_SIZE (1)
        0x95.toByte(), 0x08.toByte(),                         //   REPORT_COUNT (8)
        0x09.toByte(), 0xb5.toByte(),                         //   Scan Next Track (bit 0)
        0x09.toByte(), 0xb6.toByte(),                         //   Scan Previous Track (bit 1)
        0x09.toByte(), 0xb7.toByte(),                         //   Stop (bit 2)
        0x09.toByte(), 0xcd.toByte(),                         //   Play/Pause (bit 3)
        0x09.toByte(), 0xe2.toByte(),                         //   Mute (bit 4)
        0x09.toByte(), 0xe9.toByte(),                         //   Volume Up (bit 5)
        0x09.toByte(), 0xea.toByte(),                         //   Volume Down (bit 6)
        0x0a.toByte(), 0x23.toByte(), 0x02.toByte(),          //   Home (bit 7)
        0x81.toByte(), 0x02.toByte(),                         //   INPUT (Data,Var,Abs)
        0xc0.toByte()                                         // END_COLLECTION
    )
}
