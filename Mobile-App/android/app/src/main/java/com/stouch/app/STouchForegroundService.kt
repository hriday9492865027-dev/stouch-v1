package com.stouch.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.os.Binder
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.content.ContextCompat

/**
 * ForegroundService keeps STouch alive in the background while Bluetooth HID is active.
 * Protected with checks for Android 14+ permissions so it never crashes.
 */
class STouchForegroundService : Service() {

    companion object {
        private const val TAG = "STouch_FgService"
        const val CHANNEL_ID = "stouch_hid_channel"
        const val NOTIFICATION_ID = 1001
        const val ACTION_START = "START_FOREGROUND"
        const val ACTION_STOP = "STOP_FOREGROUND"

        fun start(context: Context) {
            try {
                // On Android 12+ (API 31+), verify BLUETOOTH_CONNECT permission before attempting FGS
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    if (ContextCompat.checkSelfPermission(
                            context,
                            android.Manifest.permission.BLUETOOTH_CONNECT
                        ) != PackageManager.PERMISSION_GRANTED
                    ) {
                        Log.w(TAG, "Cannot start FGS: BLUETOOTH_CONNECT permission not yet granted")
                        return
                    }
                }

                val intent = Intent(context, STouchForegroundService::class.java).apply {
                    action = ACTION_START
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(intent)
                } else {
                    context.startService(intent)
                }
            } catch (e: Throwable) {
                Log.e(TAG, "Safe catch: Failed to start foreground service: ${e.message}")
            }
        }

        fun stop(context: Context) {
            try {
                val intent = Intent(context, STouchForegroundService::class.java).apply {
                    action = ACTION_STOP
                }
                context.startService(intent)
            } catch (e: Throwable) {
                Log.e(TAG, "Safe catch: Failed to stop foreground service: ${e.message}")
            }
        }
    }

    private val binder = LocalBinder()

    inner class LocalBinder : Binder() {
        fun getService(): STouchForegroundService = this@STouchForegroundService
    }

    override fun onBind(intent: Intent?): IBinder = binder

    override fun onCreate() {
        super.onCreate()
        try {
            createNotificationChannel()
        } catch (e: Throwable) {
            Log.e(TAG, "onCreate channel error: ${e.message}")
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    stopForeground(STOP_FOREGROUND_REMOVE)
                } else {
                    @Suppress("DEPRECATION")
                    stopForeground(true)
                }
                stopSelf()
            } catch (e: Throwable) {
                Log.e(TAG, "stopForeground error: ${e.message}")
            }
            return START_NOT_STICKY
        }

        try {
            val notification = buildNotification()
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(
                    NOTIFICATION_ID,
                    notification,
                    ServiceInfo.FOREGROUND_SERVICE_TYPE_CONNECTED_DEVICE
                )
            } else {
                startForeground(NOTIFICATION_ID, notification)
            }
        } catch (e: Throwable) {
            Log.e(TAG, "startForeground error: ${e.message}")
            try {
                // Fallback to simple startForeground
                startForeground(NOTIFICATION_ID, buildNotification())
            } catch (e2: Throwable) {
                Log.e(TAG, "Fallback startForeground failed, stopping self safely: ${e2.message}")
                stopSelf()
            }
        }
        return START_STICKY
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "STouch Active Controller",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps STouch running while controlling devices via Bluetooth"
                setShowBadge(false)
            }
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager?.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this, 0, launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_ID)
                .setContentTitle("STouch is Active")
                .setContentText("Bluetooth controller connected")
                .setSmallIcon(android.R.drawable.stat_sys_data_bluetooth)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .build()
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(this)
                .setContentTitle("STouch is Active")
                .setContentText("Bluetooth controller connected")
                .setSmallIcon(android.R.drawable.stat_sys_data_bluetooth)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .build()
        }
    }
}
