package com.wavelinkllc.snippeta

import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.ArrayAdapter
import android.widget.ListView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.gson.GsonBuilder
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class GroupWidgetConfigureActivity : AppCompatActivity() {

    private var appWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.group_widget_configuration_layout)

        // If the user cancels, we tell the system the widget config is canceled.
        setResult(RESULT_CANCELED)

        // Retrieve the widgetId from the Activity's intent
        val intent = intent
        val extras = intent.extras
        if (extras != null) {
            appWidgetId = extras.getInt(
                AppWidgetManager.EXTRA_APPWIDGET_ID,
                AppWidgetManager.INVALID_APPWIDGET_ID
            )
        }

        // If none or invalid, just finish
        if (appWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            finish()
            return
        }

        lifecycleScope.launch {
            val snippetGroups = fetchSnippetGroups()

            // Get reference to the ListView from layout
            val listView = findViewById<ListView>(R.id.group_widget_configuration_list_view)

            // Create a simple adapter or a custom adapter
            val titles = snippetGroups.map { it.title }
            val adapter = ArrayAdapter(this@GroupWidgetConfigureActivity, android.R.layout.simple_list_item_1, titles)

            listView.adapter = adapter

            listView.setOnItemClickListener { _, _, position, _ ->
                onSnippetGroupSelected(snippetGroups[position])
            }
        }
    }

    /**
     * Example function to read "snippetGroups" from SharedPreferences and parse as JSON list.
     */
    private suspend fun fetchSnippetGroups(): List<SnippetGroup> = withContext(Dispatchers.IO) {
        val sharedPrefs = getSharedPreferences("group.com.wavelinkllc.snippeta.shared", MODE_PRIVATE)
        val dataString = sharedPrefs.getString("snippetGroups", null) ?: return@withContext emptyList()

        try {
            val gson = GsonBuilder()
                .registerTypeAdapter(SnippetGroup::class.java, SnippetGroupAdapter())
                .create()
            val listType = object : TypeToken<List<SnippetGroup>>() {}.type
            val results = gson.fromJson<List<SnippetGroup>>(dataString, listType)
            Log.d("SnippetConfigActivity", "Success decoding snippet groups: ${results.size}")
            results
        } catch (e: Exception) {
            Log.e("SnippetConfigActivity", "Error decoding snippet groups: $e")
            emptyList()
        }
    }

    /**
     * Call this when the user selects a snippet group in your UI.
     */
    private fun onSnippetGroupSelected(selectedGroup: SnippetGroup) {
        // Convert the entire snippetGroup object to JSON
        val gson = GsonBuilder()
            .registerTypeAdapter(SnippetGroup::class.java, SnippetGroupAdapter())
            .create()
        val snippetGroupJson = gson.toJson(selectedGroup)

        // Save the JSON string to SharedPreferences, keyed by widget ID
        val prefs = getSharedPreferences("SnippetWidgetPrefs", Context.MODE_PRIVATE)
        prefs.edit().putString("snippetGroup_$appWidgetId", snippetGroupJson).apply()

        // Optionally: update the widget right away
        val appWidgetManager = AppWidgetManager.getInstance(this)
        GroupWidgetProvider.updateAppWidget(this, appWidgetManager, appWidgetId)

        // Let the system know we're done configuring
        val resultValue = Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
        setResult(RESULT_OK, resultValue)
        finish()
    }
}
