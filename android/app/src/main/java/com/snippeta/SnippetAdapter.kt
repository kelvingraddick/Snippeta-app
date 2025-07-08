package com.wavelinkllc.snippeta

import android.content.Context
import android.graphics.Color
import android.graphics.PorterDuff
import android.graphics.drawable.GradientDrawable
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.BaseAdapter
import android.widget.ImageView
import android.widget.TextView

class SnippetAdapter(
    private val context: Context,
    private var snippets: List<Snippet>,
    private val themer: Themer,
    private val onSnippetClick: (Snippet) -> Unit
) : BaseAdapter() {

    fun updateSnippets(newSnippets: List<Snippet>) {
        this.snippets = newSnippets
        notifyDataSetChanged()
    }

    override fun getCount(): Int = snippets.size

    override fun getItem(position: Int): Any = snippets[position]

    override fun getItemId(position: Int): Long = position.toLong()

    override fun getView(position: Int, convertView: View?, parent: ViewGroup?): View {
        val view = convertView ?: LayoutInflater.from(context).inflate(R.layout.snippet_item, parent, false)
        val snippet = snippets[position]
        val textView = view.findViewById<TextView>(R.id.snippet_title)
        val chevron = view.findViewById<ImageView>(R.id.snippet_chevron)

        textView.text = snippet.title

        // Set background
        setSnippetBackground(view, snippet)

        // Set text and chevron color
        val textColor = getDynamicTextColor(snippet)
        textView.setTextColor(textColor)
        setChevronVisibilityAndColor(chevron, snippet, textColor)

        view.setOnClickListener { onSnippetClick(snippet) }
        return view
    }

    private fun setSnippetBackground(view: View, snippet: Snippet) {
        val colors = themer.getColors(snippet.color_id)
        val backgroundDrawable = GradientDrawable().apply {
            cornerRadius = 32f
            if (colors.size > 1) {
                orientation = GradientDrawable.Orientation.LEFT_RIGHT
                setColors(colors.toIntArray())
            } else if (colors.isNotEmpty()) {
                setColor(colors[0])
            }
        }
        view.background = backgroundDrawable
    }

    private fun getDynamicTextColor(snippet: Snippet): Int {
        val colors = themer.getColors(snippet.color_id)
        val isGradient = colors.size > 1
        val firstColor = if (colors.isNotEmpty()) colors[0] else Color.WHITE

        fun isLightColor(color: Int): Boolean {
            val r = Color.red(color)
            val g = Color.green(color)
            val b = Color.blue(color)
            val brightness = (r * 299 + g * 587 + b * 114) / 1000
            return brightness > 153
        }

        val useLightText = if (isGradient) true else isLightColor(firstColor)
        return if (useLightText) Color.parseColor("#FFFFFF") else Color.parseColor("#222222")
    }

    private fun setChevronVisibilityAndColor(chevron: ImageView, snippet: Snippet, color: Int) {
        if (snippet.type == 1) {
            chevron.visibility = View.VISIBLE
            chevron.setColorFilter(color, PorterDuff.Mode.SRC_IN)
        } else {
            chevron.visibility = View.GONE
        }
    }
}
