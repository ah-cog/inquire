package com.ahcog.floatapp.data.db

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface ChannelDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(channel: Channel): Long

    @Update
    suspend fun update(channel: Channel)

    @Delete
    suspend fun delete(channel: Channel)

    @Query("SELECT * FROM channels ORDER BY name ASC")
    fun getAll(): Flow<List<Channel>>

    @Query("SELECT * FROM channels WHERE id = :id LIMIT 1")
    suspend fun getById(id: Long): Channel?
}
