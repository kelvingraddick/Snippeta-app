package com.wavelinkllc.snippeta

import android.inputmethodservice.InputMethodService
import android.view.LayoutInflater
import android.view.View
import android.widget.LinearLayout
import android.widget.ListView
import android.widget.TextView
import android.widget.ImageButton
import android.content.Context
import android.content.ClipboardManager
import android.content.SharedPreferences
import com.google.gson.GsonBuilder
import com.google.gson.reflect.TypeToken

class SnippetaKeyboardService : InputMethodService() {
    companion object {
        private const val CLIPBOARD_GROUP_ID = "SNIPPET_CLIPBOARD_GROUP"
        private const val CLIPBOARD_SNIPPET_ID_PREFIX = "SNIPPET_CLIPBOARD_"
        private const val CLIPBOARD_GROUP_TITLE = "Clipboard"
        private const val MAX_CLIPBOARD_SNIPPETS = 50
    }

    private lateinit var rootView: View
    private lateinit var snippetListView: ListView
    private lateinit var navBar: LinearLayout
    private lateinit var backButton: ImageButton
    private lateinit var titleLabel: TextView
    private lateinit var spaceButton: ImageButton
    private lateinit var deleteButton: ImageButton
    private var snippetStack: MutableList<List<Snippet>> = mutableListOf()
    private var snippetTitleStack: MutableList<String> = mutableListOf()
    private var snippetIdStack: MutableList<String?> = mutableListOf()
    private var allSnippets: List<Snippet> = listOf()
    private var currentSnippets: List<Snippet> = listOf()
    private var currentSnippetGroupId: String? = null
    private lateinit var themer: Themer

    private lateinit var sharedPrefs: SharedPreferences
    private lateinit var clipboardManager: ClipboardManager
    private val prefsListener = SharedPreferences.OnSharedPreferenceChangeListener { prefs, key ->
        if (key == "snippets") {
            loadAllSnippets(preserveNavigation = true)
            if (::snippetListView.isInitialized && snippetListView.adapter is SnippetAdapter) {
                (snippetListView.adapter as SnippetAdapter).updateSnippets(currentSnippets)
            }
        }
    }
    private val clipboardListener = ClipboardManager.OnPrimaryClipChangedListener {
        syncClipboardSnippetIfNeeded()
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
        clipboardManager = applicationContext.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        sharedPrefs.registerOnSharedPreferenceChangeListener(prefsListener)
        clipboardManager.addPrimaryClipChangedListener(clipboardListener)
        loadAllSnippets()
        syncClipboardSnippetIfNeeded()
        setupUI()
        return rootView
    }

    override fun onDestroy() {
        super.onDestroy()
        if (::sharedPrefs.isInitialized) {
            sharedPrefs.unregisterOnSharedPreferenceChangeListener(prefsListener)
        }
        if (::clipboardManager.isInitialized) {
            clipboardManager.removePrimaryClipChangedListener(clipboardListener)
        }
    }

    private fun loadAllSnippets(preserveNavigation: Boolean = false) {
        val dataString = sharedPrefs.getString("snippets", null)
        if (dataString != null) {
            val gson = GsonBuilder().create()
            val listType = object : TypeToken<List<Snippet>>() {}.type
            allSnippets = gson.fromJson(dataString, listType)
            currentSnippets = if (preserveNavigation) {
                getSnippetsForCurrentGroup() ?: allSnippets.also {
                    currentSnippetGroupId = null
                    snippetStack.clear()
                    snippetTitleStack.clear()
                    snippetIdStack.clear()
                }
            } else {
                allSnippets
            }
        }
    }

    private fun getSnippetsForCurrentGroup(): List<Snippet>? {
        val groupId = currentSnippetGroupId ?: return allSnippets
        return allSnippets.find { it.id == groupId }?.child_snippets
    }

    private fun syncClipboardSnippetIfNeeded() {
        if (!isClipboardSyncEnabled()) return
        if (!clipboardManager.hasPrimaryClip()) return
        val clipboardText = clipboardManager.primaryClip
            ?.getItemAt(0)
            ?.coerceToText(this)
            ?.toString()
            ?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?: return

        loadAllSnippets(preserveNavigation = true)
        val clipboardGroup = allSnippets.find { it.id == CLIPBOARD_GROUP_ID }
        val existingChildren = (clipboardGroup?.child_snippets ?: listOf())
            .filter { !it.content.isNullOrBlank() }

        if (existingChildren.firstOrNull()?.content == clipboardText) return

        val dedupedChildren = existingChildren.filter { it.content != clipboardText }
        val newSnippet = Snippet(
            id = CLIPBOARD_SNIPPET_ID_PREFIX + System.currentTimeMillis(),
            type = 0,
            source = "storage",
            title = buildClipboardSnippetTitle(clipboardText),
            content = clipboardText,
            color_id = 4,
            order_index = 0,
            child_snippets = null
        )
        val updatedChildren = (listOf(newSnippet) + dedupedChildren)
            .take(MAX_CLIPBOARD_SNIPPETS)
            .mapIndexed { index, snippet -> snippet.copy(order_index = index) }

        val updatedClipboardGroup = Snippet(
            id = CLIPBOARD_GROUP_ID,
            type = 1,
            source = "storage",
            title = CLIPBOARD_GROUP_TITLE,
            content = CLIPBOARD_GROUP_TITLE,
            color_id = 3,
            order_index = 0,
            child_snippets = updatedChildren
        )
        val updatedRootSnippets = listOf(updatedClipboardGroup) + allSnippets.filter { it.id != CLIPBOARD_GROUP_ID }
        val json = GsonBuilder().create().toJson(updatedRootSnippets)
        sharedPrefs.edit().putString("snippets", json).apply()

        allSnippets = updatedRootSnippets
        currentSnippets = when (currentSnippetGroupId) {
            CLIPBOARD_GROUP_ID -> updatedChildren
            null -> updatedRootSnippets
            else -> getSnippetsForCurrentGroup() ?: updatedRootSnippets.also {
                currentSnippetGroupId = null
                snippetStack.clear()
                snippetTitleStack.clear()
                snippetIdStack.clear()
                if (::backButton.isInitialized) {
                    backButton.visibility = View.INVISIBLE
                }
                if (::titleLabel.isInitialized) {
                    titleLabel.text = "Snippets"
                }
            }
        }
        if (::snippetListView.isInitialized && snippetListView.adapter is SnippetAdapter) {
            (snippetListView.adapter as SnippetAdapter).updateSnippets(currentSnippets)
        }
    }

    private fun isClipboardSyncEnabled(): Boolean {
        val value = sharedPrefs.getString("isClipboardSyncEnabled", null) ?: return true
        return value.toBoolean()
    }

    private fun buildClipboardSnippetTitle(content: String): String {
        return content
            .lineSequence()
            .firstOrNull()
            ?.trim()
            ?.take(40)
            ?.ifBlank { "Clipboard" }
            ?: "Clipboard"
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
            if (snippetStack.isNotEmpty() && snippetTitleStack.isNotEmpty() && snippetIdStack.isNotEmpty()) {
                currentSnippets = snippetStack.removeAt(snippetStack.size - 1)
                titleLabel.text = snippetTitleStack.removeAt(snippetTitleStack.size - 1)
                currentSnippetGroupId = snippetIdStack.removeAt(snippetIdStack.size - 1)
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
            snippetIdStack.add(currentSnippetGroupId)
            currentSnippetGroupId = snippet.id
            currentSnippets = snippet.child_snippets ?: listOf()
            adapter.updateSnippets(currentSnippets)
            titleLabel.text = snippet.title
            backButton.visibility = View.VISIBLE
        }
    }
}
