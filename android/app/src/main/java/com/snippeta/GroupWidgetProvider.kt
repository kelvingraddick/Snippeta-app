package com.wavelinkllc.snippeta

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ClipboardManager
import android.content.ClipData
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import com.google.gson.GsonBuilder
import com.wavelinkllc.snippeta.MainActivity
import com.wavelinkllc.snippeta.R

class GroupWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        // Called when widgets need to be updated (manually or by the system)
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val views = RemoteViews(context.packageName, R.layout.group_widget_layout)
            val themer = Themer(context)
            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            // load selected snippet group and sub-snippets
            var snippetGroup = getSelectedSnippetGroup(context, appWidgetId)
            // set widget title
            val title = snippetGroup?.title
            views.setTextViewText(R.id.widgetTitle, title)
            // set widget buttons based on sub-snippets
            val snippets = snippetGroup?.snippets ?: emptyList()
            for (i in 0 until 6) {
                val snippet = snippets.getOrNull(i)
                val buttonId = when (i) {
                    0 -> R.id.button1
                    1 -> R.id.button2
                    2 -> R.id.button3
                    3 -> R.id.button4
                    4 -> R.id.button5
                    5 -> R.id.button6
                    else -> continue
                }
                if (snippet == null) {
                    views.setViewVisibility(buttonId, android.view.View.GONE) // Hide any unused buttons
                } else {
                    views.setViewVisibility(buttonId, android.view.View.VISIBLE)
                    views.setTextViewText(buttonId, snippet.title)
                    views.setInt(buttonId, "setBackgroundColor", themer.getColor(snippet.colorId ?: 0))
                    // set button click event/intent
                    if (snippet.type === 0) {
                        val copyIntent = Intent(context, CopyBroadcastReceiver::class.java).apply { putExtra("text_to_copy", snippet.content) }
                        val copyPendingIntent = PendingIntent.getBroadcast(context, i, copyIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
                        views.setOnClickPendingIntent(buttonId, copyPendingIntent)
                    } else {
                        var snippetId = snippet.id
                        val deepLinkUri = Uri.parse("snippeta://snippets/$snippetId")
                        val openAppIntent = Intent(Intent.ACTION_VIEW, deepLinkUri).apply { addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) }
                        val openAppPendingIntent = PendingIntent.getActivity(context, i, openAppIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
                        views.setOnClickPendingIntent(buttonId, openAppPendingIntent)
                    }
                }
            }
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        private fun getSelectedSnippetGroup(context: Context, appWidgetId: Int): SnippetGroup? {
            val prefs = context.getSharedPreferences("SnippetWidgetPrefs", Context.MODE_PRIVATE)
            val json = prefs.getString("snippetGroup_$appWidgetId", null)
            try {
                val gson = GsonBuilder().registerTypeAdapter(SnippetGroup::class.java, SnippetGroupAdapter()).create()
                return gson.fromJson<SnippetGroup>(json, SnippetGroup::class.java)
            } catch (e: Exception) {
                e.printStackTrace()
            }
            return null;
        }
    }
}
