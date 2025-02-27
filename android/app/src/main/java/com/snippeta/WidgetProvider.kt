package com.wavelinkllc.snippeta

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.wavelinkllc.snippeta.MainActivity // adjust if your MainActivity is in a different package
import com.wavelinkllc.snippeta.R

class WidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        // Called when widgets need to be updated (manually or by the system)
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            // Inflates your widget_layout
            val views = RemoteViews(context.packageName, R.layout.widget_layout)

            // The same group name used in RN:
            val ANDROID_WIDGET_GROUP = "group.com.wavelinkllc.snippeta.shared"
            
            // Under the hood, the library on Android uses a shared prefs file named after the group.
            // That means you can read it via getSharedPreferences(<groupName>, MODE_PRIVATE).
            val sharedPrefs = context.getSharedPreferences(ANDROID_WIDGET_GROUP, Context.MODE_PRIVATE)
            
            // The data is stored as JSON in a string named "widgetData"
            val jsonString = sharedPrefs.getString("colors", null)
            // Parse JSON and update the widget UI
            if (!jsonString.isNullOrEmpty()) {
                try {
                    val dataObj = org.json.JSONObject(jsonString)
                    val title = dataObj.optString("1", "000000")

                    // E.g., set your TextView
                    views.setTextViewText(R.id.widgetTitle, title)
                } catch (e: org.json.JSONException) {
                    e.printStackTrace()
                }
            }

            // Example: Setting button click actions to open MainActivity
            // (adjust as needed for your desired functionality)

            val intent = Intent(context, MainActivity::class.java)
            // Use FLAG_UPDATE_CURRENT so extras (if any) are kept up-to-date
            val pendingIntent = PendingIntent.getActivity(
                context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            // Attach the same pendingIntent to all three buttons as an example
            views.setOnClickPendingIntent(R.id.button1, pendingIntent)
            views.setOnClickPendingIntent(R.id.button2, pendingIntent)
            views.setOnClickPendingIntent(R.id.button3, pendingIntent)

            // Example: set text in the title (optional)
            //views.setTextViewText(R.id.widgetTitle, "Widget Title")

            // Finally, update the widget
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
