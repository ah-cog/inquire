package com.ahcog.floatapp.ui.timeline

import androidx.lifecycle.*
import com.ahcog.floatapp.data.FloatRepository
import com.ahcog.floatapp.data.db.SavedItem
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalCoroutinesApi::class)
class TimelineViewModel(private val repo: FloatRepository) : ViewModel() {

    private val _query = MutableStateFlow("")
    private val _channelFilter = MutableStateFlow<Long?>( null)

    val channels = repo.getAllChannels()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    val items: StateFlow<List<SavedItem>> = combine(_query, _channelFilter) { q, ch -> q to ch }
        .flatMapLatest { (query, channelId) ->
            when {
                query.isNotBlank() -> repo.searchItems(query)
                channelId != null -> repo.getItemsByChannel(channelId)
                else -> repo.getAllItems()
            }
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    fun setQuery(query: String) { _query.value = query }
    fun setChannelFilter(id: Long?) { _channelFilter.value = id }

    fun deleteItem(item: SavedItem) {
        viewModelScope.launch { repo.deleteItem(item) }
    }

    class Factory(private val repo: FloatRepository) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T =
            TimelineViewModel(repo) as T
    }
}
