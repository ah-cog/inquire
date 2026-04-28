package com.ahcog.floatapp.ui.share

import androidx.lifecycle.*
import com.ahcog.floatapp.data.FloatRepository
import com.ahcog.floatapp.data.db.Channel
import com.ahcog.floatapp.data.db.SavedItem
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class ShareViewModel(private val repo: FloatRepository) : ViewModel() {

    val channels = repo.getAllChannels()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    private var pendingItem: SavedItem? = null
    var savedId: Long = -1L
        private set

    val selectedChannelIds = mutableSetOf<Long>()

    fun setPendingItem(item: SavedItem) { pendingItem = item }

    fun saveNow() {
        val item = pendingItem ?: return
        viewModelScope.launch {
            savedId = repo.saveItem(item)
        }
    }

    fun toggleChannel(channelId: Long, selected: Boolean) {
        if (selected) selectedChannelIds.add(channelId)
        else selectedChannelIds.remove(channelId)
    }

    /** Called when the user dismisses — persists channel selection and notes. */
    fun finalize(notes: String, onDone: () -> Unit) {
        viewModelScope.launch {
            if (savedId > 0) {
                val item = repo.getItemById(savedId)
                if (item != null) {
                    repo.updateItem(
                        item.copy(
                            channelIds = repo.encodeChannelIds(selectedChannelIds),
                            notes = notes
                        )
                    )
                }
            }
            onDone()
        }
    }

    // Pre-select a channel when launched via direct-share shortcut
    fun preselectChannel(channelId: Long) {
        if (channelId > 0) selectedChannelIds.add(channelId)
    }

    class Factory(private val repo: FloatRepository) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T =
            ShareViewModel(repo) as T
    }
}
