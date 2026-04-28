package com.ahcog.floatapp.data.db

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface SavedItemDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(item: SavedItem): Long

    @Update
    suspend fun update(item: SavedItem)

    @Delete
    suspend fun delete(item: SavedItem)

    @Query("SELECT * FROM saved_items ORDER BY timestamp DESC")
    fun getAll(): Flow<List<SavedItem>>

    @Query("SELECT * FROM saved_items WHERE id = :id LIMIT 1")
    suspend fun getById(id: Long): SavedItem?

    @Query("""
        SELECT saved_items.* FROM saved_items
        INNER JOIN saved_items_fts ON saved_items.rowid = saved_items_fts.rowid
        WHERE saved_items_fts MATCH :query
        ORDER BY saved_items.timestamp DESC
    """)
    fun search(query: String): Flow<List<SavedItem>>

    @Query("""
        SELECT * FROM saved_items
        WHERE channelIds LIKE '%' || :channelId || '%'
        ORDER BY timestamp DESC
    """)
    fun getByChannel(channelId: Long): Flow<List<SavedItem>>
}
