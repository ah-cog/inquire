package com.ahcog.floatapp.data.db

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "channels")
data class Channel(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val colorHex: String = "#6200EE",
    val emoji: String = "",
    val createdAt: Long = System.currentTimeMillis()
)
