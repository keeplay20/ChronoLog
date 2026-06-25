package com.chronolog.deviceintegrity

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import java.io.BufferedReader
import java.io.File
import java.io.InputStreamReader

class DeviceIntegrityModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "DeviceIntegrityModule"

    @ReactMethod
    fun checkDeviceIntegrity(promise: Promise) {
        try {
            val reasons = mutableListOf<String>()
            if (isEmulator()) reasons.add("Running on emulator / generic device profile")
            if (isRooted()) reasons.add("Root access indicators detected (su binary or test-keys)")
            if (hasSuspiciousPackages()) reasons.add("Root management app paths detected")

            val result = WritableNativeMap().apply {
                putBoolean("isSecure", reasons.isEmpty())
                putString("platform", "android")
                putArray("reasons", WritableNativeArray().apply {
                    reasons.forEach { pushString(it) }
                })
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("INTEGRITY_ERROR", e.message, e)
        }
    }

    private fun isEmulator(): Boolean {
        return (Build.FINGERPRINT.startsWith("generic")
                || Build.FINGERPRINT.lowercase().contains("emulator")
                || Build.MODEL.contains("google_sdk")
                || Build.MODEL.contains("Emulator")
                || Build.MODEL.contains("Android SDK built for x86")
                || Build.MANUFACTURER.contains("Genymotion")
                || Build.HARDWARE.contains("goldfish")
                || Build.HARDWARE.contains("ranchu")
                || Build.PRODUCT.contains("sdk_google")
                || Build.PRODUCT.contains("google_sdk")
                || Build.PRODUCT.contains("sdk")
                || Build.PRODUCT.contains("sdk_x86")
                || Build.PRODUCT.contains("vbox86p")
                || Build.PRODUCT.contains("emulator")
                || Build.BRAND.startsWith("generic") && Build.DEVICE.startsWith("generic")
                || "google_sdk" == Build.PRODUCT)
    }

    private fun isRooted(): Boolean {
        if (Build.TAGS?.contains("test-keys") == true) return true
        val paths = arrayOf(
            "/system/app/Superuser.apk",
            "/sbin/su",
            "/system/bin/su",
            "/system/xbin/su",
            "/data/local/xbin/su",
            "/data/local/bin/su",
            "/system/sd/xbin/su",
            "/system/bin/failsafe/su",
            "/data/local/su",
            "/su/bin/su",
        )
        return paths.any { File(it).exists() } || canExecuteSu()
    }

    private fun canExecuteSu(): Boolean {
        return try {
            val process = Runtime.getRuntime().exec(arrayOf("/system/xbin/which", "su"))
            BufferedReader(InputStreamReader(process.inputStream)).readLine() != null
        } catch (_: Exception) {
            false
        }
    }

    private fun hasSuspiciousPackages(): Boolean {
        val suspicious = arrayOf(
            "/data/data/com.noshufou.android.su",
            "/data/data/com.thirdparty.superuser",
            "/data/data/eu.chainfire.supersu",
            "/data/data/com.topjohnwu.magisk",
        )
        return suspicious.any { File(it).exists() }
    }

    private object Build {
        val FINGERPRINT: String = android.os.Build.FINGERPRINT
        val MODEL: String = android.os.Build.MODEL
        val MANUFACTURER: String = android.os.Build.MANUFACTURER
        val HARDWARE: String = android.os.Build.HARDWARE
        val PRODUCT: String = android.os.Build.PRODUCT
        val BRAND: String = android.os.Build.BRAND
        val DEVICE: String = android.os.Build.DEVICE
        val TAGS: String? = android.os.Build.TAGS
    }
}
