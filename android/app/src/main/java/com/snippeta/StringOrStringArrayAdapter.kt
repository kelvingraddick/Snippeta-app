package com.wavelinkllc.snippeta

import com.google.gson.TypeAdapter
import com.google.gson.stream.JsonReader
import com.google.gson.stream.JsonToken
import com.google.gson.stream.JsonWriter

/**
 * A custom TypeAdapter that can handle either a single String or an array of Strings
 * from JSON and always convert them into a List<String>.
 */
class StringOrStringArrayAdapter : TypeAdapter<List<String>>() {
    override fun write(out: JsonWriter, value: List<String>?) {
        if (value == null || value.isEmpty()) {
            out.nullValue()
        } else if (value.size == 1) {
            // if there's only one, write it as a single string
            out.value(value.first())
        } else {
            out.beginArray()
            value.forEach { out.value(it) }
            out.endArray()
        }
    }

    override fun read(`in`: JsonReader): List<String> {
        return if (`in`.peek() == JsonToken.BEGIN_ARRAY) {
            // it's an array of strings
            val list = mutableListOf<String>()
            `in`.beginArray()
            while (`in`.hasNext()) {
                list.add(`in`.nextString())
            }
            `in`.endArray()
            list
        } else {
            // otherwise, assume it's a single string
            listOf(`in`.nextString())
        }
    }
}
