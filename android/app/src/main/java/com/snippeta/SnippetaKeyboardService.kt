package com.wavelinkllc.snippeta

import android.inputmethodservice.InputMethodService
import android.view.LayoutInflater
import android.view.View
import android.view.inputmethod.EditorInfo
import android.widget.LinearLayout
import android.widget.ListView
import android.widget.TextView
import android.widget.ImageButton
import android.content.Context
import android.content.SharedPreferences
import com.google.gson.GsonBuilder
import com.google.gson.reflect.TypeToken

class SnippetaKeyboardService : InputMethodService() {
    private lateinit var rootView: View
    private lateinit var snippetListView: ListView
    private lateinit var navBar: LinearLayout
    private lateinit var backButton: ImageButton
    private lateinit var titleLabel: TextView
    private lateinit var spaceButton: ImageButton
    private lateinit var deleteButton: ImageButton
    private var snippetStack: MutableList<List<Snippet>> = mutableListOf()
    private var snippetTitleStack: MutableList<String> = mutableListOf()
    private var allSnippets: List<Snippet> = listOf()
    private var currentSnippets: List<Snippet> = listOf()
    private lateinit var themer: Themer

    private lateinit var sharedPrefs: SharedPreferences
    private val prefsListener = SharedPreferences.OnSharedPreferenceChangeListener { prefs, key ->
        if (key == "snippets") {
            loadAllSnippets()
            // Update the adapter/UI if already initialized
            if (::snippetListView.isInitialized && snippetListView.adapter is SnippetAdapter) {
                (snippetListView.adapter as SnippetAdapter).updateSnippets(currentSnippets)
            }
        }
    }

    override fun onCreateInputView(): View {
        val inflater = getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        rootView = inflater.inflate(R.layout.keyboard_view, null)
        navBar = rootView.findViewById(R.id.nav_bar)
        backButton = rootView.findViewById(R.id.back_button)
        titleLabel = rootView.findViewById(R.id.title_label)
        spaceButton = rootView.findViewById(R.id.space_button)
        deleteButton = rootView.findViewById(R.id.delete_button)
        snippetListView = rootView.findViewById(R.id.snippet_list)
        themer = Themer(this)
        sharedPrefs = applicationContext.getSharedPreferences("group.com.wavelinkllc.snippeta.shared", Context.MODE_PRIVATE)
        sharedPrefs.registerOnSharedPreferenceChangeListener(prefsListener)
        loadAllSnippets()
        setupUI()
        return rootView
    }

    override fun onDestroy() {
        super.onDestroy()
        if (::sharedPrefs.isInitialized) {
            sharedPrefs.unregisterOnSharedPreferenceChangeListener(prefsListener)
        }
    }

    private fun loadAllSnippets() {
        val dataString = sharedPrefs.getString("snippets", null)
        if (dataString != null) {
            val gson = GsonBuilder().create()
            val listType = object : TypeToken<List<Snippet>>() {}.type
            allSnippets = gson.fromJson(dataString, listType)
            currentSnippets = allSnippets
        }
    }

    private fun setupUI() {
        titleLabel.text = "Snippets"
        backButton.visibility = View.INVISIBLE

        lateinit var adapter: SnippetAdapter
        adapter = SnippetAdapter(this, currentSnippets, themer) { snippet ->
            handleSnippetTap(snippet, adapter)
        }
        snippetListView.adapter = adapter

        backButton.setOnClickListener {
            if (snippetStack.isNotEmpty() && snippetTitleStack.isNotEmpty()) {
                currentSnippets = snippetStack.removeAt(snippetStack.size - 1)
                titleLabel.text = snippetTitleStack.removeAt(snippetTitleStack.size - 1)
                adapter.updateSnippets(currentSnippets)
                if (snippetStack.isEmpty()) {
                    backButton.visibility = View.INVISIBLE
                }
            }
        }
        spaceButton.setOnClickListener {
            currentInputConnection?.commitText(" ", 1)
        }
        deleteButton.setOnClickListener {
            currentInputConnection?.deleteSurroundingText(1, 0)
        }
    }

    private fun handleSnippetTap(snippet: Snippet, adapter: SnippetAdapter) {
        if (snippet.type == 0) { // SINGLE
            currentInputConnection?.commitText(snippet.content, 1)
        } else if (snippet.type == 1) { // MULTIPLE
            snippetStack.add(currentSnippets)
            snippetTitleStack.add(titleLabel.text.toString())
            currentSnippets = snippet.child_snippets ?: listOf()
            adapter.updateSnippets(currentSnippets)
            titleLabel.text = snippet.title
            backButton.visibility = View.VISIBLE
        }
    }
}
