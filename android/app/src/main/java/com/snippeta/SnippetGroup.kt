package com.wavelinkllc.snippeta

import com.google.gson.*
import com.google.gson.reflect.TypeToken
import java.lang.reflect.Type

data class SnippetGroup(
    val id: String,
    val type: Int,
    val source: String,
    val title: String,
    val content: String,
    val colorId: Int,
    val orderIndex: Int,
    val snippets: List<SnippetGroup> = emptyList() // default empty list
)

/**
 * A custom Gson deserializer that matches Swift's logic:
 * - "id" can be either String or Int
 * - "snippets" can be omitted or null, and should default to empty list
 */
class SnippetGroupAdapter : JsonDeserializer<SnippetGroup>, JsonSerializer<SnippetGroup> {
    override fun deserialize(json: JsonElement, typeOfT: Type, context: JsonDeserializationContext): SnippetGroup {
        val jsonObj = json.asJsonObject

        // Handle "id" (string or int):
        val idElement = jsonObj.get("id")
        val idString = when {
            idElement != null && idElement.isJsonPrimitive && idElement.asJsonPrimitive.isString ->
                idElement.asString
            idElement != null && idElement.isJsonPrimitive && idElement.asJsonPrimitive.isNumber ->
                idElement.asNumber.toString() // convert the number to string
            else -> throw JsonParseException("Expected `id` to be a string or number")
        }

        // Basic fields
        val type = jsonObj.get("type")?.asInt ?: 0
        val source = jsonObj.get("source")?.asString ?: ""
        val title = jsonObj.get("title")?.asString ?: ""
        val content = jsonObj.get("content")?.asString ?: ""
        val colorId = jsonObj.get("color_id")?.asInt ?: 0
        val orderIndex = jsonObj.get("order_index")?.asInt ?: 0

        // "snippets" might be null or an array:
        val snippetsElement = jsonObj.get("snippets")
        val snippets: List<SnippetGroup> = if (snippetsElement != null && snippetsElement.isJsonArray) {
            context.deserialize(snippetsElement, object : TypeToken<List<SnippetGroup>>() {}.type)
        } else {
            emptyList()
        }

        return SnippetGroup(
            id = idString,
            type = type,
            source = source,
            title = title,
            content = content,
            colorId = colorId,
            orderIndex = orderIndex,
            snippets = snippets
        )
    }

    override fun serialize(
        src: SnippetGroup,
        typeOfSrc: Type,
        context: JsonSerializationContext
    ): JsonElement {
        val jsonObj = JsonObject()

        // Convert "id" back to number if it's numeric, otherwise string
        val numericId = src.id.toLongOrNull()
        if (numericId != null) {
            jsonObj.addProperty("id", numericId)
        } else {
            jsonObj.addProperty("id", src.id)
        }

        // Other basic fields
        jsonObj.addProperty("type", src.type)
        jsonObj.addProperty("source", src.source)
        jsonObj.addProperty("title", src.title)
        jsonObj.addProperty("content", src.content)
        jsonObj.addProperty("color_id", src.colorId)
        jsonObj.addProperty("order_index", src.orderIndex)

        // Serialize "snippets". If empty, you can either omit the field
        // or explicitly set it to an empty array. Here, we'll explicitly set an array:
        if (src.snippets.isEmpty()) {
            // Option A: add an empty array
            jsonObj.add("snippets", JsonArray())
        } else {
            // Option B: use Gson to serialize the list
            jsonObj.add(
                "snippets",
                context.serialize(src.snippets, object : TypeToken<List<SnippetGroup>>() {}.type)
            )
        }

        return jsonObj
    }
}
