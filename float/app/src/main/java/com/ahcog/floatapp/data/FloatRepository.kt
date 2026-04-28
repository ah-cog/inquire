package com.ahcog.floatapp.data

import com.ahcog.floatapp.data.db.*
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.Flow

class FloatRepository(private val db: AppDatabase) {

    private val itemDao = db.savedItemDao()
    private val channelDao = db.channelDao()
    private val gson = Gson()

    // Items
    fun getAllItems(): Flow<List<SavedItem>> = itemDao.getAll()
    fun searchItems(query: String): Flow<List<SavedItem>> = itemDao.search("$query*")
    fun getItemsByChannel(channelId: Long): Flow<List<SavedItem>> = itemDao.getByChannel(channelId)
    suspend fun getItemById(id: Long): SavedItem? = itemDao.getById(id)
    suspend fun saveItem(item: SavedItem): Long = itemDao.insert(item)
    suspend fun updateItem(item: SavedItem) = itemDao.update(item)
    suspend fun deleteItem(item: SavedItem) = itemDao.delete(item)

    fun decodeChannelIds(item: SavedItem): List<Long> = try {
        gson.fromJson(item.channelIds, object : TypeToken<List<Long>>() {}.type)
    } catch (_: Exception) { emptyList() }

    fun encodeChannelIds(ids: Collection<Long>): String = gson.toJson(ids.toList())

    // Channels
    fun getAllChannels(): Flow<List<Channel>> = channelDao.getAll()
    suspend fun getChannelById(id: Long): Channel? = channelDao.getById(id)
    suspend fun saveChannel(channel: Channel): Long = channelDao.insert(channel)
    suspend fun updateChannel(channel: Channel) = channelDao.update(channel)
    suspend fun deleteChannel(channel: Channel) = channelDao.delete(channel)
}
