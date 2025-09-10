package com.wavelinkllc.snippeta

import android.content.Context
import android.view.inputmethod.InputMethodManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class KeyboardNativeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "KeyboardNativeModule"
    }

    @ReactMethod
    fun isKeyboardInstalled(promise: Promise) {
        try {
            val imm = reactApplicationContext.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
            val methods = imm.enabledInputMethodList
            
            // Check if our keyboard service is enabled
            val isInstalled = methods.any { method ->
                method.packageName == "com.wavelinkllc.snippeta" && 
                method.serviceName.contains("SnippetaKeyboardService")
            }
            
            promise.resolve(isInstalled)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check keyboard installation: ${e.message}")
        }
    }
}
