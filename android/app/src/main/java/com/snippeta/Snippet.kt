package com.wavelinkllc.snippeta

data class Snippet(
    val id: String,
    val type: Int,
    val source: String,
    val title: String,
    val content: String,
    val color_id: Int,
    val order_index: Int,
    val child_snippets: List<Snippet>? = null
)
