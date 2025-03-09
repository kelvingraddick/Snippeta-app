package com.wavelinkllc.snippeta

import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class WidgetNativeModule(private val reactContext: ReactApplicationContext) 
    : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "WidgetNativeModule"

    @ReactMethod
    fun updateWidgets() {
        Log.i("KG: WidgetNativeModule", "updateWidgets for " + GroupWidgetProvider.ACTION_UPDATE_WIDGET)
        val intent = Intent(GroupWidgetProvider.ACTION_UPDATE_WIDGET)
        reactContext.sendBroadcast(intent)
    }
}
