package com.ahcog.floatapp.data.db

import androidx.room.Entity
import androidx.room.Fts4
import androidx.room.PrimaryKey

@Entity(tableName = "saved_items")
data class SavedItem(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String = "",
    val text: String = "",
    val url: String = "",
    val mimeType: String = "",
    val sourcePackage: String = "",
    val sourceApp: String = "",
    val localImagePath: String = "",
    // JSON array of channel IDs, e.g. "[1, 3]"
    val channelIds: String = "[]",
    val timestamp: Long = System.currentTimeMillis(),
    val notes: String = ""
)

// FTS4 virtual table backed by saved_items for full-text search
@Entity(tableName = "saved_items_fts")
@Fts4(contentEntity = SavedItem::class)
data class SavedItemFts(
    val title: String,
    val text: String,
    val url: String,
    val notes: String,
    val sourceApp: String
)
