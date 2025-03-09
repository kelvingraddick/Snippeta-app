package com.wavelinkllc.snippeta

import android.content.Context
import android.graphics.Color
import android.util.Log
import com.google.gson.Gson
import com.google.gson.JsonSyntaxException

class Themer(context: Context) {

    // Default single fallback if absolutely everything fails.
    private val defaultColor = "#000000"

    // Default color arrays matching your Swift code
    private val defaultColor0 = listOf("#FFFFFF")              // [Color.white]
    private val defaultColor1 = listOf("#FFA500", "#FF8C00")   // [Color.orange, Color.darkOrange]
    private val defaultColor2 = listOf("#00008B", "#0000FF")   // [Color.darkBlue, Color.blue]
    private val defaultColor3 = listOf("#FF0000", "#FF6347")   // [Color.red, Color.lightRed]
    private val defaultColor4 = listOf("#008000", "#90EE90")   // [Color.green, Color.lightGreen]
    private val defaultColor5 = listOf("#9B870C", "#FFFF00")   // [Color.darkYellow, Color.yellow]
    private val defaultColor6 = listOf("#800080", "#EE82EE")   // [Color.purple, Color.lightPurple]
    private val defaultColor100 = listOf("#FFA500")            // [Color.orange]

    private val defaultColors: Colors
    private val currentColors: Colors

    init {
        // Build our default Colors
        defaultColors = Colors(
            color0 = defaultColor0,
            color1 = defaultColor1,
            color2 = defaultColor2,
            color3 = defaultColor3,
            color4 = defaultColor4,
            color5 = defaultColor5,
            color6 = defaultColor6,
            color100 = defaultColor100
        )

        // Try to read JSON from SharedPreferences
        val sharedPrefs = context.getSharedPreferences("group.com.wavelinkllc.snippeta.shared", Context.MODE_PRIVATE)
        val dataString = sharedPrefs.getString("colors", null)

        if (dataString.isNullOrEmpty()) {
            currentColors = defaultColors
        } else {
            // Attempt to parse
            currentColors = try {
                val parsed = Gson().fromJson(dataString, Colors::class.java)
                Log.d("ReactNative: Themer", "Success decoding colors. Color1 is: ${parsed.color1}")
                parsed
            } catch (e: JsonSyntaxException) {
                Log.e("ReactNative: Themer", "Error decoding colors: ${e.message}")
                defaultColors
            }
        }
    }

    /**
     * Returns a single ARGB color (Int) for the given ID.
     * If there's an array, we pick the first. If none found, we fallback.
     */
    fun getColor(id: Int): Int {
        val colorList = getColorListById(id)
        val colorString = colorList.firstOrNull() ?: defaultColor100.firstOrNull() ?: defaultColor
        return parseHexOrNull(colorString) ?: parseHexOrNull(defaultColor) ?: Color.BLACK
    }

    /**
     * Returns a list of ARGB colors (Int) for the given ID (useful for gradients).
     * Falls back if not found.
     */
    fun getColors(id: Int): List<Int> {
        val colorList = getColorListById(id)
        return if (colorList.isEmpty()) {
            // Fallback
            defaultColor100.mapNotNull { parseHexOrNull(it) }
        } else {
            colorList.mapNotNull { parseHexOrNull(it) }
        }
    }

    /**
     * Internal helper to get the list of strings from currentColors by ID,
     * or fall back to an empty list.
     */
    private fun getColorListById(id: Int): List<String> {
        return when (id) {
            0 -> currentColors.color0
            1 -> currentColors.color1
            2 -> currentColors.color2
            3 -> currentColors.color3
            4 -> currentColors.color4
            5 -> currentColors.color5
            6 -> currentColors.color6
            100 -> currentColors.color100
            else -> emptyList()
        }
    }

    /**
     * Parses a hex color string (like "#RRGGBB" or "#AARRGGBB") to an ARGB Int,
     * or returns null if invalid.
     */
    private fun parseHexOrNull(hex: String): Int? {
        return try {
            Color.parseColor(hex)
        } catch (e: Exception) {
            null
        }
    }
}
