package com.wavelinkllc.snippeta

import com.google.gson.annotations.JsonAdapter
import com.google.gson.annotations.SerializedName

data class Colors(
    @JsonAdapter(StringOrStringArrayAdapter::class)
    @SerializedName("0")
    val color0: List<String>,

    @JsonAdapter(StringOrStringArrayAdapter::class)
    @SerializedName("1")
    val color1: List<String>,

    @JsonAdapter(StringOrStringArrayAdapter::class)
    @SerializedName("2")
    val color2: List<String>,

    @JsonAdapter(StringOrStringArrayAdapter::class)
    @SerializedName("3")
    val color3: List<String>,

    @JsonAdapter(StringOrStringArrayAdapter::class)
    @SerializedName("4")
    val color4: List<String>,

    @JsonAdapter(StringOrStringArrayAdapter::class)
    @SerializedName("5")
    val color5: List<String>,

    @JsonAdapter(StringOrStringArrayAdapter::class)
    @SerializedName("6")
    val color6: List<String>,

    @JsonAdapter(StringOrStringArrayAdapter::class)
    @SerializedName("100")
    val color100: List<String>
) { 
    // Extra constructor for single-string usage
    constructor(
        color0: String,
        color1: String,
        color2: String,
        color3: String,
        color4: String,
        color5: String,
        color6: String,
        color100: String
    ) : this(
        listOf(color0),
        listOf(color1),
        listOf(color2),
        listOf(color3),
        listOf(color4),
        listOf(color5),
        listOf(color6),
        listOf(color100)
    )
}
