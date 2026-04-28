package com.ahcog.floatapp.ui.channels

import androidx.lifecycle.*
import com.ahcog.floatapp.data.FloatRepository
import com.ahcog.floatapp.data.db.Channel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class ChannelsViewModel(private val repo: FloatRepository) : ViewModel() {

    val channels = repo.getAllChannels()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    fun createChannel(name: String, emoji: String, colorHex: String) {
        if (name.isBlank()) return
        viewModelScope.launch {
            repo.saveChannel(Channel(name = name.trim(), emoji = emoji.trim(), colorHex = colorHex))
        }
    }

    fun deleteChannel(channel: Channel) {
        viewModelScope.launch { repo.deleteChannel(channel) }
    }

    fun renameChannel(channel: Channel, newName: String, newEmoji: String) {
        if (newName.isBlank()) return
        viewModelScope.launch {
            repo.updateChannel(channel.copy(name = newName.trim(), emoji = newEmoji.trim()))
        }
    }

    class Factory(private val repo: FloatRepository) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T =
            ChannelsViewModel(repo) as T
    }
}
